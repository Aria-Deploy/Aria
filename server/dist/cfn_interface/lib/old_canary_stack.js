"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanaryStack = void 0;
const cdk = __importStar(require("@aws-cdk/core"));
const elbv2 = __importStar(require("@aws-cdk/aws-elasticloadbalancingv2"));
const ec2 = __importStar(require("@aws-cdk/aws-ec2"));
const autoscaling = __importStar(require("@aws-cdk/aws-autoscaling"));
const existing_stack_1 = require("./existing_stack");
const fs_1 = require("fs");
class CanaryStack extends existing_stack_1.ExistingStack {
    constructor(source, id, stackConfig, props) {
        super(source, id, stackConfig, props);
        new cdk.CfnOutput(this, "ariacanary", {
            value: "true",
        });
        this.templateOptions.metadata = {
            "pre-canary-cfn": JSON.stringify(stackConfig.template),
        };
        const vpc = ec2.Vpc.fromVpcAttributes(this, "external-vpc", stackConfig.vpcConfig);
        // const subnets: ISubnet[] = stackConfig.vpcConfig.privateSubnetIds?.map(
        //   (subnetId: string, idx: number) => {
        //     return ec2.Subnet.fromSubnetId(this, `privSub${idx}`,  );
        //   }
        // );
        const desiredSubnet = ec2.Subnet.fromSubnetAttributes(this, "desiredSubnet", {
            subnetId: "subnet-0a8d447adc64b3246",
            availabilityZone: "us-west-2c",
        });
        const appSG = ec2.SecurityGroup.fromSecurityGroupId(this, "externalSecurityGroup", "sg-0d353e0790bca1ee5");
        const userData = ec2.UserData.forLinux();
        userData.addCommands("sudo su", "yum install -y httpd", "systemctl start httpd", "systemctl enable httpd", 'echo "<h1>Hello There from $(hostname -f)</h1>" > /var/www/html/index.html');
        // 👇 create the EC2 Instance
        const ec2Instance = {
            vpc,
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
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
        const asgStable = new autoscaling.AutoScalingGroup(this, "asgStable", ec2Instance);
        const canaryAppSetup = fs_1.readFileSync("./src/cfn_interface/lib/user-data.sh", "utf8");
        asgStable.addUserData(canaryAppSetup);
        // const targetCanary = new elbv2.ApplicationTargetGroup(this, "target2", {
        //   vpc,
        //   port: 80,
        //   targets: [asgStable],
        // });
        const alb = elbv2.ApplicationLoadBalancer.fromLookup(this, "existing-alb", {
            loadBalancerArn: "arn:aws:elasticloadbalancing:us-west-2:750078097588:loadbalancer/app/cdk-s-alb8A-1EDT7B3SC5FF4/a92cd2596cd7f92e",
        });
        // const canaryResources = new CanaryNestedStack(this, "canary-resources", {
        //   vpc,
        //   alb,
        // });
        // new cdk.CfnOutput(this, "ariaCanaryAlbDNS", {
        //   value: alb.loadBalancerDnsName,
        // });
        const listener = elbv2.ApplicationListener.fromLookup(this, "existing-listener", {
            listenerArn: "arn:aws:elasticloadbalancing:us-west-2:750078097588:listener/app/cdk-s-alb8A-DI1NU45L4GGI/8c71b51e9a3cfb84/931ed366ec44cd46",
        });
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
exports.CanaryStack = CanaryStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2xkX2NhbmFyeV9zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jZm5faW50ZXJmYWNlL2xpYi9vbGRfY2FuYXJ5X3N0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxtREFBcUM7QUFDckMsMkVBQTZEO0FBQzdELHNEQUF3QztBQUN4QyxzRUFBd0Q7QUFDeEQscURBQWlEO0FBR2pELDJCQUFrQztBQUdsQyxNQUFhLFdBQVksU0FBUSw4QkFBYTtJQUM1QyxZQUNFLE1BQWUsRUFDZixFQUFVLEVBQ1YsV0FBZ0IsRUFDaEIsS0FBc0I7UUFFdEIsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXRDLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQ3BDLEtBQUssRUFBRSxNQUFNO1NBQ2QsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEdBQUc7WUFDOUIsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO1NBQ3ZELENBQUM7UUFFRixNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUNuQyxJQUFJLEVBQ0osY0FBYyxFQUNkLFdBQVcsQ0FBQyxTQUFTLENBQ3RCLENBQUM7UUFFRiwwRUFBMEU7UUFDMUUseUNBQXlDO1FBQ3pDLGdFQUFnRTtRQUNoRSxNQUFNO1FBQ04sS0FBSztRQUVMLE1BQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQ25ELElBQUksRUFDSixlQUFlLEVBQ2Y7WUFDRSxRQUFRLEVBQUUsMEJBQTBCO1lBQ3BDLGdCQUFnQixFQUFFLFlBQVk7U0FDL0IsQ0FDRixDQUFDO1FBRUYsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLGFBQWEs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LDhCQUE4QjtRQUU5QiwrQkFBK0I7UUFDL0IsNERBQTREO1FBQzVELFlBQVk7UUFDWiwrQkFBK0I7UUFDL0IsUUFBUTtRQUNSLHdCQUF3QjtRQUN4Qix3SEFBd0g7UUFDeEgsUUFBUTtRQUNSLGtEQUFrRDtRQUVsRCw0Q0FBNEM7UUFDNUMsNkRBQTZEO1FBQzdELHdCQUF3QjtRQUN4QixpQkFBaUI7UUFDakIsWUFBWTtRQUNaLGtEQUFrRDtRQUNsRCwrQ0FBK0M7UUFDL0MsMkRBQTJEO1FBQzNELHlEQUF5RDtRQUN6RCxPQUFPO1FBQ1AsdUVBQXVFO1FBQ3ZFLE1BQU07SUFDUixDQUFDO0NBQ0Y7QUFuTEQsa0NBbUxDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gXCJAYXdzLWNkay9jb3JlXCI7XG5pbXBvcnQgKiBhcyBlbGJ2MiBmcm9tIFwiQGF3cy1jZGsvYXdzLWVsYXN0aWNsb2FkYmFsYW5jaW5ndjJcIjtcbmltcG9ydCAqIGFzIGVjMiBmcm9tIFwiQGF3cy1jZGsvYXdzLWVjMlwiO1xuaW1wb3J0ICogYXMgYXV0b3NjYWxpbmcgZnJvbSBcIkBhd3MtY2RrL2F3cy1hdXRvc2NhbGluZ1wiO1xuaW1wb3J0IHsgRXhpc3RpbmdTdGFjayB9IGZyb20gXCIuL2V4aXN0aW5nX3N0YWNrXCI7XG5pbXBvcnQgeyBDYW5hcnlOZXN0ZWRTdGFjayB9IGZyb20gXCIuL2NhbmFyeV9uZXN0ZWRfc3RhY2tcIjtcbmltcG9ydCAqIGFzIGlhbSBmcm9tIFwiQGF3cy1jZGsvYXdzLWlhbVwiO1xuaW1wb3J0IHsgcmVhZEZpbGVTeW5jIH0gZnJvbSBcImZzXCI7XG5pbXBvcnQgeyBJU3VibmV0LCBTdWJuZXQgfSBmcm9tIFwiQGF3cy1jZGsvYXdzLWVjMlwiO1xuXG5leHBvcnQgY2xhc3MgQ2FuYXJ5U3RhY2sgZXh0ZW5kcyBFeGlzdGluZ1N0YWNrIHtcbiAgY29uc3RydWN0b3IoXG4gICAgc291cmNlOiBjZGsuQXBwLFxuICAgIGlkOiBzdHJpbmcsXG4gICAgc3RhY2tDb25maWc6IGFueSxcbiAgICBwcm9wcz86IGNkay5TdGFja1Byb3BzXG4gICkge1xuICAgIHN1cGVyKHNvdXJjZSwgaWQsIHN0YWNrQ29uZmlnLCBwcm9wcyk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCBcImFyaWFjYW5hcnlcIiwge1xuICAgICAgdmFsdWU6IFwidHJ1ZVwiLFxuICAgIH0pO1xuXG4gICAgdGhpcy50ZW1wbGF0ZU9wdGlvbnMubWV0YWRhdGEgPSB7XG4gICAgICBcInByZS1jYW5hcnktY2ZuXCI6IEpTT04uc3RyaW5naWZ5KHN0YWNrQ29uZmlnLnRlbXBsYXRlKSxcbiAgICB9O1xuXG4gICAgY29uc3QgdnBjID0gZWMyLlZwYy5mcm9tVnBjQXR0cmlidXRlcyhcbiAgICAgIHRoaXMsXG4gICAgICBcImV4dGVybmFsLXZwY1wiLFxuICAgICAgc3RhY2tDb25maWcudnBjQ29uZmlnXG4gICAgKTtcblxuICAgIC8vIGNvbnN0IHN1Ym5ldHM6IElTdWJuZXRbXSA9IHN0YWNrQ29uZmlnLnZwY0NvbmZpZy5wcml2YXRlU3VibmV0SWRzPy5tYXAoXG4gICAgLy8gICAoc3VibmV0SWQ6IHN0cmluZywgaWR4OiBudW1iZXIpID0+IHtcbiAgICAvLyAgICAgcmV0dXJuIGVjMi5TdWJuZXQuZnJvbVN1Ym5ldElkKHRoaXMsIGBwcml2U3ViJHtpZHh9YCwgICk7XG4gICAgLy8gICB9XG4gICAgLy8gKTtcblxuICAgIGNvbnN0IGRlc2lyZWRTdWJuZXQgPSBlYzIuU3VibmV0LmZyb21TdWJuZXRBdHRyaWJ1dGVzKFxuICAgICAgdGhpcyxcbiAgICAgIFwiZGVzaXJlZFN1Ym5ldFwiLFxuICAgICAge1xuICAgICAgICBzdWJuZXRJZDogXCJzdWJuZXQtMGE4ZDQ0N2FkYzY0YjMyNDZcIixcbiAgICAgICAgYXZhaWxhYmlsaXR5Wm9uZTogXCJ1cy13ZXN0LTJjXCIsXG4gICAgICB9XG4gICAgKTtcblxuICAgIGNvbnN0IGFwcFNHID0gZWMyLlNlY3VyaXR5R3JvdXAuZnJvbVNlY3VyaXR5R3JvdXBJZChcbiAgICAgIHRoaXMsXG4gICAgICBcImV4dGVybmFsU2VjdXJpdHlHcm91cFwiLFxuICAgICAgXCJzZy0wZDM1M2UwNzkwYmNhMWVlNVwiXG4gICAgKTtcblxuICAgIGNvbnN0IHVzZXJEYXRhID0gZWMyLlVzZXJEYXRhLmZvckxpbnV4KCk7XG4gICAgdXNlckRhdGEuYWRkQ29tbWFuZHMoXG4gICAgICBcInN1ZG8gc3VcIixcbiAgICAgIFwieXVtIGluc3RhbGwgLXkgaHR0cGRcIixcbiAgICAgIFwic3lzdGVtY3RsIHN0YXJ0IGh0dHBkXCIsXG4gICAgICBcInN5c3RlbWN0bCBlbmFibGUgaHR0cGRcIixcbiAgICAgICdlY2hvIFwiPGgxPkhlbGxvIFRoZXJlIGZyb20gJChob3N0bmFtZSAtZik8L2gxPlwiID4gL3Zhci93d3cvaHRtbC9pbmRleC5odG1sJ1xuICAgICk7XG5cbiAgICAvLyDwn5GHIGNyZWF0ZSB0aGUgRUMyIEluc3RhbmNlXG4gICAgY29uc3QgZWMySW5zdGFuY2UgPSB7XG4gICAgICB2cGMsXG4gICAgICBpbnN0YW5jZVR5cGU6IGVjMi5JbnN0YW5jZVR5cGUub2YoXG4gICAgICAgIGVjMi5JbnN0YW5jZUNsYXNzLlQyLFxuICAgICAgICBlYzIuSW5zdGFuY2VTaXplLk1JQ1JPXG4gICAgICApLFxuICAgICAgdnBjU3VibmV0czoge1xuICAgICAgICBzdWJuZXRzOiBbZGVzaXJlZFN1Ym5ldF0sXG4gICAgICAgIGF2YWlsYWJpbGl0eVpvbmVzOiBbXCJ1cy13ZXN0LTJjXCJdLFxuICAgICAgfSxcbiAgICAgIG1pbkNhcGFjaXR5OiAxLFxuICAgICAgbWF4Q2FwYXRjaXR5OiAxLFxuICAgICAgc2VjdXJpdHlHcm91cDogYXBwU0csXG4gICAgICBtYWNoaW5lSW1hZ2U6IG5ldyBlYzIuQW1hem9uTGludXhJbWFnZSh7XG4gICAgICAgIGdlbmVyYXRpb246IGVjMi5BbWF6b25MaW51eEdlbmVyYXRpb24uQU1BWk9OX0xJTlVYLFxuICAgICAgfSksXG4gICAgICBrZXlOYW1lOiBcImVjMi1rZXktcGFpclwiLFxuICAgIH07XG5cbiAgICBjb25zdCBhc2dTdGFibGUgPSBuZXcgYXV0b3NjYWxpbmcuQXV0b1NjYWxpbmdHcm91cChcbiAgICAgIHRoaXMsXG4gICAgICBcImFzZ1N0YWJsZVwiLFxuICAgICAgZWMySW5zdGFuY2VcbiAgICApO1xuXG4gICAgY29uc3QgY2FuYXJ5QXBwU2V0dXAgPSByZWFkRmlsZVN5bmMoXG4gICAgICBcIi4vc3JjL2Nmbl9pbnRlcmZhY2UvbGliL3VzZXItZGF0YS5zaFwiLFxuICAgICAgXCJ1dGY4XCJcbiAgICApO1xuICAgIGFzZ1N0YWJsZS5hZGRVc2VyRGF0YShjYW5hcnlBcHBTZXR1cCk7XG5cbiAgICAvLyBjb25zdCB0YXJnZXRDYW5hcnkgPSBuZXcgZWxidjIuQXBwbGljYXRpb25UYXJnZXRHcm91cCh0aGlzLCBcInRhcmdldDJcIiwge1xuICAgIC8vICAgdnBjLFxuICAgIC8vICAgcG9ydDogODAsXG4gICAgLy8gICB0YXJnZXRzOiBbYXNnU3RhYmxlXSxcbiAgICAvLyB9KTtcblxuICAgIGNvbnN0IGFsYiA9IGVsYnYyLkFwcGxpY2F0aW9uTG9hZEJhbGFuY2VyLmZyb21Mb29rdXAodGhpcywgXCJleGlzdGluZy1hbGJcIiwge1xuICAgICAgbG9hZEJhbGFuY2VyQXJuOlxuICAgICAgICBcImFybjphd3M6ZWxhc3RpY2xvYWRiYWxhbmNpbmc6dXMtd2VzdC0yOjc1MDA3ODA5NzU4ODpsb2FkYmFsYW5jZXIvYXBwL2Nkay1zLWFsYjhBLTFFRFQ3QjNTQzVGRjQvYTkyY2QyNTk2Y2Q3ZjkyZVwiLFxuICAgICAgLy8gc2VjdXJpdHlHcm91cElkOiBcInNnLTAzMWQ4MWY3NjlkNGI5ZDg0XCIsXG4gICAgICAvLyBsb2FkQmFsYW5jZXJEbnNOYW1lOlxuICAgICAgLy8gICBcImNkay1zLWFsYjhBLTFFRFQ3QjNTQzVGRjQtNjg1MDA1NjMzLnVzLXdlc3QtMi5lbGIuYW1hem9uYXdzLmNvbVwiLFxuICAgIH0pO1xuXG4gICAgLy8gY29uc3QgY2FuYXJ5UmVzb3VyY2VzID0gbmV3IENhbmFyeU5lc3RlZFN0YWNrKHRoaXMsIFwiY2FuYXJ5LXJlc291cmNlc1wiLCB7XG4gICAgLy8gICB2cGMsXG4gICAgLy8gICBhbGIsXG4gICAgLy8gfSk7XG5cbiAgICAvLyBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCBcImFyaWFDYW5hcnlBbGJETlNcIiwge1xuICAgIC8vICAgdmFsdWU6IGFsYi5sb2FkQmFsYW5jZXJEbnNOYW1lLFxuICAgIC8vIH0pO1xuXG4gICAgY29uc3QgbGlzdGVuZXIgPSBlbGJ2Mi5BcHBsaWNhdGlvbkxpc3RlbmVyLmZyb21Mb29rdXAoXG4gICAgICB0aGlzLFxuICAgICAgXCJleGlzdGluZy1saXN0ZW5lclwiLFxuICAgICAge1xuICAgICAgICBsaXN0ZW5lckFybjpcbiAgICAgICAgICBcImFybjphd3M6ZWxhc3RpY2xvYWRiYWxhbmNpbmc6dXMtd2VzdC0yOjc1MDA3ODA5NzU4ODpsaXN0ZW5lci9hcHAvY2RrLXMtYWxiOEEtREkxTlU0NUw0R0dJLzhjNzFiNTFlOWEzY2ZiODQvOTMxZWQzNjZlYzQ0Y2Q0NlwiLFxuICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBjb25zdCBhcHBsaWNhdGlvbkxpc3RlbmVyID0gZWxidjIuQXBwbGljYXRpb25MaXN0ZW5lci5pbXBvcnQodGhpcywgXCJBTEJMaXN0ZW5lclwiLCB7XG4gICAgLy8gICBsaXN0ZW5lckFybjogXCJhcm46YXdzOmVsYXN0aWNsb2FkYmFsYW5jaW5nOnVzLXdlc3QtMjo3NTAwNzgwOTc1ODg6bGlzdGVuZXIvYXBwL2Nkay1zLWFsYjhBLURJMU5VNDVMNEdHSS84YzcxYjUxZTlhM2NmYjg0LzkzMWVkMzY2ZWM0NGNkNDZcIixcbiAgICAvLyAgIHNlY3VyaXR5R3JvdXBJZDogYXBwU0dcbiAgICAvLyB9KTtcblxuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBjb25zdCB0ZyA9IG5ldyBlbGJ2Mi5DZm5UYXJnZXRHcm91cCh0aGlzLCBcIlRhcmdldEdyb3VwXCIsIHtcbiAgICAgIGhlYWx0aENoZWNrUGF0aDogXCIvXCIsXG4gICAgICBoZWFsdGhDaGVja1BvcnQ6IFwiODBcIixcbiAgICAgIGhlYWx0aENoZWNrUHJvdG9jb2w6IGVsYnYyLlByb3RvY29sLkhUVFAsXG4gICAgICBoZWFsdGhDaGVja0ludGVydmFsU2Vjb25kczogMTAsXG4gICAgICBoZWFsdGhDaGVja1RpbWVvdXRTZWNvbmRzOiA1LFxuICAgICAgaGVhbHRoeVRocmVzaG9sZENvdW50OiAyLFxuICAgICAgdW5oZWFsdGh5VGhyZXNob2xkQ291bnQ6IDIsXG4gICAgICBwb3J0OiA4MCxcbiAgICAgIHByb3RvY29sOiBlbGJ2Mi5Qcm90b2NvbC5IVFRQLFxuICAgICAgdGFyZ2V0VHlwZTogZWxidjIuVGFyZ2V0VHlwZS5JUCxcbiAgICAgIHZwY0lkOiB2cGMudnBjSWQsXG4gICAgfSk7XG5cbiAgICAvL2ltcG9ydCBleGlzdGluZyBBU0dcbiAgICAvLyBjb25zdCBhc2cxID0gYXV0b3NjYWxpbmcuQXV0b1NjYWxpbmdHcm91cC5mcm9tQXV0b1NjYWxpbmdHcm91cE5hbWUoXG4gICAgLy8gICB0aGlzLFxuICAgIC8vICAgXCJleGlzdGluZy1hc2dcIixcbiAgICAvLyAgIFwiY2RrLXN0YWNrLWFzZ0FTRzREMDE0NjcwLTVHMTMzM0QzQzNVRFwiXG4gICAgLy8gKTtcblxuICAgIC8vIEB0cy1pZ25vcmVcblxuICAgIC8vIFRPRE8gaW1wb3J0IGV4aXN0aW5nIGxpc3RlbmVyXG4gICAgLy8gY29uc3QgbGlzdGVuZXIgPSBhbGIuYWRkTGlzdGVuZXIoXCJMaXN0ZW5lclwiLCB7XG4gICAgLy8gICBwb3J0OiA4MCxcbiAgICAvLyAgIG9wZW46IHRydWUsXG4gICAgLy8gfSk7XG5cbiAgICAvLyBjb25zdCBkZWZhdWx0UnVsZSA9IHRoaXMuaW1wb3J0ZWRUZW1wbGF0ZS5nZXRSZXNvdXJjZShcbiAgICAvLyAgIFwiYWxiTGlzdGVuZXJzdGF0aWNSdWxlNEYwMTczNTFcIlxuICAgIC8vICkgYXMgZWxidjIuQ2ZuTGlzdGVuZXJSdWxlO1xuXG4gICAgLy8gY29uc3QgZXhpc2l0aW5nVGFyZ2V0R3JvdXAgPVxuICAgIC8vICAgZWxidjIuQXBwbGljYXRpb25UYXJnZXRHcm91cC5mcm9tVGFyZ2V0R3JvdXBBdHRyaWJ1dGVzKFxuICAgIC8vICAgICB0aGlzLFxuICAgIC8vICAgICBcImV4aXN0aW5nLXRhcmdldC1ncm91cFwiLFxuICAgIC8vICAgICB7XG4gICAgLy8gICAgICAgdGFyZ2V0R3JvdXBBcm46XG4gICAgLy8gICAgICAgICBcImFybjphd3M6ZWxhc3RpY2xvYWRiYWxhbmNpbmc6dXMtd2VzdC0yOjc1MDA3ODA5NzU4ODp0YXJnZXRncm91cC9jZGstcy1hbGJMaS0xRTFUVExROFNSOTFXL2IzZjY4ZTI5ZWNhYTcyMDNcIixcbiAgICAvLyAgICAgfVxuICAgIC8vICAgKSBhcyB1bmtub3duIGFzIGVsYnYyLkFwcGxpY2F0aW9uVGFyZ2V0R3JvdXA7XG5cbiAgICAvLyBUT0RPIGltcG9ydCBsaXN0ZW5lciBhY3Rpb25zICh3cml0ZSBvdmVyKVxuICAgIC8vIG5ldyBlbGJ2Mi5BcHBsaWNhdGlvbkxpc3RlbmVyUnVsZSh0aGlzLCBcIndlaWdodGluZ1J1bGVcIiwge1xuICAgIC8vICAgbGlzdGVuZXI6IGxpc3RlbmVyLFxuICAgIC8vICAgcHJpb3JpdHk6IDUsXG4gICAgLy8gICBhY3Rpb246XG4gICAgLy8gICAgIGVsYnYyLkxpc3RlbmVyQWN0aW9uLmZvcndhcmQoW3RhcmdldENhbmFyeV1cbiAgICAvLyAgIC8vICBlbGJ2Mi5MaXN0ZW5lckFjdGlvbi53ZWlnaHRlZEZvcndhcmQoW1xuICAgIC8vICAgLy8gICB7IHRhcmdldEdyb3VwOiBleGlzaXRpbmdUYXJnZXRHcm91cCwgd2VpZ2h0OiAyIH0sXG4gICAgLy8gICAvLyAgIHsgdGFyZ2V0R3JvdXA6IGNhbmFyeVRhcmdldEdyb3VwLCB3ZWlnaHQ6IDEgfSxdXG4gICAgLy8gICApLFxuICAgIC8vICAgY29uZGl0aW9uczogW2VsYnYyLkxpc3RlbmVyQ29uZGl0aW9uLmh0dHBSZXF1ZXN0TWV0aG9kcyhbXCJHRVRcIl0pXSxcbiAgICAvLyB9KTtcbiAgfVxufVxuIl19