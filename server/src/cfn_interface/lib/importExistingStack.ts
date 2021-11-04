import * as cdk from "@aws-cdk/core";
import elbv2 = require("@aws-cdk/aws-elasticloadbalancingv2");
import * as autoscaling from "@aws-cdk/aws-autoscaling";
import * as ec2 from "@aws-cdk/aws-ec2";
import { EC2Client, DescribeVpcsCommand, DescribeSubnetsCommand} from "@aws-sdk/client-ec2";

import {
  CloudFormationClient,
  ListStacksCommand,
  GetTemplateCommand,
} from "@aws-sdk/client-cloudformation";
import * as cfninc from "@aws-cdk/cloudformation-include";
import * as js_yaml from "js-yaml";
import * as fs from "fs";

import { StackApp } from "./stackApp";

export class ExistingStack extends StackApp {
  static importExistingStack() {}
  constructor(source: cdk.App, id: string, props?: cdk.StackProps) {
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
      const client = new CloudFormationClient(config);
      const fetchActiveListsCmd = new ListStacksCommand({});
      const allUserStacks = await client.send(fetchActiveListsCmd);
      const activeStacks = allUserStacks.StackSummaries?.filter(
        (stack) => !stack.DeletionTime
      );

      // USER-INPUT: Replace with User Required Selection from Stacks
      const stackId = activeStacks ? activeStacks[0].StackId : "";
      const stackName = activeStacks ? activeStacks[0].StackName : "";
      const fetchStackTemplateCmd = new GetTemplateCommand({
        StackName: stackId,
      });
      const existingStackTemplate = await client.send(fetchStackTemplateCmd);

      const obj = js_yaml.load(existingStackTemplate.TemplateBody || "");
      fs.writeFileSync(
        "./cdk.out/ExistingStack.template.json",
        JSON.stringify(obj, null, 2)
      );
      await this.synthesizeStack();

      const ec2client = new EC2Client(config);
      const vpcCmd = new DescribeVpcsCommand({});
      const vpcResponse = await ec2client.send(vpcCmd);
      vpcResponse.Vpcs = vpcResponse.Vpcs || [];
      vpcResponse.Vpcs.forEach(vpc => {
        // console.log(vpc.Tags)
      })
      const subnetsCmd = new DescribeSubnetsCommand({})
      const subnetsResponse = await ec2client.send(subnetsCmd)
      subnetsResponse.Subnets = subnetsResponse.Subnets || []
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
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: new ec2.AmazonLinuxImage(),
    });
  }
}
