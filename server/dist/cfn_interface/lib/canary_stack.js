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
const autoscaling = __importStar(require("@aws-cdk/aws-autoscaling"));
const ec2 = __importStar(require("@aws-cdk/aws-ec2"));
const elbv2 = __importStar(require("@aws-cdk/aws-elasticloadbalancingv2"));
const cdk = __importStar(require("@aws-cdk/core"));
const fs_1 = require("fs");
const existing_stack_1 = require("./existing_stack");
class CanaryStack extends existing_stack_1.ExistingStack {
    constructor(scope, id, stackConfig, props) {
        super(scope, id, stackConfig, props);
        const stackContext = this;
        const vpc = ec2.Vpc.fromVpcAttributes(this, "external-vpc", stackConfig.vpcConfig);
        const prodInstanceSGs = stackConfig.securityGroupIds.map((sgId, idx) => {
            return ec2.SecurityGroup.fromSecurityGroupId(stackContext, `prodInstanceSG-${idx}`, sgId.groupId);
        });
        // 👇 create security group for application ec2 instances
        const appSG = new ec2.SecurityGroup(this, "app-sg", {
            vpc,
            allowAllOutbound: true,
        });
        appSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), "allow SSH access from anywhere");
        appSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(9100), "allow node_exporter access from anywhere");
        appSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), "allow all http acess");
        // custom image
        // const machineImage = ec2.MachineImage.lookup({
        //   name: "prometheus-monitoring-itself"
        // })
        // define configuration for app-base-and-canary asg ec2 instances,
        const appInstance = {
            vpc,
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
            machineImage: new ec2.AmazonLinuxImage({
                generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
            }),
            minCapacity: 1,
            maxCapacity: 1,
            keyName: "ec2-key-pair",
            securityGroup: appSG,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PUBLIC,
            },
        };
        // const baselineAppSetup = readFileSync(
        //   "./src/scripts/baselineSetup.sh",
        //   "utf8"
        // );
        const canaryAppSetup = fs_1.readFileSync("./src/scripts/canarySetup.sh", "utf8");
        // create new autoscaling groups
        // const asgBaseline = new autoscaling.AutoScalingGroup(
        //   this,
        //   "asgBaseline",
        //   appInstance
        // );
        // asgBaseline.addUserData(baselineAppSetup);
        // asgBaseline.addSecurityGroup(prodInstanceSG);
        const asgCanary = new autoscaling.AutoScalingGroup(this, "asgCanary", appInstance);
        asgCanary.addUserData(canaryAppSetup);
        prodInstanceSGs.forEach((sg) => asgCanary.addSecurityGroup(sg));
        // asgCanary.addSecurityGroup(prodInstanceSG);
        // define target groups for ALB
        // const targetBaseline = new elbv2.ApplicationTargetGroup(
        //   this,
        //   "BASELINE_TARGET",
        //   {
        //     vpc,
        //     // TODO user defined port value
        //     port: 80,
        //     targets: [asgBaseline],
        //   }
        // );
        const targetCanary = new elbv2.ApplicationTargetGroup(this, "CANARY_TARGET", {
            vpc,
            // TODO user defined port value
            port: 80,
            targets: [asgCanary],
        });
        // const listener = elbv2.ApplicationListener.fromLookup(
        //   this,
        //   "existingListener",
        //   {
        //     listenerArn:
        //       "arn:aws:elasticloadbalancing:us-west-2:750078097588:listener/app/cdk-s-alb8A-1AA9PUZ3YMG8L/2c17b1191f4de0af/e647e3a808a97a5e",
        //   }
        // );
        new cdk.CfnOutput(this, "ariacanary", {
            value: "true",
        });
        new cdk.CfnOutput(this, "loadBalancerName", {
            value: stackConfig.selectedAlbName,
        });
        new cdk.CfnOutput(this, "listenerArn", {
            value: stackConfig.selectedListenerArn,
        });
        // new cdk.CfnOutput(this, "Baseline-Target-Group-Arn", {
        //   value: targetBaseline.targetGroupArn,
        // });
        new cdk.CfnOutput(this, "Canary-Target-Group-Arn", {
            value: targetCanary.targetGroupArn,
        });
        // output ip addresses/dns address for
        // prometheus, baseline, canary, grafana
        // new cdk.CfnOutput(this, "albDNS", {
        //   value: `http://${alb.loadBalancerDnsName}`,
        // });
    }
}
exports.CanaryStack = CanaryStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FuYXJ5X3N0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2Nmbl9pbnRlcmZhY2UvbGliL2NhbmFyeV9zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsc0VBQXdEO0FBQ3hELHNEQUF3QztBQUN4QywyRUFBNkQ7QUFDN0QsbURBQXFDO0FBQ3JDLDJCQUFrQztBQUNsQyxxREFBaUQ7QUFFakQsTUFBYSxXQUFZLFNBQVEsOEJBQWE7SUFDNUMsWUFDRSxLQUFjLEVBQ2QsRUFBVSxFQUNWLFdBQWdCLEVBQ2hCLEtBQXNCO1FBRXRCLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNyQyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUM7UUFFMUIsTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FDbkMsSUFBSSxFQUNKLGNBQWMsRUFDZCxXQUFXLENBQUMsU0FBUyxDQUN0QixDQUFDO1FBRUYsTUFBTSxlQUFlLEdBQUcsV0FBVyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FDdEQsQ0FBQyxJQUFTLEVBQUUsR0FBVyxFQUFFLEVBQUU7WUFDekIsT0FBTyxHQUFHLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUMxQyxZQUFZLEVBQ1osa0JBQWtCLEdBQUcsRUFBRSxFQUN2QixJQUFJLENBQUMsT0FBTyxDQUNiLENBQUM7UUFDSixDQUFDLENBQ0YsQ0FBQztRQUVGLHlEQUF5RDtRQUN6RCxNQUFNLEtBQUssR0FBRyxJQUFJLEdBQUcsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRTtZQUNsRCxHQUFHO1lBQ0gsZ0JBQWdCLEVBQUUsSUFBSTtTQUN2QixDQUFDLENBQUM7UUFFSCxLQUFLLENBQUMsY0FBYyxDQUNsQixHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUNsQixH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QUFhLEVBQUU7WUFDckMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxtQkFBbUI7U0FDdkMsQ0FBQyxDQUFDO1FBRUgseURBQXlEO1FBQ3pELDBDQUEwQztRQUMxQyxNQUFNO1FBRU4sSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSx5QkFBeUIsRUFBRTtZQUNqRCxLQUFLLEVBQUUsWUFBWSxDQUFDLGNBQWM7U0FDbkMsQ0FBQyxDQUFDO1FBRUgsc0NBQXNDO1FBQ3RDLHdDQUF3QztRQUN4QyxzQ0FBc0M7UUFDdEMsZ0RBQWdEO1FBQ2hELE1BQU07SUFDUixDQUFDO0NBQ0Y7QUE1SkQsa0NBNEpDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgYXV0b3NjYWxpbmcgZnJvbSBcIkBhd3MtY2RrL2F3cy1hdXRvc2NhbGluZ1wiO1xuaW1wb3J0ICogYXMgZWMyIGZyb20gXCJAYXdzLWNkay9hd3MtZWMyXCI7XG5pbXBvcnQgKiBhcyBlbGJ2MiBmcm9tIFwiQGF3cy1jZGsvYXdzLWVsYXN0aWNsb2FkYmFsYW5jaW5ndjJcIjtcbmltcG9ydCAqIGFzIGNkayBmcm9tIFwiQGF3cy1jZGsvY29yZVwiO1xuaW1wb3J0IHsgcmVhZEZpbGVTeW5jIH0gZnJvbSBcImZzXCI7XG5pbXBvcnQgeyBFeGlzdGluZ1N0YWNrIH0gZnJvbSBcIi4vZXhpc3Rpbmdfc3RhY2tcIjtcblxuZXhwb3J0IGNsYXNzIENhbmFyeVN0YWNrIGV4dGVuZHMgRXhpc3RpbmdTdGFjayB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHNjb3BlOiBjZGsuQXBwLFxuICAgIGlkOiBzdHJpbmcsXG4gICAgc3RhY2tDb25maWc6IGFueSxcbiAgICBwcm9wcz86IGNkay5TdGFja1Byb3BzXG4gICkge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgc3RhY2tDb25maWcsIHByb3BzKTtcbiAgICBjb25zdCBzdGFja0NvbnRleHQgPSB0aGlzO1xuXG4gICAgY29uc3QgdnBjID0gZWMyLlZwYy5mcm9tVnBjQXR0cmlidXRlcyhcbiAgICAgIHRoaXMsXG4gICAgICBcImV4dGVybmFsLXZwY1wiLFxuICAgICAgc3RhY2tDb25maWcudnBjQ29uZmlnXG4gICAgKTtcblxuICAgIGNvbnN0IHByb2RJbnN0YW5jZVNHcyA9IHN0YWNrQ29uZmlnLnNlY3VyaXR5R3JvdXBJZHMubWFwKFxuICAgICAgKHNnSWQ6IGFueSwgaWR4OiBudW1iZXIpID0+IHtcbiAgICAgICAgcmV0dXJuIGVjMi5TZWN1cml0eUdyb3VwLmZyb21TZWN1cml0eUdyb3VwSWQoXG4gICAgICAgICAgc3RhY2tDb250ZXh0LFxuICAgICAgICAgIGBwcm9kSW5zdGFuY2VTRy0ke2lkeH1gLFxuICAgICAgICAgIHNnSWQuZ3JvdXBJZFxuICAgICAgICApO1xuICAgICAgfVxuICAgICk7XG5cbiAgICAvLyDwn5GHIGNyZWF0ZSBzZWN1cml0eSBncm91cCBmb3IgYXBwbGljYXRpb24gZWMyIGluc3RhbmNlc1xuICAgIGNvbnN0IGFwcFNHID0gbmV3IGVjMi5TZWN1cml0eUdyb3VwKHRoaXMsIFwiYXBwLXNnXCIsIHtcbiAgICAgIHZwYyxcbiAgICAgIGFsbG93QWxsT3V0Ym91bmQ6IHRydWUsXG4gICAgfSk7XG5cbiAgICBhcHBTRy5hZGRJbmdyZXNzUnVsZShcbiAgICAgIGVjMi5QZWVyLmFueUlwdjQoKSxcbiAgICAgIGVjMi5Qb3J0LnRjcCgyMiksXG4gICAgICBcImFsbG93IFNTSCBhY2Nlc3MgZnJvbSBhbnl3aGVyZVwiXG4gICAgKTtcblxuICAgIGFwcFNHLmFkZEluZ3Jlc3NSdWxlKFxuICAgICAgZWMyLlBlZXIuYW55SXB2NCgpLFxuICAgICAgZWMyLlBvcnQudGNwKDkxMDApLFxuICAgICAgXCJhbGxvdyBub2RlX2V4cG9ydGVyIGFjY2VzcyBmcm9tIGFueXdoZXJlXCJcbiAgICApO1xuXG4gICAgYXBwU0cuYWRkSW5ncmVzc1J1bGUoXG4gICAgICBlYzIuUGVlci5hbnlJcHY0KCksXG4gICAgICBlYzIuUG9ydC50Y3AoODApLFxuICAgICAgXCJhbGxvdyBhbGwgaHR0cCBhY2Vzc1wiXG4gICAgKTtcblxuICAgIC8vIGN1c3RvbSBpbWFnZVxuICAgIC8vIGNvbnN0IG1hY2hpbmVJbWFnZSA9IGVjMi5NYWNoaW5lSW1hZ2UubG9va3VwKHtcbiAgICAvLyAgIG5hbWU6IFwicHJvbWV0aGV1cy1tb25pdG9yaW5nLWl0c2VsZlwiXG4gICAgLy8gfSlcblxuICAgIC8vIGRlZmluZSBjb25maWd1cmF0aW9uIGZvciBhcHAtYmFzZS1hbmQtY2FuYXJ5IGFzZyBlYzIgaW5zdGFuY2VzLFxuICAgIGNvbnN0IGFwcEluc3RhbmNlID0ge1xuICAgICAgdnBjLFxuICAgICAgaW5zdGFuY2VUeXBlOiBlYzIuSW5zdGFuY2VUeXBlLm9mKFxuICAgICAgICBlYzIuSW5zdGFuY2VDbGFzcy5UMixcbiAgICAgICAgZWMyLkluc3RhbmNlU2l6ZS5NSUNST1xuICAgICAgKSxcbiAgICAgIG1hY2hpbmVJbWFnZTogbmV3IGVjMi5BbWF6b25MaW51eEltYWdlKHtcbiAgICAgICAgZ2VuZXJhdGlvbjogZWMyLkFtYXpvbkxpbnV4R2VuZXJhdGlvbi5BTUFaT05fTElOVVhfMixcbiAgICAgIH0pLFxuICAgICAgbWluQ2FwYWNpdHk6IDEsXG4gICAgICBtYXhDYXBhY2l0eTogMSxcbiAgICAgIGtleU5hbWU6IFwiZWMyLWtleS1wYWlyXCIsIC8vIHJlcGxhY2UgdGhpcyB3aXRoIHlvdXIgc2VjdXJpdHkga2V5XG4gICAgICBzZWN1cml0eUdyb3VwOiBhcHBTRyxcbiAgICAgIHZwY1N1Ym5ldHM6IHtcbiAgICAgICAgc3VibmV0VHlwZTogZWMyLlN1Ym5ldFR5cGUuUFVCTElDLFxuICAgICAgfSxcbiAgICB9O1xuXG4gICAgLy8gY29uc3QgYmFzZWxpbmVBcHBTZXR1cCA9IHJlYWRGaWxlU3luYyhcbiAgICAvLyAgIFwiLi9zcmMvc2NyaXB0cy9iYXNlbGluZVNldHVwLnNoXCIsXG4gICAgLy8gICBcInV0ZjhcIlxuICAgIC8vICk7XG4gICAgY29uc3QgY2FuYXJ5QXBwU2V0dXAgPSByZWFkRmlsZVN5bmMoXCIuL3NyYy9zY3JpcHRzL2NhbmFyeVNldHVwLnNoXCIsIFwidXRmOFwiKTtcblxuICAgIC8vIGNyZWF0ZSBuZXcgYXV0b3NjYWxpbmcgZ3JvdXBzXG4gICAgLy8gY29uc3QgYXNnQmFzZWxpbmUgPSBuZXcgYXV0b3NjYWxpbmcuQXV0b1NjYWxpbmdHcm91cChcbiAgICAvLyAgIHRoaXMsXG4gICAgLy8gICBcImFzZ0Jhc2VsaW5lXCIsXG4gICAgLy8gICBhcHBJbnN0YW5jZVxuICAgIC8vICk7XG4gICAgLy8gYXNnQmFzZWxpbmUuYWRkVXNlckRhdGEoYmFzZWxpbmVBcHBTZXR1cCk7XG4gICAgLy8gYXNnQmFzZWxpbmUuYWRkU2VjdXJpdHlHcm91cChwcm9kSW5zdGFuY2VTRyk7XG5cbiAgICBjb25zdCBhc2dDYW5hcnkgPSBuZXcgYXV0b3NjYWxpbmcuQXV0b1NjYWxpbmdHcm91cChcbiAgICAgIHRoaXMsXG4gICAgICBcImFzZ0NhbmFyeVwiLFxuICAgICAgYXBwSW5zdGFuY2VcbiAgICApO1xuICAgIGFzZ0NhbmFyeS5hZGRVc2VyRGF0YShjYW5hcnlBcHBTZXR1cCk7XG4gICAgcHJvZEluc3RhbmNlU0dzLmZvckVhY2goKHNnOiBhbnkpID0+IGFzZ0NhbmFyeS5hZGRTZWN1cml0eUdyb3VwKHNnKSk7XG4gICAgLy8gYXNnQ2FuYXJ5LmFkZFNlY3VyaXR5R3JvdXAocHJvZEluc3RhbmNlU0cpO1xuXG4gICAgLy8gZGVmaW5lIHRhcmdldCBncm91cHMgZm9yIEFMQlxuICAgIC8vIGNvbnN0IHRhcmdldEJhc2VsaW5lID0gbmV3IGVsYnYyLkFwcGxpY2F0aW9uVGFyZ2V0R3JvdXAoXG4gICAgLy8gICB0aGlzLFxuICAgIC8vICAgXCJCQVNFTElORV9UQVJHRVRcIixcbiAgICAvLyAgIHtcbiAgICAvLyAgICAgdnBjLFxuICAgIC8vICAgICAvLyBUT0RPIHVzZXIgZGVmaW5lZCBwb3J0IHZhbHVlXG4gICAgLy8gICAgIHBvcnQ6IDgwLFxuICAgIC8vICAgICB0YXJnZXRzOiBbYXNnQmFzZWxpbmVdLFxuICAgIC8vICAgfVxuICAgIC8vICk7XG5cbiAgICBjb25zdCB0YXJnZXRDYW5hcnkgPSBuZXcgZWxidjIuQXBwbGljYXRpb25UYXJnZXRHcm91cChcbiAgICAgIHRoaXMsXG4gICAgICBcIkNBTkFSWV9UQVJHRVRcIixcbiAgICAgIHtcbiAgICAgICAgdnBjLFxuICAgICAgICAvLyBUT0RPIHVzZXIgZGVmaW5lZCBwb3J0IHZhbHVlXG4gICAgICAgIHBvcnQ6IDgwLFxuICAgICAgICB0YXJnZXRzOiBbYXNnQ2FuYXJ5XSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gY29uc3QgbGlzdGVuZXIgPSBlbGJ2Mi5BcHBsaWNhdGlvbkxpc3RlbmVyLmZyb21Mb29rdXAoXG4gICAgLy8gICB0aGlzLFxuICAgIC8vICAgXCJleGlzdGluZ0xpc3RlbmVyXCIsXG4gICAgLy8gICB7XG4gICAgLy8gICAgIGxpc3RlbmVyQXJuOlxuICAgIC8vICAgICAgIFwiYXJuOmF3czplbGFzdGljbG9hZGJhbGFuY2luZzp1cy13ZXN0LTI6NzUwMDc4MDk3NTg4Omxpc3RlbmVyL2FwcC9jZGstcy1hbGI4QS0xQUE5UFVaM1lNRzhMLzJjMTdiMTE5MWY0ZGUwYWYvZTY0N2UzYTgwOGE5N2E1ZVwiLFxuICAgIC8vICAgfVxuICAgIC8vICk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCBcImFyaWFjYW5hcnlcIiwge1xuICAgICAgdmFsdWU6IFwidHJ1ZVwiLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJsb2FkQmFsYW5jZXJOYW1lXCIsIHtcbiAgICAgIHZhbHVlOiBzdGFja0NvbmZpZy5zZWxlY3RlZEFsYk5hbWUsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCBcImxpc3RlbmVyQXJuXCIsIHtcbiAgICAgIHZhbHVlOiBzdGFja0NvbmZpZy5zZWxlY3RlZExpc3RlbmVyQXJuLFxuICAgIH0pO1xuXG4gICAgLy8gbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJCYXNlbGluZS1UYXJnZXQtR3JvdXAtQXJuXCIsIHtcbiAgICAvLyAgIHZhbHVlOiB0YXJnZXRCYXNlbGluZS50YXJnZXRHcm91cEFybixcbiAgICAvLyB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiQ2FuYXJ5LVRhcmdldC1Hcm91cC1Bcm5cIiwge1xuICAgICAgdmFsdWU6IHRhcmdldENhbmFyeS50YXJnZXRHcm91cEFybixcbiAgICB9KTtcblxuICAgIC8vIG91dHB1dCBpcCBhZGRyZXNzZXMvZG5zIGFkZHJlc3MgZm9yXG4gICAgLy8gcHJvbWV0aGV1cywgYmFzZWxpbmUsIGNhbmFyeSwgZ3JhZmFuYVxuICAgIC8vIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiYWxiRE5TXCIsIHtcbiAgICAvLyAgIHZhbHVlOiBgaHR0cDovLyR7YWxiLmxvYWRCYWxhbmNlckRuc05hbWV9YCxcbiAgICAvLyB9KTtcbiAgfVxufVxuIl19