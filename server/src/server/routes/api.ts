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
  const params = req.body;
  console.log(params);
  try {
    const vpcConfig = await awsCfn.setAzPubPrivSubnets(params.vpcId);
    const stackConfig = {
      profileName: params.profileName,
      vpcConfig,
      selectedAlbName: params.selectedAlbName,
      selectedListenerArn: params.selectedListenerArn,
      securityGroupIds: params.securityGroupIds,
    };

    const app = new cdk.App();
    const canaryStack = new CanaryStack(
      app,
      `aria-canary-${params.selectedAlbName}`,
      stackConfig,
      {
        env: awsCfn.getEnv(),
      }
    );

    const deployResult = await canaryStack.deploy();
    const targetGroups =
      params.newRuleConfig.Actions[0].ForwardConfig.TargetGroups;
    targetGroups.forEach((targetGroup: any, idx: number) => {
      if (targetGroup.TargetGroupArn === "Insert Canary Target ARN") {
        targetGroups[idx].TargetGroupArn =
          deployResult.outputs.CanaryTargetGroupArn;
      }
    });

    const createRuleResponse = await awsCfn.createListenerRule(
      params.newRuleConfig
    );

    console.log(deployResult);
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
