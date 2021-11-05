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
    const profile = req.params.profile;
    const existingStacks = await awsCfn.fetchAwsStackInfo();
    res.json(existingStacks);
});
router.post("/deploy", async (req, res) => {
    const { profileName, stackId } = req.body;
    try {
        awsCfn.clientsInit(profileName);
        const selectedStackTemplate = await awsCfn.fetchStackTemplate(stackId);
        const vpcConfig = await awsCfn.fetchStackVpcConfig(stackId);
        res.json(selectedStackTemplate);
    }
    catch (error) {
        console.log(error);
        res.status(400);
        res.send(error);
    }
});
module.exports = router;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NlcnZlci9yb3V0ZXMvYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHNEQUE4QjtBQUM5QixNQUFNLE1BQU0sR0FBRyxpQkFBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2hDLDZFQUErRDtBQUUvRCxNQUFNLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBQ3pDLEdBQUcsQ0FBQyxXQUFXLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUNwQyxNQUFNLFFBQVEsR0FBRyxNQUFNLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO0lBQ3JELEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDckIsQ0FBQyxDQUFDLENBQUM7QUFFSCxNQUFNLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7SUFDaEQsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDbkMsTUFBTSxjQUFjLEdBQUcsTUFBTSxNQUFNLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUN4RCxHQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQzNCLENBQUMsQ0FBQyxDQUFDO0FBRUgsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtJQUN4QyxNQUFNLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7SUFDMUMsSUFBSTtRQUNGLE1BQU0sQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUE7UUFDL0IsTUFBTSxxQkFBcUIsR0FBRyxNQUFNLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN2RSxNQUFNLFNBQVMsR0FBRyxNQUFNLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM1RCxHQUFHLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7S0FDakM7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDbEIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNoQixHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ2pCO0FBQ0gsQ0FBQyxDQUFDLENBQUM7QUFFSCxNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBleHByZXNzIGZyb20gXCJleHByZXNzXCI7XG5jb25zdCByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpO1xuaW1wb3J0ICogYXMgYXdzQ2ZuIGZyb20gXCIuLi8uLi9jZm5faW50ZXJmYWNlL2xpYi9hd3NfY2ZuX2RhdGFcIjtcblxucm91dGVyLmdldChcIi9wcm9maWxlc1wiLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgcmVzLmNvbnRlbnRUeXBlKFwiYXBwbGljYXRpb24vanNvblwiKTtcbiAgY29uc3QgYWNjb3VudHMgPSBhd2FpdCBhd3NDZm4uZmV0Y2hBd3NQcm9maWxlc0luZm8oKTtcbiAgcmVzLmpzb24oYWNjb3VudHMpO1xufSk7XG5cbnJvdXRlci5nZXQoXCIvc3RhY2tzLzpwcm9maWxlXCIsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBwcm9maWxlID0gcmVxLnBhcmFtcy5wcm9maWxlO1xuICBjb25zdCBleGlzdGluZ1N0YWNrcyA9IGF3YWl0IGF3c0Nmbi5mZXRjaEF3c1N0YWNrSW5mbygpO1xuICByZXMuanNvbihleGlzdGluZ1N0YWNrcyk7XG59KTtcblxucm91dGVyLnBvc3QoXCIvZGVwbG95XCIsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IHByb2ZpbGVOYW1lLCBzdGFja0lkIH0gPSByZXEuYm9keTtcbiAgdHJ5IHtcbiAgICBhd3NDZm4uY2xpZW50c0luaXQocHJvZmlsZU5hbWUpXG4gICAgY29uc3Qgc2VsZWN0ZWRTdGFja1RlbXBsYXRlID0gYXdhaXQgYXdzQ2ZuLmZldGNoU3RhY2tUZW1wbGF0ZShzdGFja0lkKTtcbiAgICBjb25zdCB2cGNDb25maWcgPSBhd2FpdCBhd3NDZm4uZmV0Y2hTdGFja1ZwY0NvbmZpZyhzdGFja0lkKTtcbiAgICByZXMuanNvbihzZWxlY3RlZFN0YWNrVGVtcGxhdGUpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUubG9nKGVycm9yKVxuICAgIHJlcy5zdGF0dXMoNDAwKTtcbiAgICByZXMuc2VuZChlcnJvcik7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJvdXRlcjtcbiJdfQ==