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
router.get("/profiles", async (req, res) => {
    res.contentType("application/json");
    const accounts = await awsCfn.fetchAwsProfilesInfo();
    res.json(accounts);
});
router.get("/stacks/:profile", async (req, res) => {
    try {
        const profileName = req.params.profile;
        await awsCfn.clientsInit(profileName);
        const existingStacks = await awsCfn.fetchAwsStackInfo();
        res.json(existingStacks);
    }
    catch (error) {
        console.log("Unable to process existing stacks request: ", error);
    }
});
router.post("/deploy", async (req, res) => {
    const { stackId } = req.body;
    try {
        const selectedStackTemplate = await awsCfn.fetchStackTemplate(stackId);
        const vpcConfig = await awsCfn.fetchStackVpcConfig(stackId);
        res.json(vpcConfig);
    }
    catch (error) {
        console.log(error);
        res.status(400);
        res.send(error);
    }
});
module.exports = router;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NlcnZlci9yb3V0ZXMvYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHNEQUE4QjtBQUM5QixNQUFNLE1BQU0sR0FBRyxpQkFBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2hDLDZFQUErRDtBQUUvRCxNQUFNLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBQ3pDLEdBQUcsQ0FBQyxXQUFXLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUNwQyxNQUFNLFFBQVEsR0FBRyxNQUFNLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO0lBQ3JELEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDckIsQ0FBQyxDQUFDLENBQUM7QUFFSCxNQUFNLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7SUFDaEQsSUFBSTtRQUNGLE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO1FBQ3ZDLE1BQU0sTUFBTSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN0QyxNQUFNLGNBQWMsR0FBRyxNQUFNLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQ3hELEdBQUcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7S0FDMUI7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsNkNBQTZDLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDbkU7QUFDSCxDQUFDLENBQUMsQ0FBQztBQUVILE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7SUFDeEMsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7SUFDN0IsSUFBSTtRQUNGLE1BQU0scUJBQXFCLEdBQUcsTUFBTSxNQUFNLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdkUsTUFBTSxTQUFTLEdBQUcsTUFBTSxNQUFNLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDNUQsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUNyQjtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ2QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuQixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDakI7QUFDSCxDQUFDLENBQUMsQ0FBQztBQUVILE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGV4cHJlc3MgZnJvbSBcImV4cHJlc3NcIjtcbmNvbnN0IHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKCk7XG5pbXBvcnQgKiBhcyBhd3NDZm4gZnJvbSBcIi4uLy4uL2Nmbl9pbnRlcmZhY2UvbGliL2F3c19jZm5fZGF0YVwiO1xuXG5yb3V0ZXIuZ2V0KFwiL3Byb2ZpbGVzXCIsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICByZXMuY29udGVudFR5cGUoXCJhcHBsaWNhdGlvbi9qc29uXCIpO1xuICBjb25zdCBhY2NvdW50cyA9IGF3YWl0IGF3c0Nmbi5mZXRjaEF3c1Byb2ZpbGVzSW5mbygpO1xuICByZXMuanNvbihhY2NvdW50cyk7XG59KTtcblxucm91dGVyLmdldChcIi9zdGFja3MvOnByb2ZpbGVcIiwgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgcHJvZmlsZU5hbWUgPSByZXEucGFyYW1zLnByb2ZpbGU7XG4gICAgYXdhaXQgYXdzQ2ZuLmNsaWVudHNJbml0KHByb2ZpbGVOYW1lKTtcbiAgICBjb25zdCBleGlzdGluZ1N0YWNrcyA9IGF3YWl0IGF3c0Nmbi5mZXRjaEF3c1N0YWNrSW5mbygpO1xuICAgIHJlcy5qc29uKGV4aXN0aW5nU3RhY2tzKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmxvZyhcIlVuYWJsZSB0byBwcm9jZXNzIGV4aXN0aW5nIHN0YWNrcyByZXF1ZXN0OiBcIiwgZXJyb3IpO1xuICB9XG59KTtcblxucm91dGVyLnBvc3QoXCIvZGVwbG95XCIsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IHN0YWNrSWQgfSA9IHJlcS5ib2R5O1xuICB0cnkge1xuICAgIGNvbnN0IHNlbGVjdGVkU3RhY2tUZW1wbGF0ZSA9IGF3YWl0IGF3c0Nmbi5mZXRjaFN0YWNrVGVtcGxhdGUoc3RhY2tJZCk7XG4gICAgY29uc3QgdnBjQ29uZmlnID0gYXdhaXQgYXdzQ2ZuLmZldGNoU3RhY2tWcGNDb25maWcoc3RhY2tJZCk7XG4gICAgcmVzLmpzb24odnBjQ29uZmlnKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgcmVzLnN0YXR1cyg0MDApO1xuICAgIHJlcy5zZW5kKGVycm9yKTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gcm91dGVyO1xuIl19