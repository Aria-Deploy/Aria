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
            keyName: stackConfig.keyPair,
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
        //     port: stackConfig.selectedPort,
        //     targets: [asgBaseline],
        //   }
        // );
        const targetCanary = new elbv2.ApplicationTargetGroup(this, "CANARY_TARGET", {
            vpc,
            // TODO user defined port value
            port: stackConfig.selectedPort,
            targets: [asgCanary],
        });
        new cdk.CfnOutput(this, "ariacanary", {
            value: "true",
        });
        new cdk.CfnOutput(this, "ariaconfig", {
            value: JSON.stringify(stackConfig),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FuYXJ5X3N0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2Nmbl9pbnRlcmZhY2UvbGliL2NhbmFyeV9zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsc0VBQXdEO0FBQ3hELHNEQUF3QztBQUN4QywyRUFBNkQ7QUFDN0QsbURBQXFDO0FBQ3JDLDJCQUFrQztBQUNsQyxxREFBaUQ7QUFFakQsTUFBYSxXQUFZLFNBQVEsOEJBQWE7SUFDNUMsWUFDRSxLQUFjLEVBQ2QsRUFBVSxFQUNWLFdBQWdCLEVBQ2hCLEtBQXNCO1FBRXRCLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNyQyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUM7UUFFMUIsTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FDbkMsSUFBSSxFQUNKLGNBQWMsRUFDZCxXQUFXLENBQUMsU0FBUyxDQUN0QixDQUFDO1FBRUYsTUFBTSxlQUFlLEdBQUcsV0FBVyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FDdEQsQ0FBQyxJQUFTLEVBQUUsR0FBVyxFQUFFLEVBQUU7WUFDekIsT0FBTyxHQUFHLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUMxQyxZQUFZLEVBQ1osa0JBQWtCLEdBQUcsRUFBRSxFQUN2QixJQUFJLENBQUMsT0FBTyxDQUNiLENBQUM7UUFDSixDQUFDLENBQ0YsQ0FBQztRQUVGLHlEQUF5RDtRQUN6RCxNQUFNLEtBQUssR0FBRyxJQUFJLEdBQUcsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRTtZQUNsRCxHQUFHO1lBQ0gsZ0JBQWdCLEVBQUUsSUFBSTtTQUN2QixDQUFDLENBQUM7UUFFSCxLQUFLLENBQUMsY0FBYyxDQUNsQixHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUNsQixH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RUFBRSxZQUFZLENBQUMsY0FBYztTQUNuQyxDQUFDLENBQUM7UUFFSCxzQ0FBc0M7UUFDdEMsd0NBQXdDO1FBQ3hDLHNDQUFzQztRQUN0QyxnREFBZ0Q7UUFDaEQsTUFBTTtJQUNSLENBQUM7Q0FDRjtBQS9JRCxrQ0ErSUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBhdXRvc2NhbGluZyBmcm9tIFwiQGF3cy1jZGsvYXdzLWF1dG9zY2FsaW5nXCI7XG5pbXBvcnQgKiBhcyBlYzIgZnJvbSBcIkBhd3MtY2RrL2F3cy1lYzJcIjtcbmltcG9ydCAqIGFzIGVsYnYyIGZyb20gXCJAYXdzLWNkay9hd3MtZWxhc3RpY2xvYWRiYWxhbmNpbmd2MlwiO1xuaW1wb3J0ICogYXMgY2RrIGZyb20gXCJAYXdzLWNkay9jb3JlXCI7XG5pbXBvcnQgeyByZWFkRmlsZVN5bmMgfSBmcm9tIFwiZnNcIjtcbmltcG9ydCB7IEV4aXN0aW5nU3RhY2sgfSBmcm9tIFwiLi9leGlzdGluZ19zdGFja1wiO1xuXG5leHBvcnQgY2xhc3MgQ2FuYXJ5U3RhY2sgZXh0ZW5kcyBFeGlzdGluZ1N0YWNrIHtcbiAgY29uc3RydWN0b3IoXG4gICAgc2NvcGU6IGNkay5BcHAsXG4gICAgaWQ6IHN0cmluZyxcbiAgICBzdGFja0NvbmZpZzogYW55LFxuICAgIHByb3BzPzogY2RrLlN0YWNrUHJvcHNcbiAgKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBzdGFja0NvbmZpZywgcHJvcHMpO1xuICAgIGNvbnN0IHN0YWNrQ29udGV4dCA9IHRoaXM7XG5cbiAgICBjb25zdCB2cGMgPSBlYzIuVnBjLmZyb21WcGNBdHRyaWJ1dGVzKFxuICAgICAgdGhpcyxcbiAgICAgIFwiZXh0ZXJuYWwtdnBjXCIsXG4gICAgICBzdGFja0NvbmZpZy52cGNDb25maWdcbiAgICApO1xuXG4gICAgY29uc3QgcHJvZEluc3RhbmNlU0dzID0gc3RhY2tDb25maWcuc2VjdXJpdHlHcm91cElkcy5tYXAoXG4gICAgICAoc2dJZDogYW55LCBpZHg6IG51bWJlcikgPT4ge1xuICAgICAgICByZXR1cm4gZWMyLlNlY3VyaXR5R3JvdXAuZnJvbVNlY3VyaXR5R3JvdXBJZChcbiAgICAgICAgICBzdGFja0NvbnRleHQsXG4gICAgICAgICAgYHByb2RJbnN0YW5jZVNHLSR7aWR4fWAsXG4gICAgICAgICAgc2dJZC5ncm91cElkXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgKTtcblxuICAgIC8vIPCfkYcgY3JlYXRlIHNlY3VyaXR5IGdyb3VwIGZvciBhcHBsaWNhdGlvbiBlYzIgaW5zdGFuY2VzXG4gICAgY29uc3QgYXBwU0cgPSBuZXcgZWMyLlNlY3VyaXR5R3JvdXAodGhpcywgXCJhcHAtc2dcIiwge1xuICAgICAgdnBjLFxuICAgICAgYWxsb3dBbGxPdXRib3VuZDogdHJ1ZSxcbiAgICB9KTtcblxuICAgIGFwcFNHLmFkZEluZ3Jlc3NSdWxlKFxuICAgICAgZWMyLlBlZXIuYW55SXB2NCgpLFxuICAgICAgZWMyLlBvcnQudGNwKDIyKSxcbiAgICAgIFwiYWxsb3cgU1NIIGFjY2VzcyBmcm9tIGFueXdoZXJlXCJcbiAgICApO1xuXG4gICAgYXBwU0cuYWRkSW5ncmVzc1J1bGUoXG4gICAgICBlYzIuUGVlci5hbnlJcHY0KCksXG4gICAgICBlYzIuUG9ydC50Y3AoOTEwMCksXG4gICAgICBcImFsbG93IG5vZGVfZXhwb3J0ZXIgYWNjZXNzIGZyb20gYW55d2hlcmVcIlxuICAgICk7XG5cbiAgICBhcHBTRy5hZGRJbmdyZXNzUnVsZShcbiAgICAgIGVjMi5QZWVyLmFueUlwdjQoKSxcbiAgICAgIGVjMi5Qb3J0LnRjcCg4MCksXG4gICAgICBcImFsbG93IGFsbCBodHRwIGFjZXNzXCJcbiAgICApO1xuXG4gICAgLy8gY3VzdG9tIGltYWdlXG4gICAgLy8gY29uc3QgbWFjaGluZUltYWdlID0gZWMyLk1hY2hpbmVJbWFnZS5sb29rdXAoe1xuICAgIC8vICAgbmFtZTogXCJwcm9tZXRoZXVzLW1vbml0b3JpbmctaXRzZWxmXCJcbiAgICAvLyB9KVxuXG4gICAgLy8gZGVmaW5lIGNvbmZpZ3VyYXRpb24gZm9yIGFwcC1iYXNlLWFuZC1jYW5hcnkgYXNnIGVjMiBpbnN0YW5jZXMsXG4gICAgY29uc3QgYXBwSW5zdGFuY2UgPSB7XG4gICAgICB2cGMsXG4gICAgICBpbnN0YW5jZVR5cGU6IGVjMi5JbnN0YW5jZVR5cGUub2YoXG4gICAgICAgIGVjMi5JbnN0YW5jZUNsYXNzLlQyLFxuICAgICAgICBlYzIuSW5zdGFuY2VTaXplLk1JQ1JPXG4gICAgICApLFxuICAgICAgbWFjaGluZUltYWdlOiBuZXcgZWMyLkFtYXpvbkxpbnV4SW1hZ2Uoe1xuICAgICAgICBnZW5lcmF0aW9uOiBlYzIuQW1hem9uTGludXhHZW5lcmF0aW9uLkFNQVpPTl9MSU5VWF8yLFxuICAgICAgfSksXG4gICAgICBtaW5DYXBhY2l0eTogMSxcbiAgICAgIG1heENhcGFjaXR5OiAxLFxuICAgICAga2V5TmFtZTogc3RhY2tDb25maWcua2V5UGFpciwgLy8gcmVwbGFjZSB0aGlzIHdpdGggeW91ciBzZWN1cml0eSBrZXlcbiAgICAgIHNlY3VyaXR5R3JvdXA6IGFwcFNHLFxuICAgICAgdnBjU3VibmV0czoge1xuICAgICAgICBzdWJuZXRUeXBlOiBlYzIuU3VibmV0VHlwZS5QVUJMSUMsXG4gICAgICB9LFxuICAgIH07XG5cbiAgICAvLyBjb25zdCBiYXNlbGluZUFwcFNldHVwID0gcmVhZEZpbGVTeW5jKFxuICAgIC8vICAgXCIuL3NyYy9zY3JpcHRzL2Jhc2VsaW5lU2V0dXAuc2hcIixcbiAgICAvLyAgIFwidXRmOFwiXG4gICAgLy8gKTtcbiAgICBjb25zdCBjYW5hcnlBcHBTZXR1cCA9IHJlYWRGaWxlU3luYyhcIi4vc3JjL3NjcmlwdHMvY2FuYXJ5U2V0dXAuc2hcIiwgXCJ1dGY4XCIpO1xuXG4gICAgLy8gY3JlYXRlIG5ldyBhdXRvc2NhbGluZyBncm91cHNcbiAgICAvLyBjb25zdCBhc2dCYXNlbGluZSA9IG5ldyBhdXRvc2NhbGluZy5BdXRvU2NhbGluZ0dyb3VwKFxuICAgIC8vICAgdGhpcyxcbiAgICAvLyAgIFwiYXNnQmFzZWxpbmVcIixcbiAgICAvLyAgIGFwcEluc3RhbmNlXG4gICAgLy8gKTtcbiAgICAvLyBhc2dCYXNlbGluZS5hZGRVc2VyRGF0YShiYXNlbGluZUFwcFNldHVwKTtcbiAgICAvLyBhc2dCYXNlbGluZS5hZGRTZWN1cml0eUdyb3VwKHByb2RJbnN0YW5jZVNHKTtcblxuICAgIGNvbnN0IGFzZ0NhbmFyeSA9IG5ldyBhdXRvc2NhbGluZy5BdXRvU2NhbGluZ0dyb3VwKFxuICAgICAgdGhpcyxcbiAgICAgIFwiYXNnQ2FuYXJ5XCIsXG4gICAgICBhcHBJbnN0YW5jZVxuICAgICk7XG4gICAgYXNnQ2FuYXJ5LmFkZFVzZXJEYXRhKGNhbmFyeUFwcFNldHVwKTtcbiAgICBwcm9kSW5zdGFuY2VTR3MuZm9yRWFjaCgoc2c6IGFueSkgPT4gYXNnQ2FuYXJ5LmFkZFNlY3VyaXR5R3JvdXAoc2cpKTtcbiAgICAvLyBhc2dDYW5hcnkuYWRkU2VjdXJpdHlHcm91cChwcm9kSW5zdGFuY2VTRyk7XG5cbiAgICAvLyBkZWZpbmUgdGFyZ2V0IGdyb3VwcyBmb3IgQUxCXG4gICAgLy8gY29uc3QgdGFyZ2V0QmFzZWxpbmUgPSBuZXcgZWxidjIuQXBwbGljYXRpb25UYXJnZXRHcm91cChcbiAgICAvLyAgIHRoaXMsXG4gICAgLy8gICBcIkJBU0VMSU5FX1RBUkdFVFwiLFxuICAgIC8vICAge1xuICAgIC8vICAgICB2cGMsXG4gICAgLy8gICAgIC8vIFRPRE8gdXNlciBkZWZpbmVkIHBvcnQgdmFsdWVcbiAgICAvLyAgICAgcG9ydDogc3RhY2tDb25maWcuc2VsZWN0ZWRQb3J0LFxuICAgIC8vICAgICB0YXJnZXRzOiBbYXNnQmFzZWxpbmVdLFxuICAgIC8vICAgfVxuICAgIC8vICk7XG5cbiAgICBjb25zdCB0YXJnZXRDYW5hcnkgPSBuZXcgZWxidjIuQXBwbGljYXRpb25UYXJnZXRHcm91cChcbiAgICAgIHRoaXMsXG4gICAgICBcIkNBTkFSWV9UQVJHRVRcIixcbiAgICAgIHtcbiAgICAgICAgdnBjLFxuICAgICAgICAvLyBUT0RPIHVzZXIgZGVmaW5lZCBwb3J0IHZhbHVlXG4gICAgICAgIHBvcnQ6IHN0YWNrQ29uZmlnLnNlbGVjdGVkUG9ydCxcbiAgICAgICAgdGFyZ2V0czogW2FzZ0NhbmFyeV0sXG4gICAgICB9XG4gICAgKTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiYXJpYWNhbmFyeVwiLCB7XG4gICAgICB2YWx1ZTogXCJ0cnVlXCIsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCBcImFyaWFjb25maWdcIiwge1xuICAgICAgdmFsdWU6IEpTT04uc3RyaW5naWZ5KHN0YWNrQ29uZmlnKSxcbiAgICB9KTtcblxuICAgIC8vIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiQmFzZWxpbmUtVGFyZ2V0LUdyb3VwLUFyblwiLCB7XG4gICAgLy8gICB2YWx1ZTogdGFyZ2V0QmFzZWxpbmUudGFyZ2V0R3JvdXBBcm4sXG4gICAgLy8gfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCBcIkNhbmFyeS1UYXJnZXQtR3JvdXAtQXJuXCIsIHtcbiAgICAgIHZhbHVlOiB0YXJnZXRDYW5hcnkudGFyZ2V0R3JvdXBBcm4sXG4gICAgfSk7XG5cbiAgICAvLyBvdXRwdXQgaXAgYWRkcmVzc2VzL2RucyBhZGRyZXNzIGZvclxuICAgIC8vIHByb21ldGhldXMsIGJhc2VsaW5lLCBjYW5hcnksIGdyYWZhbmFcbiAgICAvLyBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCBcImFsYkROU1wiLCB7XG4gICAgLy8gICB2YWx1ZTogYGh0dHA6Ly8ke2FsYi5sb2FkQmFsYW5jZXJEbnNOYW1lfWAsXG4gICAgLy8gfSk7XG4gIH1cbn1cbiJdfQ==