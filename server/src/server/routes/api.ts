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
    const profileVpcs = await awsCfn.getVpcsInfo();
    const vpcEinResources = await awsCfn.getLoadBalancerInfo();

    res.json(vpcEinResources);
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
      selectedAlbArn: params.selectedAlbArn,
      securityGroupIds: params.securityGroupIds,
    };

    //   // TODO: fetch account & regions from somewhere
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
    res.json("deployment failed");
  }
});

router.put("/destroy-canary", async (req, res) => {
  const { stackId, stackName, profileName } = req.body;
  try {
    const existingCanaryStack = await awsCfn.fetchStackTemplate(stackId);
    const stackConfig = {
      profileName,
      stackId,
      template: existingCanaryStack,
    };

    const app = new cdk.App();
    const existingCanaryInfra = new ExistingStack(app, stackName, stackConfig, {
      env: awsCfn.getEnv(),
    });
    const deployResult = await existingCanaryInfra.destroy();
    res.json(deployResult);
  } catch (error) {
    console.log(error);
  }
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

// router.post("/resources/", async (req, res) => {
// const { stackId } = req.body;
// try {
//   const selectedStackTemplate = await awsCfn.fetchStackTemplate(stackId);
//   // TODO define type for stack template JSON form
//   // @ts-ignore
//   const stackResources = selectedStackTemplate.Resources;
//   const stackVpcAlbResources = {
//     vpcs: [] as string[],
//     albs: [] as string[],
//   };

//   Object.entries(stackResources).forEach(([resourceName, value]) => {
//     const vpcType = "AWS::EC2::VPC";
//     // @ts-ignore
//     if (value.Type === vpcType) stackVpcAlbResources.vpcs.push(resourceName);

//     const albType = "AWS::ElasticLoadBalancingV2::LoadBalancer";
//     // @ts-ignore
//     if (value.Type === albType && resourceName.includes("alb"))
//       stackVpcAlbResources.albs.push(resourceName);
//   });

//   res.json(stackVpcAlbResources);
// } catch (error) {
//   console.log(error);
// }
// });

module.exports = router;
