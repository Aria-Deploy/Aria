import express from "express";
const router = express.Router();
import * as awsCfn from "../../cfn_interface/lib/aws_cfn_data";
import { CanaryStack } from "../../cfn_interface/lib/canary_stack";
import { ExistingStack } from "../../cfn_interface/lib/existing_stack";

router.get("/profiles", async (req, res) => {
  res.contentType("application/json");
  const accounts = await awsCfn.fetchProfilesInfo();
  res.json(accounts);
});

router.get("/stacks/:profile", async (req, res) => {
  try {
    const profileName = req.params.profile;
    await awsCfn.clientsInit(profileName);
    const existingStacks = await awsCfn.fetchStacksInfo();
    awsCfn.fetchAccountInfo(profileName);
    res.json(existingStacks);
  } catch (error) {
    console.log("Unable to process existing stacks request: ", error);
  }
});

router.put("/deploy-canary", async (req, res) => {
  const { profileName, stackId, stackName } = req.body;
  try {
    const selectedStackTemplate = await awsCfn.fetchStackTemplate(stackId);
    const vpcConfig = await awsCfn.fetchStackVpcConfig(stackId);
    const stackConfig = {
      profileName,
      stackId,
      vpcConfig,
      template: selectedStackTemplate,
    };

    // TODO: fetch account & regions from somewhere
    const canaryStack = new CanaryStack(stackName, stackConfig, {
      env: awsCfn.getEnv(),
    });
    const deployResult = await canaryStack.deploy();

    console.log(deployResult);
    const deployResponse = { ...deployResult, stackArtifact: [] };
    res.json(deployResponse);
    // TODO: Add proper error handling
  } catch (error) {
    console.log(error);
    res.status(400);
    res.json("deployment failed");
  }
});

router.put("/rollback-canary", async (req, res) => {
  const { stackId, stackName, profileName } = req.body;
  try {
    const existingStack = await awsCfn.fetchStackTemplate(stackId);
    // TODO define type of response
    const originStackTemplate = JSON.parse(
      // @ts-ignore
      existingStack.Metadata["pre-canary-cfn"]
    );
    const vpcConfig = await awsCfn.fetchStackVpcConfig(stackId);
    const stackConfig = {
      profileName,
      stackId,
      vpcConfig,
      template: originStackTemplate,
    };

    const originalStack = new ExistingStack(stackName, stackConfig, {
      env: awsCfn.getEnv(),
    });
    const deployResult = await originalStack.deploy();
    console.log(deployResult);
    const deployResponse = { ...deployResult, stackArtifact: [] };
    res.json(deployResponse);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
