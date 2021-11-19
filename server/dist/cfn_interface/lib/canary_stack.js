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
        const baselineAppSetup = fs_1.readFileSync("./src/scripts/baselineSetup.sh", "utf8");
        const canaryAppSetup = fs_1.readFileSync("./src/scripts/canarySetup.sh", "utf8");
        // create new autoscaling groups
        const asgBaseline = new autoscaling.AutoScalingGroup(this, "asgBaseline", appInstance);
        asgBaseline.addUserData(baselineAppSetup);
        // asgBaseline.addSecurityGroup(prodInstanceSG);
        const asgCanary = new autoscaling.AutoScalingGroup(this, "asgCanary", appInstance);
        asgCanary.addUserData(canaryAppSetup);
        // add security groups from production to baseline and canary
        prodInstanceSGs.forEach((sg) => {
            asgBaseline.addSecurityGroup(sg);
            asgCanary.addSecurityGroup(sg);
        });
        // asgCanary.addSecurityGroup(prodInstanceSG);
        // define target groups for ALB
        const targetBaseline = new elbv2.ApplicationTargetGroup(this, "BASELINE_TARGET", {
            vpc,
            // TODO user defined port value
            port: 80,
            targets: [asgBaseline],
        });
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
        // 👇 create security group for monitor ec2 instances
        const monitorSG = new ec2.SecurityGroup(this, 'monitor-sg', {
            vpc,
            allowAllOutbound: true,
        });
        monitorSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(9090), 'allow prometheus access');
        monitorSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(3000), 'allow grafana access');
        monitorSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(8090), 'allow kayenta access');
        monitorSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(3001), 'allow referee access');
        monitorSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'allow SSH access from anywhere');
        // define configuration for prometheus/grafana ec2 instance,
        const monitorInstance = new ec2.Instance(this, 'monitor', {
            vpc,
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MEDIUM),
            machineImage: new ec2.AmazonLinuxImage({
                generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
            }),
            keyName: 'ec2-key-pair',
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
        const monitorSetupScript = fs_1.readFileSync('./src/scripts/monitorSetup.sh', 'utf8');
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
exports.CanaryStack = CanaryStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FuYXJ5X3N0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2Nmbl9pbnRlcmZhY2UvbGliL2NhbmFyeV9zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsc0VBQXdEO0FBQ3hELHNEQUF3QztBQUN4QywyRUFBNkQ7QUFDN0QsbURBQXFDO0FBQ3JDLDJCQUFrQztBQUNsQyxxREFBaUQ7QUFFakQsTUFBYSxXQUFZLFNBQVEsOEJBQWE7SUFDNUMsWUFDRSxLQUFjLEVBQ2QsRUFBVSxFQUNWLFdBQWdCLEVBQ2hCLEtBQXNCO1FBRXRCLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNyQyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUM7UUFFMUIsTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FDbkMsSUFBSSxFQUNKLGNBQWMsRUFDZCxXQUFXLENBQUMsU0FBUyxDQUN0QixDQUFDO1FBRUYsTUFBTSxlQUFlLEdBQUcsV0FBVyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FDdEQsQ0FBQyxJQUFTLEVBQUUsR0FBVyxFQUFFLEVBQUU7WUFDekIsT0FBTyxHQUFHLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUMxQyxZQUFZLEVBQ1osa0JBQWtCLEdBQUcsRUFBRSxFQUN2QixJQUFJLENBQUMsT0FBTyxDQUNiLENBQUM7UUFDSixDQUFDLENBQ0YsQ0FBQztRQUVGLHlEQUF5RDtRQUN6RCxNQUFNLEtBQUssR0FBRyxJQUFJLEdBQUcsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRTtZQUNsRCxHQUFHO1lBQ0gsZ0JBQWdCLEVBQUUsSUFBSTtTQUN2QixDQUFDLENBQUM7UUFFSCxLQUFLLENBQUMsY0FBYyxDQUNsQixHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUNsQixH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VSxlQUFlLENBQUMscUJBQXFCLE9BQU87U0FDOUQsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUU7WUFDcEMsS0FBSyxFQUFFLFVBQVUsZUFBZSxDQUFDLHFCQUFxQixPQUFPO1NBQzlELENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQ3BDLEtBQUssRUFBRSxVQUFVLGVBQWUsQ0FBQyxxQkFBcUIsdUJBQXVCO1NBQzlFLENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQ3BDLEtBQUssRUFBRSxVQUFVLGVBQWUsQ0FBQyxxQkFBcUIsT0FBTztTQUM5RCxDQUFDLENBQUM7UUFFSCxzQ0FBc0M7UUFDdEMsd0NBQXdDO1FBQ3hDLHNDQUFzQztRQUN0QyxnREFBZ0Q7UUFDaEQsTUFBTTtJQUNSLENBQUM7Q0FDRjtBQTFQRCxrQ0EwUEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBhdXRvc2NhbGluZyBmcm9tIFwiQGF3cy1jZGsvYXdzLWF1dG9zY2FsaW5nXCI7XG5pbXBvcnQgKiBhcyBlYzIgZnJvbSBcIkBhd3MtY2RrL2F3cy1lYzJcIjtcbmltcG9ydCAqIGFzIGVsYnYyIGZyb20gXCJAYXdzLWNkay9hd3MtZWxhc3RpY2xvYWRiYWxhbmNpbmd2MlwiO1xuaW1wb3J0ICogYXMgY2RrIGZyb20gXCJAYXdzLWNkay9jb3JlXCI7XG5pbXBvcnQgeyByZWFkRmlsZVN5bmMgfSBmcm9tIFwiZnNcIjtcbmltcG9ydCB7IEV4aXN0aW5nU3RhY2sgfSBmcm9tIFwiLi9leGlzdGluZ19zdGFja1wiO1xuXG5leHBvcnQgY2xhc3MgQ2FuYXJ5U3RhY2sgZXh0ZW5kcyBFeGlzdGluZ1N0YWNrIHtcbiAgY29uc3RydWN0b3IoXG4gICAgc2NvcGU6IGNkay5BcHAsXG4gICAgaWQ6IHN0cmluZyxcbiAgICBzdGFja0NvbmZpZzogYW55LFxuICAgIHByb3BzPzogY2RrLlN0YWNrUHJvcHNcbiAgKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBzdGFja0NvbmZpZywgcHJvcHMpO1xuICAgIGNvbnN0IHN0YWNrQ29udGV4dCA9IHRoaXM7XG5cbiAgICBjb25zdCB2cGMgPSBlYzIuVnBjLmZyb21WcGNBdHRyaWJ1dGVzKFxuICAgICAgdGhpcyxcbiAgICAgIFwiZXh0ZXJuYWwtdnBjXCIsXG4gICAgICBzdGFja0NvbmZpZy52cGNDb25maWdcbiAgICApO1xuXG4gICAgY29uc3QgcHJvZEluc3RhbmNlU0dzID0gc3RhY2tDb25maWcuc2VjdXJpdHlHcm91cElkcy5tYXAoXG4gICAgICAoc2dJZDogYW55LCBpZHg6IG51bWJlcikgPT4ge1xuICAgICAgICByZXR1cm4gZWMyLlNlY3VyaXR5R3JvdXAuZnJvbVNlY3VyaXR5R3JvdXBJZChcbiAgICAgICAgICBzdGFja0NvbnRleHQsXG4gICAgICAgICAgYHByb2RJbnN0YW5jZVNHLSR7aWR4fWAsXG4gICAgICAgICAgc2dJZC5ncm91cElkXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgKTtcblxuICAgIC8vIPCfkYcgY3JlYXRlIHNlY3VyaXR5IGdyb3VwIGZvciBhcHBsaWNhdGlvbiBlYzIgaW5zdGFuY2VzXG4gICAgY29uc3QgYXBwU0cgPSBuZXcgZWMyLlNlY3VyaXR5R3JvdXAodGhpcywgXCJhcHAtc2dcIiwge1xuICAgICAgdnBjLFxuICAgICAgYWxsb3dBbGxPdXRib3VuZDogdHJ1ZSxcbiAgICB9KTtcblxuICAgIGFwcFNHLmFkZEluZ3Jlc3NSdWxlKFxuICAgICAgZWMyLlBlZXIuYW55SXB2NCgpLFxuICAgICAgZWMyLlBvcnQudGNwKDIyKSxcbiAgICAgIFwiYWxsb3cgU1NIIGFjY2VzcyBmcm9tIGFueXdoZXJlXCJcbiAgICApO1xuXG4gICAgYXBwU0cuYWRkSW5ncmVzc1J1bGUoXG4gICAgICBlYzIuUGVlci5hbnlJcHY0KCksXG4gICAgICBlYzIuUG9ydC50Y3AoOTEwMCksXG4gICAgICBcImFsbG93IG5vZGVfZXhwb3J0ZXIgYWNjZXNzIGZyb20gYW55d2hlcmVcIlxuICAgICk7XG5cbiAgICBhcHBTRy5hZGRJbmdyZXNzUnVsZShcbiAgICAgIGVjMi5QZWVyLmFueUlwdjQoKSxcbiAgICAgIGVjMi5Qb3J0LnRjcCg4MCksXG4gICAgICBcImFsbG93IGFsbCBodHRwIGFjZXNzXCJcbiAgICApO1xuXG4gICAgLy8gZGVmaW5lIGNvbmZpZ3VyYXRpb24gZm9yIGFwcC1iYXNlLWFuZC1jYW5hcnkgYXNnIGVjMiBpbnN0YW5jZXMsXG4gICAgY29uc3QgYXBwSW5zdGFuY2UgPSB7XG4gICAgICB2cGMsXG4gICAgICBpbnN0YW5jZVR5cGU6IGVjMi5JbnN0YW5jZVR5cGUub2YoXG4gICAgICAgIGVjMi5JbnN0YW5jZUNsYXNzLlQyLFxuICAgICAgICBlYzIuSW5zdGFuY2VTaXplLk1JQ1JPXG4gICAgICApLFxuICAgICAgbWFjaGluZUltYWdlOiBuZXcgZWMyLkFtYXpvbkxpbnV4SW1hZ2Uoe1xuICAgICAgICBnZW5lcmF0aW9uOiBlYzIuQW1hem9uTGludXhHZW5lcmF0aW9uLkFNQVpPTl9MSU5VWF8yLFxuICAgICAgfSksXG4gICAgICBtaW5DYXBhY2l0eTogMSxcbiAgICAgIG1heENhcGFjaXR5OiAxLFxuICAgICAga2V5TmFtZTogXCJlYzIta2V5LXBhaXJcIiwgLy8gcmVwbGFjZSB0aGlzIHdpdGggeW91ciBzZWN1cml0eSBrZXlcbiAgICAgIHNlY3VyaXR5R3JvdXA6IGFwcFNHLFxuICAgICAgdnBjU3VibmV0czoge1xuICAgICAgICBzdWJuZXRUeXBlOiBlYzIuU3VibmV0VHlwZS5QVUJMSUMsXG4gICAgICB9LFxuICAgIH07XG5cbiAgICBjb25zdCBiYXNlbGluZUFwcFNldHVwID0gcmVhZEZpbGVTeW5jKFxuICAgICAgXCIuL3NyYy9zY3JpcHRzL2Jhc2VsaW5lU2V0dXAuc2hcIixcbiAgICAgIFwidXRmOFwiXG4gICAgKTtcbiAgICBjb25zdCBjYW5hcnlBcHBTZXR1cCA9IHJlYWRGaWxlU3luYyhcIi4vc3JjL3NjcmlwdHMvY2FuYXJ5U2V0dXAuc2hcIiwgXCJ1dGY4XCIpO1xuXG4gICAgLy8gY3JlYXRlIG5ldyBhdXRvc2NhbGluZyBncm91cHNcbiAgICBjb25zdCBhc2dCYXNlbGluZSA9IG5ldyBhdXRvc2NhbGluZy5BdXRvU2NhbGluZ0dyb3VwKFxuICAgICAgdGhpcyxcbiAgICAgIFwiYXNnQmFzZWxpbmVcIixcbiAgICAgIGFwcEluc3RhbmNlXG4gICAgKTtcbiAgICBhc2dCYXNlbGluZS5hZGRVc2VyRGF0YShiYXNlbGluZUFwcFNldHVwKTtcbiAgICAvLyBhc2dCYXNlbGluZS5hZGRTZWN1cml0eUdyb3VwKHByb2RJbnN0YW5jZVNHKTtcblxuICAgIGNvbnN0IGFzZ0NhbmFyeSA9IG5ldyBhdXRvc2NhbGluZy5BdXRvU2NhbGluZ0dyb3VwKFxuICAgICAgdGhpcyxcbiAgICAgIFwiYXNnQ2FuYXJ5XCIsXG4gICAgICBhcHBJbnN0YW5jZVxuICAgICk7XG4gICAgYXNnQ2FuYXJ5LmFkZFVzZXJEYXRhKGNhbmFyeUFwcFNldHVwKTtcbiAgICBcbiAgICAvLyBhZGQgc2VjdXJpdHkgZ3JvdXBzIGZyb20gcHJvZHVjdGlvbiB0byBiYXNlbGluZSBhbmQgY2FuYXJ5XG4gICAgcHJvZEluc3RhbmNlU0dzLmZvckVhY2goKHNnOiBhbnkpID0+IHtcbiAgICAgICAgYXNnQmFzZWxpbmUuYWRkU2VjdXJpdHlHcm91cChzZyk7XG4gICAgICAgIGFzZ0NhbmFyeS5hZGRTZWN1cml0eUdyb3VwKHNnKTtcbiAgICB9KTtcbiAgICBcbiAgICAvLyBhc2dDYW5hcnkuYWRkU2VjdXJpdHlHcm91cChwcm9kSW5zdGFuY2VTRyk7XG5cbiAgICAvLyBkZWZpbmUgdGFyZ2V0IGdyb3VwcyBmb3IgQUxCXG4gICAgY29uc3QgdGFyZ2V0QmFzZWxpbmUgPSBuZXcgZWxidjIuQXBwbGljYXRpb25UYXJnZXRHcm91cChcbiAgICAgIHRoaXMsXG4gICAgICBcIkJBU0VMSU5FX1RBUkdFVFwiLFxuICAgICAge1xuICAgICAgICB2cGMsXG4gICAgICAgIC8vIFRPRE8gdXNlciBkZWZpbmVkIHBvcnQgdmFsdWVcbiAgICAgICAgcG9ydDogODAsXG4gICAgICAgIHRhcmdldHM6IFthc2dCYXNlbGluZV0sXG4gICAgICB9XG4gICAgKTtcblxuICAgIGNvbnN0IHRhcmdldENhbmFyeSA9IG5ldyBlbGJ2Mi5BcHBsaWNhdGlvblRhcmdldEdyb3VwKFxuICAgICAgdGhpcyxcbiAgICAgIFwiQ0FOQVJZX1RBUkdFVFwiLFxuICAgICAge1xuICAgICAgICB2cGMsXG4gICAgICAgIC8vIFRPRE8gdXNlciBkZWZpbmVkIHBvcnQgdmFsdWVcbiAgICAgICAgcG9ydDogODAsXG4gICAgICAgIHRhcmdldHM6IFthc2dDYW5hcnldLFxuICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBjb25zdCBsaXN0ZW5lciA9IGVsYnYyLkFwcGxpY2F0aW9uTGlzdGVuZXIuZnJvbUxvb2t1cChcbiAgICAvLyAgIHRoaXMsXG4gICAgLy8gICBcImV4aXN0aW5nTGlzdGVuZXJcIixcbiAgICAvLyAgIHtcbiAgICAvLyAgICAgbGlzdGVuZXJBcm46XG4gICAgLy8gICAgICAgXCJhcm46YXdzOmVsYXN0aWNsb2FkYmFsYW5jaW5nOnVzLXdlc3QtMjo3NTAwNzgwOTc1ODg6bGlzdGVuZXIvYXBwL2Nkay1zLWFsYjhBLTFBQTlQVVozWU1HOEwvMmMxN2IxMTkxZjRkZTBhZi9lNjQ3ZTNhODA4YTk3YTVlXCIsXG4gICAgLy8gICB9XG4gICAgLy8gKTtcblxuICAgIC8vIPCfkYcgY3JlYXRlIHNlY3VyaXR5IGdyb3VwIGZvciBtb25pdG9yIGVjMiBpbnN0YW5jZXNcbiAgICBjb25zdCBtb25pdG9yU0cgPSBuZXcgZWMyLlNlY3VyaXR5R3JvdXAodGhpcywgJ21vbml0b3Itc2cnLCB7XG4gICAgICB2cGMsXG4gICAgICBhbGxvd0FsbE91dGJvdW5kOiB0cnVlLFxuICAgIH0pO1xuXG4gICAgbW9uaXRvclNHLmFkZEluZ3Jlc3NSdWxlKFxuICAgICAgZWMyLlBlZXIuYW55SXB2NCgpLFxuICAgICAgZWMyLlBvcnQudGNwKDkwOTApLFxuICAgICAgJ2FsbG93IHByb21ldGhldXMgYWNjZXNzJyxcbiAgICApO1xuXG4gICAgbW9uaXRvclNHLmFkZEluZ3Jlc3NSdWxlKFxuICAgICAgZWMyLlBlZXIuYW55SXB2NCgpLFxuICAgICAgZWMyLlBvcnQudGNwKDMwMDApLFxuICAgICAgJ2FsbG93IGdyYWZhbmEgYWNjZXNzJyxcbiAgICApO1xuXG4gICAgbW9uaXRvclNHLmFkZEluZ3Jlc3NSdWxlKFxuICAgICAgZWMyLlBlZXIuYW55SXB2NCgpLFxuICAgICAgZWMyLlBvcnQudGNwKDgwOTApLFxuICAgICAgJ2FsbG93IGtheWVudGEgYWNjZXNzJyxcbiAgICApO1xuXG4gICAgbW9uaXRvclNHLmFkZEluZ3Jlc3NSdWxlKFxuICAgICAgZWMyLlBlZXIuYW55SXB2NCgpLFxuICAgICAgZWMyLlBvcnQudGNwKDMwMDEpLFxuICAgICAgJ2FsbG93IHJlZmVyZWUgYWNjZXNzJyxcbiAgICApO1xuXG4gICAgbW9uaXRvclNHLmFkZEluZ3Jlc3NSdWxlKFxuICAgICAgZWMyLlBlZXIuYW55SXB2NCgpLFxuICAgICAgZWMyLlBvcnQudGNwKDIyKSxcbiAgICAgICdhbGxvdyBTU0ggYWNjZXNzIGZyb20gYW55d2hlcmUnLFxuICAgICk7XG5cbiAgICAvLyBkZWZpbmUgY29uZmlndXJhdGlvbiBmb3IgcHJvbWV0aGV1cy9ncmFmYW5hIGVjMiBpbnN0YW5jZSxcbiAgICBjb25zdCBtb25pdG9ySW5zdGFuY2UgPSBuZXcgZWMyLkluc3RhbmNlKHRoaXMsICdtb25pdG9yJywge1xuICAgICAgdnBjLFxuICAgICAgaW5zdGFuY2VUeXBlOiBlYzIuSW5zdGFuY2VUeXBlLm9mKFxuICAgICAgICBlYzIuSW5zdGFuY2VDbGFzcy5UMixcbiAgICAgICAgZWMyLkluc3RhbmNlU2l6ZS5NRURJVU0sXG4gICAgICApLFxuICAgICAgbWFjaGluZUltYWdlOiBuZXcgZWMyLkFtYXpvbkxpbnV4SW1hZ2Uoe1xuICAgICAgICBnZW5lcmF0aW9uOiBlYzIuQW1hem9uTGludXhHZW5lcmF0aW9uLkFNQVpPTl9MSU5VWF8yLFxuICAgICAgfSksXG4gICAgICBrZXlOYW1lOiAnZWMyLWtleS1wYWlyJywgLy8gcmVwbGFjZSB0aGlzIHdpdGggeW91ciBzZWN1cml0eSBrZXlcbiAgICAgIHNlY3VyaXR5R3JvdXA6IG1vbml0b3JTRyxcbiAgICAgIHZwY1N1Ym5ldHM6IHtcbiAgICAgICAgc3VibmV0VHlwZTogZWMyLlN1Ym5ldFR5cGUuUFVCTElDLFxuICAgICAgfSxcbiAgICB9KTtcbiAgICBcbiAgICAvKlxuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBjb25zdCB7YXdzUHJvZmlsZXNJbmZvfSA9IHByb3BzO1xuICAgIGNvbnNvbGUubG9nKCdwcm9maWxlICcsIGF3c1Byb2ZpbGVzSW5mbyk7XG5cbiAgICAvLyBAdHMtaWdub3JlXG4gICAgY29uc3Qge3JlZ2lvbn0gPSBhd3NQcm9maWxlc0luZm8uY29uZmlnRmlsZS5kZWZhdWx0O1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBjb25zdCBhY2Nlc3NLZXkgPSBhd3NQcm9maWxlc0luZm8uY3JlZGVudGlhbHNGaWxlLmRlZmF1bHQuYXdzX2FjY2Vzc19rZXlfaWQ7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGNvbnN0IHNlY3JldEtleSA9IGF3c1Byb2ZpbGVzSW5mby5jcmVkZW50aWFsc0ZpbGUuZGVmYXVsdC5hd3Nfc2VjcmV0X2FjY2Vzc19rZXk7XG4gICAgKi9cbiAgICBcbiAgICBjb25zdCBtb25pdG9yU2V0dXBTY3JpcHQgPSByZWFkRmlsZVN5bmMoXG4gICAgICAnLi9zcmMvc2NyaXB0cy9tb25pdG9yU2V0dXAuc2gnLFxuICAgICAgJ3V0ZjgnLFxuICAgICk7XG5cbiAgICBtb25pdG9ySW5zdGFuY2UuYWRkVXNlckRhdGEobW9uaXRvclNldHVwU2NyaXB0XG4vLyAgICAgICAgIC5yZXBsYWNlKCdNWV9SRUdJT04nLCByZWdpb24pXG4vLyAgICAgICAgIC5yZXBsYWNlKCdNWV9BQ0NFU1NfS0VZJywgYWNjZXNzS2V5KVxuLy8gICAgICAgICAucmVwbGFjZSgnTVlfU0VDUkVUX0tFWScsIHNlY3JldEtleSksXG4gICAgKTtcbiAgICAgICAgXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJhcmlhY2FuYXJ5XCIsIHtcbiAgICAgIHZhbHVlOiBcInRydWVcIixcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwibG9hZEJhbGFuY2VyTmFtZVwiLCB7XG4gICAgICB2YWx1ZTogc3RhY2tDb25maWcuc2VsZWN0ZWRBbGJOYW1lLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJsaXN0ZW5lckFyblwiLCB7XG4gICAgICB2YWx1ZTogc3RhY2tDb25maWcuc2VsZWN0ZWRMaXN0ZW5lckFybixcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiQmFzZWxpbmUtVGFyZ2V0LUdyb3VwLUFyblwiLCB7XG4gICAgICB2YWx1ZTogdGFyZ2V0QmFzZWxpbmUudGFyZ2V0R3JvdXBBcm4sXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCBcIkNhbmFyeS1UYXJnZXQtR3JvdXAtQXJuXCIsIHtcbiAgICAgIHZhbHVlOiB0YXJnZXRDYW5hcnkudGFyZ2V0R3JvdXBBcm4sXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAncHJvbWV0aGV1c0ROUycsIHtcbiAgICAgIHZhbHVlOiBgaHR0cDovLyR7bW9uaXRvckluc3RhbmNlLmluc3RhbmNlUHVibGljRG5zTmFtZX06OTA5MGAsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnZ3JhZmFuYUROUycsIHtcbiAgICAgIHZhbHVlOiBgaHR0cDovLyR7bW9uaXRvckluc3RhbmNlLmluc3RhbmNlUHVibGljRG5zTmFtZX06MzAwMGAsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAna2F5ZW50YUROUycsIHtcbiAgICAgIHZhbHVlOiBgaHR0cDovLyR7bW9uaXRvckluc3RhbmNlLmluc3RhbmNlUHVibGljRG5zTmFtZX06ODA5MC9zd2FnZ2VyLXVpLmh0bWxgLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ3JlZmVyZWVETlMnLCB7XG4gICAgICB2YWx1ZTogYGh0dHA6Ly8ke21vbml0b3JJbnN0YW5jZS5pbnN0YW5jZVB1YmxpY0Ruc05hbWV9OjMwMDFgLFxuICAgIH0pO1xuICAgIFxuICAgIC8vIG91dHB1dCBpcCBhZGRyZXNzZXMvZG5zIGFkZHJlc3MgZm9yXG4gICAgLy8gcHJvbWV0aGV1cywgYmFzZWxpbmUsIGNhbmFyeSwgZ3JhZmFuYVxuICAgIC8vIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiYWxiRE5TXCIsIHtcbiAgICAvLyAgIHZhbHVlOiBgaHR0cDovLyR7YWxiLmxvYWRCYWxhbmNlckRuc05hbWV9YCxcbiAgICAvLyB9KTtcbiAgfVxufVxuIl19