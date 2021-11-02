"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExistingStack = void 0;
const elbv2 = require("@aws-cdk/aws-elasticloadbalancingv2");
const autoscaling = require("@aws-cdk/aws-autoscaling");
const ec2 = require("@aws-cdk/aws-ec2");
const client_ec2_1 = require("@aws-sdk/client-ec2");
const client_cloudformation_1 = require("@aws-sdk/client-cloudformation");
const cfninc = require("@aws-cdk/cloudformation-include");
const js_yaml = require("js-yaml");
const fs = require("fs");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1wb3J0RXhpc3RpbmdTdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImltcG9ydEV4aXN0aW5nU3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsNkRBQThEO0FBQzlELHdEQUF3RDtBQUN4RCx3Q0FBd0M7QUFDeEMsb0RBQTRGO0FBRTVGLDBFQUl3QztBQUN4QywwREFBMEQ7QUFDMUQsbUNBQW1DO0FBQ25DLHlCQUF5QjtBQUV6Qix5Q0FBc0M7QUFFdEMsTUFBYSxhQUFjLFNBQVEsbUJBQVE7SUFDekMsTUFBTSxDQUFDLG1CQUFtQixLQUFJLENBQUM7SUFDL0IsWUFBWSxNQUFlLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQzdELEtBQUssQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXpCLE1BQU0sTUFBTSxHQUFHO1lBQ2IsV0FBVyxFQUFFO2dCQUNYLFdBQVcsRUFBRSxzQkFBc0I7Z0JBQ25DLGVBQWUsRUFBRSwwQ0FBMEM7YUFDNUQ7WUFDRCxNQUFNLEVBQUUsV0FBVztTQUNwQixDQUFDO1FBRUYsSUFBSSxRQUFRLENBQUM7UUFDYixDQUFDLEtBQUssSUFBSSxFQUFFO1lBQ1YsTUFBTSxNQUFNLEdBQUcsSUFBSSw0Q0FBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNoRCxNQUFNLG1CQUFtQixHQUFHLElBQUkseUNBQWlCLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdEQsTUFBTSxhQUFhLEdBQUcsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFDN0QsTUFBTSxZQUFZLEdBQUcsYUFBYSxDQUFDLGNBQWMsRUFBRSxNQUFNLENBQ3ZELENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQy9CLENBQUM7WUFFRiwrREFBK0Q7WUFDL0QsTUFBTSxPQUFPLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxD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QUMsZ0JBQWdCLEVBQUU7U0FDekMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBckZELHNDQXFGQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiQGF3cy1jZGsvY29yZVwiO1xuaW1wb3J0IGVsYnYyID0gcmVxdWlyZShcIkBhd3MtY2RrL2F3cy1lbGFzdGljbG9hZGJhbGFuY2luZ3YyXCIpO1xuaW1wb3J0ICogYXMgYXV0b3NjYWxpbmcgZnJvbSBcIkBhd3MtY2RrL2F3cy1hdXRvc2NhbGluZ1wiO1xuaW1wb3J0ICogYXMgZWMyIGZyb20gXCJAYXdzLWNkay9hd3MtZWMyXCI7XG5pbXBvcnQgeyBFQzJDbGllbnQsIERlc2NyaWJlVnBjc0NvbW1hbmQsIERlc2NyaWJlU3VibmV0c0NvbW1hbmR9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtZWMyXCI7XG5cbmltcG9ydCB7XG4gIENsb3VkRm9ybWF0aW9uQ2xpZW50LFxuICBMaXN0U3RhY2tzQ29tbWFuZCxcbiAgR2V0VGVtcGxhdGVDb21tYW5kLFxufSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWNsb3VkZm9ybWF0aW9uXCI7XG5pbXBvcnQgKiBhcyBjZm5pbmMgZnJvbSBcIkBhd3MtY2RrL2Nsb3VkZm9ybWF0aW9uLWluY2x1ZGVcIjtcbmltcG9ydCAqIGFzIGpzX3lhbWwgZnJvbSBcImpzLXlhbWxcIjtcbmltcG9ydCAqIGFzIGZzIGZyb20gXCJmc1wiO1xuXG5pbXBvcnQgeyBTdGFja0FwcCB9IGZyb20gXCIuL3N0YWNrQXBwXCI7XG5cbmV4cG9ydCBjbGFzcyBFeGlzdGluZ1N0YWNrIGV4dGVuZHMgU3RhY2tBcHAge1xuICBzdGF0aWMgaW1wb3J0RXhpc3RpbmdTdGFjaygpIHt9XG4gIGNvbnN0cnVjdG9yKHNvdXJjZTogY2RrLkFwcCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNvdXJjZSwgaWQsIHByb3BzKTtcblxuICAgIGNvbnN0IGNvbmZpZyA9IHtcbiAgICAgIGNyZWRlbnRpYWxzOiB7XG4gICAgICAgIGFjY2Vzc0tleUlkOiBcIkFLSUEyNUpCRFBDMklWNERKNkhEXCIsXG4gICAgICAgIHNlY3JldEFjY2Vzc0tleTogXCI0VldyZit6VWFaUE5YQXNHN2dsTGkydVZxbmxmcHJ5Qzh4SGJqQm11XCIsXG4gICAgICB9LFxuICAgICAgcmVnaW9uOiBcInVzLXdlc3QtMlwiLFxuICAgIH07XG5cbiAgICBsZXQgc3RhY2tWUEM7XG4gICAgKGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGNsaWVudCA9IG5ldyBDbG91ZEZvcm1hdGlvbkNsaWVudChjb25maWcpO1xuICAgICAgY29uc3QgZmV0Y2hBY3RpdmVMaXN0c0NtZCA9IG5ldyBMaXN0U3RhY2tzQ29tbWFuZCh7fSk7XG4gICAgICBjb25zdCBhbGxVc2VyU3RhY2tzID0gYXdhaXQgY2xpZW50LnNlbmQoZmV0Y2hBY3RpdmVMaXN0c0NtZCk7XG4gICAgICBjb25zdCBhY3RpdmVTdGFja3MgPSBhbGxVc2VyU3RhY2tzLlN0YWNrU3VtbWFyaWVzPy5maWx0ZXIoXG4gICAgICAgIChzdGFjaykgPT4gIXN0YWNrLkRlbGV0aW9uVGltZVxuICAgICAgKTtcblxuICAgICAgLy8gVVNFUi1JTlBVVDogUmVwbGFjZSB3aXRoIFVzZXIgUmVxdWlyZWQgU2VsZWN0aW9uIGZyb20gU3RhY2tzXG4gICAgICBjb25zdCBzdGFja0lkID0gYWN0aXZlU3RhY2tzID8gYWN0aXZlU3RhY2tzWzBdLlN0YWNrSWQgOiBcIlwiO1xuICAgICAgY29uc3Qgc3RhY2tOYW1lID0gYWN0aXZlU3RhY2tzID8gYWN0aXZlU3RhY2tzWzBdLlN0YWNrTmFtZSA6IFwiXCI7XG4gICAgICBjb25zdCBmZXRjaFN0YWNrVGVtcGxhdGVDbWQgPSBuZXcgR2V0VGVtcGxhdGVDb21tYW5kKHtcbiAgICAgICAgU3RhY2tOYW1lOiBzdGFja0lkLFxuICAgICAgfSk7XG4gICAgICBjb25zdCBleGlzdGluZ1N0YWNrVGVtcGxhdGUgPSBhd2FpdCBjbGllbnQuc2VuZChmZXRjaFN0YWNrVGVtcGxhdGVDbWQpO1xuXG4gICAgICBjb25zdCBvYmogPSBqc195YW1sLmxvYWQoZXhpc3RpbmdTdGFja1RlbXBsYXRlLlRlbXBsYXRlQm9keSB8fCBcIlwiKTtcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoXG4gICAgICAgIFwiLi9jZGsub3V0L0V4aXN0aW5nU3RhY2sudGVtcGxhdGUuanNvblwiLFxuICAgICAgICBKU09OLnN0cmluZ2lmeShvYmosIG51bGwsIDIpXG4gICAgICApO1xuICAgICAgYXdhaXQgdGhpcy5zeW50aGVzaXplU3RhY2soKTtcblxuICAgICAgY29uc3QgZWMyY2xpZW50ID0gbmV3IEVDMkNsaWVudChjb25maWcpO1xuICAgICAgY29uc3QgdnBjQ21kID0gbmV3IERlc2NyaWJlVnBjc0NvbW1hbmQoe30pO1xuICAgICAgY29uc3QgdnBjUmVzcG9uc2UgPSBhd2FpdCBlYzJjbGllbnQuc2VuZCh2cGNDbWQpO1xuICAgICAgdnBjUmVzcG9uc2UuVnBjcyA9IHZwY1Jlc3BvbnNlLlZwY3MgfHwgW107XG4gICAgICB2cGNSZXNwb25zZS5WcGNzLmZvckVhY2godnBjID0+IHtcbiAgICAgICAgLy8gY29uc29sZS5sb2codnBjLlRhZ3MpXG4gICAgICB9KVxuICAgICAgY29uc3Qgc3VibmV0c0NtZCA9IG5ldyBEZXNjcmliZVN1Ym5ldHNDb21tYW5kKHt9KVxuICAgICAgY29uc3Qgc3VibmV0c1Jlc3BvbnNlID0gYXdhaXQgZWMyY2xpZW50LnNlbmQoc3VibmV0c0NtZClcbiAgICAgIHN1Ym5ldHNSZXNwb25zZS5TdWJuZXRzID0gc3VibmV0c1Jlc3BvbnNlLlN1Ym5ldHMgfHwgW11cbiAgICAgIHN1Ym5ldHNSZXNwb25zZS5TdWJuZXRzLmZvckVhY2goc3VibmV0ID0+IHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coc3VibmV0LlRhZ3MpXG4gICAgICB9KTtcbiAgICB9KSgpO1xuXG4gICAgY29uc3QgdGVtcGxhdGUgPSBuZXcgY2ZuaW5jLkNmbkluY2x1ZGUodGhpcywgXCJUZW1wbGF0ZVwiLCB7XG4gICAgICB0ZW1wbGF0ZUZpbGU6IFwiLi9jZGsub3V0L0V4aXN0aW5nU3RhY2sudGVtcGxhdGUuanNvblwiLFxuICAgIH0pO1xuXG4gICAgY29uc3QgdnBjID0gZWMyLlZwYy5mcm9tVnBjQXR0cmlidXRlcyh0aGlzLCBcImV4dGVybmFsLXZwY1wiLCB7XG4gICAgICB2cGNJZDogXCJ2cGMtMDQyNWYzNGI1M2IzMmEwZTFcIixcbiAgICAgIGF2YWlsYWJpbGl0eVpvbmVzOiBbXCJ1cy13ZXN0LTFhXCIsIFwidXMtd2VzdC0xYlwiLCBcInVzLXdlc3QtMWNcIl0sXG4gICAgICBwdWJsaWNTdWJuZXRJZHM6IFtcbiAgICAgICAgXCJzdWJuZXQtMDU0ZjM0YTk3NWFmODRkNTFcIixcbiAgICAgICAgXCJzdWJuZXQtMDFiNGU3MjNkN2E3YTU0OGFcIixcbiAgICAgICAgXCJzdWJuZXQtMDg3ODQyYTQ1MjhhODhhZjFcIixcbiAgICAgIF0sXG4gICAgICBwcml2YXRlU3VibmV0SWRzOiBbXG4gICAgICAgIFwic3VibmV0LTA0ZmMxN2VmMWY5ZTU0YTZjXCIsXG4gICAgICAgIFwic3VibmV0LTBjNjUwMDViZTgzNWIzODQ5XCIsXG4gICAgICAgIFwic3VibmV0LTA1YWNkODkwZTcxMDI2YTNkXCIsXG4gICAgICBdLFxuICAgIH0pO1xuXG4gICAgY29uc3QgYWxiMiA9IG5ldyBlbGJ2Mi5BcHBsaWNhdGlvbkxvYWRCYWxhbmNlcih0aGlzLCAnYWxiMicsIHtcbiAgICAgIHZwYyxcbiAgICAgIGludGVybmV0RmFjaW5nOiB0cnVlLFxuICAgIH0pO1xuXG4gICAgY29uc3QgYXNnID0gbmV3IGF1dG9zY2FsaW5nLkF1dG9TY2FsaW5nR3JvdXAodGhpcywgXCJBU0dcIiwge1xuICAgICAgdnBjLFxuICAgICAgaW5zdGFuY2VUeXBlOiBlYzIuSW5zdGFuY2VUeXBlLm9mKFxuICAgICAgICBlYzIuSW5zdGFuY2VDbGFzcy5UMixcbiAgICAgICAgZWMyLkluc3RhbmNlU2l6ZS5NSUNST1xuICAgICAgKSxcbiAgICAgIG1hY2hpbmVJbWFnZTogbmV3IGVjMi5BbWF6b25MaW51eEltYWdlKCksXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==