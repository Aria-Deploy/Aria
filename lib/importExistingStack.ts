import * as cdk from "@aws-cdk/core";
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
  constructor(id: string, props?: cdk.StackProps) {
    super(id, props);

    const config = {
      credentials: {
        accessKeyId: "AKIA25JBDPC2IV4DJ6HD",
        secretAccessKey: "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",
      },
      region: "us-west-2",
    };
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
        "./cdk.out/existingStackTemplate.json",
        JSON.stringify(obj, null, 2)
      );
      const template = new cfninc.CfnInclude(this, stackName || "", {
        templateFile: "./cdk.out/existingStackTemplate.json",
      });
    })();

    // const importStack = Stack.
  }
}
