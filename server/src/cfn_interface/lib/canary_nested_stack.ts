import * as ec2 from "@aws-cdk/aws-ec2";
import * as cdk from "@aws-cdk/core";
import * as autoscaling from "@aws-cdk/aws-autoscaling";
import * as elbv2 from "@aws-cdk/aws-elasticloadbalancingv2";

interface CanaryNestedStackProps extends cdk.NestedStackProps {
  vpc: ec2.IVpc;
  alb: elbv2.IApplicationLoadBalancer;
}

export class CanaryNestedStack extends cdk.NestedStack {
  public readonly canaryTargetGroup: elbv2.ApplicationTargetGroup;

  constructor(scope: cdk.Construct, id: string, props: CanaryNestedStackProps) {
    super(scope, id, props);

    const userData1 = ec2.UserData.forLinux();
    //   const userData2 = ec2.UserData.forLinux();

    userData1.addCommands(
      "sudo su",
      "yum install -y httpd",
      "systemctl start httpd",
      "systemctl enable httpd",
      'echo "<h1>Hello World from $(hostname -f)!</h1>" > /var/www/html/index.html'
    );

    const canaryAsg = new autoscaling.AutoScalingGroup(this, "canary-asg", {
      vpc: props.vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      userData: userData1,
      minCapacity: 1,
      maxCapacity: 2,
    });

    // TODO import existing application target groups
    this.canaryTargetGroup = new elbv2.ApplicationTargetGroup(
      this,
      "application-target-group-canary",
      {
        port: 80,
        targets: [canaryAsg],
        vpc: props.vpc,
      }
    );

    //   userData2.addCommands(
    //     "sudo su",
    //     "yum install -y httpd",
    //     "systemctl start httpd",
    //     "systemctl enable httpd",
    //     'echo "<h1>Hello World from $(hostname -f) and instance 2</h1>" > /var/www/html/index.html'
    //   );

    //   const baselineAsg = new autoscaling.AutoScalingGroup(this, "baseline-asg", {
    //     vpc,
    //     instanceType: ec2.InstanceType.of(
    //       ec2.InstanceClass.T2,
    //       ec2.InstanceSize.MICRO
    //     ),
    //     machineImage: new ec2.AmazonLinuxImage({
    //       generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
    //     }),
    //     userData: userData2,
    //     minCapacity: 1,
    //     maxCapacity: 1,
    //   });

    //   const tg2 = new elbv2.ApplicationTargetGroup(
    //     this,
    //     "application-target-group-2",
    //     {
    //       port: 80,
    //       targets: [asg2],
    //       vpc,
    //     }
    //   );

    //   // TODO import listener actions (write over)
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
