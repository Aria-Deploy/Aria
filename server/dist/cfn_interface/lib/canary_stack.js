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
const ec2 = __importStar(require("@aws-cdk/aws-ec2"));
const existng_stack_1 = require("./existng_stack");
class CanaryStack extends existng_stack_1.ExistingStack {
    constructor(source, id, stackConfig, props) {
        super(source, id, stackConfig, props);
        new cdk.CfnOutput(this, "aria-canary", {
            value: "true",
        });
        this.templateOptions.metadata = {
            "pre-canary-cfn": JSON.stringify(stackConfig.template),
        };
        const vpc = ec2.Vpc.fromVpcAttributes(this, "external-vpc", stackConfig.vpcConfig);
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
exports.CanaryStack = CanaryStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FuYXJ5X3N0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2Nmbl9pbnRlcmZhY2UvbGliL2NhbmFyeV9zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbURBQXFDO0FBR3JDLHNEQUF3QztBQUd4QyxtREFBZ0Q7QUFHaEQsTUFBYSxXQUFZLFNBQVEsNkJBQWE7SUFDNUMsWUFDRSxNQUFlLEVBQ2YsRUFBVSxFQUNWLFdBQWdCLEVBQ2hCLEtBQXNCO1FBRXRCLEtBQUssQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV0QyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtZQUNyQyxLQUFLLEVBQUUsTUFBTTtTQUNkLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxHQUFHO1lBQzlCLGdCQUFnQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQztTQUN2RCxDQUFDO1FBRUYsTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FDbkMsSUFBSSxFQUNKLGNBQWMsRUFDZCxXQUFXLENBQUMsU0FBUyxDQUN0QixDQUFDO1FBRUYsMkJBQTJCO1FBQzNCLCtEQUErRDtRQUMvRCxTQUFTO1FBQ1QsMEJBQTBCO1FBQzFCLE1BQU07UUFFTixtQ0FBbUM7UUFDbkMsaURBQWlEO1FBQ2pELGNBQWM7UUFDZCxnQkFBZ0I7UUFDaEIsTUFBTTtRQUVOLDZDQUE2QztRQUM3Qyw2Q0FBNkM7UUFFN0MseUJBQXlCO1FBQ3pCLGVBQWU7UUFDZiw0QkFBNEI7UUFDNUIsNkJBQTZCO1FBQzdCLDhCQUE4QjtRQUM5QixnR0FBZ0c7UUFDaEcsS0FBSztRQUVMLHlCQUF5QjtRQUN6QixlQUFlO1FBQ2YsNEJBQTRCO1FBQzVCLDZCQUE2QjtRQUM3Qiw4QkFBOEI7UUFDOUIsZ0dBQWdHO1FBQ2hHLEtBQUs7UUFFTCxnRUFBZ0U7UUFDaEUsU0FBUztRQUNULHVDQUF1QztRQUN2Qyw0QkFBNEI7UUFDNUIsNkJBQTZCO1FBQzdCLE9BQU87UUFDUCw2Q0FBNkM7UUFDN0MsNERBQTREO1FBQzVELFFBQVE7UUFDUix5QkFBeUI7UUFDekIsb0JBQW9CO1FBQ3BCLG9CQUFvQjtRQUNwQixNQUFNO1FBRU4sZ0VBQWdFO1FBQ2hFLFNBQVM7UUFDVCx1Q0FBdUM7UUFDdkMsNEJBQTRCO1FBQzVCLDZCQUE2QjtRQUM3QixPQUFPO1FBQ1AsNkNBQTZDO1FBQzdDLDREQUE0RDtRQUM1RCxRQUFRO1FBQ1IseUJBQXlCO1FBQ3pCLG9CQUFvQjtRQUNwQixvQkFBb0I7UUFDcEIsTUFBTTtRQUVOLGdEQUFnRDtRQUNoRCxVQUFVO1FBQ1Ysa0NBQWtDO1FBQ2xDLE1BQU07UUFDTixnQkFBZ0I7UUFDaEIsdUJBQXVCO1FBQ3ZCLFdBQVc7UUFDWCxNQUFNO1FBQ04sS0FBSztRQUVMLGdEQUFnRDtRQUNoRCxVQUFVO1FBQ1Ysa0NBQWtDO1FBQ2xDLE1BQU07UUFDTixnQkFBZ0I7UUFDaEIsdUJBQXVCO1FBQ3ZCLFdBQVc7UUFDWCxNQUFNO1FBQ04sS0FBSztRQUVMLG1DQUFtQztRQUNuQyxtREFBbUQ7UUFDbkQsdUNBQXVDO1FBQ3ZDLHVDQUF1QztRQUN2QyxRQUFRO1FBQ1IsTUFBTTtRQUVOLHNDQUFzQztRQUN0QyxvQ0FBb0M7UUFDcEMsTUFBTTtJQUNSLENBQUM7Q0FDRjtBQWpIRCxrQ0FpSEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSBcIkBhd3MtY2RrL2NvcmVcIjtcbmltcG9ydCAqIGFzIGNmbmluYyBmcm9tIFwiQGF3cy1jZGsvY2xvdWRmb3JtYXRpb24taW5jbHVkZVwiO1xuaW1wb3J0ICogYXMgZWxidjIgZnJvbSBcIkBhd3MtY2RrL2F3cy1lbGFzdGljbG9hZGJhbGFuY2luZ3YyXCI7XG5pbXBvcnQgKiBhcyBlYzIgZnJvbSBcIkBhd3MtY2RrL2F3cy1lYzJcIjtcbmltcG9ydCAqIGFzIGF1dG9zY2FsaW5nIGZyb20gXCJAYXdzLWNkay9hd3MtYXV0b3NjYWxpbmdcIjtcbmltcG9ydCAqIGFzIGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0IHsgRXhpc3RpbmdTdGFjayB9IGZyb20gXCIuL2V4aXN0bmdfc3RhY2tcIjtcbmltcG9ydCB7IFN0YWNrU2V0T3BlcmF0aW9uUHJlZmVyZW5jZXMgfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWNsb3VkZm9ybWF0aW9uXCI7XG5cbmV4cG9ydCBjbGFzcyBDYW5hcnlTdGFjayBleHRlbmRzIEV4aXN0aW5nU3RhY2sge1xuICBjb25zdHJ1Y3RvcihcbiAgICBzb3VyY2U6IGNkay5BcHAsXG4gICAgaWQ6IHN0cmluZyxcbiAgICBzdGFja0NvbmZpZzogYW55LFxuICAgIHByb3BzPzogY2RrLlN0YWNrUHJvcHNcbiAgKSB7XG4gICAgc3VwZXIoc291cmNlLCBpZCwgc3RhY2tDb25maWcsIHByb3BzKTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiYXJpYS1jYW5hcnlcIiwge1xuICAgICAgdmFsdWU6IFwidHJ1ZVwiLFxuICAgIH0pO1xuXG4gICAgdGhpcy50ZW1wbGF0ZU9wdGlvbnMubWV0YWRhdGEgPSB7XG4gICAgICBcInByZS1jYW5hcnktY2ZuXCI6IEpTT04uc3RyaW5naWZ5KHN0YWNrQ29uZmlnLnRlbXBsYXRlKSxcbiAgICB9O1xuXG4gICAgY29uc3QgdnBjID0gZWMyLlZwYy5mcm9tVnBjQXR0cmlidXRlcyhcbiAgICAgIHRoaXMsXG4gICAgICBcImV4dGVybmFsLXZwY1wiLFxuICAgICAgc3RhY2tDb25maWcudnBjQ29uZmlnXG4gICAgKTtcblxuICAgIC8vIFRPRE8gaW1wb3J0IGV4aXN0aW5nIGFsYlxuICAgIC8vIGNvbnN0IGFsYiA9IG5ldyBlbGJ2Mi5BcHBsaWNhdGlvbkxvYWRCYWxhbmNlcih0aGlzLCBcImFsYlwiLCB7XG4gICAgLy8gICB2cGMsXG4gICAgLy8gICBpbnRlcm5ldEZhY2luZzogdHJ1ZSxcbiAgICAvLyB9KTtcblxuICAgIC8vIC8vIFRPRE8gaW1wb3J0IGV4aXN0aW5nIGxpc3RlbmVyXG4gICAgLy8gY29uc3QgbGlzdGVuZXIgPSBhbGIuYWRkTGlzdGVuZXIoXCJMaXN0ZW5lclwiLCB7XG4gICAgLy8gICBwb3J0OiA4MCxcbiAgICAvLyAgIG9wZW46IHRydWUsXG4gICAgLy8gfSk7XG5cbiAgICAvLyBjb25zdCB1c2VyRGF0YTEgPSBlYzIuVXNlckRhdGEuZm9yTGludXgoKTtcbiAgICAvLyBjb25zdCB1c2VyRGF0YTIgPSBlYzIuVXNlckRhdGEuZm9yTGludXgoKTtcblxuICAgIC8vIHVzZXJEYXRhMS5hZGRDb21tYW5kcyhcbiAgICAvLyAgIFwic3VkbyBzdVwiLFxuICAgIC8vICAgXCJ5dW0gaW5zdGFsbCAteSBodHRwZFwiLFxuICAgIC8vICAgXCJzeXN0ZW1jdGwgc3RhcnQgaHR0cGRcIixcbiAgICAvLyAgIFwic3lzdGVtY3RsIGVuYWJsZSBodHRwZFwiLFxuICAgIC8vICAgJ2VjaG8gXCI8aDE+SGVsbG8gV29ybGQgZnJvbSAkKGhvc3RuYW1lIC1mKSBhbmQgaW5zdGFuY2UgMTwvaDE+XCIgPiAvdmFyL3d3dy9odG1sL2luZGV4Lmh0bWwnXG4gICAgLy8gKTtcblxuICAgIC8vIHVzZXJEYXRhMi5hZGRDb21tYW5kcyhcbiAgICAvLyAgIFwic3VkbyBzdVwiLFxuICAgIC8vICAgXCJ5dW0gaW5zdGFsbCAteSBodHRwZFwiLFxuICAgIC8vICAgXCJzeXN0ZW1jdGwgc3RhcnQgaHR0cGRcIixcbiAgICAvLyAgIFwic3lzdGVtY3RsIGVuYWJsZSBodHRwZFwiLFxuICAgIC8vICAgJ2VjaG8gXCI8aDE+SGVsbG8gV29ybGQgZnJvbSAkKGhvc3RuYW1lIC1mKSBhbmQgaW5zdGFuY2UgMjwvaDE+XCIgPiAvdmFyL3d3dy9odG1sL2luZGV4Lmh0bWwnXG4gICAgLy8gKTtcblxuICAgIC8vIGNvbnN0IGFzZzEgPSBuZXcgYXV0b3NjYWxpbmcuQXV0b1NjYWxpbmdHcm91cCh0aGlzLCBcImFzZzFcIiwge1xuICAgIC8vICAgdnBjLFxuICAgIC8vICAgaW5zdGFuY2VUeXBlOiBlYzIuSW5zdGFuY2VUeXBlLm9mKFxuICAgIC8vICAgICBlYzIuSW5zdGFuY2VDbGFzcy5UMixcbiAgICAvLyAgICAgZWMyLkluc3RhbmNlU2l6ZS5NSUNST1xuICAgIC8vICAgKSxcbiAgICAvLyAgIG1hY2hpbmVJbWFnZTogbmV3IGVjMi5BbWF6b25MaW51eEltYWdlKHtcbiAgICAvLyAgICAgZ2VuZXJhdGlvbjogZWMyLkFtYXpvbkxpbnV4R2VuZXJhdGlvbi5BTUFaT05fTElOVVhfMixcbiAgICAvLyAgIH0pLFxuICAgIC8vICAgdXNlckRhdGE6IHVzZXJEYXRhMSxcbiAgICAvLyAgIG1pbkNhcGFjaXR5OiAxLFxuICAgIC8vICAgbWF4Q2FwYWNpdHk6IDEsXG4gICAgLy8gfSk7XG5cbiAgICAvLyBjb25zdCBhc2cyID0gbmV3IGF1dG9zY2FsaW5nLkF1dG9TY2FsaW5nR3JvdXAodGhpcywgXCJhc2cyXCIsIHtcbiAgICAvLyAgIHZwYyxcbiAgICAvLyAgIGluc3RhbmNlVHlwZTogZWMyLkluc3RhbmNlVHlwZS5vZihcbiAgICAvLyAgICAgZWMyLkluc3RhbmNlQ2xhc3MuVDIsXG4gICAgLy8gICAgIGVjMi5JbnN0YW5jZVNpemUuTUlDUk9cbiAgICAvLyAgICksXG4gICAgLy8gICBtYWNoaW5lSW1hZ2U6IG5ldyBlYzIuQW1hem9uTGludXhJbWFnZSh7XG4gICAgLy8gICAgIGdlbmVyYXRpb246IGVjMi5BbWF6b25MaW51eEdlbmVyYXRpb24uQU1BWk9OX0xJTlVYXzIsXG4gICAgLy8gICB9KSxcbiAgICAvLyAgIHVzZXJEYXRhOiB1c2VyRGF0YTIsXG4gICAgLy8gICBtaW5DYXBhY2l0eTogMSxcbiAgICAvLyAgIG1heENhcGFjaXR5OiAxLFxuICAgIC8vIH0pO1xuXG4gICAgLy8gY29uc3QgdGcxID0gbmV3IGVsYnYyLkFwcGxpY2F0aW9uVGFyZ2V0R3JvdXAoXG4gICAgLy8gICB0aGlzLFxuICAgIC8vICAgXCJhcHBsaWNhdGlvbi10YXJnZXQtZ3JvdXAtMVwiLFxuICAgIC8vICAge1xuICAgIC8vICAgICBwb3J0OiA4MCxcbiAgICAvLyAgICAgdGFyZ2V0czogW2FzZzFdLFxuICAgIC8vICAgICB2cGMsXG4gICAgLy8gICB9XG4gICAgLy8gKTtcblxuICAgIC8vIGNvbnN0IHRnMiA9IG5ldyBlbGJ2Mi5BcHBsaWNhdGlvblRhcmdldEdyb3VwKFxuICAgIC8vICAgdGhpcyxcbiAgICAvLyAgIFwiYXBwbGljYXRpb24tdGFyZ2V0LWdyb3VwLTJcIixcbiAgICAvLyAgIHtcbiAgICAvLyAgICAgcG9ydDogODAsXG4gICAgLy8gICAgIHRhcmdldHM6IFthc2cyXSxcbiAgICAvLyAgICAgdnBjLFxuICAgIC8vICAgfVxuICAgIC8vICk7XG5cbiAgICAvLyBsaXN0ZW5lci5hZGRBY3Rpb24oXCJhY3Rpb24tMVwiLCB7XG4gICAgLy8gICBhY3Rpb246IGVsYnYyLkxpc3RlbmVyQWN0aW9uLndlaWdodGVkRm9yd2FyZChbXG4gICAgLy8gICAgIHsgdGFyZ2V0R3JvdXA6IHRnMSwgd2VpZ2h0OiA0IH0sXG4gICAgLy8gICAgIHsgdGFyZ2V0R3JvdXA6IHRnMiwgd2VpZ2h0OiAxIH0sXG4gICAgLy8gICBdKSxcbiAgICAvLyB9KTtcblxuICAgIC8vIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiYWxiRE5TXCIsIHtcbiAgICAvLyAgIHZhbHVlOiBhbGIubG9hZEJhbGFuY2VyRG5zTmFtZSxcbiAgICAvLyB9KTtcbiAgfVxufVxuIl19