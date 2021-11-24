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
router.get("/test/:vpcid", async (req, res) => {
    const response = await awsCfn.setAzPubPrivSubnets(req.params.vpcid);
    res.json(response);
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
            if (targetGroup.TargetGroupArn === "Insert Baseline Target ARN") {
                targetGroups[idx].TargetGroupArn =
                    deployResult.outputs.BaselineTargetGroupArn;
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
    console.log(canaryRuleArn);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NlcnZlci9yb3V0ZXMvYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHNEQUE4QjtBQUM5QixNQUFNLE1BQU0sR0FBRyxpQkFBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2hDLDZFQUErRDtBQUMvRCx1RUFBbUU7QUFDbkUsMkVBQXVFO0FBQ3ZFLG1EQUFxQztBQUVyQyxNQUFNLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBQ3pDLE1BQU0sUUFBUSxHQUFHLE1BQU0sTUFBTSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDbEQsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNyQixDQUFDLENBQUMsQ0FBQztBQUVILE1BQU0sQ0FBQyxHQUFHLENBQUMsOEJBQThCLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtJQUM1RCxJQUFJO1FBQ0YsTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDM0MsTUFBTSxNQUFNLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3RDLE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxNQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUM1RCxNQUFNLGlCQUFpQixHQUFHLE1BQU0sTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBRXpELEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxnQkFBZ0IsRUFBRSxpQkFBaUIsRUFBRSxDQUFDLENBQUM7S0FDbkQ7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDcEI7QUFDSCxDQUFDLENBQUMsQ0FBQztBQUVILE1BQU0sQ0FBQyxHQUFH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LGFBQWEsQ0FBQyxDQUFDO0tBQ3RFO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDZCxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25CLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDakI7SUFDRCxJQUFJO1FBQ0YsTUFBTSxtQkFBbUIsR0FBRyxNQUFNLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN0RSxNQUFNLFdBQVcsR0FBRztZQUNsQixXQUFXO1lBQ1gsUUFBUTtZQUNSLFFBQVEsRUFBRSxtQkFBbUI7U0FDOUIsQ0FBQztRQUVGLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzFCLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSw4QkFBYSxDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFO1lBQ3pFLEdBQUcsRUFBRSxNQUFNLENBQUMsTUFBTSxFQUFFO1NBQ3JCLENBQUMsQ0FBQztRQUNILE1BQU0sYUFBYSxHQUFHLE1BQU0sbUJBQW1CLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDMUQsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztLQUN6QjtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ2QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNwQjtBQUNILENBQUMsQ0FBQyxDQUFDO0FBRUgsdURBQXVEO0FBQ3ZELFVBQVU7QUFDViw4Q0FBOEM7QUFDOUMsNkNBQTZDO0FBQzdDLDZEQUE2RDtBQUM3RCw0Q0FBNEM7QUFDNUMsZ0NBQWdDO0FBQ2hDLHNCQUFzQjtBQUN0Qix5RUFBeUU7QUFDekUsTUFBTTtBQUNOLE1BQU07QUFFTixNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBleHByZXNzIGZyb20gXCJleHByZXNzXCI7XG5jb25zdCByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpO1xuaW1wb3J0ICogYXMgYXdzQ2ZuIGZyb20gXCIuLi8uLi9jZm5faW50ZXJmYWNlL2xpYi9hd3NfY2ZuX2RhdGFcIjtcbmltcG9ydCB7IENhbmFyeVN0YWNrIH0gZnJvbSBcIi4uLy4uL2Nmbl9pbnRlcmZhY2UvbGliL2NhbmFyeV9zdGFja1wiO1xuaW1wb3J0IHsgRXhpc3RpbmdTdGFjayB9IGZyb20gXCIuLi8uLi9jZm5faW50ZXJmYWNlL2xpYi9leGlzdGluZ19zdGFja1wiO1xuaW1wb3J0ICogYXMgY2RrIGZyb20gXCJAYXdzLWNkay9jb3JlXCI7XG5cbnJvdXRlci5nZXQoXCIvcHJvZmlsZXNcIiwgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGFjY291bnRzID0gYXdhaXQgYXdzQ2ZuLmZldGNoUHJvZmlsZXNJbmZvKCk7XG4gIHJlcy5qc29uKGFjY291bnRzKTtcbn0pO1xuXG5yb3V0ZXIuZ2V0KFwiL3Jlc291cmNlcy1kYXRhLzpwcm9maWxlTmFtZVwiLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBwcm9maWxlTmFtZSA9IHJlcS5wYXJhbXMucHJvZmlsZU5hbWU7XG4gICAgYXdhaXQgYXdzQ2ZuLmNsaWVudHNJbml0KHByb2ZpbGVOYW1lKTtcbiAgICBjb25zdCBwcm9maWxlUmVzb3VyY2VzID0gYXdhaXQgYXdzQ2ZuLmdldExvYWRCYWxhbmNlckluZm8oKTtcbiAgICBjb25zdCBleGlzdGluZ1N0YWNrSW5mbyA9IGF3YWl0IGF3c0Nmbi5mZXRjaFN0YWNrc0luZm8oKTtcblxuICAgIHJlcy5qc29uKHsgcHJvZmlsZVJlc291cmNlcywgZXhpc3RpbmdTdGFja0luZm8gfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5sb2coZXJyb3IpO1xuICB9XG59KTtcblxucm91dGVyLmdldChcIi90ZXN0Lzp2cGNpZFwiLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhd3NDZm4uc2V0QXpQdWJQcml2U3VibmV0cyhyZXEucGFyYW1zLnZwY2lkKTtcbiAgcmVzLmpzb24ocmVzcG9uc2UpO1xufSk7XG5cbnJvdXRlci5wdXQoXCIvZGVwbG95LWNhbmFyeVwiLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgY29uc3Qgc3RhY2tDb25maWcgPSByZXEuYm9keTtcbiAgdHJ5IHtcbiAgICBzdGFja0NvbmZpZy52cGNDb25maWcgPSBhd2FpdCBhd3NDZm4uc2V0QXpQdWJQcml2U3VibmV0cyhzdGFja0NvbmZpZy52cGNJZCk7XG4gICAgc3RhY2tDb25maWcuZW52ID0gYXdzQ2ZuLmdldEVudigpO1xuXG4gICAgY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcbiAgICBjb25zdCBjYW5hcnlTdGFjayA9IG5ldyBDYW5hcnlTdGFjayhcbiAgICAgIGFwcCxcbiAgICAgIGBhcmlhLWNhbmFyeS0ke3N0YWNrQ29uZmlnLnNlbGVjdGVkQWxiTmFtZX1gLFxuICAgICAgc3RhY2tDb25maWcsXG4gICAgICBzdGFja0NvbmZpZy5lbnZcbiAgICApO1xuXG4gICAgY29uc3QgZGVwbG95UmVzdWx0ID0gYXdhaXQgY2FuYXJ5U3RhY2suZGVwbG95KCk7XG4gICAgY29uc3QgdGFyZ2V0R3JvdXBzID1cbiAgICAgIHN0YWNrQ29uZmlnLm5ld1J1bGVDb25maWcuQWN0aW9uc1swXS5Gb3J3YXJkQ29uZmlnLlRhcmdldEdyb3VwcztcblxuICAgIHRhcmdldEdyb3Vwcy5mb3JFYWNoKCh0YXJnZXRHcm91cDogYW55LCBpZHg6IG51bWJlcikgPT4ge1xuICAgICAgaWYgKHRhcmdldEdyb3VwLlRhcmdldEdyb3VwQXJuID09PSBcIkluc2VydCBDYW5hcnkgVGFyZ2V0IEFSTlwiKSB7XG4gICAgICAgIHRhcmdldEdyb3Vwc1tpZHhdLlRhcmdldEdyb3VwQXJuID1cbiAgICAgICAgICBkZXBsb3lSZXN1bHQub3V0cHV0cy5DYW5hcnlUYXJnZXRHcm91cEFybjtcbiAgICAgIH1cbiAgICAgIGlmICh0YXJnZXRHcm91cC5UYXJnZXRHcm91cEFybiA9PT0gXCJJbnNlcnQgQmFzZWxpbmUgVGFyZ2V0IEFSTlwiKSB7XG4gICAgICAgIHRhcmdldEdyb3Vwc1tpZHhdLlRhcmdldEdyb3VwQXJuID1cbiAgICAgICAgICBkZXBsb3lSZXN1bHQub3V0cHV0cy5CYXNlbGluZVRhcmdldEdyb3VwQXJuO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgY29uc3QgY3JlYXRlUnVsZVJlc3BvbnNlID0gYXdhaXQgYXdzQ2ZuLmNyZWF0ZUxpc3RlbmVyUnVsZShcbiAgICAgIHN0YWNrQ29uZmlnLm5ld1J1bGVDb25maWdcbiAgICApO1xuXG4gICAgY29uc29sZS5sb2coZGVwbG95UmVzdWx0KTtcbiAgICBjb25zdCBkZXBsb3lSZXNwb25zZSA9IHtcbiAgICAgIC4uLmRlcGxveVJlc3VsdCxcbiAgICAgIHN0YWNrQXJ0aWZhY3Q6IFtdLFxuICAgICAgY3JlYXRlUnVsZVJlc3BvbnNlLFxuICAgIH07XG4gICAgcmVzLmpzb24oZGVwbG95UmVzcG9uc2UpO1xuICAgIC8vIFRPRE86IEFkZCBwcm9wZXIgZXJyb3IgaGFuZGxpbmdcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgcmVzLnN0YXR1cyg0MDApO1xuICAgIHJlcy5qc29uKFwiZGVwbG95bWVudCBmYWlsXCIpO1xuICB9XG59KTtcblxucm91dGVyLnB1dChcIi9kZXN0cm95LWNhbmFyeVwiLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBzdGFja0Fybiwgc3RhY2tOYW1lLCBwcm9maWxlTmFtZSwgY2FuYXJ5UnVsZUFybiB9ID0gcmVxLmJvZHk7XG4gIGF3YWl0IGF3c0Nmbi5jbGllbnRzSW5pdChwcm9maWxlTmFtZSk7XG4gIGNvbnNvbGUubG9nKGNhbmFyeVJ1bGVBcm4pO1xuICB0cnkge1xuICAgIGNvbnN0IGRlbGV0ZVJ1bGVSZXMgPSBhd2FpdCBhd3NDZm4uZGVsZXRlTGlzdGVuZXJSdWxlKGNhbmFyeVJ1bGVBcm4pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICByZXMuc2VuZChlcnJvcik7XG4gIH1cbiAgdHJ5IHtcbiAgICBjb25zdCBleGlzdGluZ0NhbmFyeVN0YWNrID0gYXdhaXQgYXdzQ2ZuLmZldGNoU3RhY2tUZW1wbGF0ZShzdGFja0Fybik7XG4gICAgY29uc3Qgc3RhY2tDb25maWcgPSB7XG4gICAgICBwcm9maWxlTmFtZSxcbiAgICAgIHN0YWNrQXJuLFxuICAgICAgdGVtcGxhdGU6IGV4aXN0aW5nQ2FuYXJ5U3RhY2ssXG4gICAgfTtcblxuICAgIGNvbnN0IGFwcCA9IG5ldyBjZGsuQXBwKCk7XG4gICAgY29uc3QgZXhpc3RpbmdDYW5hcnlJbmZyYSA9IG5ldyBFeGlzdGluZ1N0YWNrKGFwcCwgc3RhY2tOYW1lLCBzdGFja0NvbmZpZywge1xuICAgICAgZW52OiBhd3NDZm4uZ2V0RW52KCksXG4gICAgfSk7XG4gICAgY29uc3QgZGVzdHJveVJlc3VsdCA9IGF3YWl0IGV4aXN0aW5nQ2FuYXJ5SW5mcmEuZGVzdHJveSgpO1xuICAgIHJlcy5qc29uKGRlc3Ryb3lSZXN1bHQpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgfVxufSk7XG5cbi8vIHJvdXRlci5nZXQoXCIvc3RhY2tzLzpwcm9maWxlXCIsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuLy8gICB0cnkge1xuLy8gICAgIGNvbnN0IHByb2ZpbGVOYW1lID0gcmVxLnBhcmFtcy5wcm9maWxlO1xuLy8gICAgIGF3YWl0IGF3c0Nmbi5jbGllbnRzSW5pdChwcm9maWxlTmFtZSk7XG4vLyAgICAgY29uc3QgZXhpc3RpbmdTdGFja3MgPSBhd2FpdCBhd3NDZm4uZmV0Y2hTdGFja3NJbmZvKCk7XG4vLyAgICAgYXdzQ2ZuLmZldGNoQWNjb3VudEluZm8ocHJvZmlsZU5hbWUpO1xuLy8gICAgIHJlcy5qc29uKGV4aXN0aW5nU3RhY2tzKTtcbi8vICAgfSBjYXRjaCAoZXJyb3IpIHtcbi8vICAgICBjb25zb2xlLmxvZyhcIlVuYWJsZSB0byBwcm9jZXNzIGV4aXN0aW5nIHN0YWNrcyByZXF1ZXN0OiBcIiwgZXJyb3IpO1xuLy8gICB9XG4vLyB9KTtcblxubW9kdWxlLmV4cG9ydHMgPSByb3V0ZXI7XG4iXX0=