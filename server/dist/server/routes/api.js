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
            if (targetGroup.TargetGroupArn === "Insert Baseline Target ARN") {
                targetGroups[idx].TargetGroupArn =
                    deployResult.outputs.BaselineTargetGroupArn;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NlcnZlci9yb3V0ZXMvYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHNEQUE4QjtBQUM5QixNQUFNLE1BQU0sR0FBRyxpQkFBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2hDLDZFQUErRDtBQUMvRCx1RUFBbUU7QUFDbkUsMkVBQXVFO0FBQ3ZFLG1EQUFxQztBQUVyQyxNQUFNLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBQ3pDLE1BQU0sUUFBUSxHQUFHLE1BQU0sTUFBTSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDbEQsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNyQixDQUFDLENBQUMsQ0FBQztBQUVILE1BQU0sQ0FBQyxHQUFHLENBQUMsOEJBQThCLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtJQUM1RCxJQUFJO1FBQ0YsTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDM0MsTUFBTSxNQUFNLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3RDLE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxNQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUM1RCxNQUFNLGlCQUFpQixHQUFHLE1BQU0sTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBRXpELEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxnQkFBZ0IsRUFBRSxpQkFBaUIsRUFBRSxDQUFDLENBQUM7S0FDbkQ7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDcEI7QUFDSCxDQUFDLENBQUMsQ0FBQztBQUVILE1BQU0sQ0FBQyxHQUFH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QUFDLENBQUM7UUFDbkIsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNqQjtJQUNELElBQUk7UUFDRixNQUFNLG1CQUFtQixHQUFHLE1BQU0sTUFBTSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3RFLE1BQU0sV0FBVyxHQUFHO1lBQ2xCLFdBQVc7WUFDWCxRQUFRO1lBQ1IsUUFBUSxFQUFFLG1CQUFtQjtTQUM5QixDQUFDO1FBRUYsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDMUIsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLDhCQUFhLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUU7WUFDekUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUU7U0FDckIsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxhQUFhLEdBQUcsTUFBTSxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUMxRCxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0tBQ3pCO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDZCxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3BCO0FBQ0gsQ0FBQyxDQUFDLENBQUM7QUFFSCx1REFBdUQ7QUFDdkQsVUFBVTtBQUNWLDhDQUE4QztBQUM5Qyw2Q0FBNkM7QUFDN0MsNkRBQTZEO0FBQzdELDRDQUE0QztBQUM1QyxnQ0FBZ0M7QUFDaEMsc0JBQXNCO0FBQ3RCLHlFQUF5RTtBQUN6RSxNQUFNO0FBQ04sTUFBTTtBQUVOLE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGV4cHJlc3MgZnJvbSBcImV4cHJlc3NcIjtcbmNvbnN0IHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKCk7XG5pbXBvcnQgKiBhcyBhd3NDZm4gZnJvbSBcIi4uLy4uL2Nmbl9pbnRlcmZhY2UvbGliL2F3c19jZm5fZGF0YVwiO1xuaW1wb3J0IHsgQ2FuYXJ5U3RhY2sgfSBmcm9tIFwiLi4vLi4vY2ZuX2ludGVyZmFjZS9saWIvY2FuYXJ5X3N0YWNrXCI7XG5pbXBvcnQgeyBFeGlzdGluZ1N0YWNrIH0gZnJvbSBcIi4uLy4uL2Nmbl9pbnRlcmZhY2UvbGliL2V4aXN0aW5nX3N0YWNrXCI7XG5pbXBvcnQgKiBhcyBjZGsgZnJvbSBcIkBhd3MtY2RrL2NvcmVcIjtcblxucm91dGVyLmdldChcIi9wcm9maWxlc1wiLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgYWNjb3VudHMgPSBhd2FpdCBhd3NDZm4uZmV0Y2hQcm9maWxlc0luZm8oKTtcbiAgcmVzLmpzb24oYWNjb3VudHMpO1xufSk7XG5cbnJvdXRlci5nZXQoXCIvcmVzb3VyY2VzLWRhdGEvOnByb2ZpbGVOYW1lXCIsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IHByb2ZpbGVOYW1lID0gcmVxLnBhcmFtcy5wcm9maWxlTmFtZTtcbiAgICBhd2FpdCBhd3NDZm4uY2xpZW50c0luaXQocHJvZmlsZU5hbWUpO1xuICAgIGNvbnN0IHByb2ZpbGVSZXNvdXJjZXMgPSBhd2FpdCBhd3NDZm4uZ2V0TG9hZEJhbGFuY2VySW5mbygpO1xuICAgIGNvbnN0IGV4aXN0aW5nU3RhY2tJbmZvID0gYXdhaXQgYXdzQ2ZuLmZldGNoU3RhY2tzSW5mbygpO1xuXG4gICAgcmVzLmpzb24oeyBwcm9maWxlUmVzb3VyY2VzLCBleGlzdGluZ1N0YWNrSW5mbyB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gIH1cbn0pO1xuXG5yb3V0ZXIucHV0KFwiL2RlcGxveS1jYW5hcnlcIiwgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHBhcmFtcyA9IHJlcS5ib2R5O1xuICBjb25zb2xlLmxvZyhwYXJhbXMpO1xuICB0cnkge1xuICAgIGNvbnN0IHZwY0NvbmZpZyA9IGF3YWl0IGF3c0Nmbi5zZXRBelB1YlByaXZTdWJuZXRzKHBhcmFtcy52cGNJZCk7XG4gICAgY29uc3Qgc3RhY2tDb25maWcgPSB7XG4gICAgICBwcm9maWxlTmFtZTogcGFyYW1zLnByb2ZpbGVOYW1lLFxuICAgICAgdnBjQ29uZmlnLFxuICAgICAgc2VsZWN0ZWRBbGJOYW1lOiBwYXJhbXMuc2VsZWN0ZWRBbGJOYW1lLFxuICAgICAgc2VsZWN0ZWRMaXN0ZW5lckFybjogcGFyYW1zLnNlbGVjdGVkTGlzdGVuZXJBcm4sXG4gICAgICBzZWN1cml0eUdyb3VwSWRzOiBwYXJhbXMuc2VjdXJpdHlHcm91cElkcyxcbiAgICB9O1xuXG4gICAgY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcbiAgICBjb25zdCBjYW5hcnlTdGFjayA9IG5ldyBDYW5hcnlTdGFjayhcbiAgICAgIGFwcCxcbiAgICAgIGBhcmlhLWNhbmFyeS0ke3BhcmFtcy5zZWxlY3RlZEFsYk5hbWV9YCxcbiAgICAgIHN0YWNrQ29uZmlnLFxuICAgICAge1xuICAgICAgICBlbnY6IGF3c0Nmbi5nZXRFbnYoKSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgY29uc3QgZGVwbG95UmVzdWx0ID0gYXdhaXQgY2FuYXJ5U3RhY2suZGVwbG95KCk7XG4gICAgY29uc3QgdGFyZ2V0R3JvdXBzID1cbiAgICAgIHBhcmFtcy5uZXdSdWxlQ29uZmlnLkFjdGlvbnNbMF0uRm9yd2FyZENvbmZpZy5UYXJnZXRHcm91cHM7XG4gICAgXG4gICAgdGFyZ2V0R3JvdXBzLmZvckVhY2goKHRhcmdldEdyb3VwOiBhbnksIGlkeDogbnVtYmVyKSA9PiB7XG4gICAgICBpZiAodGFyZ2V0R3JvdXAuVGFyZ2V0R3JvdXBBcm4gPT09IFwiSW5zZXJ0IENhbmFyeSBUYXJnZXQgQVJOXCIpIHtcbiAgICAgICAgdGFyZ2V0R3JvdXBzW2lkeF0uVGFyZ2V0R3JvdXBBcm4gPVxuICAgICAgICAgIGRlcGxveVJlc3VsdC5vdXRwdXRzLkNhbmFyeVRhcmdldEdyb3VwQXJuO1xuICAgICAgfVxuICAgICAgaWYgKHRhcmdldEdyb3VwLlRhcmdldEdyb3VwQXJuID09PSBcIkluc2VydCBCYXNlbGluZSBUYXJnZXQgQVJOXCIpIHtcbiAgICAgICAgdGFyZ2V0R3JvdXBzW2lkeF0uVGFyZ2V0R3JvdXBBcm4gPVxuICAgICAgICBkZXBsb3lSZXN1bHQub3V0cHV0cy5CYXNlbGluZVRhcmdldEdyb3VwQXJuO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgY29uc3QgY3JlYXRlUnVsZVJlc3BvbnNlID0gYXdhaXQgYXdzQ2ZuLmNyZWF0ZUxpc3RlbmVyUnVsZShcbiAgICAgIHBhcmFtcy5uZXdSdWxlQ29uZmlnXG4gICAgKTtcblxuICAgIGNvbnNvbGUubG9nKGRlcGxveVJlc3VsdCk7XG4gICAgY29uc3QgZGVwbG95UmVzcG9uc2UgPSB7XG4gICAgICAuLi5kZXBsb3lSZXN1bHQsXG4gICAgICBzdGFja0FydGlmYWN0OiBbXSxcbiAgICAgIGNyZWF0ZVJ1bGVSZXNwb25zZSxcbiAgICB9O1xuICAgIHJlcy5qc29uKGRlcGxveVJlc3BvbnNlKTtcbiAgICAvLyBUT0RPOiBBZGQgcHJvcGVyIGVycm9yIGhhbmRsaW5nXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgIHJlcy5zdGF0dXMoNDAwKTtcbiAgICByZXMuanNvbihcImRlcGxveW1lbnQgZmFpbGVkXCIpO1xuICB9XG59KTtcblxucm91dGVyLnB1dChcIi9kZXN0cm95LWNhbmFyeVwiLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBzdGFja0Fybiwgc3RhY2tOYW1lLCBwcm9maWxlTmFtZSwgY2FuYXJ5UnVsZUFybiB9ID0gcmVxLmJvZHk7XG4gIGF3YWl0IGF3c0Nmbi5jbGllbnRzSW5pdChwcm9maWxlTmFtZSk7XG4gIHRyeSB7XG4gICAgY29uc3QgZGVsZXRlUnVsZVJlcyA9IGF3YWl0IGF3c0Nmbi5kZWxldGVMaXN0ZW5lclJ1bGUoY2FuYXJ5UnVsZUFybik7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgIHJlcy5zZW5kKGVycm9yKTtcbiAgfVxuICB0cnkge1xuICAgIGNvbnN0IGV4aXN0aW5nQ2FuYXJ5U3RhY2sgPSBhd2FpdCBhd3NDZm4uZmV0Y2hTdGFja1RlbXBsYXRlKHN0YWNrQXJuKTtcbiAgICBjb25zdCBzdGFja0NvbmZpZyA9IHtcbiAgICAgIHByb2ZpbGVOYW1lLFxuICAgICAgc3RhY2tBcm4sXG4gICAgICB0ZW1wbGF0ZTogZXhpc3RpbmdDYW5hcnlTdGFjayxcbiAgICB9O1xuXG4gICAgY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcbiAgICBjb25zdCBleGlzdGluZ0NhbmFyeUluZnJhID0gbmV3IEV4aXN0aW5nU3RhY2soYXBwLCBzdGFja05hbWUsIHN0YWNrQ29uZmlnLCB7XG4gICAgICBlbnY6IGF3c0Nmbi5nZXRFbnYoKSxcbiAgICB9KTtcbiAgICBjb25zdCBkZXN0cm95UmVzdWx0ID0gYXdhaXQgZXhpc3RpbmdDYW5hcnlJbmZyYS5kZXN0cm95KCk7XG4gICAgcmVzLmpzb24oZGVzdHJveVJlc3VsdCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5sb2coZXJyb3IpO1xuICB9XG59KTtcblxuLy8gcm91dGVyLmdldChcIi9zdGFja3MvOnByb2ZpbGVcIiwgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4vLyAgIHRyeSB7XG4vLyAgICAgY29uc3QgcHJvZmlsZU5hbWUgPSByZXEucGFyYW1zLnByb2ZpbGU7XG4vLyAgICAgYXdhaXQgYXdzQ2ZuLmNsaWVudHNJbml0KHByb2ZpbGVOYW1lKTtcbi8vICAgICBjb25zdCBleGlzdGluZ1N0YWNrcyA9IGF3YWl0IGF3c0Nmbi5mZXRjaFN0YWNrc0luZm8oKTtcbi8vICAgICBhd3NDZm4uZmV0Y2hBY2NvdW50SW5mbyhwcm9maWxlTmFtZSk7XG4vLyAgICAgcmVzLmpzb24oZXhpc3RpbmdTdGFja3MpO1xuLy8gICB9IGNhdGNoIChlcnJvcikge1xuLy8gICAgIGNvbnNvbGUubG9nKFwiVW5hYmxlIHRvIHByb2Nlc3MgZXhpc3Rpbmcgc3RhY2tzIHJlcXVlc3Q6IFwiLCBlcnJvcik7XG4vLyAgIH1cbi8vIH0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJvdXRlcjtcbiJdfQ==