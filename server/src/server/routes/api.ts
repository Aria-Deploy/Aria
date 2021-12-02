import express from "express";
const router = express.Router();
import * as awsCfn from "../../cfn_interface/lib/aws_cfn_data";
import { CanaryStack } from "../../cfn_interface/lib/canary_stack";
import { ExistingStack } from "../../cfn_interface/lib/existing_stack";
import * as cdk from "@aws-cdk/core";

router.get("/profiles", async (req, res) => {
  const accounts = await awsCfn.fetchProfilesInfo();
  res.json(accounts);
});

router.get("/resources-data/:profileName", async (req, res) => {
  try {
    const profileName = req.params.profileName;
    await awsCfn.clientsInit(profileName);
    const profileResources = await awsCfn.getLoadBalancerInfo();
    const existingStackInfo = await awsCfn.fetchStacksInfo();

    res.json({ profileResources, existingStackInfo });
  } catch (error) {
    console.log(error);
  }
});

router.put("/deploy-canary", async (req, res) => {
  const stackConfig = req.body;
  try {
    stackConfig.vpcConfig = await awsCfn.setAzPubPrivSubnets(stackConfig.vpcId);
    stackConfig.env = awsCfn.getEnv();

    const app = new cdk.App();
    const canaryStack = new CanaryStack(
      app,
      `aria-canary-${stackConfig.selectedAlbName}`,
      stackConfig,
      { env: stackConfig.env }
    );

    let deployResult = await canaryStack.deploy();
    const targetGroups =
      stackConfig.newRuleConfig.Actions[0].ForwardConfig.TargetGroups;

    targetGroups.forEach((targetGroup: any, idx: number) => {
      if (targetGroup.TargetGroupArn === "Insert Canary Target ARN") {
        targetGroups[idx].TargetGroupArn =
          deployResult.outputs.CanaryTargetGroupArn;
      }
      if (targetGroup.TargetGroupArn === "Insert Baseline Target ARN") {
        targetGroups[idx].TargetGroupArn =
          deployResult.outputs.BaselineTargetGroupArn;
      }
    });

    const createRuleResponse = await awsCfn.createListenerRule(
      stackConfig.newRuleConfig
    );

    console.log(createRuleResponse);

    if (createRuleResponse.$metadata.httpStatusCode !== 200)
      // @ts-ignore
      deployResult = await canaryStack.destroy();

    const deployResponse = {
      ...deployResult,
      stackArtifact: [],
      createRuleResponse,
    };
    res.json(deployResponse);
    // TODO: Add proper error handling
  } catch (error) {
    console.log(error);
    res.status(400);
    res.json("deployment fail");
  }
});

router.put("/destroy-canary", async (req, res) => {
  const { stackArn, stackName, profileName, canaryRuleArn } = req.body;
  await awsCfn.clientsInit(profileName);
  try {
    const deleteRuleRes = await awsCfn.deleteListenerRule(canaryRuleArn);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
  try {
    const existingCanaryStack = await awsCfn.fetchStackTemplate(stackArn);
    const stackConfig = {
      profileName,
      stackArn,
      template: existingCanaryStack,
    };

    const app = new cdk.App();
    const existingCanaryInfra = new ExistingStack(app, stackName, stackConfig, {
      env: awsCfn.getEnv(),
    });
    const destroyResult = await existingCanaryInfra.destroy();
    res.json(destroyResult);
  } catch (error) {
    console.log(error);
  }
});

router.post("/status", async (req, res) => {
  try {
    const instanceIds = req.body.instanceIds;
    const instancesStatus = await awsCfn.getInstanceStatus(instanceIds);
    res.json(instancesStatus);
  } catch (error) {
    console.log(error);
  }
});

router.post("/health", async (req, res) => {
  try {
    const TargetGroupArn = req.body.TargetGroupArn;
    const healthStatus = await awsCfn.getTargetGroupHealth(TargetGroupArn);
    res.json(healthStatus);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

// router.get("/stacks/:profile", async (req, res) => {
//   try {
//     const profileName = req.params.profile;
//     await awsCfn.clientsInit(profileName);
//     const existingStacks = await awsCfn.fetchStacksInfo();
//     awsCfn.fetchAccountInfo(profileName);
//     res.json(existingStacks);
//   } catch (error) {
//     console.log("Unable to process existing stacks request: ", error);
//   }
// });

module.exports = router;
