import * as cdk from "@aws-cdk/core";
import * as elbv2 from "@aws-cdk/aws-elasticloadbalancingv2";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as autoscaling from "@aws-cdk/aws-autoscaling";
import { ExistingStack } from "./existing_stack";
import { CanaryNestedStack } from "./canary_nested_stack";
import * as iam from "@aws-cdk/aws-iam";
import { readFileSync } from "fs";
import { ISubnet, Subnet } from "@aws-cdk/aws-ec2";

export class CanaryStack extends ExistingStack {
  constructor(
    source: cdk.App,
    id: string,
    stackConfig: any,
    props?: cdk.StackProps
  ) {
    super(source, id, stackConfig, props);

    new cdk.CfnOutput(this, "ariacanary", {
      value: "true",
    });

    this.templateOptions.metadata = {
      "pre-canary-cfn": JSON.stringify(stackConfig.template),
    };

    const vpc = ec2.Vpc.fromVpcAttributes(
      this,
      "external-vpc",
      stackConfig.vpcConfig
    );

    // const subnets: ISubnet[] = stackConfig.vpcConfig.privateSubnetIds?.map(
    //   (subnetId: string, idx: number) => {
    //     return ec2.Subnet.fromSubnetId(this, `privSub${idx}`,  );
    //   }
    // );

    const desiredSubnet = ec2.Subnet.fromSubnetAttributes(
      this,
      "desiredSubnet",
      {
        subnetId: "subnet-0a8d447adc64b3246",
        availabilityZone: "us-west-2c",
      }
    );

    const appSG = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      "externalSecurityGroup",
      "sg-0d353e0790bca1ee5"
    );

    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      "sudo su",
      "yum install -y httpd",
      "systemctl start httpd",
      "systemctl enable httpd",
      'echo "<h1>Hello There from $(hostname -f)</h1>" > /var/www/html/index.html'
    );

    // 👇 create the EC2 Instance
    const ec2Instance = {
      vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      vpcSubnets: {
        subnets: [desiredSubnet],
        availabilityZones: ["us-west-2c"],
      },
      minCapacity: 1,
      maxCapatcity: 1,
      securityGroup: appSG,
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX,
      }),
      keyName: "ec2-key-pair",
    };

    const asgStable = new autoscaling.AutoScalingGroup(
      this,
      "asgStable",
      ec2Instance
    );

    const canaryAppSetup = readFileSync(
      "./src/cfn_interface/lib/user-data.sh",
      "utf8"
    );
    asgStable.addUserData(canaryAppSetup);

    // const targetCanary = new elbv2.ApplicationTargetGroup(this, "target2", {
    //   vpc,
    //   port: 80,
    //   targets: [asgStable],
    // });

    const alb = elbv2.ApplicationLoadBalancer.fromLookup(this, "existing-alb", {
      loadBalancerArn:
        "arn:aws:elasticloadbalancing:us-west-2:750078097588:loadbalancer/app/cdk-s-alb8A-1EDT7B3SC5FF4/a92cd2596cd7f92e",
      // securityGroupId: "sg-031d81f769d4b9d84",
      // loadBalancerDnsName:
      //   "cdk-s-alb8A-1EDT7B3SC5FF4-685005633.us-west-2.elb.amazonaws.com",
    });

    // const canaryResources = new CanaryNestedStack(this, "canary-resources", {
    //   vpc,
    //   alb,
    // });

    // new cdk.CfnOutput(this, "ariaCanaryAlbDNS", {
    //   value: alb.loadBalancerDnsName,
    // });

    const listener = elbv2.ApplicationListener.fromLookup(
      this,
      "existing-listener",
      {
        listenerArn:
          "arn:aws:elasticloadbalancing:us-west-2:750078097588:listener/app/cdk-s-alb8A-DI1NU45L4GGI/8c71b51e9a3cfb84/931ed366ec44cd46",
      }
    );

    // const applicationListener = elbv2.ApplicationListener.import(this, "ALBListener", {
    //   listenerArn: "arn:aws:elasticloadbalancing:us-west-2:750078097588:listener/app/cdk-s-alb8A-DI1NU45L4GGI/8c71b51e9a3cfb84/931ed366ec44cd46",
    //   securityGroupId: appSG
    // });

    // @ts-ignore
    const tg = new elbv2.CfnTargetGroup(this, "TargetGroup", {
      healthCheckPath: "/",
      healthCheckPort: "80",
      healthCheckProtocol: elbv2.Protocol.HTTP,
      healthCheckIntervalSeconds: 10,
      healthCheckTimeoutSeconds: 5,
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 2,
      port: 80,
      protocol: elbv2.Protocol.HTTP,
      targetType: elbv2.TargetType.IP,
      vpcId: vpc.vpcId,
    });

    //import existing ASG
    // const asg1 = autoscaling.AutoScalingGroup.fromAutoScalingGroupName(
    //   this,
    //   "existing-asg",
    //   "cdk-stack-asgASG4D014670-5G1333D3C3UD"
    // );

    // @ts-ignore

    // TODO import existing listener
    // const listener = alb.addListener("Listener", {
    //   port: 80,
    //   open: true,
    // });

    // const defaultRule = this.importedTemplate.getResource(
    //   "albListenerstaticRule4F017351"
    // ) as elbv2.CfnListenerRule;

    // const exisitingTargetGroup =
    //   elbv2.ApplicationTargetGroup.fromTargetGroupAttributes(
    //     this,
    //     "existing-target-group",
    //     {
    //       targetGroupArn:
    //         "arn:aws:elasticloadbalancing:us-west-2:750078097588:targetgroup/cdk-s-albLi-1E1TTLQ8SR91W/b3f68e29ecaa7203",
    //     }
    //   ) as unknown as elbv2.ApplicationTargetGroup;

    // TODO import listener actions (write over)
    // new elbv2.ApplicationListenerRule(this, "weightingRule", {
    //   listener: listener,
    //   priority: 5,
    //   action:
    //     elbv2.ListenerAction.forward([targetCanary]
    //   //  elbv2.ListenerAction.weightedForward([
    //   //   { targetGroup: exisitingTargetGroup, weight: 2 },
    //   //   { targetGroup: canaryTargetGroup, weight: 1 },]
    //   ),
    //   conditions: [elbv2.ListenerCondition.httpRequestMethods(["GET"])],
    // });
  }
}
