import express from "express";
const router = express.Router();
import {
  fetchAwsProfilesInfo,
  fetchAwsStackInfo,
} from "../../cfn_interface/lib/aws_metadata_fetch";

router.get("/profiles", async (req, res) => {
  res.contentType("application/json");
  const accounts = await fetchAwsProfilesInfo();
  res.json(accounts);
});

router.get("/stacks/:profile", async (req, res) => {
  const profile = req.params.profile;
  const existingStacks = await fetchAwsStackInfo(profile);
  res.json(existingStacks);
});

// router.post();

module.exports = router;
