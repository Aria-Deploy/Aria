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
    constructor(id, stackConfig, props) {
        super(id, stackConfig, props);
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
            machineImage: ec2.MachineImage.lookup({ name: "" })
            //new ec2.AmazonLinuxImage({
            //   generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX,
            // }),
            ,
            //new ec2.AmazonLinuxImage({
            //   generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX,
            // }),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2xkX2NhbmFyeV9zdGFjayBjb3B5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2Nmbl9pbnRlcmZhY2UvbGliL29sZF9jYW5hcnlfc3RhY2sgY29weS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbURBQXFDO0FBQ3JDLDJFQUE2RDtBQUM3RCxzREFBd0M7QUFDeEMsc0VBQXdEO0FBQ3hELHFEQUFpRDtBQUdqRCwyQkFBa0M7QUFHbEMsTUFBYSxXQUFZLFNBQVEsOEJBQWE7SUFDNUMsWUFBWSxFQUFVLEVBQUUsV0FBZ0IsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsRUFBRSxFQUFFLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUU5QixJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRTtZQUNwQyxLQUFLLEVBQUUsTUFBTTtTQUNkLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxHQUFHO1lBQzlCLGdCQUFnQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQztTQUN2RCxDQUFDO1FBRUYsTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FDbkMsSUFBSSxFQUNKLGNBQWMsRUFDZCxXQUFXLENBQUMsU0FBUyxDQUN0QixDQUFDO1FBRUYsMEVBQTBFO1FBQzFFLHlDQUF5QztRQUN6QyxnRUFBZ0U7UUFDaEUsTUFBTTtRQUNOLEtBQUs7UUFFTCxNQUFNLGFBQWEsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUNuRCxJQUFJLEVBQ0osZUFBZSxFQUNmO1lBQ0UsUUFBUSxFQUFFLDBCQUEwQjtZQUNwQyxnQkFBZ0IsRUFBRSxZQUFZO1NBQy9CLENBQ0YsQ0FBQztRQUVGLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxhQUFhLENBQUMsbUJBQW1C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UUFDekQsb0NBQW9DO1FBQ3BDLDhCQUE4QjtRQUU5QiwrQkFBK0I7UUFDL0IsNERBQTREO1FBQzVELFlBQVk7UUFDWiwrQkFBK0I7UUFDL0IsUUFBUTtRQUNSLHdCQUF3QjtRQUN4Qix3SEFBd0g7UUFDeEgsUUFBUTtRQUNSLGtEQUFrRDtRQUVsRCw0Q0FBNEM7UUFDNUMsNkRBQTZEO1FBQzdELHdCQUF3QjtRQUN4QixpQkFBaUI7UUFDakIsWUFBWTtRQUNaLGtEQUFrRDtRQUNsRCwrQ0FBK0M7UUFDL0MsMkRBQTJEO1FBQzNELHlEQUF5RDtRQUN6RCxPQUFPO1FBQ1AsdUVBQXVFO1FBQ3ZFLE1BQU07SUFDUixDQUFDO0NBQ0Y7QUFoTEQsa0NBZ0xDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gXCJAYXdzLWNkay9jb3JlXCI7XG5pbXBvcnQgKiBhcyBlbGJ2MiBmcm9tIFwiQGF3cy1jZGsvYXdzLWVsYXN0aWNsb2FkYmFsYW5jaW5ndjJcIjtcbmltcG9ydCAqIGFzIGVjMiBmcm9tIFwiQGF3cy1jZGsvYXdzLWVjMlwiO1xuaW1wb3J0ICogYXMgYXV0b3NjYWxpbmcgZnJvbSBcIkBhd3MtY2RrL2F3cy1hdXRvc2NhbGluZ1wiO1xuaW1wb3J0IHsgRXhpc3RpbmdTdGFjayB9IGZyb20gXCIuL2V4aXN0aW5nX3N0YWNrXCI7XG5pbXBvcnQgeyBDYW5hcnlOZXN0ZWRTdGFjayB9IGZyb20gXCIuL2NhbmFyeV9uZXN0ZWRfc3RhY2tcIjtcbmltcG9ydCAqIGFzIGlhbSBmcm9tIFwiQGF3cy1jZGsvYXdzLWlhbVwiO1xuaW1wb3J0IHsgcmVhZEZpbGVTeW5jIH0gZnJvbSBcImZzXCI7XG5pbXBvcnQgeyBJU3VibmV0LCBTdWJuZXQgfSBmcm9tIFwiQGF3cy1jZGsvYXdzLWVjMlwiO1xuXG5leHBvcnQgY2xhc3MgQ2FuYXJ5U3RhY2sgZXh0ZW5kcyBFeGlzdGluZ1N0YWNrIHtcbiAgY29uc3RydWN0b3IoaWQ6IHN0cmluZywgc3RhY2tDb25maWc6IGFueSwgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKGlkLCBzdGFja0NvbmZpZywgcHJvcHMpO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJhcmlhY2FuYXJ5XCIsIHtcbiAgICAgIHZhbHVlOiBcInRydWVcIixcbiAgICB9KTtcblxuICAgIHRoaXMudGVtcGxhdGVPcHRpb25zLm1ldGFkYXRhID0ge1xuICAgICAgXCJwcmUtY2FuYXJ5LWNmblwiOiBKU09OLnN0cmluZ2lmeShzdGFja0NvbmZpZy50ZW1wbGF0ZSksXG4gICAgfTtcblxuICAgIGNvbnN0IHZwYyA9IGVjMi5WcGMuZnJvbVZwY0F0dHJpYnV0ZXMoXG4gICAgICB0aGlzLFxuICAgICAgXCJleHRlcm5hbC12cGNcIixcbiAgICAgIHN0YWNrQ29uZmlnLnZwY0NvbmZpZ1xuICAgICk7XG5cbiAgICAvLyBjb25zdCBzdWJuZXRzOiBJU3VibmV0W10gPSBzdGFja0NvbmZpZy52cGNDb25maWcucHJpdmF0ZVN1Ym5ldElkcz8ubWFwKFxuICAgIC8vICAgKHN1Ym5ldElkOiBzdHJpbmcsIGlkeDogbnVtYmVyKSA9PiB7XG4gICAgLy8gICAgIHJldHVybiBlYzIuU3VibmV0LmZyb21TdWJuZXRJZCh0aGlzLCBgcHJpdlN1YiR7aWR4fWAsICApO1xuICAgIC8vICAgfVxuICAgIC8vICk7XG5cbiAgICBjb25zdCBkZXNpcmVkU3VibmV0ID0gZWMyLlN1Ym5ldC5mcm9tU3VibmV0QXR0cmlidXRlcyhcbiAgICAgIHRoaXMsXG4gICAgICBcImRlc2lyZWRTdWJuZXRcIixcbiAgICAgIHtcbiAgICAgICAgc3VibmV0SWQ6IFwic3VibmV0LTBhOGQ0NDdhZGM2NGIzMjQ2XCIsXG4gICAgICAgIGF2YWlsYWJpbGl0eVpvbmU6IFwidXMtd2VzdC0yY1wiLFxuICAgICAgfVxuICAgICk7XG5cbiAgICBjb25zdCBhcHBTRyA9IGVjMi5TZWN1cml0eUdyb3VwLmZyb21TZWN1cml0eUdyb3VwSWQoXG4gICAgICB0aGlzLFxuICAgICAgXCJleHRlcm5hbFNlY3VyaXR5R3JvdXBcIixcbiAgICAgIFwic2ctMGQzNTNlMDc5MGJjYTFlZTVcIlxuICAgICk7XG5cbiAgICBjb25zdCB1c2VyRGF0YSA9IGVjMi5Vc2VyRGF0YS5mb3JMaW51eCgpO1xuICAgIHVzZXJEYXRhLmFkZENvbW1hbmRzKFxuICAgICAgXCJzdWRvIHN1XCIsXG4gICAgICBcInl1bSBpbnN0YWxsIC15IGh0dHBkXCIsXG4gICAgICBcInN5c3RlbWN0bCBzdGFydCBodHRwZFwiLFxuICAgICAgXCJzeXN0ZW1jdGwgZW5hYmxlIGh0dHBkXCIsXG4gICAgICAnZWNobyBcIjxoMT5IZWxsbyBUaGVyZSBmcm9tICQoaG9zdG5hbWUgLWYpPC9oMT5cIiA+IC92YXIvd3d3L2h0bWwvaW5kZXguaHRtbCdcbiAgICApO1xuXG4gICAgLy8g8J+RhyBjcmVhdGUgdGhlIEVDMiBJbnN0YW5jZVxuICAgIGNvbnN0IGVjMkluc3RhbmNlID0ge1xuICAgICAgdnBjLFxuICAgICAgaW5zdGFuY2VUeXBlOiBlYzIuSW5zdGFuY2VUeXBlLm9mKFxuICAgICAgICBlYzIuSW5zdGFuY2VDbGFzcy5UMixcbiAgICAgICAgZWMyLkluc3RhbmNlU2l6ZS5NSUNST1xuICAgICAgKSxcbiAgICAgIHZwY1N1Ym5ldHM6IHtcbiAgICAgICAgc3VibmV0czogW2Rlc2lyZWRTdWJuZXRdLFxuICAgICAgICBhdmFpbGFiaWxpdHlab25lczogW1widXMtd2VzdC0yY1wiXSxcbiAgICAgIH0sXG4gICAgICBtaW5DYXBhY2l0eTogMSxcbiAgICAgIG1heENhcGF0Y2l0eTogMSxcbiAgICAgIHNlY3VyaXR5R3JvdXA6IGFwcFNHLFxuICAgICAgbWFjaGluZUltYWdlOiBlYzIuTWFjaGluZUltYWdlLmxvb2t1cCh7IG5hbWU6IFwiXCJ9KVxuICAgICAgLy9uZXcgZWMyLkFtYXpvbkxpbnV4SW1hZ2Uoe1xuICAgICAgLy8gICBnZW5lcmF0aW9uOiBlYzIuQW1hem9uTGludXhHZW5lcmF0aW9uLkFNQVpPTl9MSU5VWCxcbiAgICAgIC8vIH0pLFxuICAgICAga2V5TmFtZTogXCJlYzIta2V5LXBhaXJcIixcbiAgICB9O1xuXG4gICAgY29uc3QgYXNnU3RhYmxlID0gbmV3IGF1dG9zY2FsaW5nLkF1dG9TY2FsaW5nR3JvdXAoXG4gICAgICB0aGlzLFxuICAgICAgXCJhc2dTdGFibGVcIixcbiAgICAgIGVjMkluc3RhbmNlXG4gICAgKTtcblxuICAgIGNvbnN0IGNhbmFyeUFwcFNldHVwID0gcmVhZEZpbGVTeW5jKFxuICAgICAgXCIuL3NyYy9jZm5faW50ZXJmYWNlL2xpYi91c2VyLWRhdGEuc2hcIixcbiAgICAgIFwidXRmOFwiXG4gICAgKTtcbiAgICBhc2dTdGFibGUuYWRkVXNlckRhdGEoY2FuYXJ5QXBwU2V0dXApO1xuXG4gICAgLy8gY29uc3QgdGFyZ2V0Q2FuYXJ5ID0gbmV3IGVsYnYyLkFwcGxpY2F0aW9uVGFyZ2V0R3JvdXAodGhpcywgXCJ0YXJnZXQyXCIsIHtcbiAgICAvLyAgIHZwYyxcbiAgICAvLyAgIHBvcnQ6IDgwLFxuICAgIC8vICAgdGFyZ2V0czogW2FzZ1N0YWJsZV0sXG4gICAgLy8gfSk7XG5cbiAgICAvLyBjb25zdCBhbGIgPSBlbGJ2Mi5BcHBsaWNhdGlvbkxvYWRCYWxhbmNlci5mcm9tTG9va3VwKHRoaXMsIFwiZXhpc3RpbmctYWxiXCIsIHtcbiAgICAvLyAgIGxvYWRCYWxhbmNlckFybjpcbiAgICAvLyAgICAgXCJhcm46YXdzOmVsYXN0aWNsb2FkYmFsYW5jaW5nOnVzLXdlc3QtMjo3NTAwNzgwOTc1ODg6bG9hZGJhbGFuY2VyL2FwcC9jZGstcy1hbGI4QS0xRURUN0IzU0M1RkY0L2E5MmNkMjU5NmNkN2Y5MmVcIixcbiAgICAvLyAgIC8vIHNlY3VyaXR5R3JvdXBJZDogXCJzZy0wMzFkODFmNzY5ZDRiOWQ4NFwiLFxuICAgIC8vICAgLy8gbG9hZEJhbGFuY2VyRG5zTmFtZTpcbiAgICAvLyAgIC8vICAgXCJjZGstcy1hbGI4QS0xRURUN0IzU0M1RkY0LTY4NTAwNTYzMy51cy13ZXN0LTIuZWxiLmFtYXpvbmF3cy5jb21cIixcbiAgICAvLyB9KTtcblxuICAgIC8vIGNvbnN0IGNhbmFyeVJlc291cmNlcyA9IG5ldyBDYW5hcnlOZXN0ZWRTdGFjayh0aGlzLCBcImNhbmFyeS1yZXNvdXJjZXNcIiwge1xuICAgIC8vICAgdnBjLFxuICAgIC8vICAgYWxiLFxuICAgIC8vIH0pO1xuXG4gICAgLy8gbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJhcmlhQ2FuYXJ5QWxiRE5TXCIsIHtcbiAgICAvLyAgIHZhbHVlOiBhbGIubG9hZEJhbGFuY2VyRG5zTmFtZSxcbiAgICAvLyB9KTtcblxuICAgIGNvbnN0IGxpc3RlbmVyID0gZWxidjIuQXBwbGljYXRpb25MaXN0ZW5lci5mcm9tTG9va3VwKFxuICAgICAgdGhpcyxcbiAgICAgIFwiZXhpc3RpbmctbGlzdGVuZXJcIixcbiAgICAgIHtcbiAgICAgICAgbGlzdGVuZXJBcm46XG4gICAgICAgICAgXCJhcm46YXdzOmVsYXN0aWNsb2FkYmFsYW5jaW5nOnVzLXdlc3QtMjo3NTAwNzgwOTc1ODg6bGlzdGVuZXIvYXBwL2Nkay1zLWFsYjhBLURJMU5VNDVMNEdHSS84YzcxYjUxZTlhM2NmYjg0LzkzMWVkMzY2ZWM0NGNkNDZcIixcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gY29uc3QgYXBwbGljYXRpb25MaXN0ZW5lciA9IGVsYnYyLkFwcGxpY2F0aW9uTGlzdGVuZXIuaW1wb3J0KHRoaXMsIFwiQUxCTGlzdGVuZXJcIiwge1xuICAgIC8vICAgbGlzdGVuZXJBcm46IFwiYXJuOmF3czplbGFzdGljbG9hZGJhbGFuY2luZzp1cy13ZXN0LTI6NzUwMDc4MDk3NTg4Omxpc3RlbmVyL2FwcC9jZGstcy1hbGI4QS1ESTFOVTQ1TDRHR0kvOGM3MWI1MWU5YTNjZmI4NC85MzFlZDM2NmVjNDRjZDQ2XCIsXG4gICAgLy8gICBzZWN1cml0eUdyb3VwSWQ6IGFwcFNHXG4gICAgLy8gfSk7XG5cbiAgICAvLyBAdHMtaWdub3JlXG4gICAgY29uc3QgdGcgPSBuZXcgZWxidjIuQ2ZuVGFyZ2V0R3JvdXAodGhpcywgXCJUYXJnZXRHcm91cFwiLCB7XG4gICAgICBoZWFsdGhDaGVja1BhdGg6IFwiL1wiLFxuICAgICAgaGVhbHRoQ2hlY2tQb3J0OiBcIjgwXCIsXG4gICAgICBoZWFsdGhDaGVja1Byb3RvY29sOiBlbGJ2Mi5Qcm90b2NvbC5IVFRQLFxuICAgICAgaGVhbHRoQ2hlY2tJbnRlcnZhbFNlY29uZHM6IDEwLFxuICAgICAgaGVhbHRoQ2hlY2tUaW1lb3V0U2Vjb25kczogNSxcbiAgICAgIGhlYWx0aHlUaHJlc2hvbGRDb3VudDogMixcbiAgICAgIHVuaGVhbHRoeVRocmVzaG9sZENvdW50OiAyLFxuICAgICAgcG9ydDogODAsXG4gICAgICBwcm90b2NvbDogZWxidjIuUHJvdG9jb2wuSFRUUCxcbiAgICAgIHRhcmdldFR5cGU6IGVsYnYyLlRhcmdldFR5cGUuSVAsXG4gICAgICB2cGNJZDogdnBjLnZwY0lkLFxuICAgIH0pO1xuXG5cbiAgICAvL2ltcG9ydCBleGlzdGluZyBBU0dcbiAgICAvLyBjb25zdCBhc2cxID0gYXV0b3NjYWxpbmcuQXV0b1NjYWxpbmdHcm91cC5mcm9tQXV0b1NjYWxpbmdHcm91cE5hbWUoXG4gICAgLy8gICB0aGlzLFxuICAgIC8vICAgXCJleGlzdGluZy1hc2dcIixcbiAgICAvLyAgIFwiY2RrLXN0YWNrLWFzZ0FTRzREMDE0NjcwLTVHMTMzM0QzQzNVRFwiXG4gICAgLy8gKTtcblxuICAgIC8vIEB0cy1pZ25vcmVcblxuICAgIC8vIFRPRE8gaW1wb3J0IGV4aXN0aW5nIGxpc3RlbmVyXG4gICAgLy8gY29uc3QgbGlzdGVuZXIgPSBhbGIuYWRkTGlzdGVuZXIoXCJMaXN0ZW5lclwiLCB7XG4gICAgLy8gICBwb3J0OiA4MCxcbiAgICAvLyAgIG9wZW46IHRydWUsXG4gICAgLy8gfSk7XG5cbiAgICAvLyBjb25zdCBkZWZhdWx0UnVsZSA9IHRoaXMuaW1wb3J0ZWRUZW1wbGF0ZS5nZXRSZXNvdXJjZShcbiAgICAvLyAgIFwiYWxiTGlzdGVuZXJzdGF0aWNSdWxlNEYwMTczNTFcIlxuICAgIC8vICkgYXMgZWxidjIuQ2ZuTGlzdGVuZXJSdWxlO1xuXG4gICAgLy8gY29uc3QgZXhpc2l0aW5nVGFyZ2V0R3JvdXAgPVxuICAgIC8vICAgZWxidjIuQXBwbGljYXRpb25UYXJnZXRHcm91cC5mcm9tVGFyZ2V0R3JvdXBBdHRyaWJ1dGVzKFxuICAgIC8vICAgICB0aGlzLFxuICAgIC8vICAgICBcImV4aXN0aW5nLXRhcmdldC1ncm91cFwiLFxuICAgIC8vICAgICB7XG4gICAgLy8gICAgICAgdGFyZ2V0R3JvdXBBcm46XG4gICAgLy8gICAgICAgICBcImFybjphd3M6ZWxhc3RpY2xvYWRiYWxhbmNpbmc6dXMtd2VzdC0yOjc1MDA3ODA5NzU4ODp0YXJnZXRncm91cC9jZGstcy1hbGJMaS0xRTFUVExROFNSOTFXL2IzZjY4ZTI5ZWNhYTcyMDNcIixcbiAgICAvLyAgICAgfVxuICAgIC8vICAgKSBhcyB1bmtub3duIGFzIGVsYnYyLkFwcGxpY2F0aW9uVGFyZ2V0R3JvdXA7XG5cbiAgICAvLyBUT0RPIGltcG9ydCBsaXN0ZW5lciBhY3Rpb25zICh3cml0ZSBvdmVyKVxuICAgIC8vIG5ldyBlbGJ2Mi5BcHBsaWNhdGlvbkxpc3RlbmVyUnVsZSh0aGlzLCBcIndlaWdodGluZ1J1bGVcIiwge1xuICAgIC8vICAgbGlzdGVuZXI6IGxpc3RlbmVyLFxuICAgIC8vICAgcHJpb3JpdHk6IDUsXG4gICAgLy8gICBhY3Rpb246XG4gICAgLy8gICAgIGVsYnYyLkxpc3RlbmVyQWN0aW9uLmZvcndhcmQoW3RhcmdldENhbmFyeV1cbiAgICAvLyAgIC8vICBlbGJ2Mi5MaXN0ZW5lckFjdGlvbi53ZWlnaHRlZEZvcndhcmQoW1xuICAgIC8vICAgLy8gICB7IHRhcmdldEdyb3VwOiBleGlzaXRpbmdUYXJnZXRHcm91cCwgd2VpZ2h0OiAyIH0sXG4gICAgLy8gICAvLyAgIHsgdGFyZ2V0R3JvdXA6IGNhbmFyeVRhcmdldEdyb3VwLCB3ZWlnaHQ6IDEgfSxdXG4gICAgLy8gICApLFxuICAgIC8vICAgY29uZGl0aW9uczogW2VsYnYyLkxpc3RlbmVyQ29uZGl0aW9uLmh0dHBSZXF1ZXN0TWV0aG9kcyhbXCJHRVRcIl0pXSxcbiAgICAvLyB9KTtcbiAgfVxufVxuIl19