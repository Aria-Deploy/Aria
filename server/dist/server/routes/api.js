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
router.get("/profiles", async (req, res) => {
    res.contentType("application/json");
    const accounts = await awsCfn.fetchProfilesInfo();
    res.json(accounts);
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
        // TODO: fetch account & regions from somewhere
        const canaryStack = new canary_stack_1.CanaryStack(stackName, stackConfig, {
            env: awsCfn.getEnv(),
        });
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
        const originStackTemplate = JSON.parse(
        // @ts-ignore
        existingStack.Metadata["pre-canary-cfn"]);
        const vpcConfig = await awsCfn.fetchStackVpcConfig(stackId);
        const stackConfig = {
            profileName,
            stackId,
            vpcConfig,
            template: originStackTemplate,
        };
        const originalStack = new existing_stack_1.ExistingStack(stackName, stackConfig, {
            env: awsCfn.getEnv(),
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NlcnZlci9yb3V0ZXMvYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHNEQUE4QjtBQUM5QixNQUFNLE1BQU0sR0FBRyxpQkFBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2hDLDZFQUErRDtBQUMvRCx1RUFBbUU7QUFDbkUsMkVBQXVFO0FBRXZFLE1BQU0sQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7SUFDekMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQ3BDLE1BQU0sUUFBUSxHQUFHLE1BQU0sTUFBTSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDbEQsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNyQixDQUFDLENBQUMsQ0FBQztBQUVILE1BQU0sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtJQUNoRCxJQUFJO1FBQ0YsTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7UUFDdkMsTUFBTSxNQUFNLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3RDLE1BQU0sY0FBYyxHQUFHLE1BQU0sTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3RELE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNyQyxHQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0tBQzFCO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDZCxPQUFPLENBQUMsR0FBRyxDQUFDLDZDQUE2QyxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQ25FO0FBQ0gsQ0FBQyxDQUFDLENBQUM7QUFFSCxNQUFNLENBQUMs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ZnJvbSBcImV4cHJlc3NcIjtcbmNvbnN0IHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKCk7XG5pbXBvcnQgKiBhcyBhd3NDZm4gZnJvbSBcIi4uLy4uL2Nmbl9pbnRlcmZhY2UvbGliL2F3c19jZm5fZGF0YVwiO1xuaW1wb3J0IHsgQ2FuYXJ5U3RhY2sgfSBmcm9tIFwiLi4vLi4vY2ZuX2ludGVyZmFjZS9saWIvY2FuYXJ5X3N0YWNrXCI7XG5pbXBvcnQgeyBFeGlzdGluZ1N0YWNrIH0gZnJvbSBcIi4uLy4uL2Nmbl9pbnRlcmZhY2UvbGliL2V4aXN0aW5nX3N0YWNrXCI7XG5cbnJvdXRlci5nZXQoXCIvcHJvZmlsZXNcIiwgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gIHJlcy5jb250ZW50VHlwZShcImFwcGxpY2F0aW9uL2pzb25cIik7XG4gIGNvbnN0IGFjY291bnRzID0gYXdhaXQgYXdzQ2ZuLmZldGNoUHJvZmlsZXNJbmZvKCk7XG4gIHJlcy5qc29uKGFjY291bnRzKTtcbn0pO1xuXG5yb3V0ZXIuZ2V0KFwiL3N0YWNrcy86cHJvZmlsZVwiLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBwcm9maWxlTmFtZSA9IHJlcS5wYXJhbXMucHJvZmlsZTtcbiAgICBhd2FpdCBhd3NDZm4uY2xpZW50c0luaXQocHJvZmlsZU5hbWUpO1xuICAgIGNvbnN0IGV4aXN0aW5nU3RhY2tzID0gYXdhaXQgYXdzQ2ZuLmZldGNoU3RhY2tzSW5mbygpO1xuICAgIGF3c0Nmbi5mZXRjaEFjY291bnRJbmZvKHByb2ZpbGVOYW1lKTtcbiAgICByZXMuanNvbihleGlzdGluZ1N0YWNrcyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5sb2coXCJVbmFibGUgdG8gcHJvY2VzcyBleGlzdGluZyBzdGFja3MgcmVxdWVzdDogXCIsIGVycm9yKTtcbiAgfVxufSk7XG5cbnJvdXRlci5wdXQoXCIvZGVwbG95LWNhbmFyeVwiLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBwcm9maWxlTmFtZSwgc3RhY2tJZCwgc3RhY2tOYW1lIH0gPSByZXEuYm9keTtcbiAgdHJ5IHtcbiAgICBjb25zdCBzZWxlY3RlZFN0YWNrVGVtcGxhdGUgPSBhd2FpdCBhd3NDZm4uZmV0Y2hTdGFja1RlbXBsYXRlKHN0YWNrSWQpO1xuICAgIGNvbnN0IHZwY0NvbmZpZyA9IGF3YWl0IGF3c0Nmbi5mZXRjaFN0YWNrVnBjQ29uZmlnKHN0YWNrSWQpO1xuICAgIGNvbnN0IHN0YWNrQ29uZmlnID0ge1xuICAgICAgcHJvZmlsZU5hbWUsXG4gICAgICBzdGFja0lkLFxuICAgICAgdnBjQ29uZmlnLFxuICAgICAgdGVtcGxhdGU6IHNlbGVjdGVkU3RhY2tUZW1wbGF0ZSxcbiAgICB9O1xuXG4gICAgLy8gVE9ETzogZmV0Y2ggYWNjb3VudCAmIHJlZ2lvbnMgZnJvbSBzb21ld2hlcmVcbiAgICBjb25zdCBjYW5hcnlTdGFjayA9IG5ldyBDYW5hcnlTdGFjayhzdGFja05hbWUsIHN0YWNrQ29uZmlnLCB7XG4gICAgICBlbnY6IGF3c0Nmbi5nZXRFbnYoKSxcbiAgICB9KTtcbiAgICBjb25zdCBkZXBsb3lSZXN1bHQgPSBhd2FpdCBjYW5hcnlTdGFjay5kZXBsb3koKTtcblxuICAgIGNvbnNvbGUubG9nKGRlcGxveVJlc3VsdCk7XG4gICAgY29uc3QgZGVwbG95UmVzcG9uc2UgPSB7IC4uLmRlcGxveVJlc3VsdCwgc3RhY2tBcnRpZmFjdDogW10gfTtcbiAgICByZXMuanNvbihkZXBsb3lSZXNwb25zZSk7XG4gICAgLy8gVE9ETzogQWRkIHByb3BlciBlcnJvciBoYW5kbGluZ1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICByZXMuc3RhdHVzKDQwMCk7XG4gICAgcmVzLmpzb24oXCJkZXBsb3ltZW50IGZhaWxlZFwiKTtcbiAgfVxufSk7XG5cbnJvdXRlci5wdXQoXCIvcm9sbGJhY2stY2FuYXJ5XCIsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IHN0YWNrSWQsIHN0YWNrTmFtZSwgcHJvZmlsZU5hbWUgfSA9IHJlcS5ib2R5O1xuICB0cnkge1xuICAgIGNvbnN0IGV4aXN0aW5nU3RhY2sgPSBhd2FpdCBhd3NDZm4uZmV0Y2hTdGFja1RlbXBsYXRlKHN0YWNrSWQpO1xuICAgIC8vIFRPRE8gZGVmaW5lIHR5cGUgb2YgcmVzcG9uc2VcbiAgICBjb25zdCBvcmlnaW5TdGFja1RlbXBsYXRlID0gSlNPTi5wYXJzZShcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIGV4aXN0aW5nU3RhY2suTWV0YWRhdGFbXCJwcmUtY2FuYXJ5LWNmblwiXVxuICAgICk7XG4gICAgY29uc3QgdnBjQ29uZmlnID0gYXdhaXQgYXdzQ2ZuLmZldGNoU3RhY2tWcGNDb25maWcoc3RhY2tJZCk7XG4gICAgY29uc3Qgc3RhY2tDb25maWcgPSB7XG4gICAgICBwcm9maWxlTmFtZSxcbiAgICAgIHN0YWNrSWQsXG4gICAgICB2cGNDb25maWcsXG4gICAgICB0ZW1wbGF0ZTogb3JpZ2luU3RhY2tUZW1wbGF0ZSxcbiAgICB9O1xuXG4gICAgY29uc3Qgb3JpZ2luYWxTdGFjayA9IG5ldyBFeGlzdGluZ1N0YWNrKHN0YWNrTmFtZSwgc3RhY2tDb25maWcsIHtcbiAgICAgIGVudjogYXdzQ2ZuLmdldEVudigpLFxuICAgIH0pO1xuICAgIGNvbnN0IGRlcGxveVJlc3VsdCA9IGF3YWl0IG9yaWdpbmFsU3RhY2suZGVwbG95KCk7XG4gICAgY29uc29sZS5sb2coZGVwbG95UmVzdWx0KTtcbiAgICBjb25zdCBkZXBsb3lSZXNwb25zZSA9IHsgLi4uZGVwbG95UmVzdWx0LCBzdGFja0FydGlmYWN0OiBbXSB9O1xuICAgIHJlcy5qc29uKGRlcGxveVJlc3BvbnNlKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJvdXRlcjtcbiJdfQ==