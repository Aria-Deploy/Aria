"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ec2InstanceExampleStack = void 0;
const ec2 = require("@aws-cdk/aws-ec2");
const stackApp_1 = require("./stackApp");
class Ec2InstanceExampleStack extends stackApp_1.StackApp {
    constructor(source, id, props) {
        super(source, id, props);
        // USER-INPUT Required VPC Input
        const vpc = new ec2.Vpc(this, "my-cdk-vpc", {
            cidr: "10.0.0.0/16",
            natGateways: 0,
            subnetConfiguration: [
                { name: "public", cidrMask: 24, subnetType: ec2.SubnetType.PUBLIC },
            ],
        });
        // // // USER-INPUT Optional Security Group Input
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWMyX2luc3RhbmNlX2V4YW1wbGUtc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGliL2VjMl9pbnN0YW5jZV9leGFtcGxlLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLHdDQUF3QztBQUN4Qyx5Q0FBc0M7QUFHdEMsTUFBYSx1QkFBd0IsU0FBUSxtQkFBUTtJQUNuRCxZQUFZLE1BQWUsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDN0QsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFekIsZ0NBQWdDO1FBQ2hDLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQzFDLElBQUksRUFBRSxhQUFhO1lBQ25CLFdBQVcsRUFBRSxDQUFDO1lBQ2QsbUJBQW1CLEVBQUU7Z0JBQ25CLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRTthQUNwRTtTQUNGLENBQUMsQ0FBQztRQUdILGlEQUFpRDtRQUNqRCxvRUFBb0U7UUFDcEUsU0FBUztRQUNULDRCQUE0QjtRQUM1QixNQUFNO1FBRU4sOEJBQThCO1FBQzlCLHdCQUF3QjtRQUN4QixzQkFBc0I7UUFDdEIscUNBQXFDO1FBQ3JDLEtBQUs7UUFFTCw4QkFBOEI7UUFDOUIsd0JBQXdCO1FBQ3hCLHNCQUFzQjtRQUN0Qix1Q0FBdUM7UUFDdkMsS0FBSztRQUVMLDhCQUE4QjtRQUM5Qix3QkFBd0I7UUFDeEIsc0JBQXNCO1FBQ3RCLHVDQUF1QztRQUN2QyxLQUFLO1FBRUwsOEJBQThCO1FBQzlCLHdCQUF3QjtRQUN4Qix1QkFBdUI7UUFDdkIsdUNBQXVDO1FBQ3ZDLEtBQUs7UUFFTCwrREFBK0Q7UUFDL0QsOERBQThEO1FBQzlELHVCQUF1QjtRQUN2Qiw0RUFBNEU7UUFDNUUsT0FBTztRQUNQLE1BQU07UUFFTiwrREFBK0Q7UUFDL0QsU0FBUztRQUNULGtCQUFrQjtRQUNsQix5Q0FBeUM7UUFDekMsT0FBTztRQUNQLHlCQUF5QjtRQUN6QixnQ0FBZ0M7UUFDaEMsdUNBQXVDO1FBQ3ZDLDRCQUE0QjtRQUM1Qiw2QkFBNkI7UUFDN0IsT0FBTztRQUNQLDZDQUE2QztRQUM3Qyw0REFBNEQ7UUFDNUQsUUFBUTtRQUNSLDhCQUE4QjtRQUM5QixNQUFNO1FBRU4sZ0NBQWdDO1FBQ2hDLHFFQUFxRTtRQUNyRSxpREFBaUQ7UUFDakQsMkNBQTJDO0lBQzdDLENBQUM7Q0FDRjtBQXpFRCwwREF5RUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSBcIkBhd3MtY2RrL2NvcmVcIjtcbmltcG9ydCAqIGFzIGlhbSBmcm9tIFwiQGF3cy1jZGsvYXdzLWlhbVwiO1xuaW1wb3J0ICogYXMgZWMyIGZyb20gXCJAYXdzLWNkay9hd3MtZWMyXCI7XG5pbXBvcnQgeyBTdGFja0FwcCB9IGZyb20gXCIuL3N0YWNrQXBwXCI7XG5pbXBvcnQgeyByZWFkRmlsZVN5bmMgfSBmcm9tIFwiZnNcIjtcblxuZXhwb3J0IGNsYXNzIEVjMkluc3RhbmNlRXhhbXBsZVN0YWNrIGV4dGVuZHMgU3RhY2tBcHAge1xuICBjb25zdHJ1Y3Rvcihzb3VyY2U6IGNkay5BcHAsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzb3VyY2UsIGlkLCBwcm9wcyk7XG5cbiAgICAvLyBVU0VSLUlOUFVUIFJlcXVpcmVkIFZQQyBJbnB1dFxuICAgIGNvbnN0IHZwYyA9IG5ldyBlYzIuVnBjKHRoaXMsIFwibXktY2RrLXZwY1wiLCB7XG4gICAgICBjaWRyOiBcIjEwLjAuMC4wLzE2XCIsIC8vd2hhdCBpcyB0aGlzP1xuICAgICAgbmF0R2F0ZXdheXM6IDAsXG4gICAgICBzdWJuZXRDb25maWd1cmF0aW9uOiBbXG4gICAgICAgIHsgbmFtZTogXCJwdWJsaWNcIiwgY2lkck1hc2s6IDI0LCBzdWJuZXRUeXBlOiBlYzIuU3VibmV0VHlwZS5QVUJMSUMgfSxcbiAgICAgIF0sXG4gICAgfSk7XG4gICAgXG5cbiAgICAvLyAvLyAvLyBVU0VSLUlOUFVUIE9wdGlvbmFsIFNlY3VyaXR5IEdyb3VwIElucHV0XG4gICAgLy8gY29uc3Qgd2Vic2VydmVyU0cgPSBuZXcgZWMyLlNlY3VyaXR5R3JvdXAodGhpcywgXCJ3ZWJzZXJ2ZXItc2dcIiwge1xuICAgIC8vICAgdnBjLFxuICAgIC8vICAgYWxsb3dBbGxPdXRib3VuZDogdHJ1ZSxcbiAgICAvLyB9KTtcblxuICAgIC8vIHdlYnNlcnZlclNHLmFkZEluZ3Jlc3NSdWxlKFxuICAgIC8vICAgZWMyLlBlZXIuYW55SXB2NCgpLFxuICAgIC8vICAgZWMyLlBvcnQudGNwKDIyKSxcbiAgICAvLyAgIFwiYWxsb3cgU1NIIGFjY2VzcyBmcm9tIGFueXdoZXJlXCJcbiAgICAvLyApO1xuXG4gICAgLy8gd2Vic2VydmVyU0cuYWRkSW5ncmVzc1J1bGUoXG4gICAgLy8gICBlYzIuUGVlci5hbnlJcHY0KCksXG4gICAgLy8gICBlYzIuUG9ydC50Y3AoODApLFxuICAgIC8vICAgXCJhbGxvdyBIVFRQIHRyYWZmaWMgZnJvbSBhbnl3aGVyZVwiXG4gICAgLy8gKTtcblxuICAgIC8vIHdlYnNlcnZlclNHLmFkZEluZ3Jlc3NSdWxlKFxuICAgIC8vICAgZWMyLlBlZXIuYW55SXB2NCgpLFxuICAgIC8vICAgZWMyLlBvcnQudGNwKDgwKSxcbiAgICAvLyAgIFwiYWxsb3cgSFRUUCB0cmFmZmljIGZyb20gYW55d2hlcmVcIlxuICAgIC8vICk7XG5cbiAgICAvLyB3ZWJzZXJ2ZXJTRy5hZGRJbmdyZXNzUnVsZShcbiAgICAvLyAgIGVjMi5QZWVyLmFueUlwdjQoKSxcbiAgICAvLyAgIGVjMi5Qb3J0LnRjcCg0NDMpLFxuICAgIC8vICAgXCJhbGxvdyBIVFRQIHRyYWZmaWMgZnJvbSBhbnl3aGVyZVwiXG4gICAgLy8gKTtcblxuICAgIC8vIGNvbnN0IHdlYnNlcnZlclJvbGUgPSBuZXcgaWFtLlJvbGUodGhpcywgXCJ3ZWJzZXJ2ZXItcm9sZVwiLCB7XG4gICAgLy8gICBhc3N1bWVkQnk6IG5ldyBpYW0uU2VydmljZVByaW5jaXBhbChcImVjMi5hbWF6b25hd3MuY29tXCIpLFxuICAgIC8vICAgbWFuYWdlZFBvbGljaWVzOiBbXG4gICAgLy8gICAgIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcIkFtYXpvblMzUmVhZE9ubHlBY2Nlc3NcIiksXG4gICAgLy8gICBdLFxuICAgIC8vIH0pO1xuXG4gICAgLy8gY29uc3QgZWMySW5zdGFuY2UgPSBuZXcgZWMyLkluc3RhbmNlKHRoaXMsIFwiZWMyLWluc3RhbmNlXCIsIHtcbiAgICAvLyAgIHZwYyxcbiAgICAvLyAgIHZwY1N1Ym5ldHM6IHtcbiAgICAvLyAgICAgc3VibmV0VHlwZTogZWMyLlN1Ym5ldFR5cGUuUFVCTElDLFxuICAgIC8vICAgfSxcbiAgICAvLyAgIHJvbGU6IHdlYnNlcnZlclJvbGUsXG4gICAgLy8gICBzZWN1cml0eUdyb3VwOiB3ZWJzZXJ2ZXJTRyxcbiAgICAvLyAgIGluc3RhbmNlVHlwZTogZWMyLkluc3RhbmNlVHlwZS5vZihcbiAgICAvLyAgICAgZWMyLkluc3RhbmNlQ2xhc3MuVDIsXG4gICAgLy8gICAgIGVjMi5JbnN0YW5jZVNpemUuTUlDUk9cbiAgICAvLyAgICksXG4gICAgLy8gICBtYWNoaW5lSW1hZ2U6IG5ldyBlYzIuQW1hem9uTGludXhJbWFnZSh7XG4gICAgLy8gICAgIGdlbmVyYXRpb246IGVjMi5BbWF6b25MaW51eEdlbmVyYXRpb24uQU1BWk9OX0xJTlVYXzIsXG4gICAgLy8gICB9KSxcbiAgICAvLyAgIGtleU5hbWU6IFwiZWMyLWtleS1wYWlyMlwiLFxuICAgIC8vIH0pO1xuXG4gICAgLy8gLy8g8J+RhyBsb2FkIGNvbnRlbnRzIG9mIHNjcmlwdFxuICAgIC8vIGNvbnN0IHVzZXJEYXRhU2NyaXB0ID0gcmVhZEZpbGVTeW5jKFwiLi9saWIvdXNlci1kYXRhLnNoXCIsIFwidXRmOFwiKTtcbiAgICAvLyAvLyDwn5GHIGFkZCB0aGUgVXNlciBEYXRhIHNjcmlwdCB0byB0aGUgSW5zdGFuY2VcbiAgICAvLyBlYzJJbnN0YW5jZS5hZGRVc2VyRGF0YSh1c2VyRGF0YVNjcmlwdCk7XG4gIH1cbn1cbiJdfQ==