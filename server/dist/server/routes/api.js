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
const demo_production_stack_1 = require("../../cfn_interface/lib/demo_production_stack");
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
router.post("/deploy-demo-production", async (req, res) => {
    const stackConfig = req.body;
    try {
        const app = new cdk.App();
        stackConfig.env = awsCfn.getEnv();
        // use profile name to set region/account?
        console.log('stackConfig in api route: ', stackConfig);
        const demoProductionStack = new demo_production_stack_1.CdkDemoProductionStack(app, 'aria-demo-production-stack', stackConfig, stackConfig.env);
        const deployResult = await demoProductionStack.deploy();
        console.log(deployResult);
        res.json(deployResult);
        //     stackConfig.vpcConfig = await awsCfn.setAzPubPrivSubnets(stackConfig.vpcId);
        //     stackConfig.env = awsCfn.getEnv();
        // 
        //     const app = new cdk.App();
        //     const canaryStack = new CanaryStack(
        //       app,
        //       `aria-canary-${stackConfig.selectedAlbName}`,
        //       stackConfig,
        //       stackConfig.env
        //     );
        // 
        //     const deployResult = await canaryStack.deploy();
        //     const targetGroups =
        //       stackConfig.newRuleConfig.Actions[0].ForwardConfig.TargetGroups;
        // 
        //     targetGroups.forEach((targetGroup: any, idx: number) => {
        //       if (targetGroup.TargetGroupArn === "Insert Canary Target ARN") {
        //         targetGroups[idx].TargetGroupArn =
        //           deployResult.outputs.CanaryTargetGroupArn;
        //       }
        //       if (targetGroup.TargetGroupArn === "Insert Baseline Target ARN") {
        //         targetGroups[idx].TargetGroupArn =
        //           deployResult.outputs.BaselineTargetGroupArn;
        //       }
        //     });
        // 
        //     const createRuleResponse = await awsCfn.createListenerRule(
        //       stackConfig.newRuleConfig
        //     );
        // 
        //     console.log(deployResult);
        //     const deployResponse = {
        //       ...deployResult,
        //       stackArtifact: [],
        //       createRuleResponse,
        //     };
        //     res.json(deployResponse);
        //     TODO: Add proper error handling
    }
    catch (error) {
        console.log(error);
        res.status(400);
        res.json("demo production deployment fail");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NlcnZlci9yb3V0ZXMvYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHNEQUE4QjtBQUM5QixNQUFNLE1BQU0sR0FBRyxpQkFBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2hDLDZFQUErRDtBQUMvRCx1RUFBbUU7QUFDbkUsMkVBQXVFO0FBQ3ZFLHlGQUF1RjtBQUN2RixtREFBcUM7QUFFckMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtJQUN6QyxNQUFNLFFBQVEsR0FBRyxNQUFNLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQ2xELEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDckIsQ0FBQyxDQUFDLENBQUM7QUFFSCxNQUFNLENBQUMsR0FBRyxDQUFDLDhCQUE4QixFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7SUFDNUQsSUFBSTtRQUNGLE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQzNDLE1BQU0sTUFBTSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN0QyxNQUFNLGdCQUFnQixHQUFHLE1BQU0sTUFBTSxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFDNUQsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLE1BQU0sQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUV6RCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO0tBQ25EO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDZCxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3BCO0FBQ0gsQ0FBQyxDQUFDLENBQUM7QUFFSCxN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LENBQUM7QUFFSCx1REFBdUQ7QUFDdkQsVUFBVTtBQUNWLDhDQUE4QztBQUM5Qyw2Q0FBNkM7QUFDN0MsNkRBQTZEO0FBQzdELDRDQUE0QztBQUM1QyxnQ0FBZ0M7QUFDaEMsc0JBQXNCO0FBQ3RCLHlFQUF5RTtBQUN6RSxNQUFNO0FBQ04sTUFBTTtBQUVOLE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGV4cHJlc3MgZnJvbSBcImV4cHJlc3NcIjtcbmNvbnN0IHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKCk7XG5pbXBvcnQgKiBhcyBhd3NDZm4gZnJvbSBcIi4uLy4uL2Nmbl9pbnRlcmZhY2UvbGliL2F3c19jZm5fZGF0YVwiO1xuaW1wb3J0IHsgQ2FuYXJ5U3RhY2sgfSBmcm9tIFwiLi4vLi4vY2ZuX2ludGVyZmFjZS9saWIvY2FuYXJ5X3N0YWNrXCI7XG5pbXBvcnQgeyBFeGlzdGluZ1N0YWNrIH0gZnJvbSBcIi4uLy4uL2Nmbl9pbnRlcmZhY2UvbGliL2V4aXN0aW5nX3N0YWNrXCI7XG5pbXBvcnQgeyBDZGtEZW1vUHJvZHVjdGlvblN0YWNrIH0gZnJvbSBcIi4uLy4uL2Nmbl9pbnRlcmZhY2UvbGliL2RlbW9fcHJvZHVjdGlvbl9zdGFja1wiO1xuaW1wb3J0ICogYXMgY2RrIGZyb20gXCJAYXdzLWNkay9jb3JlXCI7XG5cbnJvdXRlci5nZXQoXCIvcHJvZmlsZXNcIiwgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGFjY291bnRzID0gYXdhaXQgYXdzQ2ZuLmZldGNoUHJvZmlsZXNJbmZvKCk7XG4gIHJlcy5qc29uKGFjY291bnRzKTtcbn0pO1xuXG5yb3V0ZXIuZ2V0KFwiL3Jlc291cmNlcy1kYXRhLzpwcm9maWxlTmFtZVwiLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBwcm9maWxlTmFtZSA9IHJlcS5wYXJhbXMucHJvZmlsZU5hbWU7XG4gICAgYXdhaXQgYXdzQ2ZuLmNsaWVudHNJbml0KHByb2ZpbGVOYW1lKTtcbiAgICBjb25zdCBwcm9maWxlUmVzb3VyY2VzID0gYXdhaXQgYXdzQ2ZuLmdldExvYWRCYWxhbmNlckluZm8oKTtcbiAgICBjb25zdCBleGlzdGluZ1N0YWNrSW5mbyA9IGF3YWl0IGF3c0Nmbi5mZXRjaFN0YWNrc0luZm8oKTtcblxuICAgIHJlcy5qc29uKHsgcHJvZmlsZVJlc291cmNlcywgZXhpc3RpbmdTdGFja0luZm8gfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5sb2coZXJyb3IpO1xuICB9XG59KTtcblxucm91dGVyLmdldChcIi90ZXN0Lzp2cGNpZFwiLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhd3NDZm4uc2V0QXpQdWJQcml2U3VibmV0cyhyZXEucGFyYW1zLnZwY2lkKTtcbiAgcmVzLmpzb24ocmVzcG9uc2UpO1xufSk7XG5cbnJvdXRlci5wdXQoXCIvZGVwbG95LWNhbmFyeVwiLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgY29uc3Qgc3RhY2tDb25maWcgPSByZXEuYm9keTtcbiAgdHJ5IHtcbiAgICBzdGFja0NvbmZpZy52cGNDb25maWcgPSBhd2FpdCBhd3NDZm4uc2V0QXpQdWJQcml2U3VibmV0cyhzdGFja0NvbmZpZy52cGNJZCk7XG4gICAgc3RhY2tDb25maWcuZW52ID0gYXdzQ2ZuLmdldEVudigpO1xuXG4gICAgY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcbiAgICBjb25zdCBjYW5hcnlTdGFjayA9IG5ldyBDYW5hcnlTdGFjayhcbiAgICAgIGFwcCxcbiAgICAgIGBhcmlhLWNhbmFyeS0ke3N0YWNrQ29uZmlnLnNlbGVjdGVkQWxiTmFtZX1gLFxuICAgICAgc3RhY2tDb25maWcsXG4gICAgICBzdGFja0NvbmZpZy5lbnZcbiAgICApO1xuXG4gICAgY29uc3QgZGVwbG95UmVzdWx0ID0gYXdhaXQgY2FuYXJ5U3RhY2suZGVwbG95KCk7XG4gICAgY29uc3QgdGFyZ2V0R3JvdXBzID1cbiAgICAgIHN0YWNrQ29uZmlnLm5ld1J1bGVDb25maWcuQWN0aW9uc1swXS5Gb3J3YXJkQ29uZmlnLlRhcmdldEdyb3VwcztcblxuICAgIHRhcmdldEdyb3Vwcy5mb3JFYWNoKCh0YXJnZXRHcm91cDogYW55LCBpZHg6IG51bWJlcikgPT4ge1xuICAgICAgaWYgKHRhcmdldEdyb3VwLlRhcmdldEdyb3VwQXJuID09PSBcIkluc2VydCBDYW5hcnkgVGFyZ2V0IEFSTlwiKSB7XG4gICAgICAgIHRhcmdldEdyb3Vwc1tpZHhdLlRhcmdldEdyb3VwQXJuID1cbiAgICAgICAgICBkZXBsb3lSZXN1bHQub3V0cHV0cy5DYW5hcnlUYXJnZXRHcm91cEFybjtcbiAgICAgIH1cbiAgICAgIGlmICh0YXJnZXRHcm91cC5UYXJnZXRHcm91cEFybiA9PT0gXCJJbnNlcnQgQmFzZWxpbmUgVGFyZ2V0IEFSTlwiKSB7XG4gICAgICAgIHRhcmdldEdyb3Vwc1tpZHhdLlRhcmdldEdyb3VwQXJuID1cbiAgICAgICAgICBkZXBsb3lSZXN1bHQub3V0cHV0cy5CYXNlbGluZVRhcmdldEdyb3VwQXJuO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgY29uc3QgY3JlYXRlUnVsZVJlc3BvbnNlID0gYXdhaXQgYXdzQ2ZuLmNyZWF0ZUxpc3RlbmVyUnVsZShcbiAgICAgIHN0YWNrQ29uZmlnLm5ld1J1bGVDb25maWdcbiAgICApO1xuXG4gICAgY29uc29sZS5sb2coZGVwbG95UmVzdWx0KTtcbiAgICBjb25zdCBkZXBsb3lSZXNwb25zZSA9IHtcbiAgICAgIC4uLmRlcGxveVJlc3VsdCxcbiAgICAgIHN0YWNrQXJ0aWZhY3Q6IFtdLFxuICAgICAgY3JlYXRlUnVsZVJlc3BvbnNlLFxuICAgIH07XG4gICAgcmVzLmpzb24oZGVwbG95UmVzcG9uc2UpO1xuICAgIC8vIFRPRE86IEFkZCBwcm9wZXIgZXJyb3IgaGFuZGxpbmdcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgcmVzLnN0YXR1cyg0MDApO1xuICAgIHJlcy5qc29uKFwiZGVwbG95bWVudCBmYWlsXCIpO1xuICB9XG59KTtcblxucm91dGVyLnBvc3QoXCIvZGVwbG95LWRlbW8tcHJvZHVjdGlvblwiLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgY29uc3Qgc3RhY2tDb25maWcgPSByZXEuYm9keTtcbiAgdHJ5IHsgXG4gICAgY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcbiAgICBzdGFja0NvbmZpZy5lbnYgPSBhd3NDZm4uZ2V0RW52KCk7XG4gICAgLy8gdXNlIHByb2ZpbGUgbmFtZSB0byBzZXQgcmVnaW9uL2FjY291bnQ/XG4gICAgY29uc29sZS5sb2coJ3N0YWNrQ29uZmlnIGluIGFwaSByb3V0ZTogJywgc3RhY2tDb25maWcpO1xuICAgIGNvbnN0IGRlbW9Qcm9kdWN0aW9uU3RhY2sgPSBuZXcgQ2RrRGVtb1Byb2R1Y3Rpb25TdGFjayhcbiAgICAgIGFwcCwgXG4gICAgICAnYXJpYS1kZW1vLXByb2R1Y3Rpb24tc3RhY2snLFxuICAgICAgc3RhY2tDb25maWcsXG4gICAgICBzdGFja0NvbmZpZy5lbnYsXG4vLyAgICAgICBzdGFja05hbWU6ICdhcmlhLWRlbW8tcHJvZHVjdGlvbi1zdGFjaycsXG4vLyAgICAgICBlbnY6IHtcbi8vICAgICAgICAgcmVnaW9uOiBwcm9jZXNzLmVudi5DREtfREVGQVVMVF9SRUdJT04sXG4vLyAgICAgICAgIGFjY291bnQ6IHByb2Nlc3MuZW52LkNES19ERUZBVUxUX0FDQ09VTlQsXG4vLyAgICAgICB9LFxuICAgICk7XG4gICAgY29uc3QgZGVwbG95UmVzdWx0ID0gYXdhaXQgZGVtb1Byb2R1Y3Rpb25TdGFjay5kZXBsb3koKTtcbiAgICBjb25zb2xlLmxvZyhkZXBsb3lSZXN1bHQpO1xuICAgIHJlcy5qc29uKGRlcGxveVJlc3VsdCk7XG4gICAgXG4vLyAgICAgc3RhY2tDb25maWcudnBjQ29uZmlnID0gYXdhaXQgYXdzQ2ZuLnNldEF6UHViUHJpdlN1Ym5ldHMoc3RhY2tDb25maWcudnBjSWQpO1xuLy8gICAgIHN0YWNrQ29uZmlnLmVudiA9IGF3c0Nmbi5nZXRFbnYoKTtcbi8vIFxuLy8gICAgIGNvbnN0IGFwcCA9IG5ldyBjZGsuQXBwKCk7XG4vLyAgICAgY29uc3QgY2FuYXJ5U3RhY2sgPSBuZXcgQ2FuYXJ5U3RhY2soXG4vLyAgICAgICBhcHAsXG4vLyAgICAgICBgYXJpYS1jYW5hcnktJHtzdGFja0NvbmZpZy5zZWxlY3RlZEFsYk5hbWV9YCxcbi8vICAgICAgIHN0YWNrQ29uZmlnLFxuLy8gICAgICAgc3RhY2tDb25maWcuZW52XG4vLyAgICAgKTtcbi8vIFxuLy8gICAgIGNvbnN0IGRlcGxveVJlc3VsdCA9IGF3YWl0IGNhbmFyeVN0YWNrLmRlcGxveSgpO1xuLy8gICAgIGNvbnN0IHRhcmdldEdyb3VwcyA9XG4vLyAgICAgICBzdGFja0NvbmZpZy5uZXdSdWxlQ29uZmlnLkFjdGlvbnNbMF0uRm9yd2FyZENvbmZpZy5UYXJnZXRHcm91cHM7XG4vLyBcbi8vICAgICB0YXJnZXRHcm91cHMuZm9yRWFjaCgodGFyZ2V0R3JvdXA6IGFueSwgaWR4OiBudW1iZXIpID0+IHtcbi8vICAgICAgIGlmICh0YXJnZXRHcm91cC5UYXJnZXRHcm91cEFybiA9PT0gXCJJbnNlcnQgQ2FuYXJ5IFRhcmdldCBBUk5cIikge1xuLy8gICAgICAgICB0YXJnZXRHcm91cHNbaWR4XS5UYXJnZXRHcm91cEFybiA9XG4vLyAgICAgICAgICAgZGVwbG95UmVzdWx0Lm91dHB1dHMuQ2FuYXJ5VGFyZ2V0R3JvdXBBcm47XG4vLyAgICAgICB9XG4vLyAgICAgICBpZiAodGFyZ2V0R3JvdXAuVGFyZ2V0R3JvdXBBcm4gPT09IFwiSW5zZXJ0IEJhc2VsaW5lIFRhcmdldCBBUk5cIikge1xuLy8gICAgICAgICB0YXJnZXRHcm91cHNbaWR4XS5UYXJnZXRHcm91cEFybiA9XG4vLyAgICAgICAgICAgZGVwbG95UmVzdWx0Lm91dHB1dHMuQmFzZWxpbmVUYXJnZXRHcm91cEFybjtcbi8vICAgICAgIH1cbi8vICAgICB9KTtcbi8vIFxuLy8gICAgIGNvbnN0IGNyZWF0ZVJ1bGVSZXNwb25zZSA9IGF3YWl0IGF3c0Nmbi5jcmVhdGVMaXN0ZW5lclJ1bGUoXG4vLyAgICAgICBzdGFja0NvbmZpZy5uZXdSdWxlQ29uZmlnXG4vLyAgICAgKTtcbi8vIFxuLy8gICAgIGNvbnNvbGUubG9nKGRlcGxveVJlc3VsdCk7XG4vLyAgICAgY29uc3QgZGVwbG95UmVzcG9uc2UgPSB7XG4vLyAgICAgICAuLi5kZXBsb3lSZXN1bHQsXG4vLyAgICAgICBzdGFja0FydGlmYWN0OiBbXSxcbi8vICAgICAgIGNyZWF0ZVJ1bGVSZXNwb25zZSxcbi8vICAgICB9O1xuLy8gICAgIHJlcy5qc29uKGRlcGxveVJlc3BvbnNlKTtcbi8vICAgICBUT0RPOiBBZGQgcHJvcGVyIGVycm9yIGhhbmRsaW5nXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgIHJlcy5zdGF0dXMoNDAwKTtcbiAgICByZXMuanNvbihcImRlbW8gcHJvZHVjdGlvbiBkZXBsb3ltZW50IGZhaWxcIik7XG4gIH1cbn0pO1xuXG5yb3V0ZXIucHV0KFwiL2Rlc3Ryb3ktY2FuYXJ5XCIsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IHN0YWNrQXJuLCBzdGFja05hbWUsIHByb2ZpbGVOYW1lLCBjYW5hcnlSdWxlQXJuIH0gPSByZXEuYm9keTtcbiAgYXdhaXQgYXdzQ2ZuLmNsaWVudHNJbml0KHByb2ZpbGVOYW1lKTtcbiAgY29uc29sZS5sb2coY2FuYXJ5UnVsZUFybik7XG4gIHRyeSB7XG4gICAgY29uc3QgZGVsZXRlUnVsZVJlcyA9IGF3YWl0IGF3c0Nmbi5kZWxldGVMaXN0ZW5lclJ1bGUoY2FuYXJ5UnVsZUFybik7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgIHJlcy5zZW5kKGVycm9yKTtcbiAgfVxuICB0cnkge1xuICAgIGNvbnN0IGV4aXN0aW5nQ2FuYXJ5U3RhY2sgPSBhd2FpdCBhd3NDZm4uZmV0Y2hTdGFja1RlbXBsYXRlKHN0YWNrQXJuKTtcbiAgICBjb25zdCBzdGFja0NvbmZpZyA9IHtcbiAgICAgIHByb2ZpbGVOYW1lLFxuICAgICAgc3RhY2tBcm4sXG4gICAgICB0ZW1wbGF0ZTogZXhpc3RpbmdDYW5hcnlTdGFjayxcbiAgICB9O1xuXG4gICAgY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcbiAgICBjb25zdCBleGlzdGluZ0NhbmFyeUluZnJhID0gbmV3IEV4aXN0aW5nU3RhY2soYXBwLCBzdGFja05hbWUsIHN0YWNrQ29uZmlnLCB7XG4gICAgICBlbnY6IGF3c0Nmbi5nZXRFbnYoKSxcbiAgICB9KTtcbiAgICBjb25zdCBkZXN0cm95UmVzdWx0ID0gYXdhaXQgZXhpc3RpbmdDYW5hcnlJbmZyYS5kZXN0cm95KCk7XG4gICAgcmVzLmpzb24oZGVzdHJveVJlc3VsdCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5sb2coZXJyb3IpO1xuICB9XG59KTtcblxuLy8gcm91dGVyLmdldChcIi9zdGFja3MvOnByb2ZpbGVcIiwgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4vLyAgIHRyeSB7XG4vLyAgICAgY29uc3QgcHJvZmlsZU5hbWUgPSByZXEucGFyYW1zLnByb2ZpbGU7XG4vLyAgICAgYXdhaXQgYXdzQ2ZuLmNsaWVudHNJbml0KHByb2ZpbGVOYW1lKTtcbi8vICAgICBjb25zdCBleGlzdGluZ1N0YWNrcyA9IGF3YWl0IGF3c0Nmbi5mZXRjaFN0YWNrc0luZm8oKTtcbi8vICAgICBhd3NDZm4uZmV0Y2hBY2NvdW50SW5mbyhwcm9maWxlTmFtZSk7XG4vLyAgICAgcmVzLmpzb24oZXhpc3RpbmdTdGFja3MpO1xuLy8gICB9IGNhdGNoIChlcnJvcikge1xuLy8gICAgIGNvbnNvbGUubG9nKFwiVW5hYmxlIHRvIHByb2Nlc3MgZXhpc3Rpbmcgc3RhY2tzIHJlcXVlc3Q6IFwiLCBlcnJvcik7XG4vLyAgIH1cbi8vIH0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJvdXRlcjtcbiJdfQ==