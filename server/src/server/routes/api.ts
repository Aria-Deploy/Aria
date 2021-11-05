import express from "express";
const router = express.Router();
import * as awsCfn from "../../cfn_interface/lib/aws_cfn_data";

router.get("/profiles", async (req, res) => {
  res.contentType("application/json");
  const accounts = await awsCfn.fetchAwsProfilesInfo();
  res.json(accounts);
});

router.get("/stacks/:profile", async (req, res) => {
  const profile = req.params.profile;
  const existingStacks = await awsCfn.fetchAwsStackInfo();
  res.json(existingStacks);
});

router.post("/deploy", async (req, res) => {
  const { profileName, stackId } = req.body;
  try {
    awsCfn.clientsInit(profileName)
    const selectedStackTemplate = await awsCfn.fetchStackTemplate(stackId);
    const vpcConfig = await awsCfn.fetchStackVpcConfig(stackId);
    res.json(selectedStackTemplate);
  } catch (error) {
    console.log(error)
    res.status(400);
    res.send(error);
  }
});

module.exports = router;
