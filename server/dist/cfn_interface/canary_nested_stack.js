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
const ec2 = __importStar(require("@aws-cdk/aws-ec2"));
const cdk = __importStar(require("@aws-cdk/core"));
const autoscaling = __importStar(require("@aws-cdk/aws-autoscaling"));
// 👇 extends NestedStack
class CanaryNestedStack extends cdk.NestedStack {
    constructor(scope, id, props) {
        super(scope, id, props);
        this.vpc = new ec2.Vpc(this, "nested-stack-vpc", {
            cidr: "10.0.0.0/16",
            natGateways: 0,
            maxAzs: 3,
            subnetConfiguration: [
                {
                    name: "public-subnet-1",
                    subnetType: ec2.SubnetType.PUBLIC,
                    cidrMask: 24,
                },
            ],
        });
        const vpc = this.vpc;
        const userData1 = ec2.UserData.forLinux();
        //   const userData2 = ec2.UserData.forLinux();
        userData1.addCommands("sudo su", "yum install -y httpd", "systemctl start httpd", "systemctl enable httpd", 'echo "<h1>Hello World from $(hostname -f) and instance 1</h1>" > /var/www/html/index.html');
        //   userData2.addCommands(
        //     "sudo su",
        //     "yum install -y httpd",
        //     "systemctl start httpd",
        //     "systemctl enable httpd",
        //     'echo "<h1>Hello World from $(hostname -f) and instance 2</h1>" > /var/www/html/index.html'
        //   );
        const canaryAsg = new autoscaling.AutoScalingGroup(this, "canary-asg", {
            vpc,
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
            machineImage: new ec2.AmazonLinuxImage({
                generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX,
            }),
            userData: userData1,
            minCapacity: 1,
            maxCapacity: 1,
        });
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
        //   // TODO import existing application target groups
        // const tg1 = new elbv2.ApplicationTargetGroup(
        //   this,
        //   "application-target-group-canary",
        //   {
        //     port: 80,
        //     targets: [canaryAsg],
        //     vpc,
        //   }
        // );
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FuYXJ5X25lc3RlZF9zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jZm5faW50ZXJmYWNlL2NhbmFyeV9uZXN0ZWRfc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsc0RBQXdDO0FBQ3hDLG1EQUFxQztBQUNyQyxzRUFBd0Q7QUFFeEQseUJBQXlCO0FBQ3pCLE1BQU0saUJBQWtCLFNBQVEsR0FBRyxDQUFDLFdBQVc7SUFHN0MsWUFBWSxLQUFvQixFQUFFLEVBQVUsRUFBRSxLQUE0QjtRQUN4RSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUU7WUFDL0MsSUFBSSxFQUFFLGFBQWE7WUFDbkIsV0FBVyxFQUFFLENBQUM7WUFDZCxNQUFNLEVBQUUsQ0FBQztZQUNULG1CQUFtQixFQUFFO2dCQUNuQjtvQkFDRSxJQUFJLEVBQUUsaUJBQWlCO29CQUN2QixVQUFVLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNO29CQUNqQyxRQUFRLEVBQUUsRUFBRTtpQkFDYjthQUNGO1NBQ0YsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUVyQixNQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzFDLCtDQUErQztRQUUvQyxTQUFTLENBQUMsV0FBVyxDQUNuQixTQUFTLEVBQ1Qsc0JBQXNCLEVBQ3RCLHVCQUF1QixFQUN2Qix3QkFBd0IsRUFDeEIsMkZBQTJGLENBQzVGLENBQUM7UUFFRiwyQkFBMkI7UUFDM0IsaUJBQWlCO1FBQ2pCLDhCQUE4QjtRQUM5QiwrQkFBK0I7UUFDL0IsZ0NBQWdDO1FBQ2hDLGtHQUFrRztRQUNsRyxPQUFPO1FBRVAsTUFBTSxTQUFTLEdBQUcsSUFBSSxXQUFXLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRTtZQUNyRSxHQUFHO1lBQ0gsWUFBWSxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUMvQixHQUFHLENBQUMsYUFBYSxDQUFDLEVBQUUsRUFDcEIsR0FBRyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQ3ZCO1lBQ0QsWUFBWSxFQUFFLElBQUksR0FBRyxDQUFDLGdCQUFnQixDQUFDO2dCQUNyQyxVQUFVLEVBQUUsR0FBRyxDQUFDLHFCQUFxQixDQUFDLFlBQVk7YUFDbkQsQ0FBQztZQUNGLFFBQVEsRUFBRSxTQUFTO1lBQ25CLFdBQVcsRUFBRSxDQUFDO1lBQ2QsV0FBVyxFQUFFLENBQUM7U0FDZixDQUFDLENBQUM7UUFFSCxpRkFBaUY7UUFDakYsV0FBVztRQUNYLHlDQUF5QztRQUN6Qyw4QkFBOEI7UUFDOUIsK0JBQStCO1FBQy9CLFNBQVM7UUFDVCwrQ0FBK0M7UUFDL0MsOERBQThEO1FBQzlELFVBQVU7UUFDViwyQkFBMkI7UUFDM0Isc0JBQXNCO1FBQ3RCLHNCQUFzQjtRQUN0QixRQUFRO1FBRVIsc0RBQXNEO1FBQ3RELGdEQUFnRDtRQUNoRCxVQUFVO1FBQ1YsdUNBQXVDO1FBQ3ZDLE1BQU07UUFDTixnQkFBZ0I7UUFDaEIsNEJBQTRCO1FBQzVCLFdBQVc7UUFDWCxNQUFNO1FBQ04sS0FBSztRQUVMLGtEQUFrRDtRQUNsRCxZQUFZO1FBQ1osb0NBQW9DO1FBQ3BDLFFBQVE7UUFDUixrQkFBa0I7UUFDbEIseUJBQXlCO1FBQ3pCLGFBQWE7UUFDYixRQUFRO1FBQ1IsT0FBTztRQUVQLGlEQUFpRDtRQUNqRCxtQ0FBbUM7UUFDbkMsbURBQW1EO1FBQ25ELHVDQUF1QztRQUN2Qyx1Q0FBdUM7UUFDdkMsUUFBUTtRQUNSLE1BQU07UUFFTixzQ0FBc0M7UUFDdEMsb0NBQW9DO1FBQ3BDLE1BQU07SUFDUixDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBlYzIgZnJvbSBcIkBhd3MtY2RrL2F3cy1lYzJcIjtcbmltcG9ydCAqIGFzIGNkayBmcm9tIFwiQGF3cy1jZGsvY29yZVwiO1xuaW1wb3J0ICogYXMgYXV0b3NjYWxpbmcgZnJvbSBcIkBhd3MtY2RrL2F3cy1hdXRvc2NhbGluZ1wiO1xuXG4vLyDwn5GHIGV4dGVuZHMgTmVzdGVkU3RhY2tcbmNsYXNzIENhbmFyeU5lc3RlZFN0YWNrIGV4dGVuZHMgY2RrLk5lc3RlZFN0YWNrIHtcbiAgcHVibGljIHJlYWRvbmx5IHZwYzogZWMyLlZwYztcblxuICBjb25zdHJ1Y3RvcihzY29wZTogY2RrLkNvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuTmVzdGVkU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgdGhpcy52cGMgPSBuZXcgZWMyLlZwYyh0aGlzLCBcIm5lc3RlZC1zdGFjay12cGNcIiwge1xuICAgICAgY2lkcjogXCIxMC4wLjAuMC8xNlwiLFxuICAgICAgbmF0R2F0ZXdheXM6IDAsXG4gICAgICBtYXhBenM6IDMsXG4gICAgICBzdWJuZXRDb25maWd1cmF0aW9uOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiBcInB1YmxpYy1zdWJuZXQtMVwiLFxuICAgICAgICAgIHN1Ym5ldFR5cGU6IGVjMi5TdWJuZXRUeXBlLlBVQkxJQyxcbiAgICAgICAgICBjaWRyTWFzazogMjQsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0pO1xuICAgIGNvbnN0IHZwYyA9IHRoaXMudnBjO1xuXG4gICAgY29uc3QgdXNlckRhdGExID0gZWMyLlVzZXJEYXRhLmZvckxpbnV4KCk7XG4gICAgLy8gICBjb25zdCB1c2VyRGF0YTIgPSBlYzIuVXNlckRhdGEuZm9yTGludXgoKTtcblxuICAgIHVzZXJEYXRhMS5hZGRDb21tYW5kcyhcbiAgICAgIFwic3VkbyBzdVwiLFxuICAgICAgXCJ5dW0gaW5zdGFsbCAteSBodHRwZFwiLFxuICAgICAgXCJzeXN0ZW1jdGwgc3RhcnQgaHR0cGRcIixcbiAgICAgIFwic3lzdGVtY3RsIGVuYWJsZSBodHRwZFwiLFxuICAgICAgJ2VjaG8gXCI8aDE+SGVsbG8gV29ybGQgZnJvbSAkKGhvc3RuYW1lIC1mKSBhbmQgaW5zdGFuY2UgMTwvaDE+XCIgPiAvdmFyL3d3dy9odG1sL2luZGV4Lmh0bWwnXG4gICAgKTtcblxuICAgIC8vICAgdXNlckRhdGEyLmFkZENvbW1hbmRzKFxuICAgIC8vICAgICBcInN1ZG8gc3VcIixcbiAgICAvLyAgICAgXCJ5dW0gaW5zdGFsbCAteSBodHRwZFwiLFxuICAgIC8vICAgICBcInN5c3RlbWN0bCBzdGFydCBodHRwZFwiLFxuICAgIC8vICAgICBcInN5c3RlbWN0bCBlbmFibGUgaHR0cGRcIixcbiAgICAvLyAgICAgJ2VjaG8gXCI8aDE+SGVsbG8gV29ybGQgZnJvbSAkKGhvc3RuYW1lIC1mKSBhbmQgaW5zdGFuY2UgMjwvaDE+XCIgPiAvdmFyL3d3dy9odG1sL2luZGV4Lmh0bWwnXG4gICAgLy8gICApO1xuXG4gICAgY29uc3QgY2FuYXJ5QXNnID0gbmV3IGF1dG9zY2FsaW5nLkF1dG9TY2FsaW5nR3JvdXAodGhpcywgXCJjYW5hcnktYXNnXCIsIHtcbiAgICAgIHZwYyxcbiAgICAgIGluc3RhbmNlVHlwZTogZWMyLkluc3RhbmNlVHlwZS5vZihcbiAgICAgICAgZWMyLkluc3RhbmNlQ2xhc3MuVDIsXG4gICAgICAgIGVjMi5JbnN0YW5jZVNpemUuTUlDUk9cbiAgICAgICksXG4gICAgICBtYWNoaW5lSW1hZ2U6IG5ldyBlYzIuQW1hem9uTGludXhJbWFnZSh7XG4gICAgICAgIGdlbmVyYXRpb246IGVjMi5BbWF6b25MaW51eEdlbmVyYXRpb24uQU1BWk9OX0xJTlVYLFxuICAgICAgfSksXG4gICAgICB1c2VyRGF0YTogdXNlckRhdGExLFxuICAgICAgbWluQ2FwYWNpdHk6IDEsXG4gICAgICBtYXhDYXBhY2l0eTogMSxcbiAgICB9KTtcblxuICAgIC8vICAgY29uc3QgYmFzZWxpbmVBc2cgPSBuZXcgYXV0b3NjYWxpbmcuQXV0b1NjYWxpbmdHcm91cCh0aGlzLCBcImJhc2VsaW5lLWFzZ1wiLCB7XG4gICAgLy8gICAgIHZwYyxcbiAgICAvLyAgICAgaW5zdGFuY2VUeXBlOiBlYzIuSW5zdGFuY2VUeXBlLm9mKFxuICAgIC8vICAgICAgIGVjMi5JbnN0YW5jZUNsYXNzLlQyLFxuICAgIC8vICAgICAgIGVjMi5JbnN0YW5jZVNpemUuTUlDUk9cbiAgICAvLyAgICAgKSxcbiAgICAvLyAgICAgbWFjaGluZUltYWdlOiBuZXcgZWMyLkFtYXpvbkxpbnV4SW1hZ2Uoe1xuICAgIC8vICAgICAgIGdlbmVyYXRpb246IGVjMi5BbWF6b25MaW51eEdlbmVyYXRpb24uQU1BWk9OX0xJTlVYXzIsXG4gICAgLy8gICAgIH0pLFxuICAgIC8vICAgICB1c2VyRGF0YTogdXNlckRhdGEyLFxuICAgIC8vICAgICBtaW5DYXBhY2l0eTogMSxcbiAgICAvLyAgICAgbWF4Q2FwYWNpdHk6IDEsXG4gICAgLy8gICB9KTtcblxuICAgIC8vICAgLy8gVE9ETyBpbXBvcnQgZXhpc3RpbmcgYXBwbGljYXRpb24gdGFyZ2V0IGdyb3Vwc1xuICAgIC8vIGNvbnN0IHRnMSA9IG5ldyBlbGJ2Mi5BcHBsaWNhdGlvblRhcmdldEdyb3VwKFxuICAgIC8vICAgdGhpcyxcbiAgICAvLyAgIFwiYXBwbGljYXRpb24tdGFyZ2V0LWdyb3VwLWNhbmFyeVwiLFxuICAgIC8vICAge1xuICAgIC8vICAgICBwb3J0OiA4MCxcbiAgICAvLyAgICAgdGFyZ2V0czogW2NhbmFyeUFzZ10sXG4gICAgLy8gICAgIHZwYyxcbiAgICAvLyAgIH1cbiAgICAvLyApO1xuXG4gICAgLy8gICBjb25zdCB0ZzIgPSBuZXcgZWxidjIuQXBwbGljYXRpb25UYXJnZXRHcm91cChcbiAgICAvLyAgICAgdGhpcyxcbiAgICAvLyAgICAgXCJhcHBsaWNhdGlvbi10YXJnZXQtZ3JvdXAtMlwiLFxuICAgIC8vICAgICB7XG4gICAgLy8gICAgICAgcG9ydDogODAsXG4gICAgLy8gICAgICAgdGFyZ2V0czogW2FzZzJdLFxuICAgIC8vICAgICAgIHZwYyxcbiAgICAvLyAgICAgfVxuICAgIC8vICAgKTtcblxuICAgIC8vICAgLy8gVE9ETyBpbXBvcnQgbGlzdGVuZXIgYWN0aW9ucyAod3JpdGUgb3ZlcilcbiAgICAvLyBsaXN0ZW5lci5hZGRBY3Rpb24oXCJhY3Rpb24tMVwiLCB7XG4gICAgLy8gICBhY3Rpb246IGVsYnYyLkxpc3RlbmVyQWN0aW9uLndlaWdodGVkRm9yd2FyZChbXG4gICAgLy8gICAgIHsgdGFyZ2V0R3JvdXA6IHRnMSwgd2VpZ2h0OiA0IH0sXG4gICAgLy8gICAgIHsgdGFyZ2V0R3JvdXA6IHRnMiwgd2VpZ2h0OiAxIH0sXG4gICAgLy8gICBdKSxcbiAgICAvLyB9KTtcblxuICAgIC8vIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiYWxiRE5TXCIsIHtcbiAgICAvLyAgIHZhbHVlOiBhbGIubG9hZEJhbGFuY2VyRG5zTmFtZSxcbiAgICAvLyB9KTtcbiAgfVxufVxuIl19