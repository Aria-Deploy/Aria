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
const xxx__stackApp_1 = require("./xxx__stackApp");
class ExistingStack extends xxx__stackApp_1.StackApp {
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
            vpcResponse.Vpcs.forEach((vpc) => {
                // console.log(vpc.Tags)
            });
            const subnetsCmd = new client_ec2_1.DescribeSubnetsCommand({});
            const subnetsResponse = await ec2client.send(subnetsCmd);
            subnetsResponse.Subnets = subnetsResponse.Subnets || [];
            subnetsResponse.Subnets.forEach((subnet) => {
                // console.log(subnet.Tags)
            });
        })();
        const template = new cfninc.CfnInclude(this, "Template", {
            templateFile: "./cdk.out/ExistingStack.template.json",
        });
        const vpc = ec2.Vpc.fromVpcAttributes(this, "external-vpc", {
            vpcId: "vpc-0b442d80b65646eef",
            availabilityZones: ["us-west-1a", "us-west-1b", "us-west-1c"],
            publicSubnetIds: [
                "subnet-00875646ca5702e88",
                "subnet-06a53ab7668acac0c",
                "subnet-0d3061cff4ecf4edd",
            ],
            privateSubnetIds: [
                "subnet-02292e9bca8f221a1",
                "subnet-0c02c5f0a15a1574a",
                "subnet-0f09a919564e3a828",
            ],
        });
        const alb2 = new elbv2.ApplicationLoadBalancer(this, "alb2", {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieHh4X2ltcG9ydEV4aXN0aW5nU3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY2ZuX2ludGVyZmFjZS9saWIveHh4X2ltcG9ydEV4aXN0aW5nU3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLDZEQUE4RDtBQUM5RCxzRUFBd0Q7QUFDeEQsc0RBQXdDO0FBQ3hDLG9EQUk2QjtBQUU3QiwwRUFJd0M7QUFDeEMsd0VBQTBEO0FBQzFELGlEQUFtQztBQUNuQyx1Q0FBeUI7QUFFekIsbURBQTJDO0FBRTNDLE1BQWEsYUFBYyxTQUFRLHdCQUFRO0lBQ3pDLE1BQU0sQ0FBQyxtQkFBbUIsS0FBSSxDQUFDO0lBQy9CLFlBQVksTUFBZSxFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM3RCxLQUFLLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV6QixNQUFNLE1BQU0sR0FBRztZQUNiLFdBQVcsRUFBRTtnQkFDWCxXQUFXLEVBQUUsc0JBQXNCO2dCQUNuQyxlQUFlLEVBQUUsMENBQTBDO2FBQzVEO1lBQ0QsTUFBTSxFQUFFLFdBQVc7U0FDcEIsQ0FBQztRQUVGLElBQUksUUFBUSxDQUFDO1FBQ2IsQ0FBQyxLQUFLLElBQUksRUFBRTtZQUNWLE1BQU0sTUFBTSxHQUFHLElBQUksNENBQW9CLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDaEQsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLHlDQUFpQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3RELE1BQU0sYUFBYSxHQUFHLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBQzdELE1BQU0sWUFBWSxHQUFHLGFBQWEsQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUN2RCxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUMvQixDQUFDO1lBRUYsK0RBQStE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QUFFLEVBQ3BCLEdBQUcsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUN2QjtZQUNELFlBQVksRUFBRSxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtTQUN6QyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFyRkQsc0NBcUZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gXCJAYXdzLWNkay9jb3JlXCI7XG5pbXBvcnQgZWxidjIgPSByZXF1aXJlKFwiQGF3cy1jZGsvYXdzLWVsYXN0aWNsb2FkYmFsYW5jaW5ndjJcIik7XG5pbXBvcnQgKiBhcyBhdXRvc2NhbGluZyBmcm9tIFwiQGF3cy1jZGsvYXdzLWF1dG9zY2FsaW5nXCI7XG5pbXBvcnQgKiBhcyBlYzIgZnJvbSBcIkBhd3MtY2RrL2F3cy1lYzJcIjtcbmltcG9ydCB7XG4gIEVDMkNsaWVudCxcbiAgRGVzY3JpYmVWcGNzQ29tbWFuZCxcbiAgRGVzY3JpYmVTdWJuZXRzQ29tbWFuZCxcbn0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1lYzJcIjtcblxuaW1wb3J0IHtcbiAgQ2xvdWRGb3JtYXRpb25DbGllbnQsXG4gIExpc3RTdGFja3NDb21tYW5kLFxuICBHZXRUZW1wbGF0ZUNvbW1hbmQsXG59IGZyb20gXCJAYXdzLXNkay9jbGllbnQtY2xvdWRmb3JtYXRpb25cIjtcbmltcG9ydCAqIGFzIGNmbmluYyBmcm9tIFwiQGF3cy1jZGsvY2xvdWRmb3JtYXRpb24taW5jbHVkZVwiO1xuaW1wb3J0ICogYXMganNfeWFtbCBmcm9tIFwianMteWFtbFwiO1xuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzXCI7XG5cbmltcG9ydCB7IFN0YWNrQXBwIH0gZnJvbSBcIi4veHh4X19zdGFja0FwcFwiO1xuXG5leHBvcnQgY2xhc3MgRXhpc3RpbmdTdGFjayBleHRlbmRzIFN0YWNrQXBwIHtcbiAgc3RhdGljIGltcG9ydEV4aXN0aW5nU3RhY2soKSB7fVxuICBjb25zdHJ1Y3Rvcihzb3VyY2U6IGNkay5BcHAsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzb3VyY2UsIGlkLCBwcm9wcyk7XG5cbiAgICBjb25zdCBjb25maWcgPSB7XG4gICAgICBjcmVkZW50aWFsczoge1xuICAgICAgICBhY2Nlc3NLZXlJZDogXCJBS0lBMjVKQkRQQzJJVjRESjZIRFwiLFxuICAgICAgICBzZWNyZXRBY2Nlc3NLZXk6IFwiNFZXcmYrelVhWlBOWEFzRzdnbExpMnVWcW5sZnByeUM4eEhiakJtdVwiLFxuICAgICAgfSxcbiAgICAgIHJlZ2lvbjogXCJ1cy13ZXN0LTJcIixcbiAgICB9O1xuXG4gICAgbGV0IHN0YWNrVlBDO1xuICAgIChhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBjbGllbnQgPSBuZXcgQ2xvdWRGb3JtYXRpb25DbGllbnQoY29uZmlnKTtcbiAgICAgIGNvbnN0IGZldGNoQWN0aXZlTGlzdHNDbWQgPSBuZXcgTGlzdFN0YWNrc0NvbW1hbmQoe30pO1xuICAgICAgY29uc3QgYWxsVXNlclN0YWNrcyA9IGF3YWl0IGNsaWVudC5zZW5kKGZldGNoQWN0aXZlTGlzdHNDbWQpO1xuICAgICAgY29uc3QgYWN0aXZlU3RhY2tzID0gYWxsVXNlclN0YWNrcy5TdGFja1N1bW1hcmllcz8uZmlsdGVyKFxuICAgICAgICAoc3RhY2spID0+ICFzdGFjay5EZWxldGlvblRpbWVcbiAgICAgICk7XG5cbiAgICAgIC8vIFVTRVItSU5QVVQ6IFJlcGxhY2Ugd2l0aCBVc2VyIFJlcXVpcmVkIFNlbGVjdGlvbiBmcm9tIFN0YWNrc1xuICAgICAgY29uc3Qgc3RhY2tJZCA9IGFjdGl2ZVN0YWNrcyA/IGFjdGl2ZVN0YWNrc1swXS5TdGFja0lkIDogXCJcIjtcbiAgICAgIGNvbnN0IHN0YWNrTmFtZSA9IGFjdGl2ZVN0YWNrcyA/IGFjdGl2ZVN0YWNrc1swXS5TdGFja05hbWUgOiBcIlwiO1xuICAgICAgY29uc3QgZmV0Y2hTdGFja1RlbXBsYXRlQ21kID0gbmV3IEdldFRlbXBsYXRlQ29tbWFuZCh7XG4gICAgICAgIFN0YWNrTmFtZTogc3RhY2tJZCxcbiAgICAgIH0pO1xuICAgICAgY29uc3QgZXhpc3RpbmdTdGFja1RlbXBsYXRlID0gYXdhaXQgY2xpZW50LnNlbmQoZmV0Y2hTdGFja1RlbXBsYXRlQ21kKTtcblxuICAgICAgY29uc3Qgb2JqID0ganNfeWFtbC5sb2FkKGV4aXN0aW5nU3RhY2tUZW1wbGF0ZS5UZW1wbGF0ZUJvZHkgfHwgXCJcIik7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKFxuICAgICAgICBcIi4vY2RrLm91dC9FeGlzdGluZ1N0YWNrLnRlbXBsYXRlLmpzb25cIixcbiAgICAgICAgSlNPTi5zdHJpbmdpZnkob2JqLCBudWxsLCAyKVxuICAgICAgKTtcbiAgICAgIGF3YWl0IHRoaXMuc3ludGhlc2l6ZVN0YWNrKCk7XG5cbiAgICAgIGNvbnN0IGVjMmNsaWVudCA9IG5ldyBFQzJDbGllbnQoY29uZmlnKTtcbiAgICAgIGNvbnN0IHZwY0NtZCA9IG5ldyBEZXNjcmliZVZwY3NDb21tYW5kKHt9KTtcbiAgICAgIGNvbnN0IHZwY1Jlc3BvbnNlID0gYXdhaXQgZWMyY2xpZW50LnNlbmQodnBjQ21kKTtcbiAgICAgIHZwY1Jlc3BvbnNlLlZwY3MgPSB2cGNSZXNwb25zZS5WcGNzIHx8IFtdO1xuICAgICAgdnBjUmVzcG9uc2UuVnBjcy5mb3JFYWNoKCh2cGMpID0+IHtcbiAgICAgICAgLy8gY29uc29sZS5sb2codnBjLlRhZ3MpXG4gICAgICB9KTtcbiAgICAgIGNvbnN0IHN1Ym5ldHNDbWQgPSBuZXcgRGVzY3JpYmVTdWJuZXRzQ29tbWFuZCh7fSk7XG4gICAgICBjb25zdCBzdWJuZXRzUmVzcG9uc2UgPSBhd2FpdCBlYzJjbGllbnQuc2VuZChzdWJuZXRzQ21kKTtcbiAgICAgIHN1Ym5ldHNSZXNwb25zZS5TdWJuZXRzID0gc3VibmV0c1Jlc3BvbnNlLlN1Ym5ldHMgfHwgW107XG4gICAgICBzdWJuZXRzUmVzcG9uc2UuU3VibmV0cy5mb3JFYWNoKChzdWJuZXQpID0+IHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coc3VibmV0LlRhZ3MpXG4gICAgICB9KTtcbiAgICB9KSgpO1xuXG4gICAgY29uc3QgdGVtcGxhdGUgPSBuZXcgY2ZuaW5jLkNmbkluY2x1ZGUodGhpcywgXCJUZW1wbGF0ZVwiLCB7XG4gICAgICB0ZW1wbGF0ZUZpbGU6IFwiLi9jZGsub3V0L0V4aXN0aW5nU3RhY2sudGVtcGxhdGUuanNvblwiLFxuICAgIH0pO1xuXG4gICAgY29uc3QgdnBjID0gZWMyLlZwYy5mcm9tVnBjQXR0cmlidXRlcyh0aGlzLCBcImV4dGVybmFsLXZwY1wiLCB7XG4gICAgICB2cGNJZDogXCJ2cGMtMGI0NDJkODBiNjU2NDZlZWZcIiwgXG4gICAgICBhdmFpbGFiaWxpdHlab25lczogW1widXMtd2VzdC0xYVwiLCBcInVzLXdlc3QtMWJcIiwgXCJ1cy13ZXN0LTFjXCJdLFxuICAgICAgcHVibGljU3VibmV0SWRzOiBbXG4gICAgICAgIFwic3VibmV0LTAwODc1NjQ2Y2E1NzAyZTg4XCIsXG4gICAgICAgIFwic3VibmV0LTA2YTUzYWI3NjY4YWNhYzBjXCIsXG4gICAgICAgIFwic3VibmV0LTBkMzA2MWNmZjRlY2Y0ZWRkXCIsXG4gICAgICBdLFxuICAgICAgcHJpdmF0ZVN1Ym5ldElkczogW1xuICAgICAgICBcInN1Ym5ldC0wMjI5MmU5YmNhOGYyMjFhMVwiLFxuICAgICAgICBcInN1Ym5ldC0wYzAyYzVmMGExNWExNTc0YVwiLFxuICAgICAgICBcInN1Ym5ldC0wZjA5YTkxOTU2NGUzYTgyOFwiLFxuICAgICAgXSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGFsYjIgPSBuZXcgZWxidjIuQXBwbGljYXRpb25Mb2FkQmFsYW5jZXIodGhpcywgXCJhbGIyXCIsIHtcbiAgICAgIHZwYyxcbiAgICAgIGludGVybmV0RmFjaW5nOiB0cnVlLFxuICAgIH0pO1xuXG4gICAgY29uc3QgYXNnID0gbmV3IGF1dG9zY2FsaW5nLkF1dG9TY2FsaW5nR3JvdXAodGhpcywgXCJBU0dcIiwge1xuICAgICAgdnBjLFxuICAgICAgaW5zdGFuY2VUeXBlOiBlYzIuSW5zdGFuY2VUeXBlLm9mKFxuICAgICAgICBlYzIuSW5zdGFuY2VDbGFzcy5UMixcbiAgICAgICAgZWMyLkluc3RhbmNlU2l6ZS5NSUNST1xuICAgICAgKSxcbiAgICAgIG1hY2hpbmVJbWFnZTogbmV3IGVjMi5BbWF6b25MaW51eEltYWdlKCksXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==