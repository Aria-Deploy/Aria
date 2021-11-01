"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ec2InstanceExampleStack = void 0;
const stackApp_1 = require("./stackApp");
class Ec2InstanceExampleStack extends stackApp_1.StackApp {
    constructor(id, props) {
        super(id, props);
        // USER-INPUT Required VPC Input
        // const vpc = new ec2.Vpc(this, "my-cdk-vpc", {
        //   cidr: "10.0.0.0/16", //what is this?
        //   natGateways: 0,
        //   subnetConfiguration: [
        //     { name: "public", cidrMask: 24, subnetType: ec2.SubnetType.PUBLIC },
        //   ],
        // });
        // // USER-INPUT Optional Security Group Input
        // const webserverSG = new ec2.SecurityGroup(this, "webserver-sg", {
        //   vpc,
        //   allowAllOutbound: true,
        // });
        // webserverSG.addIngressRule(
        //   ec2.Peer.anyIpv4(),
        //   ec2.Port.tcp(22),
        //   "allow SSH access from anywhere"
        // );
        // webserverSG.addIngressRule(
        //   ec2.Peer.anyIpv4(),
        //   ec2.Port.tcp(80),
        //   "allow HTTP traffic from anywhere"
        // );
        // webserverSG.addIngressRule(
        //   ec2.Peer.anyIpv4(),
        //   ec2.Port.tcp(80),
        //   "allow HTTP traffic from anywhere"
        // );
        // webserverSG.addIngressRule(
        //   ec2.Peer.anyIpv4(),
        //   ec2.Port.tcp(443),
        //   "allow HTTP traffic from anywhere"
        // );
        // const webserverRole = new iam.Role(this, "webserver-role", {
        //   assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
        //   managedPolicies: [
        //     iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3ReadOnlyAccess"),
        //   ],
        // });
        // const ec2Instance = new ec2.Instance(this, "ec2-instance", {
        //   vpc,
        //   vpcSubnets: {
        //     subnetType: ec2.SubnetType.PUBLIC,
        //   },
        //   role: webserverRole,
        //   securityGroup: webserverSG,
        //   instanceType: ec2.InstanceType.of(
        //     ec2.InstanceClass.T2,
        //     ec2.InstanceSize.MICRO
        //   ),
        //   machineImage: new ec2.AmazonLinuxImage({
        //     generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
        //   }),
        //   keyName: "ec2-key-pair2",
        // });
        // // 👇 load contents of script
        // const userDataScript = readFileSync("./lib/user-data.sh", "utf8");
        // // 👇 add the User Data script to the Instance
        // ec2Instance.addUserData(userDataScript);
    }
}
exports.Ec2InstanceExampleStack = Ec2InstanceExampleStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWMyX2luc3RhbmNlX2V4YW1wbGUtc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJlYzJfaW5zdGFuY2VfZXhhbXBsZS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFHQSx5Q0FBc0M7QUFFdEMsTUFBYSx1QkFBd0IsU0FBUSxtQkFBUTtJQUNuRCxZQUFZLEVBQVUsRUFBRSxLQUFzQjtRQUM1QyxLQUFLLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRWpCLGdDQUFnQztRQUNoQyxnREFBZ0Q7UUFDaEQseUNBQXlDO1FBQ3pDLG9CQUFvQjtRQUNwQiwyQkFBMkI7UUFDM0IsMkVBQTJFO1FBQzNFLE9BQU87UUFDUCxNQUFNO1FBRU4sOENBQThDO1FBQzlDLG9FQUFvRTtRQUNwRSxTQUFTO1FBQ1QsNEJBQTRCO1FBQzVCLE1BQU07UUFFTiw4QkFBOEI7UUFDOUIsd0JBQXdCO1FBQ3hCLHNCQUFzQjtRQUN0QixxQ0FBcUM7UUFDckMsS0FBSztRQUVMLDhCQUE4QjtRQUM5Qix3QkFBd0I7UUFDeEIsc0JBQXNCO1FBQ3RCLHVDQUF1QztRQUN2QyxLQUFLO1FBRUwsOEJBQThCO1FBQzlCLHdCQUF3QjtRQUN4QixzQkFBc0I7UUFDdEIsdUNBQXVDO1FBQ3ZDLEtBQUs7UUFFTCw4QkFBOEI7UUFDOUIsd0JBQXdCO1FBQ3hCLHVCQUF1QjtRQUN2Qix1Q0FBdUM7UUFDdkMsS0FBSztRQUVMLCtEQUErRDtRQUMvRCw4REFBOEQ7UUFDOUQsdUJBQXVCO1FBQ3ZCLDRFQUE0RTtRQUM1RSxPQUFPO1FBQ1AsTUFBTTtRQUVOLCtEQUErRDtRQUMvRCxTQUFTO1FBQ1Qsa0JBQWtCO1FBQ2xCLHlDQUF5QztRQUN6QyxPQUFPO1FBQ1AseUJBQXlCO1FBQ3pCLGdDQUFnQztRQUNoQyx1Q0FBdUM7UUFDdkMsNEJBQTRCO1FBQzVCLDZCQUE2QjtRQUM3QixPQUFPO1FBQ1AsNkNBQTZDO1FBQzdDLDREQUE0RDtRQUM1RCxRQUFRO1FBQ1IsOEJBQThCO1FBQzlCLE1BQU07UUFFTixnQ0FBZ0M7UUFDaEMscUVBQXFFO1FBQ3JFLGlEQUFpRDtRQUNqRCwyQ0FBMkM7SUFDN0MsQ0FBQztDQUNGO0FBeEVELDBEQXdFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiQGF3cy1jZGsvY29yZVwiO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gXCJAYXdzLWNkay9hd3MtaWFtXCI7XG5pbXBvcnQgKiBhcyBlYzIgZnJvbSBcIkBhd3MtY2RrL2F3cy1lYzJcIjtcbmltcG9ydCB7IFN0YWNrQXBwIH0gZnJvbSBcIi4vc3RhY2tBcHBcIjtcblxuZXhwb3J0IGNsYXNzIEVjMkluc3RhbmNlRXhhbXBsZVN0YWNrIGV4dGVuZHMgU3RhY2tBcHAge1xuICBjb25zdHJ1Y3RvcihpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoaWQsIHByb3BzKTtcblxuICAgIC8vIFVTRVItSU5QVVQgUmVxdWlyZWQgVlBDIElucHV0XG4gICAgLy8gY29uc3QgdnBjID0gbmV3IGVjMi5WcGModGhpcywgXCJteS1jZGstdnBjXCIsIHtcbiAgICAvLyAgIGNpZHI6IFwiMTAuMC4wLjAvMTZcIiwgLy93aGF0IGlzIHRoaXM/XG4gICAgLy8gICBuYXRHYXRld2F5czogMCxcbiAgICAvLyAgIHN1Ym5ldENvbmZpZ3VyYXRpb246IFtcbiAgICAvLyAgICAgeyBuYW1lOiBcInB1YmxpY1wiLCBjaWRyTWFzazogMjQsIHN1Ym5ldFR5cGU6IGVjMi5TdWJuZXRUeXBlLlBVQkxJQyB9LFxuICAgIC8vICAgXSxcbiAgICAvLyB9KTtcblxuICAgIC8vIC8vIFVTRVItSU5QVVQgT3B0aW9uYWwgU2VjdXJpdHkgR3JvdXAgSW5wdXRcbiAgICAvLyBjb25zdCB3ZWJzZXJ2ZXJTRyA9IG5ldyBlYzIuU2VjdXJpdHlHcm91cCh0aGlzLCBcIndlYnNlcnZlci1zZ1wiLCB7XG4gICAgLy8gICB2cGMsXG4gICAgLy8gICBhbGxvd0FsbE91dGJvdW5kOiB0cnVlLFxuICAgIC8vIH0pO1xuXG4gICAgLy8gd2Vic2VydmVyU0cuYWRkSW5ncmVzc1J1bGUoXG4gICAgLy8gICBlYzIuUGVlci5hbnlJcHY0KCksXG4gICAgLy8gICBlYzIuUG9ydC50Y3AoMjIpLFxuICAgIC8vICAgXCJhbGxvdyBTU0ggYWNjZXNzIGZyb20gYW55d2hlcmVcIlxuICAgIC8vICk7XG5cbiAgICAvLyB3ZWJzZXJ2ZXJTRy5hZGRJbmdyZXNzUnVsZShcbiAgICAvLyAgIGVjMi5QZWVyLmFueUlwdjQoKSxcbiAgICAvLyAgIGVjMi5Qb3J0LnRjcCg4MCksXG4gICAgLy8gICBcImFsbG93IEhUVFAgdHJhZmZpYyBmcm9tIGFueXdoZXJlXCJcbiAgICAvLyApO1xuXG4gICAgLy8gd2Vic2VydmVyU0cuYWRkSW5ncmVzc1J1bGUoXG4gICAgLy8gICBlYzIuUGVlci5hbnlJcHY0KCksXG4gICAgLy8gICBlYzIuUG9ydC50Y3AoODApLFxuICAgIC8vICAgXCJhbGxvdyBIVFRQIHRyYWZmaWMgZnJvbSBhbnl3aGVyZVwiXG4gICAgLy8gKTtcblxuICAgIC8vIHdlYnNlcnZlclNHLmFkZEluZ3Jlc3NSdWxlKFxuICAgIC8vICAgZWMyLlBlZXIuYW55SXB2NCgpLFxuICAgIC8vICAgZWMyLlBvcnQudGNwKDQ0MyksXG4gICAgLy8gICBcImFsbG93IEhUVFAgdHJhZmZpYyBmcm9tIGFueXdoZXJlXCJcbiAgICAvLyApO1xuXG4gICAgLy8gY29uc3Qgd2Vic2VydmVyUm9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCBcIndlYnNlcnZlci1yb2xlXCIsIHtcbiAgICAvLyAgIGFzc3VtZWRCeTogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKFwiZWMyLmFtYXpvbmF3cy5jb21cIiksXG4gICAgLy8gICBtYW5hZ2VkUG9saWNpZXM6IFtcbiAgICAvLyAgICAgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFwiQW1hem9uUzNSZWFkT25seUFjY2Vzc1wiKSxcbiAgICAvLyAgIF0sXG4gICAgLy8gfSk7XG5cbiAgICAvLyBjb25zdCBlYzJJbnN0YW5jZSA9IG5ldyBlYzIuSW5zdGFuY2UodGhpcywgXCJlYzItaW5zdGFuY2VcIiwge1xuICAgIC8vICAgdnBjLFxuICAgIC8vICAgdnBjU3VibmV0czoge1xuICAgIC8vICAgICBzdWJuZXRUeXBlOiBlYzIuU3VibmV0VHlwZS5QVUJMSUMsXG4gICAgLy8gICB9LFxuICAgIC8vICAgcm9sZTogd2Vic2VydmVyUm9sZSxcbiAgICAvLyAgIHNlY3VyaXR5R3JvdXA6IHdlYnNlcnZlclNHLFxuICAgIC8vICAgaW5zdGFuY2VUeXBlOiBlYzIuSW5zdGFuY2VUeXBlLm9mKFxuICAgIC8vICAgICBlYzIuSW5zdGFuY2VDbGFzcy5UMixcbiAgICAvLyAgICAgZWMyLkluc3RhbmNlU2l6ZS5NSUNST1xuICAgIC8vICAgKSxcbiAgICAvLyAgIG1hY2hpbmVJbWFnZTogbmV3IGVjMi5BbWF6b25MaW51eEltYWdlKHtcbiAgICAvLyAgICAgZ2VuZXJhdGlvbjogZWMyLkFtYXpvbkxpbnV4R2VuZXJhdGlvbi5BTUFaT05fTElOVVhfMixcbiAgICAvLyAgIH0pLFxuICAgIC8vICAga2V5TmFtZTogXCJlYzIta2V5LXBhaXIyXCIsXG4gICAgLy8gfSk7XG5cbiAgICAvLyAvLyDwn5GHIGxvYWQgY29udGVudHMgb2Ygc2NyaXB0XG4gICAgLy8gY29uc3QgdXNlckRhdGFTY3JpcHQgPSByZWFkRmlsZVN5bmMoXCIuL2xpYi91c2VyLWRhdGEuc2hcIiwgXCJ1dGY4XCIpO1xuICAgIC8vIC8vIPCfkYcgYWRkIHRoZSBVc2VyIERhdGEgc2NyaXB0IHRvIHRoZSBJbnN0YW5jZVxuICAgIC8vIGVjMkluc3RhbmNlLmFkZFVzZXJEYXRhKHVzZXJEYXRhU2NyaXB0KTtcbiAgfVxufVxuIl19