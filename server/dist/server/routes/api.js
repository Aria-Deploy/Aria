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
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const awsCfn = __importStar(require("../../cfn_interface/lib/aws_cfn_data"));
const canary_stack_1 = require("../../cfn_interface/lib/canary_stack");
const existing_stack_1 = require("../../cfn_interface/lib/existing_stack");
const cdk = __importStar(require("@aws-cdk/core"));
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
    }
    catch (error) {
        console.log(error);
    }
});
router.put("/deploy-canary", async (req, res) => {
    const stackConfig = req.body;
    try {
        stackConfig.vpcConfig = await awsCfn.setAzPubPrivSubnets(stackConfig.vpcId);
        stackConfig.env = awsCfn.getEnv();
        const app = new cdk.App();
        const canaryStack = new canary_stack_1.CanaryStack(app, `aria-canary-${stackConfig.selectedAlbName}`, stackConfig, stackConfig.env);
        const deployResult = await canaryStack.deploy();
        const targetGroups = stackConfig.newRuleConfig.Actions[0].ForwardConfig.TargetGroups;
        targetGroups.forEach((targetGroup, idx) => {
            if (targetGroup.TargetGroupArn === "Insert Canary Target ARN") {
                targetGroups[idx].TargetGroupArn =
                    deployResult.outputs.CanaryTargetGroupArn;
            }
        });
        const createRuleResponse = await awsCfn.createListenerRule(stackConfig.newRuleConfig);
        console.log(deployResult);
        const deployResponse = {
            ...deployResult,
            stackArtifact: [],
            createRuleResponse,
        };
        res.json(deployResponse);
        // TODO: Add proper error handling
    }
    catch (error) {
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
    }
    catch (error) {
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
        const existingCanaryInfra = new existing_stack_1.ExistingStack(app, stackName, stackConfig, {
            env: awsCfn.getEnv(),
        });
        const destroyResult = await existingCanaryInfra.destroy();
        res.json(destroyResult);
    }
    catch (error) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NlcnZlci9yb3V0ZXMvYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHNEQUE4QjtBQUM5QixNQUFNLE1BQU0sR0FBRyxpQkFBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2hDLDZFQUErRDtBQUMvRCx1RUFBbUU7QUFDbkUsMkVBQXVFO0FBQ3ZFLG1EQUFxQztBQUVyQyxNQUFNLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBQ3pDLE1BQU0sUUFBUSxHQUFHLE1BQU0sTUFBTSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDbEQsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNyQixDQUFDLENBQUMsQ0FBQztBQUVILE1BQU0sQ0FBQyxHQUFHLENBQUMsOEJBQThCLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtJQUM1RCxJQUFJO1FBQ0YsTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDM0MsTUFBTSxNQUFNLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3RDLE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxNQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUM1RCxNQUFNLGlCQUFpQixHQUFHLE1BQU0sTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBRXpELEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxnQkFBZ0IsRUFBRSxpQkFBaUIsRUFBRSxDQUFDLENBQUM7S0FDbkQ7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDcEI7QUFDSCxDQUFDLENBQUMsQ0FBQztBQUVILE1BQU0sQ0FBQyxHQUFH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UyxFQUFFLFdBQVcsRUFBRTtZQUN6RSxHQUFHLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRTtTQUNyQixDQUFDLENBQUM7UUFDSCxNQUFNLGFBQWEsR0FBRyxNQUFNLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzFELEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7S0FDekI7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDcEI7QUFDSCxDQUFDLENBQUMsQ0FBQztBQUVILHVEQUF1RDtBQUN2RCxVQUFVO0FBQ1YsOENBQThDO0FBQzlDLDZDQUE2QztBQUM3Qyw2REFBNkQ7QUFDN0QsNENBQTRDO0FBQzVDLGdDQUFnQztBQUNoQyxzQkFBc0I7QUFDdEIseUVBQXlFO0FBQ3pFLE1BQU07QUFDTixNQUFNO0FBRU4sTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZXhwcmVzcyBmcm9tIFwiZXhwcmVzc1wiO1xuY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKTtcbmltcG9ydCAqIGFzIGF3c0NmbiBmcm9tIFwiLi4vLi4vY2ZuX2ludGVyZmFjZS9saWIvYXdzX2Nmbl9kYXRhXCI7XG5pbXBvcnQgeyBDYW5hcnlTdGFjayB9IGZyb20gXCIuLi8uLi9jZm5faW50ZXJmYWNlL2xpYi9jYW5hcnlfc3RhY2tcIjtcbmltcG9ydCB7IEV4aXN0aW5nU3RhY2sgfSBmcm9tIFwiLi4vLi4vY2ZuX2ludGVyZmFjZS9saWIvZXhpc3Rpbmdfc3RhY2tcIjtcbmltcG9ydCAqIGFzIGNkayBmcm9tIFwiQGF3cy1jZGsvY29yZVwiO1xuXG5yb3V0ZXIuZ2V0KFwiL3Byb2ZpbGVzXCIsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBhY2NvdW50cyA9IGF3YWl0IGF3c0Nmbi5mZXRjaFByb2ZpbGVzSW5mbygpO1xuICByZXMuanNvbihhY2NvdW50cyk7XG59KTtcblxucm91dGVyLmdldChcIi9yZXNvdXJjZXMtZGF0YS86cHJvZmlsZU5hbWVcIiwgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgcHJvZmlsZU5hbWUgPSByZXEucGFyYW1zLnByb2ZpbGVOYW1lO1xuICAgIGF3YWl0IGF3c0Nmbi5jbGllbnRzSW5pdChwcm9maWxlTmFtZSk7XG4gICAgY29uc3QgcHJvZmlsZVJlc291cmNlcyA9IGF3YWl0IGF3c0Nmbi5nZXRMb2FkQmFsYW5jZXJJbmZvKCk7XG4gICAgY29uc3QgZXhpc3RpbmdTdGFja0luZm8gPSBhd2FpdCBhd3NDZm4uZmV0Y2hTdGFja3NJbmZvKCk7XG5cbiAgICByZXMuanNvbih7IHByb2ZpbGVSZXNvdXJjZXMsIGV4aXN0aW5nU3RhY2tJbmZvIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgfVxufSk7XG5cbnJvdXRlci5wdXQoXCIvZGVwbG95LWNhbmFyeVwiLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgY29uc3Qgc3RhY2tDb25maWcgPSByZXEuYm9keTtcbiAgdHJ5IHtcbiAgICBzdGFja0NvbmZpZy52cGNDb25maWcgPSBhd2FpdCBhd3NDZm4uc2V0QXpQdWJQcml2U3VibmV0cyhzdGFja0NvbmZpZy52cGNJZCk7XG4gICAgc3RhY2tDb25maWcuZW52ID0gYXdzQ2ZuLmdldEVudigpO1xuXG4gICAgY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcbiAgICBjb25zdCBjYW5hcnlTdGFjayA9IG5ldyBDYW5hcnlTdGFjayhcbiAgICAgIGFwcCxcbiAgICAgIGBhcmlhLWNhbmFyeS0ke3N0YWNrQ29uZmlnLnNlbGVjdGVkQWxiTmFtZX1gLFxuICAgICAgc3RhY2tDb25maWcsXG4gICAgICBzdGFja0NvbmZpZy5lbnYgIFxuICAgICk7XG5cbiAgICBjb25zdCBkZXBsb3lSZXN1bHQgPSBhd2FpdCBjYW5hcnlTdGFjay5kZXBsb3koKTtcbiAgICBjb25zdCB0YXJnZXRHcm91cHMgPVxuICAgICAgc3RhY2tDb25maWcubmV3UnVsZUNvbmZpZy5BY3Rpb25zWzBdLkZvcndhcmRDb25maWcuVGFyZ2V0R3JvdXBzO1xuICAgIHRhcmdldEdyb3Vwcy5mb3JFYWNoKCh0YXJnZXRHcm91cDogYW55LCBpZHg6IG51bWJlcikgPT4ge1xuICAgICAgaWYgKHRhcmdldEdyb3VwLlRhcmdldEdyb3VwQXJuID09PSBcIkluc2VydCBDYW5hcnkgVGFyZ2V0IEFSTlwiKSB7XG4gICAgICAgIHRhcmdldEdyb3Vwc1tpZHhdLlRhcmdldEdyb3VwQXJuID1cbiAgICAgICAgICBkZXBsb3lSZXN1bHQub3V0cHV0cy5DYW5hcnlUYXJnZXRHcm91cEFybjtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnN0IGNyZWF0ZVJ1bGVSZXNwb25zZSA9IGF3YWl0IGF3c0Nmbi5jcmVhdGVMaXN0ZW5lclJ1bGUoXG4gICAgICBzdGFja0NvbmZpZy5uZXdSdWxlQ29uZmlnXG4gICAgKTtcblxuICAgIGNvbnNvbGUubG9nKGRlcGxveVJlc3VsdCk7XG4gICAgY29uc3QgZGVwbG95UmVzcG9uc2UgPSB7XG4gICAgICAuLi5kZXBsb3lSZXN1bHQsXG4gICAgICBzdGFja0FydGlmYWN0OiBbXSxcbiAgICAgIGNyZWF0ZVJ1bGVSZXNwb25zZSxcbiAgICB9O1xuICAgIHJlcy5qc29uKGRlcGxveVJlc3BvbnNlKTtcbiAgICAvLyBUT0RPOiBBZGQgcHJvcGVyIGVycm9yIGhhbmRsaW5nXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgIHJlcy5zdGF0dXMoNDAwKTtcbiAgICByZXMuanNvbihcImRlcGxveW1lbnQgZmFpbFwiKTtcbiAgfVxufSk7XG5cbnJvdXRlci5wdXQoXCIvZGVzdHJveS1jYW5hcnlcIiwgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgc3RhY2tBcm4sIHN0YWNrTmFtZSwgcHJvZmlsZU5hbWUsIGNhbmFyeVJ1bGVBcm4gfSA9IHJlcS5ib2R5O1xuICBhd2FpdCBhd3NDZm4uY2xpZW50c0luaXQocHJvZmlsZU5hbWUpO1xuICB0cnkge1xuICAgIGNvbnN0IGRlbGV0ZVJ1bGVSZXMgPSBhd2FpdCBhd3NDZm4uZGVsZXRlTGlzdGVuZXJSdWxlKGNhbmFyeVJ1bGVBcm4pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICByZXMuc2VuZChlcnJvcik7XG4gIH1cbiAgdHJ5IHtcbiAgICBjb25zdCBleGlzdGluZ0NhbmFyeVN0YWNrID0gYXdhaXQgYXdzQ2ZuLmZldGNoU3RhY2tUZW1wbGF0ZShzdGFja0Fybik7XG4gICAgY29uc3Qgc3RhY2tDb25maWcgPSB7XG4gICAgICBwcm9maWxlTmFtZSxcbiAgICAgIHN0YWNrQXJuLFxuICAgICAgdGVtcGxhdGU6IGV4aXN0aW5nQ2FuYXJ5U3RhY2ssXG4gICAgfTtcblxuICAgIGNvbnN0IGFwcCA9IG5ldyBjZGsuQXBwKCk7XG4gICAgY29uc3QgZXhpc3RpbmdDYW5hcnlJbmZyYSA9IG5ldyBFeGlzdGluZ1N0YWNrKGFwcCwgc3RhY2tOYW1lLCBzdGFja0NvbmZpZywge1xuICAgICAgZW52OiBhd3NDZm4uZ2V0RW52KCksXG4gICAgfSk7XG4gICAgY29uc3QgZGVzdHJveVJlc3VsdCA9IGF3YWl0IGV4aXN0aW5nQ2FuYXJ5SW5mcmEuZGVzdHJveSgpO1xuICAgIHJlcy5qc29uKGRlc3Ryb3lSZXN1bHQpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgfVxufSk7XG5cbi8vIHJvdXRlci5nZXQoXCIvc3RhY2tzLzpwcm9maWxlXCIsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuLy8gICB0cnkge1xuLy8gICAgIGNvbnN0IHByb2ZpbGVOYW1lID0gcmVxLnBhcmFtcy5wcm9maWxlO1xuLy8gICAgIGF3YWl0IGF3c0Nmbi5jbGllbnRzSW5pdChwcm9maWxlTmFtZSk7XG4vLyAgICAgY29uc3QgZXhpc3RpbmdTdGFja3MgPSBhd2FpdCBhd3NDZm4uZmV0Y2hTdGFja3NJbmZvKCk7XG4vLyAgICAgYXdzQ2ZuLmZldGNoQWNjb3VudEluZm8ocHJvZmlsZU5hbWUpO1xuLy8gICAgIHJlcy5qc29uKGV4aXN0aW5nU3RhY2tzKTtcbi8vICAgfSBjYXRjaCAoZXJyb3IpIHtcbi8vICAgICBjb25zb2xlLmxvZyhcIlVuYWJsZSB0byBwcm9jZXNzIGV4aXN0aW5nIHN0YWNrcyByZXF1ZXN0OiBcIiwgZXJyb3IpO1xuLy8gICB9XG4vLyB9KTtcblxubW9kdWxlLmV4cG9ydHMgPSByb3V0ZXI7XG4iXX0=