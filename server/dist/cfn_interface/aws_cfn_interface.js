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
const xxx_ec2_instance_example_stack_1 = require("./lib/xxx_ec2_instance_example-stack");
const xxx_importExistingStack_1 = require("./lib/xxx_importExistingStack");
const evnUSA = { account: "750078097588", region: "us-west-2" };
const app = new cdk.App();
const cdkStack = new xxx_ec2_instance_example_stack_1.Ec2InstanceExampleStack(app, "Ec2InstanceExampleStack", {
    env: { ...evnUSA },
});
const importedStack = new xxx_importExistingStack_1.ExistingStack(app, "cdk-stack", {
    env: { ...evnUSA },
});
(async () => {
    // const deployResult = await cdkStack.deploy();
    // const deployResult = await importedStack.deploy();
    // console.log(deployResult);
})();
const breakpoint = "Completed Execution\n";
console.log(breakpoint);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXdzX2Nmbl9pbnRlcmZhY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY2ZuX2ludGVyZmFjZS9hd3NfY2ZuX2ludGVyZmFjZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsdUNBQXFDO0FBQ3JDLG1EQUFxQztBQUNyQyx5RkFBK0U7QUFDL0UsMkVBQThEO0FBRTlELE1BQU0sTUFBTSxHQUFHLEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLENBQUM7QUFFaEUsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDMUIsTUFBTSxRQUFRLEdBQUcsSUFBSSx3REFBdUIsQ0FBQyxHQUFHLEVBQUUseUJBQXlCLEVBQUU7SUFDM0UsR0FBRyxFQUFFLEVBQUUsR0FBRyxNQUFNLEVBQUU7Q0FDbkIsQ0FBQyxDQUFDO0FBRUgsTUFBTSxhQUFhLEdBQUcsSUFBSSx1Q0FBYSxDQUFDLEdBQUcsRUFBRSxXQUFXLEVBQUU7SUFDeEQsR0FBRyxFQUFFLEVBQUUsR0FBRyxNQUFNLEVBQUU7Q0FDbkIsQ0FBQyxDQUFDO0FBRUgsQ0FBQyxLQUFLLElBQUksRUFBRTtJQUNWLGdEQUFnRDtJQUNoRCxxREFBcUQ7SUFDckQsNkJBQTZCO0FBQy9CLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFFTCxNQUFNLFVBQVUsR0FBRyx1QkFBdUIsQ0FBQztBQUMzQyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuaW1wb3J0IFwic291cmNlLW1hcC1zdXBwb3J0L3JlZ2lzdGVyXCI7XG5pbXBvcnQgKiBhcyBjZGsgZnJvbSBcIkBhd3MtY2RrL2NvcmVcIjtcbmltcG9ydCB7IEVjMkluc3RhbmNlRXhhbXBsZVN0YWNrIH0gZnJvbSBcIi4vbGliL3h4eF9lYzJfaW5zdGFuY2VfZXhhbXBsZS1zdGFja1wiO1xuaW1wb3J0IHsgRXhpc3RpbmdTdGFjayB9IGZyb20gXCIuL2xpYi94eHhfaW1wb3J0RXhpc3RpbmdTdGFja1wiO1xuXG5jb25zdCBldm5VU0EgPSB7IGFjY291bnQ6IFwiNzUwMDc4MDk3NTg4XCIsIHJlZ2lvbjogXCJ1cy13ZXN0LTJcIiB9O1xuXG5jb25zdCBhcHAgPSBuZXcgY2RrLkFwcCgpO1xuY29uc3QgY2RrU3RhY2sgPSBuZXcgRWMySW5zdGFuY2VFeGFtcGxlU3RhY2soYXBwLCBcIkVjMkluc3RhbmNlRXhhbXBsZVN0YWNrXCIsIHtcbiAgZW52OiB7IC4uLmV2blVTQSB9LFxufSk7XG5cbmNvbnN0IGltcG9ydGVkU3RhY2sgPSBuZXcgRXhpc3RpbmdTdGFjayhhcHAsIFwiY2RrLXN0YWNrXCIsIHtcbiAgZW52OiB7IC4uLmV2blVTQSB9LFxufSk7XG5cbihhc3luYyAoKSA9PiB7XG4gIC8vIGNvbnN0IGRlcGxveVJlc3VsdCA9IGF3YWl0IGNka1N0YWNrLmRlcGxveSgpO1xuICAvLyBjb25zdCBkZXBsb3lSZXN1bHQgPSBhd2FpdCBpbXBvcnRlZFN0YWNrLmRlcGxveSgpO1xuICAvLyBjb25zb2xlLmxvZyhkZXBsb3lSZXN1bHQpO1xufSkoKTtcblxuY29uc3QgYnJlYWtwb2ludCA9IFwiQ29tcGxldGVkIEV4ZWN1dGlvblxcblwiO1xuY29uc29sZS5sb2coYnJlYWtwb2ludCk7XG4iXX0=