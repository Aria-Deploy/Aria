#!/usr/bin/env node
import "source-map-support/register";
import { Vpc } from "@aws-cdk/aws-ec2";
import { Ec2InstanceExampleStack } from "../lib/ec2_instance_example-stack";
import { ExistingStack } from "../lib/importExistingStack";

const evnUSA = { account: "750078097588", region: "us-east-1" };

// const stack = new Ec2InstanceExampleStack("Ec2InstanceExampleStack", {
//   env: { ...evnUSA },
// });

const importedStack = new ExistingStack("ExistingStack", {
  env: { ...evnUSA },
});

(async () => {
  await importedStack.deploy();
})();

// const existingVPC = Vpc.fromLookup(stack, "ImportVPC", {
//   isDefault: false,
//   vpcId: "vpc-d36e18b8",
// });
const breakpoint = "Completed Execution\n";
console.log(breakpoint);
