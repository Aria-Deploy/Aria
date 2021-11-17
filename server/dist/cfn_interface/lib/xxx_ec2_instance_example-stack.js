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
exports.Ec2InstanceExampleStack = void 0;
const ec2 = __importStar(require("@aws-cdk/aws-ec2"));
const xxx__stackApp_1 = require("./xxx__stackApp");
class Ec2InstanceExampleStack extends xxx__stackApp_1.StackApp {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieHh4X2VjMl9pbnN0YW5jZV9leGFtcGxlLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2Nmbl9pbnRlcmZhY2UvbGliL3h4eF9lYzJfaW5zdGFuY2VfZXhhbXBsZS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsc0RBQXdDO0FBQ3hDLG1EQUEyQztBQUczQyxNQUFhLHVCQUF3QixTQUFRLHdCQUFRO0lBQ25ELFlBQVksTUFBZSxFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM3RCxLQUFLLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV6QixnQ0FBZ0M7UUFDaEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUU7WUFDMUMsSUFBSSxFQUFFLGFBQWE7WUFDbkIsV0FBVyxFQUFFLENBQUM7WUFDZCxtQkFBbUIsRUFBRTtnQkFDbkIsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFO2FBQ3BFO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsaURBQWlEO1FBQ2pELG9FQUFvRTtRQUNwRSxTQUFTO1FBQ1QsNEJBQTRCO1FBQzVCLE1BQU07UUFFTiw4QkFBOEI7UUFDOUIsd0JBQXdCO1FBQ3hCLHNCQUFzQjtRQUN0QixxQ0FBcUM7UUFDckMsS0FBSztRQUVMLDhCQUE4QjtRQUM5Qix3QkFBd0I7UUFDeEIsc0JBQXNCO1FBQ3RCLHVDQUF1QztRQUN2QyxLQUFLO1FBRUwsOEJBQThCO1FBQzlCLHdCQUF3QjtRQUN4QixzQkFBc0I7UUFDdEIsdUNBQXVDO1FBQ3ZDLEtBQUs7UUFFTCw4QkFBOEI7UUFDOUIsd0JBQXdCO1FBQ3hCLHVCQUF1QjtRQUN2Qix1Q0FBdUM7UUFDdkMsS0FBSztRQUVMLCtEQUErRDtRQUMvRCw4REFBOEQ7UUFDOUQsdUJBQXVCO1FBQ3ZCLDRFQUE0RTtRQUM1RSxPQUFPO1FBQ1AsTUFBTTtRQUVOLCtEQUErRDtRQUMvRCxTQUFTO1FBQ1Qsa0JBQWtCO1FBQ2xCLHlDQUF5QztRQUN6QyxPQUFPO1FBQ1AseUJBQXlCO1FBQ3pCLGdDQUFnQztRQUNoQyx1Q0FBdUM7UUFDdkMsNEJBQTRCO1FBQzVCLDZCQUE2QjtRQUM3QixPQUFPO1FBQ1AsNkNBQTZDO1FBQzdDLDREQUE0RDtRQUM1RCxRQUFRO1FBQ1IsOEJBQThCO1FBQzlCLE1BQU07UUFFTixnQ0FBZ0M7UUFDaEMscUVBQXFFO1FBQ3JFLGlEQUFpRDtRQUNqRCwyQ0FBMkM7SUFDN0MsQ0FBQztDQUNGO0FBeEVELDBEQXdFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiQGF3cy1jZGsvY29yZVwiO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gXCJAYXdzLWNkay9hd3MtaWFtXCI7XG5pbXBvcnQgKiBhcyBlYzIgZnJvbSBcIkBhd3MtY2RrL2F3cy1lYzJcIjtcbmltcG9ydCB7IFN0YWNrQXBwIH0gZnJvbSBcIi4veHh4X19zdGFja0FwcFwiO1xuaW1wb3J0IHsgcmVhZEZpbGVTeW5jIH0gZnJvbSBcImZzXCI7XG5cbmV4cG9ydCBjbGFzcyBFYzJJbnN0YW5jZUV4YW1wbGVTdGFjayBleHRlbmRzIFN0YWNrQXBwIHtcbiAgY29uc3RydWN0b3Ioc291cmNlOiBjZGsuQXBwLCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc291cmNlLCBpZCwgcHJvcHMpO1xuXG4gICAgLy8gVVNFUi1JTlBVVCBSZXF1aXJlZCBWUEMgSW5wdXRcbiAgICBjb25zdCB2cGMgPSBuZXcgZWMyLlZwYyh0aGlzLCBcIm15LWNkay12cGNcIiwge1xuICAgICAgY2lkcjogXCIxMC4wLjAuMC8xNlwiLCAvL3doYXQgaXMgdGhpcz9cbiAgICAgIG5hdEdhdGV3YXlzOiAwLFxuICAgICAgc3VibmV0Q29uZmlndXJhdGlvbjogW1xuICAgICAgICB7IG5hbWU6IFwicHVibGljXCIsIGNpZHJNYXNrOiAyNCwgc3VibmV0VHlwZTogZWMyLlN1Ym5ldFR5cGUuUFVCTElDIH0sXG4gICAgICBdLFxuICAgIH0pO1xuXG4gICAgLy8gLy8gLy8gVVNFUi1JTlBVVCBPcHRpb25hbCBTZWN1cml0eSBHcm91cCBJbnB1dFxuICAgIC8vIGNvbnN0IHdlYnNlcnZlclNHID0gbmV3IGVjMi5TZWN1cml0eUdyb3VwKHRoaXMsIFwid2Vic2VydmVyLXNnXCIsIHtcbiAgICAvLyAgIHZwYyxcbiAgICAvLyAgIGFsbG93QWxsT3V0Ym91bmQ6IHRydWUsXG4gICAgLy8gfSk7XG5cbiAgICAvLyB3ZWJzZXJ2ZXJTRy5hZGRJbmdyZXNzUnVsZShcbiAgICAvLyAgIGVjMi5QZWVyLmFueUlwdjQoKSxcbiAgICAvLyAgIGVjMi5Qb3J0LnRjcCgyMiksXG4gICAgLy8gICBcImFsbG93IFNTSCBhY2Nlc3MgZnJvbSBhbnl3aGVyZVwiXG4gICAgLy8gKTtcblxuICAgIC8vIHdlYnNlcnZlclNHLmFkZEluZ3Jlc3NSdWxlKFxuICAgIC8vICAgZWMyLlBlZXIuYW55SXB2NCgpLFxuICAgIC8vICAgZWMyLlBvcnQudGNwKDgwKSxcbiAgICAvLyAgIFwiYWxsb3cgSFRUUCB0cmFmZmljIGZyb20gYW55d2hlcmVcIlxuICAgIC8vICk7XG5cbiAgICAvLyB3ZWJzZXJ2ZXJTRy5hZGRJbmdyZXNzUnVsZShcbiAgICAvLyAgIGVjMi5QZWVyLmFueUlwdjQoKSxcbiAgICAvLyAgIGVjMi5Qb3J0LnRjcCg4MCksXG4gICAgLy8gICBcImFsbG93IEhUVFAgdHJhZmZpYyBmcm9tIGFueXdoZXJlXCJcbiAgICAvLyApO1xuXG4gICAgLy8gd2Vic2VydmVyU0cuYWRkSW5ncmVzc1J1bGUoXG4gICAgLy8gICBlYzIuUGVlci5hbnlJcHY0KCksXG4gICAgLy8gICBlYzIuUG9ydC50Y3AoNDQzKSxcbiAgICAvLyAgIFwiYWxsb3cgSFRUUCB0cmFmZmljIGZyb20gYW55d2hlcmVcIlxuICAgIC8vICk7XG5cbiAgICAvLyBjb25zdCB3ZWJzZXJ2ZXJSb2xlID0gbmV3IGlhbS5Sb2xlKHRoaXMsIFwid2Vic2VydmVyLXJvbGVcIiwge1xuICAgIC8vICAgYXNzdW1lZEJ5OiBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoXCJlYzIuYW1hem9uYXdzLmNvbVwiKSxcbiAgICAvLyAgIG1hbmFnZWRQb2xpY2llczogW1xuICAgIC8vICAgICBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJBbWF6b25TM1JlYWRPbmx5QWNjZXNzXCIpLFxuICAgIC8vICAgXSxcbiAgICAvLyB9KTtcblxuICAgIC8vIGNvbnN0IGVjMkluc3RhbmNlID0gbmV3IGVjMi5JbnN0YW5jZSh0aGlzLCBcImVjMi1pbnN0YW5jZVwiLCB7XG4gICAgLy8gICB2cGMsXG4gICAgLy8gICB2cGNTdWJuZXRzOiB7XG4gICAgLy8gICAgIHN1Ym5ldFR5cGU6IGVjMi5TdWJuZXRUeXBlLlBVQkxJQyxcbiAgICAvLyAgIH0sXG4gICAgLy8gICByb2xlOiB3ZWJzZXJ2ZXJSb2xlLFxuICAgIC8vICAgc2VjdXJpdHlHcm91cDogd2Vic2VydmVyU0csXG4gICAgLy8gICBpbnN0YW5jZVR5cGU6IGVjMi5JbnN0YW5jZVR5cGUub2YoXG4gICAgLy8gICAgIGVjMi5JbnN0YW5jZUNsYXNzLlQyLFxuICAgIC8vICAgICBlYzIuSW5zdGFuY2VTaXplLk1JQ1JPXG4gICAgLy8gICApLFxuICAgIC8vICAgbWFjaGluZUltYWdlOiBuZXcgZWMyLkFtYXpvbkxpbnV4SW1hZ2Uoe1xuICAgIC8vICAgICBnZW5lcmF0aW9uOiBlYzIuQW1hem9uTGludXhHZW5lcmF0aW9uLkFNQVpPTl9MSU5VWF8yLFxuICAgIC8vICAgfSksXG4gICAgLy8gICBrZXlOYW1lOiBcImVjMi1rZXktcGFpcjJcIixcbiAgICAvLyB9KTtcblxuICAgIC8vIC8vIPCfkYcgbG9hZCBjb250ZW50cyBvZiBzY3JpcHRcbiAgICAvLyBjb25zdCB1c2VyRGF0YVNjcmlwdCA9IHJlYWRGaWxlU3luYyhcIi4vbGliL3VzZXItZGF0YS5zaFwiLCBcInV0ZjhcIik7XG4gICAgLy8gLy8g8J+RhyBhZGQgdGhlIFVzZXIgRGF0YSBzY3JpcHQgdG8gdGhlIEluc3RhbmNlXG4gICAgLy8gZWMySW5zdGFuY2UuYWRkVXNlckRhdGEodXNlckRhdGFTY3JpcHQpO1xuICB9XG59XG4iXX0=