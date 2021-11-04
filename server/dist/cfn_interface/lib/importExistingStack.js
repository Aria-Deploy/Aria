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
exports.ExistingStack = void 0;
const elbv2 = require("@aws-cdk/aws-elasticloadbalancingv2");
const autoscaling = __importStar(require("@aws-cdk/aws-autoscaling"));
const ec2 = __importStar(require("@aws-cdk/aws-ec2"));
const client_ec2_1 = require("@aws-sdk/client-ec2");
const client_cloudformation_1 = require("@aws-sdk/client-cloudformation");
const cfninc = __importStar(require("@aws-cdk/cloudformation-include"));
const js_yaml = __importStar(require("js-yaml"));
const fs = __importStar(require("fs"));
const stackApp_1 = require("./stackApp");
class ExistingStack extends stackApp_1.StackApp {
    static importExistingStack() { }
    constructor(source, id, props) {
        super(source, id, props);
        const config = {
            credentials: {
                accessKeyId: "AKIA25JBDPC2IV4DJ6HD",
                secretAccessKey: "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",
            },
            region: "us-west-2",
        };
        let stackVPC;
        (async () => {
            const client = new client_cloudformation_1.CloudFormationClient(config);
            const fetchActiveListsCmd = new client_cloudformation_1.ListStacksCommand({});
            const allUserStacks = await client.send(fetchActiveListsCmd);
            const activeStacks = allUserStacks.StackSummaries?.filter((stack) => !stack.DeletionTime);
            // USER-INPUT: Replace with User Required Selection from Stacks
            const stackId = activeStacks ? activeStacks[0].StackId : "";
            const stackName = activeStacks ? activeStacks[0].StackName : "";
            const fetchStackTemplateCmd = new client_cloudformation_1.GetTemplateCommand({
                StackName: stackId,
            });
            const existingStackTemplate = await client.send(fetchStackTemplateCmd);
            const obj = js_yaml.load(existingStackTemplate.TemplateBody || "");
            fs.writeFileSync("./cdk.out/ExistingStack.template.json", JSON.stringify(obj, null, 2));
            await this.synthesizeStack();
            const ec2client = new client_ec2_1.EC2Client(config);
            const vpcCmd = new client_ec2_1.DescribeVpcsCommand({});
            const vpcResponse = await ec2client.send(vpcCmd);
            vpcResponse.Vpcs = vpcResponse.Vpcs || [];
            vpcResponse.Vpcs.forEach(vpc => {
                // console.log(vpc.Tags)
            });
            const subnetsCmd = new client_ec2_1.DescribeSubnetsCommand({});
            const subnetsResponse = await ec2client.send(subnetsCmd);
            subnetsResponse.Subnets = subnetsResponse.Subnets || [];
            subnetsResponse.Subnets.forEach(subnet => {
                // console.log(subnet.Tags)
            });
        })();
        const template = new cfninc.CfnInclude(this, "Template", {
            templateFile: "./cdk.out/ExistingStack.template.json",
        });
        const vpc = ec2.Vpc.fromVpcAttributes(this, "external-vpc", {
            vpcId: "vpc-0425f34b53b32a0e1",
            availabilityZones: ["us-west-1a", "us-west-1b", "us-west-1c"],
            publicSubnetIds: [
                "subnet-054f34a975af84d51",
                "subnet-01b4e723d7a7a548a",
                "subnet-087842a4528a88af1",
            ],
            privateSubnetIds: [
                "subnet-04fc17ef1f9e54a6c",
                "subnet-0c65005be835b3849",
                "subnet-05acd890e71026a3d",
            ],
        });
        const alb2 = new elbv2.ApplicationLoadBalancer(this, 'alb2', {
            vpc,
            internetFacing: true,
        });
        const asg = new autoscaling.AutoScalingGroup(this, "ASG", {
            vpc,
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
            machineImage: new ec2.AmazonLinuxImage(),
        });
    }
}
exports.ExistingStack = ExistingStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1wb3J0RXhpc3RpbmdTdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jZm5faW50ZXJmYWNlL2xpYi9pbXBvcnRFeGlzdGluZ1N0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSw2REFBOEQ7QUFDOUQsc0VBQXdEO0FBQ3hELHNEQUF3QztBQUN4QyxvREFBNEY7QUFFNUYsMEVBSXdDO0FBQ3hDLHdFQUEwRDtBQUMxRCxpREFBbUM7QUFDbkMsdUNBQXlCO0FBRXpCLHlDQUFzQztBQUV0QyxNQUFhLGFBQWMsU0FBUSxtQkFBUTtJQUN6QyxNQUFNLENBQUMsbUJBQW1CLEtBQUksQ0FBQztJQUMvQixZQUFZLE1BQWUsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDN0QsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFekIsTUFBTSxNQUFNLEdBQUc7WUFDYixXQUFXLEVBQUU7Z0JBQ1gsV0FBVyxFQUFFLHNCQUFzQjtnQkFDbkMsZUFBZSxFQUFFLDBDQUEwQzthQUM1RDtZQUNELE1BQU0sRUFBRSxXQUFXO1NBQ3BCLENBQUM7UUFFRixJQUFJLFFBQVEsQ0FBQztRQUNiLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDVixNQUFNLE1BQU0sR0FBRyxJQUFJLDRDQUFvQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2hELE1BQU0sbUJBQW1CLEdBQUcsSUFBSSx5Q0FBaUIsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN0RCxNQUFNLGFBQWEsR0FBRyxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUM3RCxNQUFNLFlBQVksR0FBRyxhQUFhLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FDdkQsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FDL0IsQ0FBQztZQUVGLCtEQUErRDtZQUMvRCxN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QyxZQUFZLENBQUMsS0FBSyxDQUN2QjtZQUNELFlBQVksRUFBRSxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtTQUN6QyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFyRkQsc0NBcUZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gXCJAYXdzLWNkay9jb3JlXCI7XG5pbXBvcnQgZWxidjIgPSByZXF1aXJlKFwiQGF3cy1jZGsvYXdzLWVsYXN0aWNsb2FkYmFsYW5jaW5ndjJcIik7XG5pbXBvcnQgKiBhcyBhdXRvc2NhbGluZyBmcm9tIFwiQGF3cy1jZGsvYXdzLWF1dG9zY2FsaW5nXCI7XG5pbXBvcnQgKiBhcyBlYzIgZnJvbSBcIkBhd3MtY2RrL2F3cy1lYzJcIjtcbmltcG9ydCB7IEVDMkNsaWVudCwgRGVzY3JpYmVWcGNzQ29tbWFuZCwgRGVzY3JpYmVTdWJuZXRzQ29tbWFuZH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1lYzJcIjtcblxuaW1wb3J0IHtcbiAgQ2xvdWRGb3JtYXRpb25DbGllbnQsXG4gIExpc3RTdGFja3NDb21tYW5kLFxuICBHZXRUZW1wbGF0ZUNvbW1hbmQsXG59IGZyb20gXCJAYXdzLXNkay9jbGllbnQtY2xvdWRmb3JtYXRpb25cIjtcbmltcG9ydCAqIGFzIGNmbmluYyBmcm9tIFwiQGF3cy1jZGsvY2xvdWRmb3JtYXRpb24taW5jbHVkZVwiO1xuaW1wb3J0ICogYXMganNfeWFtbCBmcm9tIFwianMteWFtbFwiO1xuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzXCI7XG5cbmltcG9ydCB7IFN0YWNrQXBwIH0gZnJvbSBcIi4vc3RhY2tBcHBcIjtcblxuZXhwb3J0IGNsYXNzIEV4aXN0aW5nU3RhY2sgZXh0ZW5kcyBTdGFja0FwcCB7XG4gIHN0YXRpYyBpbXBvcnRFeGlzdGluZ1N0YWNrKCkge31cbiAgY29uc3RydWN0b3Ioc291cmNlOiBjZGsuQXBwLCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc291cmNlLCBpZCwgcHJvcHMpO1xuXG4gICAgY29uc3QgY29uZmlnID0ge1xuICAgICAgY3JlZGVudGlhbHM6IHtcbiAgICAgICAgYWNjZXNzS2V5SWQ6IFwiQUtJQTI1SkJEUEMySVY0REo2SERcIixcbiAgICAgICAgc2VjcmV0QWNjZXNzS2V5OiBcIjRWV3JmK3pVYVpQTlhBc0c3Z2xMaTJ1VnFubGZwcnlDOHhIYmpCbXVcIixcbiAgICAgIH0sXG4gICAgICByZWdpb246IFwidXMtd2VzdC0yXCIsXG4gICAgfTtcblxuICAgIGxldCBzdGFja1ZQQztcbiAgICAoYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgY2xpZW50ID0gbmV3IENsb3VkRm9ybWF0aW9uQ2xpZW50KGNvbmZpZyk7XG4gICAgICBjb25zdCBmZXRjaEFjdGl2ZUxpc3RzQ21kID0gbmV3IExpc3RTdGFja3NDb21tYW5kKHt9KTtcbiAgICAgIGNvbnN0IGFsbFVzZXJTdGFja3MgPSBhd2FpdCBjbGllbnQuc2VuZChmZXRjaEFjdGl2ZUxpc3RzQ21kKTtcbiAgICAgIGNvbnN0IGFjdGl2ZVN0YWNrcyA9IGFsbFVzZXJTdGFja3MuU3RhY2tTdW1tYXJpZXM/LmZpbHRlcihcbiAgICAgICAgKHN0YWNrKSA9PiAhc3RhY2suRGVsZXRpb25UaW1lXG4gICAgICApO1xuXG4gICAgICAvLyBVU0VSLUlOUFVUOiBSZXBsYWNlIHdpdGggVXNlciBSZXF1aXJlZCBTZWxlY3Rpb24gZnJvbSBTdGFja3NcbiAgICAgIGNvbnN0IHN0YWNrSWQgPSBhY3RpdmVTdGFja3MgPyBhY3RpdmVTdGFja3NbMF0uU3RhY2tJZCA6IFwiXCI7XG4gICAgICBjb25zdCBzdGFja05hbWUgPSBhY3RpdmVTdGFja3MgPyBhY3RpdmVTdGFja3NbMF0uU3RhY2tOYW1lIDogXCJcIjtcbiAgICAgIGNvbnN0IGZldGNoU3RhY2tUZW1wbGF0ZUNtZCA9IG5ldyBHZXRUZW1wbGF0ZUNvbW1hbmQoe1xuICAgICAgICBTdGFja05hbWU6IHN0YWNrSWQsXG4gICAgICB9KTtcbiAgICAgIGNvbnN0IGV4aXN0aW5nU3RhY2tUZW1wbGF0ZSA9IGF3YWl0IGNsaWVudC5zZW5kKGZldGNoU3RhY2tUZW1wbGF0ZUNtZCk7XG5cbiAgICAgIGNvbnN0IG9iaiA9IGpzX3lhbWwubG9hZChleGlzdGluZ1N0YWNrVGVtcGxhdGUuVGVtcGxhdGVCb2R5IHx8IFwiXCIpO1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhcbiAgICAgICAgXCIuL2Nkay5vdXQvRXhpc3RpbmdTdGFjay50ZW1wbGF0ZS5qc29uXCIsXG4gICAgICAgIEpTT04uc3RyaW5naWZ5KG9iaiwgbnVsbCwgMilcbiAgICAgICk7XG4gICAgICBhd2FpdCB0aGlzLnN5bnRoZXNpemVTdGFjaygpO1xuXG4gICAgICBjb25zdCBlYzJjbGllbnQgPSBuZXcgRUMyQ2xpZW50KGNvbmZpZyk7XG4gICAgICBjb25zdCB2cGNDbWQgPSBuZXcgRGVzY3JpYmVWcGNzQ29tbWFuZCh7fSk7XG4gICAgICBjb25zdCB2cGNSZXNwb25zZSA9IGF3YWl0IGVjMmNsaWVudC5zZW5kKHZwY0NtZCk7XG4gICAgICB2cGNSZXNwb25zZS5WcGNzID0gdnBjUmVzcG9uc2UuVnBjcyB8fCBbXTtcbiAgICAgIHZwY1Jlc3BvbnNlLlZwY3MuZm9yRWFjaCh2cGMgPT4ge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyh2cGMuVGFncylcbiAgICAgIH0pXG4gICAgICBjb25zdCBzdWJuZXRzQ21kID0gbmV3IERlc2NyaWJlU3VibmV0c0NvbW1hbmQoe30pXG4gICAgICBjb25zdCBzdWJuZXRzUmVzcG9uc2UgPSBhd2FpdCBlYzJjbGllbnQuc2VuZChzdWJuZXRzQ21kKVxuICAgICAgc3VibmV0c1Jlc3BvbnNlLlN1Ym5ldHMgPSBzdWJuZXRzUmVzcG9uc2UuU3VibmV0cyB8fCBbXVxuICAgICAgc3VibmV0c1Jlc3BvbnNlLlN1Ym5ldHMuZm9yRWFjaChzdWJuZXQgPT4ge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhzdWJuZXQuVGFncylcbiAgICAgIH0pO1xuICAgIH0pKCk7XG5cbiAgICBjb25zdCB0ZW1wbGF0ZSA9IG5ldyBjZm5pbmMuQ2ZuSW5jbHVkZSh0aGlzLCBcIlRlbXBsYXRlXCIsIHtcbiAgICAgIHRlbXBsYXRlRmlsZTogXCIuL2Nkay5vdXQvRXhpc3RpbmdTdGFjay50ZW1wbGF0ZS5qc29uXCIsXG4gICAgfSk7XG5cbiAgICBjb25zdCB2cGMgPSBlYzIuVnBjLmZyb21WcGNBdHRyaWJ1dGVzKHRoaXMsIFwiZXh0ZXJuYWwtdnBjXCIsIHtcbiAgICAgIHZwY0lkOiBcInZwYy0wNDI1ZjM0YjUzYjMyYTBlMVwiLFxuICAgICAgYXZhaWxhYmlsaXR5Wm9uZXM6IFtcInVzLXdlc3QtMWFcIiwgXCJ1cy13ZXN0LTFiXCIsIFwidXMtd2VzdC0xY1wiXSxcbiAgICAgIHB1YmxpY1N1Ym5ldElkczogW1xuICAgICAgICBcInN1Ym5ldC0wNTRmMzRhOTc1YWY4NGQ1MVwiLFxuICAgICAgICBcInN1Ym5ldC0wMWI0ZTcyM2Q3YTdhNTQ4YVwiLFxuICAgICAgICBcInN1Ym5ldC0wODc4NDJhNDUyOGE4OGFmMVwiLFxuICAgICAgXSxcbiAgICAgIHByaXZhdGVTdWJuZXRJZHM6IFtcbiAgICAgICAgXCJzdWJuZXQtMDRmYzE3ZWYxZjllNTRhNmNcIixcbiAgICAgICAgXCJzdWJuZXQtMGM2NTAwNWJlODM1YjM4NDlcIixcbiAgICAgICAgXCJzdWJuZXQtMDVhY2Q4OTBlNzEwMjZhM2RcIixcbiAgICAgIF0sXG4gICAgfSk7XG5cbiAgICBjb25zdCBhbGIyID0gbmV3IGVsYnYyLkFwcGxpY2F0aW9uTG9hZEJhbGFuY2VyKHRoaXMsICdhbGIyJywge1xuICAgICAgdnBjLFxuICAgICAgaW50ZXJuZXRGYWNpbmc6IHRydWUsXG4gICAgfSk7XG5cbiAgICBjb25zdCBhc2cgPSBuZXcgYXV0b3NjYWxpbmcuQXV0b1NjYWxpbmdHcm91cCh0aGlzLCBcIkFTR1wiLCB7XG4gICAgICB2cGMsXG4gICAgICBpbnN0YW5jZVR5cGU6IGVjMi5JbnN0YW5jZVR5cGUub2YoXG4gICAgICAgIGVjMi5JbnN0YW5jZUNsYXNzLlQyLFxuICAgICAgICBlYzIuSW5zdGFuY2VTaXplLk1JQ1JPXG4gICAgICApLFxuICAgICAgbWFjaGluZUltYWdlOiBuZXcgZWMyLkFtYXpvbkxpbnV4SW1hZ2UoKSxcbiAgICB9KTtcbiAgfVxufVxuIl19