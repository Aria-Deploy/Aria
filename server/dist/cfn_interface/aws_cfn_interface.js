#!/usr/bin/env node
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
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const cdk = __importStar(require("@aws-cdk/core"));
const ec2_instance_example_stack_1 = require("./lib/ec2_instance_example-stack");
const importExistingStack_1 = require("./lib/importExistingStack");
const evnUSA = { account: "750078097588", region: "us-west-2" };
const app = new cdk.App();
const cdkStack = new ec2_instance_example_stack_1.Ec2InstanceExampleStack(app, "Ec2InstanceExampleStack", {
    env: { ...evnUSA },
});
const importedStack = new importExistingStack_1.ExistingStack(app, "cdk-stack", {
    env: { ...evnUSA },
});
(async () => {
    // const deployResult = await cdkStack.deploy();
    // const deployResult = await importedStack.deploy();
    // console.log(deployResult);
})();
const breakpoint = "Completed Execution\n";
console.log(breakpoint);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXdzX2Nmbl9pbnRlcmZhY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY2ZuX2ludGVyZmFjZS9hd3NfY2ZuX2ludGVyZmFjZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsdUNBQXFDO0FBQ3JDLG1EQUFxQztBQUNyQyxpRkFBMkU7QUFDM0UsbUVBQTBEO0FBRTFELE1BQU0sTUFBTSxHQUFHLEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLENBQUM7QUFFaEUsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDMUIsTUFBTSxRQUFRLEdBQUcsSUFBSSxvREFBdUIsQ0FBQyxHQUFHLEVBQUUseUJBQXlCLEVBQUU7SUFDM0UsR0FBRyxFQUFFLEVBQUUsR0FBRyxNQUFNLEVBQUU7Q0FDbkIsQ0FBQyxDQUFDO0FBRUgsTUFBTSxhQUFhLEdBQUcsSUFBSSxtQ0FBYSxDQUFDLEdBQUcsRUFBRSxXQUFXLEVBQUU7SUFDeEQsR0FBRyxFQUFFLEVBQUUsR0FBRyxNQUFNLEVBQUU7Q0FDbkIsQ0FBQyxDQUFDO0FBRUgsQ0FBQyxLQUFLLElBQUksRUFBRTtJQUNWLGdEQUFnRDtJQUNoRCxxREFBcUQ7SUFDckQsNkJBQTZCO0FBQy9CLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFFTCxNQUFNLFVBQVUsR0FBRyx1QkFBdUIsQ0FBQztBQUMzQyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuaW1wb3J0IFwic291cmNlLW1hcC1zdXBwb3J0L3JlZ2lzdGVyXCI7XG5pbXBvcnQgKiBhcyBjZGsgZnJvbSBcIkBhd3MtY2RrL2NvcmVcIjtcbmltcG9ydCB7IEVjMkluc3RhbmNlRXhhbXBsZVN0YWNrIH0gZnJvbSBcIi4vbGliL2VjMl9pbnN0YW5jZV9leGFtcGxlLXN0YWNrXCI7XG5pbXBvcnQgeyBFeGlzdGluZ1N0YWNrIH0gZnJvbSBcIi4vbGliL2ltcG9ydEV4aXN0aW5nU3RhY2tcIjtcblxuY29uc3QgZXZuVVNBID0geyBhY2NvdW50OiBcIjc1MDA3ODA5NzU4OFwiLCByZWdpb246IFwidXMtd2VzdC0yXCIgfTtcblxuY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcbmNvbnN0IGNka1N0YWNrID0gbmV3IEVjMkluc3RhbmNlRXhhbXBsZVN0YWNrKGFwcCwgXCJFYzJJbnN0YW5jZUV4YW1wbGVTdGFja1wiLCB7XG4gIGVudjogeyAuLi5ldm5VU0EgfSxcbn0pO1xuXG5jb25zdCBpbXBvcnRlZFN0YWNrID0gbmV3IEV4aXN0aW5nU3RhY2soYXBwLCBcImNkay1zdGFja1wiLCB7XG4gIGVudjogeyAuLi5ldm5VU0EgfSxcbn0pO1xuXG4oYXN5bmMgKCkgPT4ge1xuICAvLyBjb25zdCBkZXBsb3lSZXN1bHQgPSBhd2FpdCBjZGtTdGFjay5kZXBsb3koKTtcbiAgLy8gY29uc3QgZGVwbG95UmVzdWx0ID0gYXdhaXQgaW1wb3J0ZWRTdGFjay5kZXBsb3koKTtcbiAgLy8gY29uc29sZS5sb2coZGVwbG95UmVzdWx0KTtcbn0pKCk7XG5cbmNvbnN0IGJyZWFrcG9pbnQgPSBcIkNvbXBsZXRlZCBFeGVjdXRpb25cXG5cIjtcbmNvbnNvbGUubG9nKGJyZWFrcG9pbnQpO1xuIl19