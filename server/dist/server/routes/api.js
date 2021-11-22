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
        const canaryStack = new canary_stack_1.CanaryStack(app, `aria-canary-${params.selectedAlbName}`, stackConfig, {
            env: awsCfn.getEnv(),
        });
        const deployResult = await canaryStack.deploy();
        const targetGroups = params.newRuleConfig.Actions[0].ForwardConfig.TargetGroups;
        targetGroups.forEach((targetGroup, idx) => {
            if (targetGroup.TargetGroupArn === "Insert Canary Target ARN") {
                targetGroups[idx].TargetGroupArn =
                    deployResult.outputs.CanaryTargetGroupArn;
            }
        });
        const createRuleResponse = await awsCfn.createListenerRule(params.newRuleConfig);
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
        res.json("deployment failed");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NlcnZlci9yb3V0ZXMvYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHNEQUE4QjtBQUM5QixNQUFNLE1BQU0sR0FBRyxpQkFBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2hDLDZFQUErRDtBQUMvRCx1RUFBbUU7QUFDbkUsMkVBQXVFO0FBQ3ZFLG1EQUFxQztBQUVyQyxNQUFNLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBQ3pDLE1BQU0sUUFBUSxHQUFHLE1BQU0sTUFBTSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDbEQsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNyQixDQUFDLENBQUMsQ0FBQztBQUVILE1BQU0sQ0FBQyxHQUFHLENBQUMsOEJBQThCLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtJQUM1RCxJQUFJO1FBQ0YsTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDM0MsTUFBTSxNQUFNLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3RDLE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxNQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUM1RCxNQUFNLGlCQUFpQixHQUFHLE1BQU0sTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBRXpELEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxnQkFBZ0IsRUFBRSxpQkFBaUIsRUFBRSxDQUFDLENBQUM7S0FDbkQ7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDcEI7QUFDSCxDQUFDLENBQUMsQ0FBQztBQUVILE1BQU0sQ0FBQyxHQUFH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LENBQUM7UUFDdEUsTUFBTSxXQUFXLEdBQUc7WUFDbEIsV0FBVztZQUNYLFFBQVE7WUFDUixRQUFRLEVBQUUsbUJBQW1CO1NBQzlCLENBQUM7UUFFRixNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUMxQixNQUFNLG1CQUFtQixHQUFHLElBQUksOEJBQWEsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRTtZQUN6RSxHQUFHLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRTtTQUNyQixDQUFDLENBQUM7UUFDSCxNQUFNLGFBQWEsR0FBRyxNQUFNLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzFELEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7S0FDekI7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDcEI7QUFDSCxDQUFDLENBQUMsQ0FBQztBQUVILHVEQUF1RDtBQUN2RCxVQUFVO0FBQ1YsOENBQThDO0FBQzlDLDZDQUE2QztBQUM3Qyw2REFBNkQ7QUFDN0QsNENBQTRDO0FBQzVDLGdDQUFnQztBQUNoQyxzQkFBc0I7QUFDdEIseUVBQXlFO0FBQ3pFLE1BQU07QUFDTixNQUFNO0FBRU4sTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZXhwcmVzcyBmcm9tIFwiZXhwcmVzc1wiO1xuY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKTtcbmltcG9ydCAqIGFzIGF3c0NmbiBmcm9tIFwiLi4vLi4vY2ZuX2ludGVyZmFjZS9saWIvYXdzX2Nmbl9kYXRhXCI7XG5pbXBvcnQgeyBDYW5hcnlTdGFjayB9IGZyb20gXCIuLi8uLi9jZm5faW50ZXJmYWNlL2xpYi9jYW5hcnlfc3RhY2tcIjtcbmltcG9ydCB7IEV4aXN0aW5nU3RhY2sgfSBmcm9tIFwiLi4vLi4vY2ZuX2ludGVyZmFjZS9saWIvZXhpc3Rpbmdfc3RhY2tcIjtcbmltcG9ydCAqIGFzIGNkayBmcm9tIFwiQGF3cy1jZGsvY29yZVwiO1xuXG5yb3V0ZXIuZ2V0KFwiL3Byb2ZpbGVzXCIsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBhY2NvdW50cyA9IGF3YWl0IGF3c0Nmbi5mZXRjaFByb2ZpbGVzSW5mbygpO1xuICByZXMuanNvbihhY2NvdW50cyk7XG59KTtcblxucm91dGVyLmdldChcIi9yZXNvdXJjZXMtZGF0YS86cHJvZmlsZU5hbWVcIiwgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgcHJvZmlsZU5hbWUgPSByZXEucGFyYW1zLnByb2ZpbGVOYW1lO1xuICAgIGF3YWl0IGF3c0Nmbi5jbGllbnRzSW5pdChwcm9maWxlTmFtZSk7XG4gICAgY29uc3QgcHJvZmlsZVJlc291cmNlcyA9IGF3YWl0IGF3c0Nmbi5nZXRMb2FkQmFsYW5jZXJJbmZvKCk7XG4gICAgY29uc3QgZXhpc3RpbmdTdGFja0luZm8gPSBhd2FpdCBhd3NDZm4uZmV0Y2hTdGFja3NJbmZvKCk7XG5cbiAgICByZXMuanNvbih7IHByb2ZpbGVSZXNvdXJjZXMsIGV4aXN0aW5nU3RhY2tJbmZvIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgfVxufSk7XG5cbnJvdXRlci5wdXQoXCIvZGVwbG95LWNhbmFyeVwiLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgcGFyYW1zID0gcmVxLmJvZHk7XG4gIGNvbnNvbGUubG9nKHBhcmFtcyk7XG4gIHRyeSB7XG4gICAgY29uc3QgdnBjQ29uZmlnID0gYXdhaXQgYXdzQ2ZuLnNldEF6UHViUHJpdlN1Ym5ldHMocGFyYW1zLnZwY0lkKTtcbiAgICBjb25zdCBzdGFja0NvbmZpZyA9IHtcbiAgICAgIHByb2ZpbGVOYW1lOiBwYXJhbXMucHJvZmlsZU5hbWUsXG4gICAgICB2cGNDb25maWcsXG4gICAgICBzZWxlY3RlZEFsYk5hbWU6IHBhcmFtcy5zZWxlY3RlZEFsYk5hbWUsXG4gICAgICBzZWxlY3RlZExpc3RlbmVyQXJuOiBwYXJhbXMuc2VsZWN0ZWRMaXN0ZW5lckFybixcbiAgICAgIHNlY3VyaXR5R3JvdXBJZHM6IHBhcmFtcy5zZWN1cml0eUdyb3VwSWRzLFxuICAgIH07XG5cbiAgICBjb25zdCBhcHAgPSBuZXcgY2RrLkFwcCgpO1xuICAgIGNvbnN0IGNhbmFyeVN0YWNrID0gbmV3IENhbmFyeVN0YWNrKFxuICAgICAgYXBwLFxuICAgICAgYGFyaWEtY2FuYXJ5LSR7cGFyYW1zLnNlbGVjdGVkQWxiTmFtZX1gLFxuICAgICAgc3RhY2tDb25maWcsXG4gICAgICB7XG4gICAgICAgIGVudjogYXdzQ2ZuLmdldEVudigpLFxuICAgICAgfVxuICAgICk7XG5cbiAgICBjb25zdCBkZXBsb3lSZXN1bHQgPSBhd2FpdCBjYW5hcnlTdGFjay5kZXBsb3koKTtcbiAgICBjb25zdCB0YXJnZXRHcm91cHMgPVxuICAgICAgcGFyYW1zLm5ld1J1bGVDb25maWcuQWN0aW9uc1swXS5Gb3J3YXJkQ29uZmlnLlRhcmdldEdyb3VwcztcbiAgICB0YXJnZXRHcm91cHMuZm9yRWFjaCgodGFyZ2V0R3JvdXA6IGFueSwgaWR4OiBudW1iZXIpID0+IHtcbiAgICAgIGlmICh0YXJnZXRHcm91cC5UYXJnZXRHcm91cEFybiA9PT0gXCJJbnNlcnQgQ2FuYXJ5IFRhcmdldCBBUk5cIikge1xuICAgICAgICB0YXJnZXRHcm91cHNbaWR4XS5UYXJnZXRHcm91cEFybiA9XG4gICAgICAgICAgZGVwbG95UmVzdWx0Lm91dHB1dHMuQ2FuYXJ5VGFyZ2V0R3JvdXBBcm47XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zdCBjcmVhdGVSdWxlUmVzcG9uc2UgPSBhd2FpdCBhd3NDZm4uY3JlYXRlTGlzdGVuZXJSdWxlKFxuICAgICAgcGFyYW1zLm5ld1J1bGVDb25maWdcbiAgICApO1xuXG4gICAgY29uc29sZS5sb2coZGVwbG95UmVzdWx0KTtcbiAgICBjb25zdCBkZXBsb3lSZXNwb25zZSA9IHtcbiAgICAgIC4uLmRlcGxveVJlc3VsdCxcbiAgICAgIHN0YWNrQXJ0aWZhY3Q6IFtdLFxuICAgICAgY3JlYXRlUnVsZVJlc3BvbnNlLFxuICAgIH07XG4gICAgcmVzLmpzb24oZGVwbG95UmVzcG9uc2UpO1xuICAgIC8vIFRPRE86IEFkZCBwcm9wZXIgZXJyb3IgaGFuZGxpbmdcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgcmVzLnN0YXR1cyg0MDApO1xuICAgIHJlcy5qc29uKFwiZGVwbG95bWVudCBmYWlsZWRcIik7XG4gIH1cbn0pO1xuXG5yb3V0ZXIucHV0KFwiL2Rlc3Ryb3ktY2FuYXJ5XCIsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IHN0YWNrQXJuLCBzdGFja05hbWUsIHByb2ZpbGVOYW1lLCBjYW5hcnlSdWxlQXJuIH0gPSByZXEuYm9keTtcbiAgYXdhaXQgYXdzQ2ZuLmNsaWVudHNJbml0KHByb2ZpbGVOYW1lKTtcbiAgdHJ5IHtcbiAgICBjb25zdCBkZWxldGVSdWxlUmVzID0gYXdhaXQgYXdzQ2ZuLmRlbGV0ZUxpc3RlbmVyUnVsZShjYW5hcnlSdWxlQXJuKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgcmVzLnNlbmQoZXJyb3IpO1xuICB9XG4gIHRyeSB7XG4gICAgY29uc3QgZXhpc3RpbmdDYW5hcnlTdGFjayA9IGF3YWl0IGF3c0Nmbi5mZXRjaFN0YWNrVGVtcGxhdGUoc3RhY2tBcm4pO1xuICAgIGNvbnN0IHN0YWNrQ29uZmlnID0ge1xuICAgICAgcHJvZmlsZU5hbWUsXG4gICAgICBzdGFja0FybixcbiAgICAgIHRlbXBsYXRlOiBleGlzdGluZ0NhbmFyeVN0YWNrLFxuICAgIH07XG5cbiAgICBjb25zdCBhcHAgPSBuZXcgY2RrLkFwcCgpO1xuICAgIGNvbnN0IGV4aXN0aW5nQ2FuYXJ5SW5mcmEgPSBuZXcgRXhpc3RpbmdTdGFjayhhcHAsIHN0YWNrTmFtZSwgc3RhY2tDb25maWcsIHtcbiAgICAgIGVudjogYXdzQ2ZuLmdldEVudigpLFxuICAgIH0pO1xuICAgIGNvbnN0IGRlc3Ryb3lSZXN1bHQgPSBhd2FpdCBleGlzdGluZ0NhbmFyeUluZnJhLmRlc3Ryb3koKTtcbiAgICByZXMuanNvbihkZXN0cm95UmVzdWx0KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gIH1cbn0pO1xuXG4vLyByb3V0ZXIuZ2V0KFwiL3N0YWNrcy86cHJvZmlsZVwiLCBhc3luYyAocmVxLCByZXMpID0+IHtcbi8vICAgdHJ5IHtcbi8vICAgICBjb25zdCBwcm9maWxlTmFtZSA9IHJlcS5wYXJhbXMucHJvZmlsZTtcbi8vICAgICBhd2FpdCBhd3NDZm4uY2xpZW50c0luaXQocHJvZmlsZU5hbWUpO1xuLy8gICAgIGNvbnN0IGV4aXN0aW5nU3RhY2tzID0gYXdhaXQgYXdzQ2ZuLmZldGNoU3RhY2tzSW5mbygpO1xuLy8gICAgIGF3c0Nmbi5mZXRjaEFjY291bnRJbmZvKHByb2ZpbGVOYW1lKTtcbi8vICAgICByZXMuanNvbihleGlzdGluZ1N0YWNrcyk7XG4vLyAgIH0gY2F0Y2ggKGVycm9yKSB7XG4vLyAgICAgY29uc29sZS5sb2coXCJVbmFibGUgdG8gcHJvY2VzcyBleGlzdGluZyBzdGFja3MgcmVxdWVzdDogXCIsIGVycm9yKTtcbi8vICAgfVxuLy8gfSk7XG5cbm1vZHVsZS5leHBvcnRzID0gcm91dGVyO1xuIl19