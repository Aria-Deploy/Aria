import * as autoscaling from "@aws-cdk/aws-autoscaling";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as elbv2 from "@aws-cdk/aws-elasticloadbalancingv2";
import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import { Asset } from "@aws-cdk/aws-s3-assets";
import { appendFileSync, copyFileSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import { ExistingStack } from "./existing_stack";
import { SecurityGroup } from "@aws-cdk/aws-ec2";

export class CanaryStack extends ExistingStack {
  constructor(
    scope: cdk.App,
    id: string,
    stackConfig: any,
    props?: cdk.StackProps
  ) {
    super(scope, id, stackConfig, props);
    const stackContext = this;

    const vpc = ec2.Vpc.fromVpcAttributes(
      this,
      "external-vpc",
      stackConfig.vpcConfig
    );

    const prodInstanceSGs = stackConfig.securityGroupIds.map(
      (sgId: any, idx: number) => {
        return ec2.SecurityGroup.fromSecurityGroupId(
          stackContext,
          `prodInstanceSG-${idx}`,
          sgId.groupId
        );
      }
    );
    
    // 👇 create security group for application ec2 instances
    const appSG = new ec2.SecurityGroup(this, "app-sg", {
      vpc,
      allowAllOutbound: true,
    });

    appSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      "allow SSH access from anywhere"
    );

    appSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(9100),
      "allow node_exporter access from anywhere"
    );

    appSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      "allow all http access"
    );

    stackConfig.exporters = stackConfig.exporters ? stackConfig.exporters : new Array();
    // @ts-ignore
    stackConfig.exporters.forEach(exporter => {
      const { jobName, port } = exporter;
      appSG.addIngressRule(
        ec2.Peer.anyIpv4(),
        ec2.Port.tcp(port),
        'allow all ' + jobName + ' exporter access'
      );
    });

    // define configuration for app-base-and-canary asg ec2 instances,
    const appInstance = {
      vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      minCapacity: 1,
      maxCapacity: 1,
      keyName: stackConfig.keyPair, // replace this with your security key
      securityGroup: appSG,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
    };

    // assets are stored in a temporary s3 bucket then transferred to instance
    // expects tarball to be in root Aria directory
    const canaryImageAsset = new Asset(this, "CanaryImageAsset", {
      path: "../" + stackConfig.canaryImgPath,
    });

    const canaryComposeAsset = new Asset(this, "CanaryComposeAsset", {
      path: "../" + stackConfig.canaryComposePath,
    });

    const baselineImageAsset = new Asset(this, "BaselineImageAsset", {
      path: "../" + stackConfig.baselineImgPath,
    });

    const baselineComposeAsset = new Asset(this, "BaselineComposeAsset", {
      path: "../" + stackConfig.baselineComposePath,
    });

    const baselineAppSetup = readFileSync(
      "./src/scripts/baselineSetup.sh",
      "utf8"
    );
    const canaryAppSetup = readFileSync("./src/scripts/canarySetup.sh", "utf8");

    // create new autoscaling groups
    const asgBaseline = new autoscaling.AutoScalingGroup(
      this,
      "asgBaseline",
      appInstance
    );

    baselineImageAsset.grantRead(asgBaseline.grantPrincipal);
    baselineComposeAsset.grantRead(asgBaseline.grantPrincipal);
    asgBaseline.userData.addS3DownloadCommand({
      bucket: baselineImageAsset.bucket,
      bucketKey: baselineImageAsset.s3ObjectKey,
      localFile: "/home/ec2-user/baseline.tar",
    });
    asgBaseline.userData.addS3DownloadCommand({
      bucket: baselineComposeAsset.bucket,
      bucketKey: baselineComposeAsset.s3ObjectKey,
      localFile: "/home/ec2-user/docker-compose.yml",
    });
    asgBaseline.addUserData(baselineAppSetup);

    const asgCanary = new autoscaling.AutoScalingGroup(
      this,
      "asgCanary",
      appInstance
    );

    canaryImageAsset.grantRead(asgCanary.grantPrincipal);
    canaryComposeAsset.grantRead(asgCanary.grantPrincipal);
    asgCanary.userData.addS3DownloadCommand({
      bucket: canaryImageAsset.bucket,
      bucketKey: canaryImageAsset.s3ObjectKey,
      localFile: "/home/ec2-user/canary.tar",
    });    
    asgCanary.userData.addS3DownloadCommand({
      bucket: canaryComposeAsset.bucket,
      bucketKey: canaryComposeAsset.s3ObjectKey,
      localFile: "/home/ec2-user/docker-compose.yml",
    });
    asgCanary.addUserData(canaryAppSetup);

    // add security groups from production to baseline and canary
    prodInstanceSGs.forEach((sg: SecurityGroup) => {
      asgBaseline.addSecurityGroup(sg);
      asgCanary.addSecurityGroup(sg);
    });

    // define target groups for ALB
    const targetBaseline = new elbv2.ApplicationTargetGroup(
      this,
      "BASELINE_TARGET",
      {
        vpc,
        // TODO user defined port value
        port: stackConfig.selectedPort,
        targets: [asgBaseline],
        healthCheck: { path: stackConfig.healthCheckPath },
      }
    );

    const targetCanary = new elbv2.ApplicationTargetGroup(
      this,
      "CANARY_TARGET",
      {
        vpc,
        // TODO user defined port value
        port: stackConfig.selectedPort,
        targets: [asgCanary],
        healthCheck: { path: stackConfig.healthCheckPath },
      }
    );

    // 👇 create security group for monitor ec2 instances
    const monitorSG = new ec2.SecurityGroup(this, "monitor-sg", {
      vpc,
      allowAllOutbound: true,
    });

    monitorSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(9090),
      "allow prometheus access"
    );

    monitorSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(3000),
      "allow grafana access"
    );

    monitorSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(8090),
      "allow kayenta access"
    );

    monitorSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(3001),
      "allow referee access"
    );

    monitorSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      "allow SSH access from anywhere"
    );

    // define configuration for prometheus/grafana ec2 instance,
    const monitorInstance = new ec2.Instance(this, "monitor", {
      vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MEDIUM
      ),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      keyName: "ec2-key-pair", // replace this with your security key
      securityGroup: monitorSG,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
    });

    // pass configuration and setup files to monitor
    const monitorComposeAsset = new Asset(this, 'MonitorComposeAsset', {
      path: "./src/scripts/monitor-docker-compose",
    });
    const monitorKayentaAsset = new Asset(this, 'MonitorKayentaAsset', {
      path: "./src/scripts/monitor-kayenta",
    });

    monitorComposeAsset.grantRead(monitorInstance.grantPrincipal);
    monitorKayentaAsset.grantRead(monitorInstance.grantPrincipal);

    monitorInstance.userData.addS3DownloadCommand({
      bucket: monitorComposeAsset.bucket,
      bucketKey: monitorComposeAsset.s3ObjectKey,
      localFile: "/home/ec2-user/docker-compose.yml",
    });

    monitorInstance.userData.addS3DownloadCommand({
      bucket: monitorKayentaAsset.bucket,
      bucketKey: monitorKayentaAsset.s3ObjectKey,
      localFile: "/home/ec2-user/kayenta.yml",
    });
  
    const tmpPrometheusConfigPath = "./src/scripts/monitor-prometheus-tmp";
    // copyFileSync("./src/scripts/monitor-prometheus-template", tmpPrometheusConfigPath);
    let tmpPrometheusConfigContents = readFileSync("./src/scripts/monitor-prometheus-template", "utf8");

    // careful altering position of this assignment,
    // indentation is VERY important to create prometheus.yml
    const scrapeConfigTemplate = `
  - job_name: 'EXPORTER_JOBNAME'
    relabel_configs:
    - source_labels: [__meta_ec2_tag_Name]
      target_label: instance
    ec2_sd_configs:
      - access_key: MY_ACCESS_KEY 
        secret_key: MY_SECRET_KEY
        port: EXPORTER_PORT`;

    // @ts-ignore
    stackConfig.exporters.forEach(exporter => {
      const { jobName, port } = exporter;
      let scrapeConfig = scrapeConfigTemplate
        .replace(/EXPORTER_JOBNAME/, jobName)
        .replace(/EXPORTER_PORT/, port)     
      tmpPrometheusConfigContents = tmpPrometheusConfigContents.concat(scrapeConfig);
    });
    
    const accessKey = stackConfig.credentials.credentials.aws_access_key_id;
    const secretKey = stackConfig.credentials.credentials.aws_secret_access_key;
    tmpPrometheusConfigContents = tmpPrometheusConfigContents
      .replace(/MY_ACCESS_KEY/g, accessKey)
      .replace(/MY_SECRET_KEY/g, secretKey);

    writeFileSync(tmpPrometheusConfigPath, tmpPrometheusConfigContents);
    
    // set credentials object to empty object to prevent keys from leaking into stack.template.json
    stackConfig.credentials = {};

    const monitorPrometheusAsset = new Asset(this, 'MonitorPrometheusAsset', {
      path: tmpPrometheusConfigPath,
    });
    monitorPrometheusAsset.grantRead(monitorInstance.grantPrincipal);
    
    monitorInstance.userData.addS3DownloadCommand({
      bucket: monitorPrometheusAsset.bucket,
      bucketKey: monitorPrometheusAsset.s3ObjectKey,
      localFile: "/home/ec2-user/prometheus.yml",
    });
    
    // remove temporary file for monitor-prometheus configuration    
    try {
      unlinkSync("./src/scripts/monitor-prometheus-tmp");
      //file removed
    } catch(err) {
      console.error(err);
    }

    const monitorSetupScript = readFileSync(
      "./src/scripts/monitorSetup.sh",
      "utf8"
    );
    monitorInstance.addUserData(monitorSetupScript);

    new cdk.CfnOutput(this, "ariacanary", {
      value: "true",
    });

    new cdk.CfnOutput(this, "ariaconfig", {
      value: JSON.stringify(stackConfig),
    });

    new cdk.CfnOutput(this, "Baseline-Target-Group-Arn", {
      value: targetBaseline.targetGroupArn,
    });

    new cdk.CfnOutput(this, "Canary-Target-Group-Arn", {
      value: targetCanary.targetGroupArn,
    });

    new cdk.CfnOutput(this, "prometheusDNS", {
      value: `http://${monitorInstance.instancePublicDnsName}:9090`,
    });

    new cdk.CfnOutput(this, "monitorId",{
      value: monitorInstance.instanceId
    })

    new cdk.CfnOutput(this, "grafanaDNS", {
      value: `http://${monitorInstance.instancePublicDnsName}:3000`,
    });

    new cdk.CfnOutput(this, "kayentaDNS", {
      value: `http://${monitorInstance.instancePublicDnsName}:8090/swagger-ui.html`,
    });

    new cdk.CfnOutput(this, "refereeDNS", {
      value: `http://${monitorInstance.instancePublicDnsName}:3001`,
    });

    // new cdk.CfnOutput(this, "albDNS", {
    //   value: `http://${alb.loadBalancerDnsName}`,
    // });
  }
}
