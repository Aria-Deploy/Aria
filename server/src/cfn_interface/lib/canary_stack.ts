import * as autoscaling from "@aws-cdk/aws-autoscaling";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as elbv2 from "@aws-cdk/aws-elasticloadbalancingv2";
import * as cdk from "@aws-cdk/core";
import { readFileSync } from "fs";
import { ExistingStack } from "./existing_stack";

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
      "allow all http acess"
    );

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
      keyName: "ec2-key-pair", // replace this with your security key
      securityGroup: appSG,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
    };

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
    asgBaseline.addUserData(baselineAppSetup);
    // asgBaseline.addSecurityGroup(prodInstanceSG);

    const asgCanary = new autoscaling.AutoScalingGroup(
      this,
      "asgCanary",
      appInstance
    );
    asgCanary.addUserData(canaryAppSetup);
    
    // add security groups from production to baseline and canary
    prodInstanceSGs.forEach((sg: any) => {
        asgBaseline.addSecurityGroup(sg);
        asgCanary.addSecurityGroup(sg);
    });
    
    // asgCanary.addSecurityGroup(prodInstanceSG);

    // define target groups for ALB
    const targetBaseline = new elbv2.ApplicationTargetGroup(
      this,
      "BASELINE_TARGET",
      {
        vpc,
        // TODO user defined port value
        port: 80,
        targets: [asgBaseline],
      }
    );

    const targetCanary = new elbv2.ApplicationTargetGroup(
      this,
      "CANARY_TARGET",
      {
        vpc,
        // TODO user defined port value
        port: 80,
        targets: [asgCanary],
      }
    );

    // const listener = elbv2.ApplicationListener.fromLookup(
    //   this,
    //   "existingListener",
    //   {
    //     listenerArn:
    //       "arn:aws:elasticloadbalancing:us-west-2:750078097588:listener/app/cdk-s-alb8A-1AA9PUZ3YMG8L/2c17b1191f4de0af/e647e3a808a97a5e",
    //   }
    // );

    // 👇 create security group for monitor ec2 instances
    const monitorSG = new ec2.SecurityGroup(this, 'monitor-sg', {
      vpc,
      allowAllOutbound: true,
    });

    monitorSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(9090),
      'allow prometheus access',
    );

    monitorSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(3000),
      'allow grafana access',
    );

    monitorSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(8090),
      'allow kayenta access',
    );

    monitorSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(3001),
      'allow referee access',
    );

    monitorSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'allow SSH access from anywhere',
    );

    // define configuration for prometheus/grafana ec2 instance,
    const monitorInstance = new ec2.Instance(this, 'monitor', {
      vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MEDIUM,
      ),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      keyName: 'ec2-key-pair', // replace this with your security key
      securityGroup: monitorSG,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
    });
    
    /*
    // @ts-ignore
    const {awsProfilesInfo} = props;
    console.log('profile ', awsProfilesInfo);

    // @ts-ignore
    const {region} = awsProfilesInfo.configFile.default;
    // @ts-ignore
    const accessKey = awsProfilesInfo.credentialsFile.default.aws_access_key_id;
    // @ts-ignore
    const secretKey = awsProfilesInfo.credentialsFile.default.aws_secret_access_key;
    */
    
    const monitorSetupScript = readFileSync(
      './src/scripts/monitorSetup.sh',
      'utf8',
    );

    monitorInstance.addUserData(monitorSetupScript
//         .replace('MY_REGION', region)
//         .replace('MY_ACCESS_KEY', accessKey)
//         .replace('MY_SECRET_KEY', secretKey),
    );
        
    new cdk.CfnOutput(this, "ariacanary", {
      value: "true",
    });

    new cdk.CfnOutput(this, "loadBalancerName", {
      value: stackConfig.selectedAlbName,
    });

    new cdk.CfnOutput(this, "listenerArn", {
      value: stackConfig.selectedListenerArn,
    });

    new cdk.CfnOutput(this, "Baseline-Target-Group-Arn", {
      value: targetBaseline.targetGroupArn,
    });

    new cdk.CfnOutput(this, "Canary-Target-Group-Arn", {
      value: targetCanary.targetGroupArn,
    });

    new cdk.CfnOutput(this, 'prometheusDNS', {
      value: `http://${monitorInstance.instancePublicDnsName}:9090`,
    });

    new cdk.CfnOutput(this, 'grafanaDNS', {
      value: `http://${monitorInstance.instancePublicDnsName}:3000`,
    });

    new cdk.CfnOutput(this, 'kayentaDNS', {
      value: `http://${monitorInstance.instancePublicDnsName}:8090/swagger-ui.html`,
    });

    new cdk.CfnOutput(this, 'refereeDNS', {
      value: `http://${monitorInstance.instancePublicDnsName}:3001`,
    });
    
    // output ip addresses/dns address for
    // prometheus, baseline, canary, grafana
    // new cdk.CfnOutput(this, "albDNS", {
    //   value: `http://${alb.loadBalancerDnsName}`,
    // });
  }
}
