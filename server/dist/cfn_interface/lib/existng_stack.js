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
exports.ExistingStack = void 0;
const cdk = __importStar(require("@aws-cdk/core"));
const cfninc = __importStar(require("@aws-cdk/cloudformation-include"));
const fs = __importStar(require("fs"));
const aws_auth_1 = require("aws-cdk/lib/api/aws-auth");
const cloudformation_deployments_1 = require("aws-cdk/lib/api/cloudformation-deployments");
class ExistingStack extends cdk.Stack {
    // TODO: define stackConfig type
    constructor(source, id, stackConfig, props) {
        super(source, id, props);
        this.profileName = stackConfig.profileName;
        this.app = source;
        fs.writeFileSync("./cdk.out/ExistingStack.template.json", JSON.stringify(stackConfig.template, null, 2));
        const template = new cfninc.CfnInclude(this, "Template", {
            templateFile: "./cdk.out/ExistingStack.template.json",
        });
    }
    get availabilityZones() {
        return this.vpcConfig.availabilityZones;
    }
    synthesizeStack() {
        this.stackArtifact = this.app.synth().getStackByName(this.stackName);
    }
    async createNewCfnDeploy() {
        // USER-INPUT: Optional Profile Name or Default
        const sdkProvider = await aws_auth_1.SdkProvider.withAwsCliCompatibleDefaults({
            // profile: 'your ~/.aws/config profile name here',
            profile: this.profileName,
        });
        return new cloudformation_deployments_1.CloudFormationDeployments({ sdkProvider });
    }
    async deploy() {
        this.synthesizeStack();
        const cloudFormation = await this.createNewCfnDeploy();
        const deployResultPromise = await cloudFormation.deployStack({
            // TODO: Address CloudFormationStackArtifact separate definitions
            // @ts-ignore
            stack: this.stackArtifact,
        });
        return deployResultPromise;
    }
}
exports.ExistingStack = ExistingStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhpc3RuZ19zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jZm5faW50ZXJmYWNlL2xpYi9leGlzdG5nX3N0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxtREFBcUM7QUFHckMsd0VBQTBEO0FBQzFELHVDQUF5QjtBQUN6Qix1REFBdUQ7QUFDdkQsMkZBQXVGO0FBR3ZGLE1BQWEsYUFBYyxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBcUMxQyxnQ0FBZ0M7SUFDaEMsWUFDRSxNQUFlLEVBQ2YsRUFBVSxFQUNWLFdBQWdCLEVBQ2hCLEtBQXNCO1FBRXRCLEtBQUssQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3pCLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQztRQUMzQyxJQUFJLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQztRQUVsQixFQUFFLENBQUMsYUFBYSxDQUNkLHVDQUF1QyxFQUN2QyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUM5QyxDQUFDO1FBRUYsTUFBTSxRQUFRLEdBQUcsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUU7WUFDdkQsWUFBWSxFQUFFLHVDQUF1QztTQUN0RCxDQUFDLENBQUM7SUFDTCxDQUFDO0lBakRELElBQUksaUJBQWlCO1FBQ25CLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQztJQUMxQyxDQUFDO0lBRUQsZUFBZTtRQUNiLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7SUFFRCxLQUFLLENBQUMsa0JBQWtCO1FBQ3RCLCtDQUErQztRQUMvQyxNQUFNLFdBQVcsR0FBRyxNQUFNLHNCQUFXLENBQUMsNEJBQTRCLENBQUM7WUFDakUsbURBQW1EO1lBQ25ELE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBVztTQUMxQixDQUFDLENBQUM7UUFFSCxPQUFPLElBQUksc0RBQXlCLENBQUMsRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFFRCxLQUFLLENBQUMsTUFBTTtRQUNWLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN2QixNQUFNLGNBQWMsR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQ3ZELE1BQU0sbUJBQW1CLEdBQUcsTUFBTSxjQUFjLENBQUMsV0FBVyxDQUFDO1lBQzNELGlFQUFpRTtZQUNqRSxhQUFhO1lBQ2IsS0FBSyxFQUFFLElBQUksQ0FBQyxhQUFhO1NBQzFCLENBQUMsQ0FBQztRQUVILE9BQU8sbUJBQW1CLENBQUM7SUFDN0IsQ0FBQztDQXNCRjtBQXpERCxzQ0F5REMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSBcIkBhd3MtY2RrL2NvcmVcIjtcbmltcG9ydCAqIGFzIGN4YXBpIGZyb20gXCJAYXdzLWNkay9jeC1hcGlcIjtcbmltcG9ydCAqIGFzIGVjMiBmcm9tIFwiQGF3cy1jZGsvYXdzLWVjMlwiO1xuaW1wb3J0ICogYXMgY2ZuaW5jIGZyb20gXCJAYXdzLWNkay9jbG91ZGZvcm1hdGlvbi1pbmNsdWRlXCI7XG5pbXBvcnQgKiBhcyBmcyBmcm9tIFwiZnNcIjtcbmltcG9ydCB7IFNka1Byb3ZpZGVyIH0gZnJvbSBcImF3cy1jZGsvbGliL2FwaS9hd3MtYXV0aFwiO1xuaW1wb3J0IHsgQ2xvdWRGb3JtYXRpb25EZXBsb3ltZW50cyB9IGZyb20gXCJhd3MtY2RrL2xpYi9hcGkvY2xvdWRmb3JtYXRpb24tZGVwbG95bWVudHNcIjtcbmltcG9ydCB7IFZwY0F0dHJpYnV0ZXMgfSBmcm9tIFwiQGF3cy1jZGsvYXdzLWVjMlwiO1xuXG5leHBvcnQgY2xhc3MgRXhpc3RpbmdTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIHByaXZhdGUgc3RhY2tBcnRpZmFjdDogY3hhcGkuQ2xvdWRGb3JtYXRpb25TdGFja0FydGlmYWN0O1xuICBwcml2YXRlIGFwcDogY2RrLkFwcDtcbiAgcHJpdmF0ZSB2cGNDb25maWc6IFZwY0F0dHJpYnV0ZXM7XG4gIHByaXZhdGUgcHJvZmlsZU5hbWU6IHN0cmluZztcbiAgcHVibGljIHZwYzogZWMyLklWcGM7XG5cbiAgZ2V0IGF2YWlsYWJpbGl0eVpvbmVzKCk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gdGhpcy52cGNDb25maWcuYXZhaWxhYmlsaXR5Wm9uZXM7XG4gIH1cblxuICBzeW50aGVzaXplU3RhY2soKSB7XG4gICAgdGhpcy5zdGFja0FydGlmYWN0ID0gdGhpcy5hcHAuc3ludGgoKS5nZXRTdGFja0J5TmFtZSh0aGlzLnN0YWNrTmFtZSk7XG4gIH1cblxuICBhc3luYyBjcmVhdGVOZXdDZm5EZXBsb3koKTogUHJvbWlzZTxDbG91ZEZvcm1hdGlvbkRlcGxveW1lbnRzPiB7XG4gICAgLy8gVVNFUi1JTlBVVDogT3B0aW9uYWwgUHJvZmlsZSBOYW1lIG9yIERlZmF1bHRcbiAgICBjb25zdCBzZGtQcm92aWRlciA9IGF3YWl0IFNka1Byb3ZpZGVyLndpdGhBd3NDbGlDb21wYXRpYmxlRGVmYXVsdHMoe1xuICAgICAgLy8gcHJvZmlsZTogJ3lvdXIgfi8uYXdzL2NvbmZpZyBwcm9maWxlIG5hbWUgaGVyZScsXG4gICAgICBwcm9maWxlOiB0aGlzLnByb2ZpbGVOYW1lLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIG5ldyBDbG91ZEZvcm1hdGlvbkRlcGxveW1lbnRzKHsgc2RrUHJvdmlkZXIgfSk7XG4gIH1cblxuICBhc3luYyBkZXBsb3koKSB7XG4gICAgdGhpcy5zeW50aGVzaXplU3RhY2soKTtcbiAgICBjb25zdCBjbG91ZEZvcm1hdGlvbiA9IGF3YWl0IHRoaXMuY3JlYXRlTmV3Q2ZuRGVwbG95KCk7XG4gICAgY29uc3QgZGVwbG95UmVzdWx0UHJvbWlzZSA9IGF3YWl0IGNsb3VkRm9ybWF0aW9uLmRlcGxveVN0YWNrKHtcbiAgICAgIC8vIFRPRE86IEFkZHJlc3MgQ2xvdWRGb3JtYXRpb25TdGFja0FydGlmYWN0IHNlcGFyYXRlIGRlZmluaXRpb25zXG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICBzdGFjazogdGhpcy5zdGFja0FydGlmYWN0LFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGRlcGxveVJlc3VsdFByb21pc2U7XG4gIH1cblxuICAvLyBUT0RPOiBkZWZpbmUgc3RhY2tDb25maWcgdHlwZVxuICBjb25zdHJ1Y3RvcihcbiAgICBzb3VyY2U6IGNkay5BcHAsXG4gICAgaWQ6IHN0cmluZyxcbiAgICBzdGFja0NvbmZpZzogYW55LFxuICAgIHByb3BzPzogY2RrLlN0YWNrUHJvcHNcbiAgKSB7XG4gICAgc3VwZXIoc291cmNlLCBpZCwgcHJvcHMpO1xuICAgIHRoaXMucHJvZmlsZU5hbWUgPSBzdGFja0NvbmZpZy5wcm9maWxlTmFtZTtcbiAgICB0aGlzLmFwcCA9IHNvdXJjZTtcblxuICAgIGZzLndyaXRlRmlsZVN5bmMoXG4gICAgICBcIi4vY2RrLm91dC9FeGlzdGluZ1N0YWNrLnRlbXBsYXRlLmpzb25cIixcbiAgICAgIEpTT04uc3RyaW5naWZ5KHN0YWNrQ29uZmlnLnRlbXBsYXRlLCBudWxsLCAyKVxuICAgICk7XG5cbiAgICBjb25zdCB0ZW1wbGF0ZSA9IG5ldyBjZm5pbmMuQ2ZuSW5jbHVkZSh0aGlzLCBcIlRlbXBsYXRlXCIsIHtcbiAgICAgIHRlbXBsYXRlRmlsZTogXCIuL2Nkay5vdXQvRXhpc3RpbmdTdGFjay50ZW1wbGF0ZS5qc29uXCIsXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==