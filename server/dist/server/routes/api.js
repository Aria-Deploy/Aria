"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cdk = __importStar(require("@aws-cdk/core"));
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const awsCfn = __importStar(require("../../cfn_interface/lib/aws_cfn_data"));
const canary_stack_1 = require("../../cfn_interface/lib/canary_stack");
const existng_stack_1 = require("../../cfn_interface/lib/existng_stack");
router.get("/profiles", async (req, res) => {
    res.contentType("application/json");
    const accounts = await awsCfn.fetchAwsProfilesInfo();
    res.json(accounts);
});
router.get("/stacks/:profile", async (req, res) => {
    try {
        const profileName = req.params.profile;
        await awsCfn.clientsInit(profileName);
        const existingStacks = await awsCfn.fetchStacksInfo();
        res.json(existingStacks);
    }
    catch (error) {
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
        // TODO incorporate app into ExistingStack class
        const app = new cdk.App();
        // TODO: fetch account & regions from somewhere
        const canaryStack = new canary_stack_1.CanaryStack(app, stackName, stackConfig);
        const deployResult = await canaryStack.deploy();
        console.log(deployResult);
        const deployResponse = { ...deployResult, stackArtifact: [] };
        res.json(deployResponse);
        // TODO: Add proper error handling
    }
    catch (error) {
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
        // @ts-ignore
        const originalStackTemplate = JSON.parse(existingStack.Metadata["pre-canary-cfn"]);
        const vpcConfig = await awsCfn.fetchStackVpcConfig(stackId);
        const stackConfig = {
            profileName,
            stackId,
            vpcConfig,
            template: originalStackTemplate,
        };
        // TODO incorporate app into ExistingStack class
        const app = new cdk.App();
        const originalStack = new existng_stack_1.ExistingStack(app, stackName, stackConfig);
        const deployResult = await originalStack.deploy();
        console.log(deployResult);
        const deployResponse = { ...deployResult, stackArtifact: [] };
        res.json(deployResponse);
    }
    catch (error) {
        console.log(error);
    }
});
module.exports = router;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NlcnZlci9yb3V0ZXMvYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG1EQUFxQztBQUNyQyxzREFBNEM7QUFDNUMsTUFBTSxNQUFNLEdBQUcsaUJBQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNoQyw2RUFBK0Q7QUFDL0QsdUVBQW1FO0FBQ25FLHlFQUFzRTtBQUV0RSxNQUFNLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBQ3pDLEdBQUcsQ0FBQyxXQUFXLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUNwQyxNQUFNLFFBQVEsR0FBRyxNQUFNLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO0lBQ3JELEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDckIsQ0FBQyxDQUFDLENBQUM7QUFFSCxNQUFNLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7SUFDaEQsSUFBSTtRQUNGLE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO1FBQ3ZDLE1BQU0sTUFBTSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN0QyxNQUFNLGNBQWMsR0FBRyxNQUFNLE1BQU0sQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN0RCxHQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0tBQzFCO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDZCxPQUFPLENBQUMsR0FBRyxDQUFDLDZDQUE2QyxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQ25FO0FBQ0gsQ0FBQyxDQUFDLENBQUM7QUFFSCxNQUFNLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLEtBQUssRUFB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b250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiQGF3cy1jZGsvY29yZVwiO1xuaW1wb3J0IGV4cHJlc3MsIHsgcmVzcG9uc2UgfSBmcm9tIFwiZXhwcmVzc1wiO1xuY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKTtcbmltcG9ydCAqIGFzIGF3c0NmbiBmcm9tIFwiLi4vLi4vY2ZuX2ludGVyZmFjZS9saWIvYXdzX2Nmbl9kYXRhXCI7XG5pbXBvcnQgeyBDYW5hcnlTdGFjayB9IGZyb20gXCIuLi8uLi9jZm5faW50ZXJmYWNlL2xpYi9jYW5hcnlfc3RhY2tcIjtcbmltcG9ydCB7IEV4aXN0aW5nU3RhY2sgfSBmcm9tIFwiLi4vLi4vY2ZuX2ludGVyZmFjZS9saWIvZXhpc3RuZ19zdGFja1wiO1xuXG5yb3V0ZXIuZ2V0KFwiL3Byb2ZpbGVzXCIsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICByZXMuY29udGVudFR5cGUoXCJhcHBsaWNhdGlvbi9qc29uXCIpO1xuICBjb25zdCBhY2NvdW50cyA9IGF3YWl0IGF3c0Nmbi5mZXRjaEF3c1Byb2ZpbGVzSW5mbygpO1xuICByZXMuanNvbihhY2NvdW50cyk7XG59KTtcblxucm91dGVyLmdldChcIi9zdGFja3MvOnByb2ZpbGVcIiwgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgcHJvZmlsZU5hbWUgPSByZXEucGFyYW1zLnByb2ZpbGU7XG4gICAgYXdhaXQgYXdzQ2ZuLmNsaWVudHNJbml0KHByb2ZpbGVOYW1lKTtcbiAgICBjb25zdCBleGlzdGluZ1N0YWNrcyA9IGF3YWl0IGF3c0Nmbi5mZXRjaFN0YWNrc0luZm8oKTtcbiAgICByZXMuanNvbihleGlzdGluZ1N0YWNrcyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5sb2coXCJVbmFibGUgdG8gcHJvY2VzcyBleGlzdGluZyBzdGFja3MgcmVxdWVzdDogXCIsIGVycm9yKTtcbiAgfVxufSk7XG5cbnJvdXRlci5wdXQoXCIvZGVwbG95LWNhbmFyeVwiLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBwcm9maWxlTmFtZSwgc3RhY2tJZCwgc3RhY2tOYW1lIH0gPSByZXEuYm9keTtcbiAgdHJ5IHtcbiAgICBjb25zdCBzZWxlY3RlZFN0YWNrVGVtcGxhdGUgPSBhd2FpdCBhd3NDZm4uZmV0Y2hTdGFja1RlbXBsYXRlKHN0YWNrSWQpO1xuICAgIGNvbnN0IHZwY0NvbmZpZyA9IGF3YWl0IGF3c0Nmbi5mZXRjaFN0YWNrVnBjQ29uZmlnKHN0YWNrSWQpO1xuICAgIGNvbnN0IHN0YWNrQ29uZmlnID0ge1xuICAgICAgcHJvZmlsZU5hbWUsXG4gICAgICBzdGFja0lkLFxuICAgICAgdnBjQ29uZmlnLFxuICAgICAgdGVtcGxhdGU6IHNlbGVjdGVkU3RhY2tUZW1wbGF0ZSxcbiAgICB9O1xuXG4gICAgLy8gVE9ETyBpbmNvcnBvcmF0ZSBhcHAgaW50byBFeGlzdGluZ1N0YWNrIGNsYXNzXG4gICAgY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcbiAgICAvLyBUT0RPOiBmZXRjaCBhY2NvdW50ICYgcmVnaW9ucyBmcm9tIHNvbWV3aGVyZVxuICAgIGNvbnN0IGNhbmFyeVN0YWNrID0gbmV3IENhbmFyeVN0YWNrKGFwcCwgc3RhY2tOYW1lLCBzdGFja0NvbmZpZyk7XG4gICAgY29uc3QgZGVwbG95UmVzdWx0ID0gYXdhaXQgY2FuYXJ5U3RhY2suZGVwbG95KCk7XG5cbiAgICBjb25zb2xlLmxvZyhkZXBsb3lSZXN1bHQpO1xuICAgIGNvbnN0IGRlcGxveVJlc3BvbnNlID0geyAuLi5kZXBsb3lSZXN1bHQsIHN0YWNrQXJ0aWZhY3Q6IFtdIH07XG4gICAgcmVzLmpzb24oZGVwbG95UmVzcG9uc2UpO1xuICAgIC8vIFRPRE86IEFkZCBwcm9wZXIgZXJyb3IgaGFuZGxpbmdcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgcmVzLnN0YXR1cyg0MDApO1xuICAgIHJlcy5qc29uKFwiZGVwbG95bWVudCBmYWlsZWRcIik7XG4gIH1cbn0pO1xuXG5yb3V0ZXIucHV0KFwiL3JvbGxiYWNrLWNhbmFyeVwiLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBzdGFja0lkLCBzdGFja05hbWUsIHByb2ZpbGVOYW1lIH0gPSByZXEuYm9keTtcbiAgdHJ5IHtcbiAgICBjb25zdCBleGlzdGluZ1N0YWNrID0gYXdhaXQgYXdzQ2ZuLmZldGNoU3RhY2tUZW1wbGF0ZShzdGFja0lkKTtcbiAgICAvLyBUT0RPIGRlZmluZSB0eXBlIG9mIHJlc3BvbnNlXG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGNvbnN0IG9yaWdpbmFsU3RhY2tUZW1wbGF0ZSA9IEpTT04ucGFyc2UoZXhpc3RpbmdTdGFjay5NZXRhZGF0YVtcInByZS1jYW5hcnktY2ZuXCJdKTtcbiAgICBjb25zdCB2cGNDb25maWcgPSBhd2FpdCBhd3NDZm4uZmV0Y2hTdGFja1ZwY0NvbmZpZyhzdGFja0lkKTtcbiAgICBjb25zdCBzdGFja0NvbmZpZyA9IHtcbiAgICAgIHByb2ZpbGVOYW1lLFxuICAgICAgc3RhY2tJZCxcbiAgICAgIHZwY0NvbmZpZyxcbiAgICAgIHRlbXBsYXRlOiBvcmlnaW5hbFN0YWNrVGVtcGxhdGUsXG4gICAgfTtcblxuICAgIC8vIFRPRE8gaW5jb3Jwb3JhdGUgYXBwIGludG8gRXhpc3RpbmdTdGFjayBjbGFzc1xuICAgIGNvbnN0IGFwcCA9IG5ldyBjZGsuQXBwKCk7XG4gICAgY29uc3Qgb3JpZ2luYWxTdGFjayA9IG5ldyBFeGlzdGluZ1N0YWNrKGFwcCwgc3RhY2tOYW1lLCBzdGFja0NvbmZpZyk7XG4gICAgY29uc3QgZGVwbG95UmVzdWx0ID0gYXdhaXQgb3JpZ2luYWxTdGFjay5kZXBsb3koKTtcbiAgICBjb25zb2xlLmxvZyhkZXBsb3lSZXN1bHQpO1xuICAgIGNvbnN0IGRlcGxveVJlc3BvbnNlID0geyAuLi5kZXBsb3lSZXN1bHQsIHN0YWNrQXJ0aWZhY3Q6IFtdIH07XG4gICAgcmVzLmpzb24oZGVwbG95UmVzcG9uc2UpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gcm91dGVyO1xuIl19