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
const existng_stack_1 = require("./existng_stack");
class CanaryStack extends existng_stack_1.ExistingStack {
    constructor(source, id, stackConfig, props) {
        super(source, id, stackConfig, props);
        new cdk.CfnOutput(this, "aria-canary", {
            value: "true",
        });
        // console.log(JSON.stringify(stackConfig.template));
        this.templateOptions.metadata = {
            "pre-canary-cfn": JSON.stringify(stackConfig.template),
        };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FuYXJ5X3N0YWNrIGNvcHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY2ZuX2ludGVyZmFjZS9saWIvY2FuYXJ5X3N0YWNrIGNvcHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG1EQUFxQztBQU1yQyxtREFBZ0Q7QUFHaEQsTUFBYSxXQUFZLFNBQVEsNkJBQWE7SUFDNUMsWUFDRSxNQUFlLEVBQ2YsRUFBVSxFQUNWLFdBQWdCLEVBQ2hCLEtBQXNCO1FBRXRCLEtBQUssQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV0QyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtZQUNyQyxLQUFLLEVBQUUsTUFBTTtTQUNkLENBQUMsQ0FBQztRQUVILHFEQUFxRDtRQUVyRCxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsR0FBRztZQUM5QixnQkFBZ0IsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7U0FDdkQsQ0FBQztRQUVGLDJCQUEyQjtRQUMzQiwrREFBK0Q7UUFDL0QsU0FBUztRQUNULDBCQUEwQjtRQUMxQixNQUFNO1FBRU4sbUNBQW1DO1FBQ25DLGlEQUFpRDtRQUNqRCxjQUFjO1FBQ2QsZ0JBQWdCO1FBQ2hCLE1BQU07UUFFTiw2Q0FBNkM7UUFDN0MsNkNBQTZDO1FBRTdDLHlCQUF5QjtRQUN6QixlQUFlO1FBQ2YsNEJBQTRCO1FBQzVCLDZCQUE2QjtRQUM3Qiw4QkFBOEI7UUFDOUIsZ0dBQWdHO1FBQ2hHLEtBQUs7UUFFTCx5QkFBeUI7UUFDekIsZUFBZTtRQUNmLDRCQUE0QjtRQUM1Qiw2QkFBNkI7UUFDN0IsOEJBQThCO1FBQzlCLGdHQUFnRztRQUNoRyxLQUFLO1FBRUwsZ0VBQWdFO1FBQ2hFLFNBQVM7UUFDVCx1Q0FBdUM7UUFDdkMsNEJBQTRCO1FBQzVCLDZCQUE2QjtRQUM3QixPQUFPO1FBQ1AsNkNBQTZDO1FBQzdDLDREQUE0RDtRQUM1RCxRQUFRO1FBQ1IseUJBQXlCO1FBQ3pCLG9CQUFvQjtRQUNwQixvQkFBb0I7UUFDcEIsTUFBTTtRQUVOLGdFQUFnRTtRQUNoRSxTQUFTO1FBQ1QsdUNBQXVDO1FBQ3ZDLDRCQUE0QjtRQUM1Qiw2QkFBNkI7UUFDN0IsT0FBTztRQUNQLDZDQUE2QztRQUM3Qyw0REFBNEQ7UUFDNUQsUUFBUTtRQUNSLHlCQUF5QjtRQUN6QixvQkFBb0I7UUFDcEIsb0JBQW9CO1FBQ3BCLE1BQU07UUFFTixnREFBZ0Q7UUFDaEQsVUFBVTtRQUNWLGtDQUFrQztRQUNsQyxNQUFNO1FBQ04sZ0JBQWdCO1FBQ2hCLHVCQUF1QjtRQUN2QixXQUFXO1FBQ1gsTUFBTTtRQUNOLEtBQUs7UUFFTCxnREFBZ0Q7UUFDaEQsVUFBVTtRQUNWLGtDQUFrQztRQUNsQyxNQUFNO1FBQ04sZ0JBQWdCO1FBQ2hCLHVCQUF1QjtRQUN2QixXQUFXO1FBQ1gsTUFBTTtRQUNOLEtBQUs7UUFFTCxtQ0FBbUM7UUFDbkMsbURBQW1EO1FBQ25ELHVDQUF1QztRQUN2Qyx1Q0FBdUM7UUFDdkMsUUFBUTtRQUNSLE1BQU07UUFFTixzQ0FBc0M7UUFDdEMsb0NBQW9DO1FBQ3BDLE1BQU07SUFDUixDQUFDO0NBQ0Y7QUE3R0Qsa0NBNkdDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gXCJAYXdzLWNkay9jb3JlXCI7XG5pbXBvcnQgKiBhcyBjZm5pbmMgZnJvbSBcIkBhd3MtY2RrL2Nsb3VkZm9ybWF0aW9uLWluY2x1ZGVcIjtcbmltcG9ydCAqIGFzIGVsYnYyIGZyb20gXCJAYXdzLWNkay9hd3MtZWxhc3RpY2xvYWRiYWxhbmNpbmd2MlwiO1xuaW1wb3J0ICogYXMgZWMyIGZyb20gXCJAYXdzLWNkay9hd3MtZWMyXCI7XG5pbXBvcnQgKiBhcyBhdXRvc2NhbGluZyBmcm9tIFwiQGF3cy1jZGsvYXdzLWF1dG9zY2FsaW5nXCI7XG5pbXBvcnQgKiBhcyBmcyBmcm9tIFwiZnNcIjtcbmltcG9ydCB7IEV4aXN0aW5nU3RhY2sgfSBmcm9tIFwiLi9leGlzdG5nX3N0YWNrXCI7XG5pbXBvcnQgeyBTdGFja1NldE9wZXJhdGlvblByZWZlcmVuY2VzIH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1jbG91ZGZvcm1hdGlvblwiO1xuXG5leHBvcnQgY2xhc3MgQ2FuYXJ5U3RhY2sgZXh0ZW5kcyBFeGlzdGluZ1N0YWNrIHtcbiAgY29uc3RydWN0b3IoXG4gICAgc291cmNlOiBjZGsuQXBwLFxuICAgIGlkOiBzdHJpbmcsXG4gICAgc3RhY2tDb25maWc6IGFueSxcbiAgICBwcm9wcz86IGNkay5TdGFja1Byb3BzXG4gICkge1xuICAgIHN1cGVyKHNvdXJjZSwgaWQsIHN0YWNrQ29uZmlnLCBwcm9wcyk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCBcImFyaWEtY2FuYXJ5XCIsIHtcbiAgICAgIHZhbHVlOiBcInRydWVcIixcbiAgICB9KTtcblxuICAgIC8vIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KHN0YWNrQ29uZmlnLnRlbXBsYXRlKSk7XG5cbiAgICB0aGlzLnRlbXBsYXRlT3B0aW9ucy5tZXRhZGF0YSA9IHtcbiAgICAgIFwicHJlLWNhbmFyeS1jZm5cIjogSlNPTi5zdHJpbmdpZnkoc3RhY2tDb25maWcudGVtcGxhdGUpLFxuICAgIH07XG5cbiAgICAvLyBUT0RPIGltcG9ydCBleGlzdGluZyBhbGJcbiAgICAvLyBjb25zdCBhbGIgPSBuZXcgZWxidjIuQXBwbGljYXRpb25Mb2FkQmFsYW5jZXIodGhpcywgXCJhbGJcIiwge1xuICAgIC8vICAgdnBjLFxuICAgIC8vICAgaW50ZXJuZXRGYWNpbmc6IHRydWUsXG4gICAgLy8gfSk7XG5cbiAgICAvLyAvLyBUT0RPIGltcG9ydCBleGlzdGluZyBsaXN0ZW5lclxuICAgIC8vIGNvbnN0IGxpc3RlbmVyID0gYWxiLmFkZExpc3RlbmVyKFwiTGlzdGVuZXJcIiwge1xuICAgIC8vICAgcG9ydDogODAsXG4gICAgLy8gICBvcGVuOiB0cnVlLFxuICAgIC8vIH0pO1xuXG4gICAgLy8gY29uc3QgdXNlckRhdGExID0gZWMyLlVzZXJEYXRhLmZvckxpbnV4KCk7XG4gICAgLy8gY29uc3QgdXNlckRhdGEyID0gZWMyLlVzZXJEYXRhLmZvckxpbnV4KCk7XG5cbiAgICAvLyB1c2VyRGF0YTEuYWRkQ29tbWFuZHMoXG4gICAgLy8gICBcInN1ZG8gc3VcIixcbiAgICAvLyAgIFwieXVtIGluc3RhbGwgLXkgaHR0cGRcIixcbiAgICAvLyAgIFwic3lzdGVtY3RsIHN0YXJ0IGh0dHBkXCIsXG4gICAgLy8gICBcInN5c3RlbWN0bCBlbmFibGUgaHR0cGRcIixcbiAgICAvLyAgICdlY2hvIFwiPGgxPkhlbGxvIFdvcmxkIGZyb20gJChob3N0bmFtZSAtZikgYW5kIGluc3RhbmNlIDE8L2gxPlwiID4gL3Zhci93d3cvaHRtbC9pbmRleC5odG1sJ1xuICAgIC8vICk7XG5cbiAgICAvLyB1c2VyRGF0YTIuYWRkQ29tbWFuZHMoXG4gICAgLy8gICBcInN1ZG8gc3VcIixcbiAgICAvLyAgIFwieXVtIGluc3RhbGwgLXkgaHR0cGRcIixcbiAgICAvLyAgIFwic3lzdGVtY3RsIHN0YXJ0IGh0dHBkXCIsXG4gICAgLy8gICBcInN5c3RlbWN0bCBlbmFibGUgaHR0cGRcIixcbiAgICAvLyAgICdlY2hvIFwiPGgxPkhlbGxvIFdvcmxkIGZyb20gJChob3N0bmFtZSAtZikgYW5kIGluc3RhbmNlIDI8L2gxPlwiID4gL3Zhci93d3cvaHRtbC9pbmRleC5odG1sJ1xuICAgIC8vICk7XG5cbiAgICAvLyBjb25zdCBhc2cxID0gbmV3IGF1dG9zY2FsaW5nLkF1dG9TY2FsaW5nR3JvdXAodGhpcywgXCJhc2cxXCIsIHtcbiAgICAvLyAgIHZwYyxcbiAgICAvLyAgIGluc3RhbmNlVHlwZTogZWMyLkluc3RhbmNlVHlwZS5vZihcbiAgICAvLyAgICAgZWMyLkluc3RhbmNlQ2xhc3MuVDIsXG4gICAgLy8gICAgIGVjMi5JbnN0YW5jZVNpemUuTUlDUk9cbiAgICAvLyAgICksXG4gICAgLy8gICBtYWNoaW5lSW1hZ2U6IG5ldyBlYzIuQW1hem9uTGludXhJbWFnZSh7XG4gICAgLy8gICAgIGdlbmVyYXRpb246IGVjMi5BbWF6b25MaW51eEdlbmVyYXRpb24uQU1BWk9OX0xJTlVYXzIsXG4gICAgLy8gICB9KSxcbiAgICAvLyAgIHVzZXJEYXRhOiB1c2VyRGF0YTEsXG4gICAgLy8gICBtaW5DYXBhY2l0eTogMSxcbiAgICAvLyAgIG1heENhcGFjaXR5OiAxLFxuICAgIC8vIH0pO1xuXG4gICAgLy8gY29uc3QgYXNnMiA9IG5ldyBhdXRvc2NhbGluZy5BdXRvU2NhbGluZ0dyb3VwKHRoaXMsIFwiYXNnMlwiLCB7XG4gICAgLy8gICB2cGMsXG4gICAgLy8gICBpbnN0YW5jZVR5cGU6IGVjMi5JbnN0YW5jZVR5cGUub2YoXG4gICAgLy8gICAgIGVjMi5JbnN0YW5jZUNsYXNzLlQyLFxuICAgIC8vICAgICBlYzIuSW5zdGFuY2VTaXplLk1JQ1JPXG4gICAgLy8gICApLFxuICAgIC8vICAgbWFjaGluZUltYWdlOiBuZXcgZWMyLkFtYXpvbkxpbnV4SW1hZ2Uoe1xuICAgIC8vICAgICBnZW5lcmF0aW9uOiBlYzIuQW1hem9uTGludXhHZW5lcmF0aW9uLkFNQVpPTl9MSU5VWF8yLFxuICAgIC8vICAgfSksXG4gICAgLy8gICB1c2VyRGF0YTogdXNlckRhdGEyLFxuICAgIC8vICAgbWluQ2FwYWNpdHk6IDEsXG4gICAgLy8gICBtYXhDYXBhY2l0eTogMSxcbiAgICAvLyB9KTtcblxuICAgIC8vIGNvbnN0IHRnMSA9IG5ldyBlbGJ2Mi5BcHBsaWNhdGlvblRhcmdldEdyb3VwKFxuICAgIC8vICAgdGhpcyxcbiAgICAvLyAgIFwiYXBwbGljYXRpb24tdGFyZ2V0LWdyb3VwLTFcIixcbiAgICAvLyAgIHtcbiAgICAvLyAgICAgcG9ydDogODAsXG4gICAgLy8gICAgIHRhcmdldHM6IFthc2cxXSxcbiAgICAvLyAgICAgdnBjLFxuICAgIC8vICAgfVxuICAgIC8vICk7XG5cbiAgICAvLyBjb25zdCB0ZzIgPSBuZXcgZWxidjIuQXBwbGljYXRpb25UYXJnZXRHcm91cChcbiAgICAvLyAgIHRoaXMsXG4gICAgLy8gICBcImFwcGxpY2F0aW9uLXRhcmdldC1ncm91cC0yXCIsXG4gICAgLy8gICB7XG4gICAgLy8gICAgIHBvcnQ6IDgwLFxuICAgIC8vICAgICB0YXJnZXRzOiBbYXNnMl0sXG4gICAgLy8gICAgIHZwYyxcbiAgICAvLyAgIH1cbiAgICAvLyApO1xuXG4gICAgLy8gbGlzdGVuZXIuYWRkQWN0aW9uKFwiYWN0aW9uLTFcIiwge1xuICAgIC8vICAgYWN0aW9uOiBlbGJ2Mi5MaXN0ZW5lckFjdGlvbi53ZWlnaHRlZEZvcndhcmQoW1xuICAgIC8vICAgICB7IHRhcmdldEdyb3VwOiB0ZzEsIHdlaWdodDogNCB9LFxuICAgIC8vICAgICB7IHRhcmdldEdyb3VwOiB0ZzIsIHdlaWdodDogMSB9LFxuICAgIC8vICAgXSksXG4gICAgLy8gfSk7XG5cbiAgICAvLyBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCBcImFsYkROU1wiLCB7XG4gICAgLy8gICB2YWx1ZTogYWxiLmxvYWRCYWxhbmNlckRuc05hbWUsXG4gICAgLy8gfSk7XG4gIH1cbn1cbiJdfQ==