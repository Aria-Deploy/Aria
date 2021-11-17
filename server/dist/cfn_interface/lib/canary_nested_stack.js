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
exports.CanaryNestedStack = void 0;
const ec2 = __importStar(require("@aws-cdk/aws-ec2"));
const cdk = __importStar(require("@aws-cdk/core"));
const autoscaling = __importStar(require("@aws-cdk/aws-autoscaling"));
const elbv2 = __importStar(require("@aws-cdk/aws-elasticloadbalancingv2"));
class CanaryNestedStack extends cdk.NestedStack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const userData1 = ec2.UserData.forLinux();
        //   const userData2 = ec2.UserData.forLinux();
        userData1.addCommands("sudo su", "yum install -y httpd", "systemctl start httpd", "systemctl enable httpd", 'echo "<h1>Hello World from $(hostname -f)!</h1>" > /var/www/html/index.html');
        const canaryAsg = new autoscaling.AutoScalingGroup(this, "canary-asg", {
            vpc: props.vpc,
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
            machineImage: new ec2.AmazonLinuxImage({
                generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
            }),
            userData: userData1,
            minCapacity: 1,
            maxCapacity: 2,
        });
        // TODO import existing application target groups
        this.canaryTargetGroup = new elbv2.ApplicationTargetGroup(this, "application-target-group-canary", {
            port: 80,
            targets: [canaryAsg],
            vpc: props.vpc,
        });
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
exports.CanaryNestedStack = CanaryNestedStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FuYXJ5X25lc3RlZF9zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jZm5faW50ZXJmYWNlL2xpYi9jYW5hcnlfbmVzdGVkX3N0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxzREFBd0M7QUFDeEMsbURBQXFDO0FBQ3JDLHNFQUF3RDtBQUN4RCwyRUFBNkQ7QUFPN0QsTUFBYSxpQkFBa0IsU0FBUSxHQUFHLENBQUMsV0FBVztJQUdwRCxZQUFZLEtBQW9CLEVBQUUsRUFBVSxFQUFFLEtBQTZCO1FBQ3pFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLE1BQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDMUMsK0NBQStDO1FBRS9DLFNBQVMsQ0FBQyxXQUFXLENBQ25CLFNBQVMsRUFDVCxzQkFBc0IsRUFDdEIsdUJBQXVCLEVBQ3ZCLHdCQUF3QixFQUN4Qiw2RUFBNkUsQ0FDOUUsQ0FBQztRQUVGLE1BQU0sU0FBUyxHQUFHLElBQUksV0FBVyxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxZQUFZLEVBQUU7WUFDckUsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHO1lBQ2QsWUFBWSxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUMvQixHQUFHLENBQUMsYUFBYSxDQUFDLEVBQUUsRUFDcEIsR0FBRyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQ3ZCO1lBQ0QsWUFBWSxFQUFFLElBQUksR0FBRyxDQUFDLGdCQUFnQixDQUFDO2dCQUNyQyxVQUFVLEVBQUUsR0FBRyxDQUFDLHFCQUFxQixDQUFDLGNBQWM7YUFDckQsQ0FBQztZQUNGLFFBQVEsRUFBRSxTQUFTO1lBQ25CLFdBQVcsRUFBRSxDQUFDO1lBQ2QsV0FBVyxFQUFFLENBQUM7U0FDZixDQUFDLENBQUM7UUFFSCxpREFBaUQ7UUFDakQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksS0FBSyxDQUFDLHNCQUFzQixDQUN2RCxJQUFJLEVBQ0osaUNBQWlDLEVBQ2pDO1lBQ0UsSUFBSSxFQUFFLEVBQUU7WUFDUixPQUFPLEVBQUUsQ0FBQyxTQUFTLENBQUM7WUFDcEIsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHO1NBQ2YsQ0FDRixDQUFDO1FBRUYsMkJBQTJCO1FBQzNCLGlCQUFpQjtRQUNqQiw4QkFBOEI7UUFDOUIsK0JBQStCO1FBQy9CLGdDQUFnQztRQUNoQyxrR0FBa0c7UUFDbEcsT0FBTztRQUVQLGlGQUFpRjtRQUNqRixXQUFXO1FBQ1gseUNBQXlDO1FBQ3pDLDhCQUE4QjtRQUM5QiwrQkFBK0I7UUFDL0IsU0FBUztRQUNULCtDQUErQztRQUMvQyw4REFBOEQ7UUFDOUQsVUFBVTtRQUNWLDJCQUEyQjtRQUMzQixzQkFBc0I7UUFDdEIsc0JBQXNCO1FBQ3RCLFFBQVE7UUFFUixrREFBa0Q7UUFDbEQsWUFBWTtRQUNaLG9DQUFvQztRQUNwQyxRQUFRO1FBQ1Isa0JBQWtCO1FBQ2xCLHlCQUF5QjtRQUN6QixhQUFhO1FBQ2IsUUFBUTtRQUNSLE9BQU87UUFFUCxpREFBaUQ7UUFDakQsbUNBQW1DO1FBQ25DLG1EQUFtRDtRQUNuRCx1Q0FBdUM7UUFDdkMsdUNBQXVDO1FBQ3ZDLFFBQVE7UUFDUixNQUFNO1FBRU4sc0NBQXNDO1FBQ3RDLG9DQUFvQztRQUNwQyxNQUFNO0lBQ1IsQ0FBQztDQUNGO0FBdEZELDhDQXNGQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGVjMiBmcm9tIFwiQGF3cy1jZGsvYXdzLWVjMlwiO1xuaW1wb3J0ICogYXMgY2RrIGZyb20gXCJAYXdzLWNkay9jb3JlXCI7XG5pbXBvcnQgKiBhcyBhdXRvc2NhbGluZyBmcm9tIFwiQGF3cy1jZGsvYXdzLWF1dG9zY2FsaW5nXCI7XG5pbXBvcnQgKiBhcyBlbGJ2MiBmcm9tIFwiQGF3cy1jZGsvYXdzLWVsYXN0aWNsb2FkYmFsYW5jaW5ndjJcIjtcblxuaW50ZXJmYWNlIENhbmFyeU5lc3RlZFN0YWNrUHJvcHMgZXh0ZW5kcyBjZGsuTmVzdGVkU3RhY2tQcm9wcyB7XG4gIHZwYzogZWMyLklWcGM7XG4gIGFsYjogZWxidjIuSUFwcGxpY2F0aW9uTG9hZEJhbGFuY2VyO1xufVxuXG5leHBvcnQgY2xhc3MgQ2FuYXJ5TmVzdGVkU3RhY2sgZXh0ZW5kcyBjZGsuTmVzdGVkU3RhY2sge1xuICBwdWJsaWMgcmVhZG9ubHkgY2FuYXJ5VGFyZ2V0R3JvdXA6IGVsYnYyLkFwcGxpY2F0aW9uVGFyZ2V0R3JvdXA7XG5cbiAgY29uc3RydWN0b3Ioc2NvcGU6IGNkay5Db25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBDYW5hcnlOZXN0ZWRTdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICBjb25zdCB1c2VyRGF0YTEgPSBlYzIuVXNlckRhdGEuZm9yTGludXgoKTtcbiAgICAvLyAgIGNvbnN0IHVzZXJEYXRhMiA9IGVjMi5Vc2VyRGF0YS5mb3JMaW51eCgpO1xuXG4gICAgdXNlckRhdGExLmFkZENvbW1hbmRzKFxuICAgICAgXCJzdWRvIHN1XCIsXG4gICAgICBcInl1bSBpbnN0YWxsIC15IGh0dHBkXCIsXG4gICAgICBcInN5c3RlbWN0bCBzdGFydCBodHRwZFwiLFxuICAgICAgXCJzeXN0ZW1jdGwgZW5hYmxlIGh0dHBkXCIsXG4gICAgICAnZWNobyBcIjxoMT5IZWxsbyBXb3JsZCBmcm9tICQoaG9zdG5hbWUgLWYpITwvaDE+XCIgPiAvdmFyL3d3dy9odG1sL2luZGV4Lmh0bWwnXG4gICAgKTtcblxuICAgIGNvbnN0IGNhbmFyeUFzZyA9IG5ldyBhdXRvc2NhbGluZy5BdXRvU2NhbGluZ0dyb3VwKHRoaXMsIFwiY2FuYXJ5LWFzZ1wiLCB7XG4gICAgICB2cGM6IHByb3BzLnZwYyxcbiAgICAgIGluc3RhbmNlVHlwZTogZWMyLkluc3RhbmNlVHlwZS5vZihcbiAgICAgICAgZWMyLkluc3RhbmNlQ2xhc3MuVDIsXG4gICAgICAgIGVjMi5JbnN0YW5jZVNpemUuTUlDUk9cbiAgICAgICksXG4gICAgICBtYWNoaW5lSW1hZ2U6IG5ldyBlYzIuQW1hem9uTGludXhJbWFnZSh7XG4gICAgICAgIGdlbmVyYXRpb246IGVjMi5BbWF6b25MaW51eEdlbmVyYXRpb24uQU1BWk9OX0xJTlVYXzIsXG4gICAgICB9KSxcbiAgICAgIHVzZXJEYXRhOiB1c2VyRGF0YTEsXG4gICAgICBtaW5DYXBhY2l0eTogMSxcbiAgICAgIG1heENhcGFjaXR5OiAyLFxuICAgIH0pO1xuXG4gICAgLy8gVE9ETyBpbXBvcnQgZXhpc3RpbmcgYXBwbGljYXRpb24gdGFyZ2V0IGdyb3Vwc1xuICAgIHRoaXMuY2FuYXJ5VGFyZ2V0R3JvdXAgPSBuZXcgZWxidjIuQXBwbGljYXRpb25UYXJnZXRHcm91cChcbiAgICAgIHRoaXMsXG4gICAgICBcImFwcGxpY2F0aW9uLXRhcmdldC1ncm91cC1jYW5hcnlcIixcbiAgICAgIHtcbiAgICAgICAgcG9ydDogODAsXG4gICAgICAgIHRhcmdldHM6IFtjYW5hcnlBc2ddLFxuICAgICAgICB2cGM6IHByb3BzLnZwYyxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gICB1c2VyRGF0YTIuYWRkQ29tbWFuZHMoXG4gICAgLy8gICAgIFwic3VkbyBzdVwiLFxuICAgIC8vICAgICBcInl1bSBpbnN0YWxsIC15IGh0dHBkXCIsXG4gICAgLy8gICAgIFwic3lzdGVtY3RsIHN0YXJ0IGh0dHBkXCIsXG4gICAgLy8gICAgIFwic3lzdGVtY3RsIGVuYWJsZSBodHRwZFwiLFxuICAgIC8vICAgICAnZWNobyBcIjxoMT5IZWxsbyBXb3JsZCBmcm9tICQoaG9zdG5hbWUgLWYpIGFuZCBpbnN0YW5jZSAyPC9oMT5cIiA+IC92YXIvd3d3L2h0bWwvaW5kZXguaHRtbCdcbiAgICAvLyAgICk7XG5cbiAgICAvLyAgIGNvbnN0IGJhc2VsaW5lQXNnID0gbmV3IGF1dG9zY2FsaW5nLkF1dG9TY2FsaW5nR3JvdXAodGhpcywgXCJiYXNlbGluZS1hc2dcIiwge1xuICAgIC8vICAgICB2cGMsXG4gICAgLy8gICAgIGluc3RhbmNlVHlwZTogZWMyLkluc3RhbmNlVHlwZS5vZihcbiAgICAvLyAgICAgICBlYzIuSW5zdGFuY2VDbGFzcy5UMixcbiAgICAvLyAgICAgICBlYzIuSW5zdGFuY2VTaXplLk1JQ1JPXG4gICAgLy8gICAgICksXG4gICAgLy8gICAgIG1hY2hpbmVJbWFnZTogbmV3IGVjMi5BbWF6b25MaW51eEltYWdlKHtcbiAgICAvLyAgICAgICBnZW5lcmF0aW9uOiBlYzIuQW1hem9uTGludXhHZW5lcmF0aW9uLkFNQVpPTl9MSU5VWF8yLFxuICAgIC8vICAgICB9KSxcbiAgICAvLyAgICAgdXNlckRhdGE6IHVzZXJEYXRhMixcbiAgICAvLyAgICAgbWluQ2FwYWNpdHk6IDEsXG4gICAgLy8gICAgIG1heENhcGFjaXR5OiAxLFxuICAgIC8vICAgfSk7XG5cbiAgICAvLyAgIGNvbnN0IHRnMiA9IG5ldyBlbGJ2Mi5BcHBsaWNhdGlvblRhcmdldEdyb3VwKFxuICAgIC8vICAgICB0aGlzLFxuICAgIC8vICAgICBcImFwcGxpY2F0aW9uLXRhcmdldC1ncm91cC0yXCIsXG4gICAgLy8gICAgIHtcbiAgICAvLyAgICAgICBwb3J0OiA4MCxcbiAgICAvLyAgICAgICB0YXJnZXRzOiBbYXNnMl0sXG4gICAgLy8gICAgICAgdnBjLFxuICAgIC8vICAgICB9XG4gICAgLy8gICApO1xuXG4gICAgLy8gICAvLyBUT0RPIGltcG9ydCBsaXN0ZW5lciBhY3Rpb25zICh3cml0ZSBvdmVyKVxuICAgIC8vIGxpc3RlbmVyLmFkZEFjdGlvbihcImFjdGlvbi0xXCIsIHtcbiAgICAvLyAgIGFjdGlvbjogZWxidjIuTGlzdGVuZXJBY3Rpb24ud2VpZ2h0ZWRGb3J3YXJkKFtcbiAgICAvLyAgICAgeyB0YXJnZXRHcm91cDogdGcxLCB3ZWlnaHQ6IDQgfSxcbiAgICAvLyAgICAgeyB0YXJnZXRHcm91cDogdGcyLCB3ZWlnaHQ6IDEgfSxcbiAgICAvLyAgIF0pLFxuICAgIC8vIH0pO1xuXG4gICAgLy8gbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJhbGJETlNcIiwge1xuICAgIC8vICAgdmFsdWU6IGFsYi5sb2FkQmFsYW5jZXJEbnNOYW1lLFxuICAgIC8vIH0pO1xuICB9XG59XG4iXX0=