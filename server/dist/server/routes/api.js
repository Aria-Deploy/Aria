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
        const profileVpcs = await awsCfn.getVpcsInfo();
        const vpcEinResources = await awsCfn.getLoadBalancerInfo();
        res.json(vpcEinResources);
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
            selectedAlbArn: params.selectedAlbArn,
            securityGroupIds: params.securityGroupIds,
        };
        //   // TODO: fetch account & regions from somewhere
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
    const { stackId, stackName, profileName } = req.body;
    try {
        const existingCanaryStack = await awsCfn.fetchStackTemplate(stackId);
        const stackConfig = {
            profileName,
            stackId,
            template: existingCanaryStack,
        };
        const app = new cdk.App();
        const existingCanaryInfra = new existing_stack_1.ExistingStack(app, stackName, stackConfig, {
            env: awsCfn.getEnv(),
        });
        const deployResult = await existingCanaryInfra.destroy();
        res.json(deployResult);
    }
    catch (error) {
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
    }
    catch (error) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NlcnZlci9yb3V0ZXMvYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHNEQUE4QjtBQUM5QixNQUFNLE1BQU0sR0FBRyxpQkFBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2hDLDZFQUErRDtBQUMvRCx1RUFBbUU7QUFDbkUsMkVBQXVFO0FBQ3ZFLG1EQUFxQztBQUVyQyxNQUFNLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBQ3pDLE1BQU0sUUFBUSxHQUFHLE1BQU0sTUFBTSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDbEQsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNyQixDQUFDLENBQUMsQ0FBQztBQUVILE1BQU0sQ0FBQyxHQUFHLENBQUMsOEJBQThCLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtJQUM1RCxJQUFJO1FBQ0YsTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDM0MsTUFBTSxNQUFNLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3RDLE1BQU0sV0FBVyxHQUFHLE1BQU0sTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQy9DLE1BQU0sZUFBZSxHQUFHLE1BQU0sTUFBTSxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFFM0QsR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztLQUMzQjtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ2QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNwQjtBQUNILENBQUMsQ0FBQyxDQUFDO0FBRUgsTUFBTSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUs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QUFNLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZXhwcmVzcyBmcm9tIFwiZXhwcmVzc1wiO1xuY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKTtcbmltcG9ydCAqIGFzIGF3c0NmbiBmcm9tIFwiLi4vLi4vY2ZuX2ludGVyZmFjZS9saWIvYXdzX2Nmbl9kYXRhXCI7XG5pbXBvcnQgeyBDYW5hcnlTdGFjayB9IGZyb20gXCIuLi8uLi9jZm5faW50ZXJmYWNlL2xpYi9jYW5hcnlfc3RhY2tcIjtcbmltcG9ydCB7IEV4aXN0aW5nU3RhY2sgfSBmcm9tIFwiLi4vLi4vY2ZuX2ludGVyZmFjZS9saWIvZXhpc3Rpbmdfc3RhY2tcIjtcbmltcG9ydCAqIGFzIGNkayBmcm9tIFwiQGF3cy1jZGsvY29yZVwiO1xuXG5yb3V0ZXIuZ2V0KFwiL3Byb2ZpbGVzXCIsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBhY2NvdW50cyA9IGF3YWl0IGF3c0Nmbi5mZXRjaFByb2ZpbGVzSW5mbygpO1xuICByZXMuanNvbihhY2NvdW50cyk7XG59KTtcblxucm91dGVyLmdldChcIi9yZXNvdXJjZXMtZGF0YS86cHJvZmlsZU5hbWVcIiwgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgcHJvZmlsZU5hbWUgPSByZXEucGFyYW1zLnByb2ZpbGVOYW1lO1xuICAgIGF3YWl0IGF3c0Nmbi5jbGllbnRzSW5pdChwcm9maWxlTmFtZSk7XG4gICAgY29uc3QgcHJvZmlsZVZwY3MgPSBhd2FpdCBhd3NDZm4uZ2V0VnBjc0luZm8oKTtcbiAgICBjb25zdCB2cGNFaW5SZXNvdXJjZXMgPSBhd2FpdCBhd3NDZm4uZ2V0TG9hZEJhbGFuY2VySW5mbygpO1xuXG4gICAgcmVzLmpzb24odnBjRWluUmVzb3VyY2VzKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gIH1cbn0pO1xuXG5yb3V0ZXIucHV0KFwiL2RlcGxveS1jYW5hcnlcIiwgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHBhcmFtcyA9IHJlcS5ib2R5O1xuICBjb25zb2xlLmxvZyhwYXJhbXMpO1xuICB0cnkge1xuICAgIGNvbnN0IHZwY0NvbmZpZyA9IGF3YWl0IGF3c0Nmbi5zZXRBelB1YlByaXZTdWJuZXRzKHBhcmFtcy52cGNJZCk7XG4gICAgY29uc3Qgc3RhY2tDb25maWcgPSB7XG4gICAgICBwcm9maWxlTmFtZTogcGFyYW1zLnByb2ZpbGVOYW1lLFxuICAgICAgdnBjQ29uZmlnLFxuICAgICAgc2VsZWN0ZWRBbGJBcm46IHBhcmFtcy5zZWxlY3RlZEFsYkFybixcbiAgICAgIHNlY3VyaXR5R3JvdXBJZHM6IHBhcmFtcy5zZWN1cml0eUdyb3VwSWRzLFxuICAgIH07XG5cbiAgICAvLyAgIC8vIFRPRE86IGZldGNoIGFjY291bnQgJiByZWdpb25zIGZyb20gc29tZXdoZXJlXG4gICAgY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcbiAgICBjb25zdCBjYW5hcnlTdGFjayA9IG5ldyBDYW5hcnlTdGFjayhcbiAgICAgIGFwcCxcbiAgICAgIGBhcmlhLWNhbmFyeS0ke3BhcmFtcy5zZWxlY3RlZEFsYk5hbWV9YCxcbiAgICAgIHN0YWNrQ29uZmlnLFxuICAgICAge1xuICAgICAgICBlbnY6IGF3c0Nmbi5nZXRFbnYoKSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgY29uc3QgZGVwbG95UmVzdWx0ID0gYXdhaXQgY2FuYXJ5U3RhY2suZGVwbG95KCk7XG4gICAgY29uc3QgdGFyZ2V0R3JvdXBzID1cbiAgICAgIHBhcmFtcy5uZXdSdWxlQ29uZmlnLkFjdGlvbnNbMF0uRm9yd2FyZENvbmZpZy5UYXJnZXRHcm91cHM7XG4gICAgdGFyZ2V0R3JvdXBzLmZvckVhY2goKHRhcmdldEdyb3VwOiBhbnksIGlkeDogbnVtYmVyKSA9PiB7XG4gICAgICBpZiAodGFyZ2V0R3JvdXAuVGFyZ2V0R3JvdXBBcm4gPT09IFwiSW5zZXJ0IENhbmFyeSBUYXJnZXQgQVJOXCIpIHtcbiAgICAgICAgdGFyZ2V0R3JvdXBzW2lkeF0uVGFyZ2V0R3JvdXBBcm4gPVxuICAgICAgICAgIGRlcGxveVJlc3VsdC5vdXRwdXRzLkNhbmFyeVRhcmdldEdyb3VwQXJuO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgY29uc3QgY3JlYXRlUnVsZVJlc3BvbnNlID0gYXdhaXQgYXdzQ2ZuLmNyZWF0ZUxpc3RlbmVyUnVsZShcbiAgICAgIHBhcmFtcy5uZXdSdWxlQ29uZmlnXG4gICAgKTtcblxuICAgIGNvbnNvbGUubG9nKGRlcGxveVJlc3VsdCk7XG4gICAgY29uc3QgZGVwbG95UmVzcG9uc2UgPSB7XG4gICAgICAuLi5kZXBsb3lSZXN1bHQsXG4gICAgICBzdGFja0FydGlmYWN0OiBbXSxcbiAgICAgIGNyZWF0ZVJ1bGVSZXNwb25zZSxcbiAgICB9O1xuICAgIHJlcy5qc29uKGRlcGxveVJlc3BvbnNlKTtcbiAgICAvLyBUT0RPOiBBZGQgcHJvcGVyIGVycm9yIGhhbmRsaW5nXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgIHJlcy5zdGF0dXMoNDAwKTtcbiAgICByZXMuanNvbihcImRlcGxveW1lbnQgZmFpbGVkXCIpO1xuICB9XG59KTtcblxucm91dGVyLnB1dChcIi9kZXN0cm95LWNhbmFyeVwiLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBzdGFja0lkLCBzdGFja05hbWUsIHByb2ZpbGVOYW1lIH0gPSByZXEuYm9keTtcbiAgdHJ5IHtcbiAgICBjb25zdCBleGlzdGluZ0NhbmFyeVN0YWNrID0gYXdhaXQgYXdzQ2ZuLmZldGNoU3RhY2tUZW1wbGF0ZShzdGFja0lkKTtcbiAgICBjb25zdCBzdGFja0NvbmZpZyA9IHtcbiAgICAgIHByb2ZpbGVOYW1lLFxuICAgICAgc3RhY2tJZCxcbiAgICAgIHRlbXBsYXRlOiBleGlzdGluZ0NhbmFyeVN0YWNrLFxuICAgIH07XG5cbiAgICBjb25zdCBhcHAgPSBuZXcgY2RrLkFwcCgpO1xuICAgIGNvbnN0IGV4aXN0aW5nQ2FuYXJ5SW5mcmEgPSBuZXcgRXhpc3RpbmdTdGFjayhhcHAsIHN0YWNrTmFtZSwgc3RhY2tDb25maWcsIHtcbiAgICAgIGVudjogYXdzQ2ZuLmdldEVudigpLFxuICAgIH0pO1xuICAgIGNvbnN0IGRlcGxveVJlc3VsdCA9IGF3YWl0IGV4aXN0aW5nQ2FuYXJ5SW5mcmEuZGVzdHJveSgpO1xuICAgIHJlcy5qc29uKGRlcGxveVJlc3VsdCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5sb2coZXJyb3IpO1xuICB9XG59KTtcblxucm91dGVyLmdldChcIi9zdGFja3MvOnByb2ZpbGVcIiwgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgcHJvZmlsZU5hbWUgPSByZXEucGFyYW1zLnByb2ZpbGU7XG4gICAgYXdhaXQgYXdzQ2ZuLmNsaWVudHNJbml0KHByb2ZpbGVOYW1lKTtcbiAgICBjb25zdCBleGlzdGluZ1N0YWNrcyA9IGF3YWl0IGF3c0Nmbi5mZXRjaFN0YWNrc0luZm8oKTtcbiAgICBhd3NDZm4uZmV0Y2hBY2NvdW50SW5mbyhwcm9maWxlTmFtZSk7XG4gICAgcmVzLmpzb24oZXhpc3RpbmdTdGFja3MpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUubG9nKFwiVW5hYmxlIHRvIHByb2Nlc3MgZXhpc3Rpbmcgc3RhY2tzIHJlcXVlc3Q6IFwiLCBlcnJvcik7XG4gIH1cbn0pO1xuXG4vLyByb3V0ZXIucG9zdChcIi9yZXNvdXJjZXMvXCIsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuLy8gY29uc3QgeyBzdGFja0lkIH0gPSByZXEuYm9keTtcbi8vIHRyeSB7XG4vLyAgIGNvbnN0IHNlbGVjdGVkU3RhY2tUZW1wbGF0ZSA9IGF3YWl0IGF3c0Nmbi5mZXRjaFN0YWNrVGVtcGxhdGUoc3RhY2tJZCk7XG4vLyAgIC8vIFRPRE8gZGVmaW5lIHR5cGUgZm9yIHN0YWNrIHRlbXBsYXRlIEpTT04gZm9ybVxuLy8gICAvLyBAdHMtaWdub3JlXG4vLyAgIGNvbnN0IHN0YWNrUmVzb3VyY2VzID0gc2VsZWN0ZWRTdGFja1RlbXBsYXRlLlJlc291cmNlcztcbi8vICAgY29uc3Qgc3RhY2tWcGNBbGJSZXNvdXJjZXMgPSB7XG4vLyAgICAgdnBjczogW10gYXMgc3RyaW5nW10sXG4vLyAgICAgYWxiczogW10gYXMgc3RyaW5nW10sXG4vLyAgIH07XG5cbi8vICAgT2JqZWN0LmVudHJpZXMoc3RhY2tSZXNvdXJjZXMpLmZvckVhY2goKFtyZXNvdXJjZU5hbWUsIHZhbHVlXSkgPT4ge1xuLy8gICAgIGNvbnN0IHZwY1R5cGUgPSBcIkFXUzo6RUMyOjpWUENcIjtcbi8vICAgICAvLyBAdHMtaWdub3JlXG4vLyAgICAgaWYgKHZhbHVlLlR5cGUgPT09IHZwY1R5cGUpIHN0YWNrVnBjQWxiUmVzb3VyY2VzLnZwY3MucHVzaChyZXNvdXJjZU5hbWUpO1xuXG4vLyAgICAgY29uc3QgYWxiVHlwZSA9IFwiQVdTOjpFbGFzdGljTG9hZEJhbGFuY2luZ1YyOjpMb2FkQmFsYW5jZXJcIjtcbi8vICAgICAvLyBAdHMtaWdub3JlXG4vLyAgICAgaWYgKHZhbHVlLlR5cGUgPT09IGFsYlR5cGUgJiYgcmVzb3VyY2VOYW1lLmluY2x1ZGVzKFwiYWxiXCIpKVxuLy8gICAgICAgc3RhY2tWcGNBbGJSZXNvdXJjZXMuYWxicy5wdXNoKHJlc291cmNlTmFtZSk7XG4vLyAgIH0pO1xuXG4vLyAgIHJlcy5qc29uKHN0YWNrVnBjQWxiUmVzb3VyY2VzKTtcbi8vIH0gY2F0Y2ggKGVycm9yKSB7XG4vLyAgIGNvbnNvbGUubG9nKGVycm9yKTtcbi8vIH1cbi8vIH0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJvdXRlcjtcbiJdfQ==