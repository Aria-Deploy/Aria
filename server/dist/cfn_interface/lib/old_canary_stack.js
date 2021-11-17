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
        // const alb = elbv2.ApplicationLoadBalancer.fromLookup(this, "existing-alb", {
        //   loadBalancerArn:
        //     "arn:aws:elasticloadbalancing:us-west-2:750078097588:loadbalancer/app/cdk-s-alb8A-1EDT7B3SC5FF4/a92cd2596cd7f92e",
        //   // securityGroupId: "sg-031d81f769d4b9d84",
        //   // loadBalancerDnsName:
        //   //   "cdk-s-alb8A-1EDT7B3SC5FF4-685005633.us-west-2.elb.amazonaws.com",
        // });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2xkX2NhbmFyeV9zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jZm5faW50ZXJmYWNlL2xpYi9vbGRfY2FuYXJ5X3N0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxtREFBcUM7QUFDckMsMkVBQTZEO0FBQzdELHNEQUF3QztBQUN4QyxzRUFBd0Q7QUFDeEQscURBQWlEO0FBR2pELDJCQUFrQztBQUdsQyxNQUFhLFdBQVksU0FBUSw4QkFBYTtJQUM1QyxZQUNFLE1BQWUsRUFDZixFQUFVLEVBQ1YsV0FBZ0IsRUFDaEIsS0FBc0I7UUFFdEIsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXRDLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQ3BDLEtBQUssRUFBRSxNQUFNO1NBQ2QsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEdBQUc7WUFDOUIsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO1NBQ3ZELENBQUM7UUFFRixNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUNuQyxJQUFJLEVBQ0osY0FBYyxFQUNkLFdBQVcsQ0FBQyxTQUFTLENBQ3RCLENBQUM7UUFFRiwwRUFBMEU7UUFDMUUseUNBQXlDO1FBQ3pDLGdFQUFnRTtRQUNoRSxNQUFNO1FBQ04sS0FBSztRQUVMLE1BQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQ25ELElBQUksRUFDSixlQUFlLEVBQ2Y7WUFDRSxRQUFRLEVBQUUsMEJBQTBCO1lBQ3BDLGdCQUFnQixFQUFFLFlBQVk7U0FDL0IsQ0FDRixDQUFDO1FBRUYsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLGFBQWEs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Qy9CLDREQUE0RDtRQUM1RCxZQUFZO1FBQ1osK0JBQStCO1FBQy9CLFFBQVE7UUFDUix3QkFBd0I7UUFDeEIsd0hBQXdIO1FBQ3hILFFBQVE7UUFDUixrREFBa0Q7UUFFbEQsNENBQTRDO1FBQzVDLDZEQUE2RDtRQUM3RCx3QkFBd0I7UUFDeEIsaUJBQWlCO1FBQ2pCLFlBQVk7UUFDWixrREFBa0Q7UUFDbEQsK0NBQStDO1FBQy9DLDJEQUEyRDtRQUMzRCx5REFBeUQ7UUFDekQsT0FBTztRQUNQLHVFQUF1RTtRQUN2RSxNQUFNO0lBQ1IsQ0FBQztDQUNGO0FBbkxELGtDQW1MQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiQGF3cy1jZGsvY29yZVwiO1xuaW1wb3J0ICogYXMgZWxidjIgZnJvbSBcIkBhd3MtY2RrL2F3cy1lbGFzdGljbG9hZGJhbGFuY2luZ3YyXCI7XG5pbXBvcnQgKiBhcyBlYzIgZnJvbSBcIkBhd3MtY2RrL2F3cy1lYzJcIjtcbmltcG9ydCAqIGFzIGF1dG9zY2FsaW5nIGZyb20gXCJAYXdzLWNkay9hd3MtYXV0b3NjYWxpbmdcIjtcbmltcG9ydCB7IEV4aXN0aW5nU3RhY2sgfSBmcm9tIFwiLi9leGlzdGluZ19zdGFja1wiO1xuaW1wb3J0IHsgQ2FuYXJ5TmVzdGVkU3RhY2sgfSBmcm9tIFwiLi9jYW5hcnlfbmVzdGVkX3N0YWNrXCI7XG5pbXBvcnQgKiBhcyBpYW0gZnJvbSBcIkBhd3MtY2RrL2F3cy1pYW1cIjtcbmltcG9ydCB7IHJlYWRGaWxlU3luYyB9IGZyb20gXCJmc1wiO1xuaW1wb3J0IHsgSVN1Ym5ldCwgU3VibmV0IH0gZnJvbSBcIkBhd3MtY2RrL2F3cy1lYzJcIjtcblxuZXhwb3J0IGNsYXNzIENhbmFyeVN0YWNrIGV4dGVuZHMgRXhpc3RpbmdTdGFjayB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHNvdXJjZTogY2RrLkFwcCxcbiAgICBpZDogc3RyaW5nLFxuICAgIHN0YWNrQ29uZmlnOiBhbnksXG4gICAgcHJvcHM/OiBjZGsuU3RhY2tQcm9wc1xuICApIHtcbiAgICBzdXBlcihzb3VyY2UsIGlkLCBzdGFja0NvbmZpZywgcHJvcHMpO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJhcmlhY2FuYXJ5XCIsIHtcbiAgICAgIHZhbHVlOiBcInRydWVcIixcbiAgICB9KTtcblxuICAgIHRoaXMudGVtcGxhdGVPcHRpb25zLm1ldGFkYXRhID0ge1xuICAgICAgXCJwcmUtY2FuYXJ5LWNmblwiOiBKU09OLnN0cmluZ2lmeShzdGFja0NvbmZpZy50ZW1wbGF0ZSksXG4gICAgfTtcblxuICAgIGNvbnN0IHZwYyA9IGVjMi5WcGMuZnJvbVZwY0F0dHJpYnV0ZXMoXG4gICAgICB0aGlzLFxuICAgICAgXCJleHRlcm5hbC12cGNcIixcbiAgICAgIHN0YWNrQ29uZmlnLnZwY0NvbmZpZ1xuICAgICk7XG5cbiAgICAvLyBjb25zdCBzdWJuZXRzOiBJU3VibmV0W10gPSBzdGFja0NvbmZpZy52cGNDb25maWcucHJpdmF0ZVN1Ym5ldElkcz8ubWFwKFxuICAgIC8vICAgKHN1Ym5ldElkOiBzdHJpbmcsIGlkeDogbnVtYmVyKSA9PiB7XG4gICAgLy8gICAgIHJldHVybiBlYzIuU3VibmV0LmZyb21TdWJuZXRJZCh0aGlzLCBgcHJpdlN1YiR7aWR4fWAsICApO1xuICAgIC8vICAgfVxuICAgIC8vICk7XG5cbiAgICBjb25zdCBkZXNpcmVkU3VibmV0ID0gZWMyLlN1Ym5ldC5mcm9tU3VibmV0QXR0cmlidXRlcyhcbiAgICAgIHRoaXMsXG4gICAgICBcImRlc2lyZWRTdWJuZXRcIixcbiAgICAgIHtcbiAgICAgICAgc3VibmV0SWQ6IFwic3VibmV0LTBhOGQ0NDdhZGM2NGIzMjQ2XCIsXG4gICAgICAgIGF2YWlsYWJpbGl0eVpvbmU6IFwidXMtd2VzdC0yY1wiLFxuICAgICAgfVxuICAgICk7XG5cbiAgICBjb25zdCBhcHBTRyA9IGVjMi5TZWN1cml0eUdyb3VwLmZyb21TZWN1cml0eUdyb3VwSWQoXG4gICAgICB0aGlzLFxuICAgICAgXCJleHRlcm5hbFNlY3VyaXR5R3JvdXBcIixcbiAgICAgIFwic2ctMGQzNTNlMDc5MGJjYTFlZTVcIlxuICAgICk7XG5cbiAgICBjb25zdCB1c2VyRGF0YSA9IGVjMi5Vc2VyRGF0YS5mb3JMaW51eCgpO1xuICAgIHVzZXJEYXRhLmFkZENvbW1hbmRzKFxuICAgICAgXCJzdWRvIHN1XCIsXG4gICAgICBcInl1bSBpbnN0YWxsIC15IGh0dHBkXCIsXG4gICAgICBcInN5c3RlbWN0bCBzdGFydCBodHRwZFwiLFxuICAgICAgXCJzeXN0ZW1jdGwgZW5hYmxlIGh0dHBkXCIsXG4gICAgICAnZWNobyBcIjxoMT5IZWxsbyBUaGVyZSBmcm9tICQoaG9zdG5hbWUgLWYpPC9oMT5cIiA+IC92YXIvd3d3L2h0bWwvaW5kZXguaHRtbCdcbiAgICApO1xuXG4gICAgLy8g8J+RhyBjcmVhdGUgdGhlIEVDMiBJbnN0YW5jZVxuICAgIGNvbnN0IGVjMkluc3RhbmNlID0ge1xuICAgICAgdnBjLFxuICAgICAgaW5zdGFuY2VUeXBlOiBlYzIuSW5zdGFuY2VUeXBlLm9mKFxuICAgICAgICBlYzIuSW5zdGFuY2VDbGFzcy5UMixcbiAgICAgICAgZWMyLkluc3RhbmNlU2l6ZS5NSUNST1xuICAgICAgKSxcbiAgICAgIHZwY1N1Ym5ldHM6IHtcbiAgICAgICAgc3VibmV0czogW2Rlc2lyZWRTdWJuZXRdLFxuICAgICAgICBhdmFpbGFiaWxpdHlab25lczogW1widXMtd2VzdC0yY1wiXSxcbiAgICAgIH0sXG4gICAgICBtaW5DYXBhY2l0eTogMSxcbiAgICAgIG1heENhcGF0Y2l0eTogMSxcbiAgICAgIHNlY3VyaXR5R3JvdXA6IGFwcFNHLFxuICAgICAgbWFjaGluZUltYWdlOiBuZXcgZWMyLkFtYXpvbkxpbnV4SW1hZ2Uoe1xuICAgICAgICBnZW5lcmF0aW9uOiBlYzIuQW1hem9uTGludXhHZW5lcmF0aW9uLkFNQVpPTl9MSU5VWCxcbiAgICAgIH0pLFxuICAgICAga2V5TmFtZTogXCJlYzIta2V5LXBhaXJcIixcbiAgICB9O1xuXG4gICAgY29uc3QgYXNnU3RhYmxlID0gbmV3IGF1dG9zY2FsaW5nLkF1dG9TY2FsaW5nR3JvdXAoXG4gICAgICB0aGlzLFxuICAgICAgXCJhc2dTdGFibGVcIixcbiAgICAgIGVjMkluc3RhbmNlXG4gICAgKTtcblxuICAgIGNvbnN0IGNhbmFyeUFwcFNldHVwID0gcmVhZEZpbGVTeW5jKFxuICAgICAgXCIuL3NyYy9jZm5faW50ZXJmYWNlL2xpYi91c2VyLWRhdGEuc2hcIixcbiAgICAgIFwidXRmOFwiXG4gICAgKTtcbiAgICBhc2dTdGFibGUuYWRkVXNlckRhdGEoY2FuYXJ5QXBwU2V0dXApO1xuXG4gICAgLy8gY29uc3QgdGFyZ2V0Q2FuYXJ5ID0gbmV3IGVsYnYyLkFwcGxpY2F0aW9uVGFyZ2V0R3JvdXAodGhpcywgXCJ0YXJnZXQyXCIsIHtcbiAgICAvLyAgIHZwYyxcbiAgICAvLyAgIHBvcnQ6IDgwLFxuICAgIC8vICAgdGFyZ2V0czogW2FzZ1N0YWJsZV0sXG4gICAgLy8gfSk7XG5cbiAgICAvLyBjb25zdCBhbGIgPSBlbGJ2Mi5BcHBsaWNhdGlvbkxvYWRCYWxhbmNlci5mcm9tTG9va3VwKHRoaXMsIFwiZXhpc3RpbmctYWxiXCIsIHtcbiAgICAvLyAgIGxvYWRCYWxhbmNlckFybjpcbiAgICAvLyAgICAgXCJhcm46YXdzOmVsYXN0aWNsb2FkYmFsYW5jaW5nOnVzLXdlc3QtMjo3NTAwNzgwOTc1ODg6bG9hZGJhbGFuY2VyL2FwcC9jZGstcy1hbGI4QS0xRURUN0IzU0M1RkY0L2E5MmNkMjU5NmNkN2Y5MmVcIixcbiAgICAvLyAgIC8vIHNlY3VyaXR5R3JvdXBJZDogXCJzZy0wMzFkODFmNzY5ZDRiOWQ4NFwiLFxuICAgIC8vICAgLy8gbG9hZEJhbGFuY2VyRG5zTmFtZTpcbiAgICAvLyAgIC8vICAgXCJjZGstcy1hbGI4QS0xRURUN0IzU0M1RkY0LTY4NTAwNTYzMy51cy13ZXN0LTIuZWxiLmFtYXpvbmF3cy5jb21cIixcbiAgICAvLyB9KTtcblxuICAgIC8vIGNvbnN0IGNhbmFyeVJlc291cmNlcyA9IG5ldyBDYW5hcnlOZXN0ZWRTdGFjayh0aGlzLCBcImNhbmFyeS1yZXNvdXJjZXNcIiwge1xuICAgIC8vICAgdnBjLFxuICAgIC8vICAgYWxiLFxuICAgIC8vIH0pO1xuXG4gICAgLy8gbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJhcmlhQ2FuYXJ5QWxiRE5TXCIsIHtcbiAgICAvLyAgIHZhbHVlOiBhbGIubG9hZEJhbGFuY2VyRG5zTmFtZSxcbiAgICAvLyB9KTtcblxuICAgIGNvbnN0IGxpc3RlbmVyID0gZWxidjIuQXBwbGljYXRpb25MaXN0ZW5lci5mcm9tTG9va3VwKFxuICAgICAgdGhpcyxcbiAgICAgIFwiZXhpc3RpbmctbGlzdGVuZXJcIixcbiAgICAgIHtcbiAgICAgICAgbGlzdGVuZXJBcm46XG4gICAgICAgICAgXCJhcm46YXdzOmVsYXN0aWNsb2FkYmFsYW5jaW5nOnVzLXdlc3QtMjo3NTAwNzgwOTc1ODg6bGlzdGVuZXIvYXBwL2Nkay1zLWFsYjhBLURJMU5VNDVMNEdHSS84YzcxYjUxZTlhM2NmYjg0LzkzMWVkMzY2ZWM0NGNkNDZcIixcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gY29uc3QgYXBwbGljYXRpb25MaXN0ZW5lciA9IGVsYnYyLkFwcGxpY2F0aW9uTGlzdGVuZXIuaW1wb3J0KHRoaXMsIFwiQUxCTGlzdGVuZXJcIiwge1xuICAgIC8vICAgbGlzdGVuZXJBcm46IFwiYXJuOmF3czplbGFzdGljbG9hZGJhbGFuY2luZzp1cy13ZXN0LTI6NzUwMDc4MDk3NTg4Omxpc3RlbmVyL2FwcC9jZGstcy1hbGI4QS1ESTFOVTQ1TDRHR0kvOGM3MWI1MWU5YTNjZmI4NC85MzFlZDM2NmVjNDRjZDQ2XCIsXG4gICAgLy8gICBzZWN1cml0eUdyb3VwSWQ6IGFwcFNHXG4gICAgLy8gfSk7XG5cbiAgICAvLyBAdHMtaWdub3JlXG4gICAgY29uc3QgdGcgPSBuZXcgZWxidjIuQ2ZuVGFyZ2V0R3JvdXAodGhpcywgXCJUYXJnZXRHcm91cFwiLCB7XG4gICAgICBoZWFsdGhDaGVja1BhdGg6IFwiL1wiLFxuICAgICAgaGVhbHRoQ2hlY2tQb3J0OiBcIjgwXCIsXG4gICAgICBoZWFsdGhDaGVja1Byb3RvY29sOiBlbGJ2Mi5Qcm90b2NvbC5IVFRQLFxuICAgICAgaGVhbHRoQ2hlY2tJbnRlcnZhbFNlY29uZHM6IDEwLFxuICAgICAgaGVhbHRoQ2hlY2tUaW1lb3V0U2Vjb25kczogNSxcbiAgICAgIGhlYWx0aHlUaHJlc2hvbGRDb3VudDogMixcbiAgICAgIHVuaGVhbHRoeVRocmVzaG9sZENvdW50OiAyLFxuICAgICAgcG9ydDogODAsXG4gICAgICBwcm90b2NvbDogZWxidjIuUHJvdG9jb2wuSFRUUCxcbiAgICAgIHRhcmdldFR5cGU6IGVsYnYyLlRhcmdldFR5cGUuSVAsXG4gICAgICB2cGNJZDogdnBjLnZwY0lkLFxuICAgIH0pO1xuXG4gICAgLy9pbXBvcnQgZXhpc3RpbmcgQVNHXG4gICAgLy8gY29uc3QgYXNnMSA9IGF1dG9zY2FsaW5nLkF1dG9TY2FsaW5nR3JvdXAuZnJvbUF1dG9TY2FsaW5nR3JvdXBOYW1lKFxuICAgIC8vICAgdGhpcyxcbiAgICAvLyAgIFwiZXhpc3RpbmctYXNnXCIsXG4gICAgLy8gICBcImNkay1zdGFjay1hc2dBU0c0RDAxNDY3MC01RzEzMzNEM0MzVURcIlxuICAgIC8vICk7XG5cbiAgICAvLyBAdHMtaWdub3JlXG5cbiAgICAvLyBUT0RPIGltcG9ydCBleGlzdGluZyBsaXN0ZW5lclxuICAgIC8vIGNvbnN0IGxpc3RlbmVyID0gYWxiLmFkZExpc3RlbmVyKFwiTGlzdGVuZXJcIiwge1xuICAgIC8vICAgcG9ydDogODAsXG4gICAgLy8gICBvcGVuOiB0cnVlLFxuICAgIC8vIH0pO1xuXG4gICAgLy8gY29uc3QgZGVmYXVsdFJ1bGUgPSB0aGlzLmltcG9ydGVkVGVtcGxhdGUuZ2V0UmVzb3VyY2UoXG4gICAgLy8gICBcImFsYkxpc3RlbmVyc3RhdGljUnVsZTRGMDE3MzUxXCJcbiAgICAvLyApIGFzIGVsYnYyLkNmbkxpc3RlbmVyUnVsZTtcblxuICAgIC8vIGNvbnN0IGV4aXNpdGluZ1RhcmdldEdyb3VwID1cbiAgICAvLyAgIGVsYnYyLkFwcGxpY2F0aW9uVGFyZ2V0R3JvdXAuZnJvbVRhcmdldEdyb3VwQXR0cmlidXRlcyhcbiAgICAvLyAgICAgdGhpcyxcbiAgICAvLyAgICAgXCJleGlzdGluZy10YXJnZXQtZ3JvdXBcIixcbiAgICAvLyAgICAge1xuICAgIC8vICAgICAgIHRhcmdldEdyb3VwQXJuOlxuICAgIC8vICAgICAgICAgXCJhcm46YXdzOmVsYXN0aWNsb2FkYmFsYW5jaW5nOnVzLXdlc3QtMjo3NTAwNzgwOTc1ODg6dGFyZ2V0Z3JvdXAvY2RrLXMtYWxiTGktMUUxVFRMUThTUjkxVy9iM2Y2OGUyOWVjYWE3MjAzXCIsXG4gICAgLy8gICAgIH1cbiAgICAvLyAgICkgYXMgdW5rbm93biBhcyBlbGJ2Mi5BcHBsaWNhdGlvblRhcmdldEdyb3VwO1xuXG4gICAgLy8gVE9ETyBpbXBvcnQgbGlzdGVuZXIgYWN0aW9ucyAod3JpdGUgb3ZlcilcbiAgICAvLyBuZXcgZWxidjIuQXBwbGljYXRpb25MaXN0ZW5lclJ1bGUodGhpcywgXCJ3ZWlnaHRpbmdSdWxlXCIsIHtcbiAgICAvLyAgIGxpc3RlbmVyOiBsaXN0ZW5lcixcbiAgICAvLyAgIHByaW9yaXR5OiA1LFxuICAgIC8vICAgYWN0aW9uOlxuICAgIC8vICAgICBlbGJ2Mi5MaXN0ZW5lckFjdGlvbi5mb3J3YXJkKFt0YXJnZXRDYW5hcnldXG4gICAgLy8gICAvLyAgZWxidjIuTGlzdGVuZXJBY3Rpb24ud2VpZ2h0ZWRGb3J3YXJkKFtcbiAgICAvLyAgIC8vICAgeyB0YXJnZXRHcm91cDogZXhpc2l0aW5nVGFyZ2V0R3JvdXAsIHdlaWdodDogMiB9LFxuICAgIC8vICAgLy8gICB7IHRhcmdldEdyb3VwOiBjYW5hcnlUYXJnZXRHcm91cCwgd2VpZ2h0OiAxIH0sXVxuICAgIC8vICAgKSxcbiAgICAvLyAgIGNvbmRpdGlvbnM6IFtlbGJ2Mi5MaXN0ZW5lckNvbmRpdGlvbi5odHRwUmVxdWVzdE1ldGhvZHMoW1wiR0VUXCJdKV0sXG4gICAgLy8gfSk7XG4gIH1cbn1cbiJdfQ==