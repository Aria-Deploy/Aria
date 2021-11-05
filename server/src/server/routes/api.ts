import express from "express";
const router = express.Router();
import * as awsCfn from "../../cfn_interface/lib/aws_cfn_data";

router.get("/profiles", async (req, res) => {
  res.contentType("application/json");
  const accounts = await awsCfn.fetchAwsProfilesInfo();
  res.json(accounts);
});

router.get("/stacks/:profile", async (req, res) => {
  try {
    const profileName = req.params.profile;
    await awsCfn.clientsInit(profileName);
    const existingStacks = await awsCfn.fetchAwsStackInfo();
    res.json(existingStacks);
  } catch (error) {
    console.log("Unable to process existing stacks request: ", error);
  }
});

router.post("/deploy", async (req, res) => {
  const { stackId } = req.body;
  try {
    const selectedStackTemplate = await awsCfn.fetchStackTemplate(stackId);
    const vpcConfig = await awsCfn.fetchStackVpcConfig(stackId);
    res.json(vpcConfig);
  } catch (error) {
    console.log(error);
    res.status(400);
    res.send(error);
  }
});

module.exports = router;
