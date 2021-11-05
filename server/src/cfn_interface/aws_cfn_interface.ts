#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { Ec2InstanceExampleStack } from "./lib/xxx_ec2_instance_example-stack";
import { ExistingStack } from "./lib/xxx_importExistingStack";

const evnUSA = { account: "750078097588", region: "us-west-2" };

const app = new cdk.App();
const cdkStack = new Ec2InstanceExampleStack(app, "Ec2InstanceExampleStack", {
  env: { ...evnUSA },
});

const importedStack = new ExistingStack(app, "cdk-stack", {
  env: { ...evnUSA },
});

(async () => {
  // const deployResult = await cdkStack.deploy();
  // const deployResult = await importedStack.deploy();
  // console.log(deployResult);
})();

const breakpoint = "Completed Execution\n";
console.log(breakpoint);
