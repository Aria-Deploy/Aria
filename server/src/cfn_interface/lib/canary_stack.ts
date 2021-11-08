import * as cdk from "@aws-cdk/core";
import * as elbv2 from "@aws-cdk/aws-elasticloadbalancingv2";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as autoscaling from "@aws-cdk/aws-autoscaling";
import { ExistingStack } from "./existing_stack";

export class CanaryStack extends ExistingStack {
  constructor(
    id: string,
    stackConfig: any,
    props?: cdk.StackProps
  ) {
    super(id, stackConfig, props);

    new cdk.CfnOutput(this, "aria-canary", {
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

    // TODO import existing alb
    // const alb = new elbv2.ApplicationLoadBalancer(this, "alb", {
    //   vpc,
    //   internetFacing: true,
    // });

    // // TODO import existing listener
    // const listener = alb.addListener("Listener", {
    //   port: 80,
    //   open: true,
    // });

    // const userData1 = ec2.UserData.forLinux();
    // const userData2 = ec2.UserData.forLinux();

    // userData1.addCommands(
    //   "sudo su",
    //   "yum install -y httpd",
    //   "systemctl start httpd",
    //   "systemctl enable httpd",
    //   'echo "<h1>Hello World from $(hostname -f) and instance 1</h1>" > /var/www/html/index.html'
    // );

    // userData2.addCommands(
    //   "sudo su",
    //   "yum install -y httpd",
    //   "systemctl start httpd",
    //   "systemctl enable httpd",
    //   'echo "<h1>Hello World from $(hostname -f) and instance 2</h1>" > /var/www/html/index.html'
    // );

    // const asg1 = new autoscaling.AutoScalingGroup(this, "asg1", {
    //   vpc,
    //   instanceType: ec2.InstanceType.of(
    //     ec2.InstanceClass.T2,
    //     ec2.InstanceSize.MICRO
    //   ),
    //   machineImage: new ec2.AmazonLinuxImage({
    //     generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
    //   }),
    //   userData: userData1,
    //   minCapacity: 1,
    //   maxCapacity: 1,
    // });

    // const asg2 = new autoscaling.AutoScalingGroup(this, "asg2", {
    //   vpc,
    //   instanceType: ec2.InstanceType.of(
    //     ec2.InstanceClass.T2,
    //     ec2.InstanceSize.MICRO
    //   ),
    //   machineImage: new ec2.AmazonLinuxImage({
    //     generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
    //   }),
    //   userData: userData2,
    //   minCapacity: 1,
    //   maxCapacity: 1,
    // });

    // const tg1 = new elbv2.ApplicationTargetGroup(
    //   this,
    //   "application-target-group-1",
    //   {
    //     port: 80,
    //     targets: [asg1],
    //     vpc,
    //   }
    // );

    // const tg2 = new elbv2.ApplicationTargetGroup(
    //   this,
    //   "application-target-group-2",
    //   {
    //     port: 80,
    //     targets: [asg2],
    //     vpc,
    //   }
    // );

    // listener.addAction("action-1", {
    //   action: elbv2.ListenerAction.weightedForward([
    //     { targetGroup: tg1, weight: 4 },
    //     { targetGroup: tg2, weight: 1 },
    //   ]),
    // });

    // new cdk.CfnOutput(this, "albDNS", {
    //   value: alb.loadBalancerDnsName,
    // });
  }
}
