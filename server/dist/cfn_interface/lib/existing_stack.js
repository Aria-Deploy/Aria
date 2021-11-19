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
        this.app = source;
        this.profileName = stackConfig.profileName;
        if (stackConfig.template) {
            fs.writeFileSync("./cdk.out/stack.template.json", JSON.stringify(stackConfig.template, null, 2));
            this.importedTemplate = new cfninc.CfnInclude(this, "Template", {
                templateFile: "./cdk.out/stack.template.json",
            });
        }
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
            usePreviousParameters: true,
        });
        return deployResultPromise;
    }
    async destroy() {
        this.synthesizeStack();
        const cloudFormation = await this.createNewCfnDeploy();
        await cloudFormation.destroyStack({
            // @ts-ignore
            stack: this.stackArtifact,
            usePreviousParameters: true,
        });
        return {
            destroyResult: "Stack Destroyed Successfully",
        };
    }
}
exports.ExistingStack = ExistingStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhpc3Rpbmdfc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY2ZuX2ludGVyZmFjZS9saWIvZXhpc3Rpbmdfc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG1EQUFxQztBQUdyQyx3RUFBMEQ7QUFDMUQsdUNBQXlCO0FBQ3pCLHVEQUF1RDtBQUN2RCwyRkFBdUY7QUFJdkYsTUFBYSxhQUFjLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFxRDFDLGdDQUFnQztJQUNoQyxZQUNFLE1BQWUsRUFDZixFQUFVLEVBQ1YsV0FBZ0IsRUFDaEIsS0FBc0I7UUFFdEIsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDekIsSUFBSSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUM7UUFDbEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUMsV0FBVyxDQUFDO1FBRTNDLElBQUksV0FBVyxDQUFDLFFBQVEsRUFBRTtZQUN4QixFQUFFLENBQUMsYUFBYSxDQUNkLCtCQUErQixFQUMvQixJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUM5QyxDQUFDO1lBRUYsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFO2dCQUM5RCxZQUFZLEVBQUUsK0JBQStCO2FBQzlDLENBQUMsQ0FBQztTQUNKO0lBQ0gsQ0FBQztJQWxFRCxJQUFJLGlCQUFpQjtRQUNuQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsaUJBQWlCLENBQUM7SUFDMUMsQ0FBQztJQUVELGVBQWU7UUFDYixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN2RSxDQUFDO0lBRUQsS0FBSyxDQUFDLGtCQUFrQjtRQUN0QiwrQ0FBK0M7UUFDL0MsTUFBTSxXQUFXLEdBQUcsTUFBTSxzQkFBVyxDQUFDLDRCQUE0QixDQUFDO1lBQ2pFLG1EQUFtRDtZQUNuRCxPQUFPLEVBQUUsSUFBSSxDQUFDLFdBQVc7U0FDMUIsQ0FBQyxDQUFDO1FBRUgsT0FBTyxJQUFJLHNEQUF5QixDQUFDLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRUQsS0FBSyxDQUFDLE1BQU07UUFDVixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDdkIsTUFBTSxjQUFjLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUN2RCxNQUFNLG1CQUFtQixHQUFHLE1BQU0sY0FBYyxDQUFDLFdBQVcsQ0FBQztZQUMzRCxpRUFBaUU7WUFDakUsYUFBYTtZQUNiLEtBQUssRUFBRSxJQUFJLENBQUMsYUFBYTtZQUN6QixxQkFBcUIsRUFBRSxJQUFJO1NBQzVCLENBQUMsQ0FBQztRQUVILE9BQU8sbUJBQW1CLENBQUM7SUFDN0IsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPO1FBQ1gsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3ZCLE1BQU0sY0FBYyxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDdkQsTUFBTSxjQUFjLENBQUMsWUFBWSxDQUFDO1lBQ2hDLGFBQWE7WUFDYixLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWE7WUFDekIscUJBQXFCLEVBQUUsSUFBSTtTQUM1QixDQUFDLENBQUM7UUFFSCxPQUFPO1lBQ0wsYUFBYSxFQUFFLDhCQUE4QjtTQUM5QyxDQUFDO0lBQ0osQ0FBQztDQXdCRjtBQTNFRCxzQ0EyRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSBcIkBhd3MtY2RrL2NvcmVcIjtcbmltcG9ydCAqIGFzIGN4YXBpIGZyb20gXCJAYXdzLWNkay9jeC1hcGlcIjtcbmltcG9ydCAqIGFzIGVjMiBmcm9tIFwiQGF3cy1jZGsvYXdzLWVjMlwiO1xuaW1wb3J0ICogYXMgY2ZuaW5jIGZyb20gXCJAYXdzLWNkay9jbG91ZGZvcm1hdGlvbi1pbmNsdWRlXCI7XG5pbXBvcnQgKiBhcyBmcyBmcm9tIFwiZnNcIjtcbmltcG9ydCB7IFNka1Byb3ZpZGVyIH0gZnJvbSBcImF3cy1jZGsvbGliL2FwaS9hd3MtYXV0aFwiO1xuaW1wb3J0IHsgQ2xvdWRGb3JtYXRpb25EZXBsb3ltZW50cyB9IGZyb20gXCJhd3MtY2RrL2xpYi9hcGkvY2xvdWRmb3JtYXRpb24tZGVwbG95bWVudHNcIjtcbmltcG9ydCB7IFZwY0F0dHJpYnV0ZXMgfSBmcm9tIFwiQGF3cy1jZGsvYXdzLWVjMlwiO1xuaW1wb3J0IHsgQ2xvdWRGb3JtYXRpb24gfSBmcm9tIFwiYXdzLXNka1wiO1xuXG5leHBvcnQgY2xhc3MgRXhpc3RpbmdTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIHByaXZhdGUgc3RhY2tBcnRpZmFjdDogY3hhcGkuQ2xvdWRGb3JtYXRpb25TdGFja0FydGlmYWN0O1xuICBwcml2YXRlIGFwcDogY2RrLkFwcDtcbiAgcHJpdmF0ZSB2cGNDb25maWc6IFZwY0F0dHJpYnV0ZXM7XG4gIHByaXZhdGUgcHJvZmlsZU5hbWU6IHN0cmluZztcbiAgcHVibGljIHZwYzogZWMyLklWcGM7XG4gIHB1YmxpYyBpbXBvcnRlZFRlbXBsYXRlOiBjZm5pbmMuQ2ZuSW5jbHVkZTtcblxuICBnZXQgYXZhaWxhYmlsaXR5Wm9uZXMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiB0aGlzLnZwY0NvbmZpZy5hdmFpbGFiaWxpdHlab25lcztcbiAgfVxuXG4gIHN5bnRoZXNpemVTdGFjaygpIHtcbiAgICB0aGlzLnN0YWNrQXJ0aWZhY3QgPSB0aGlzLmFwcC5zeW50aCgpLmdldFN0YWNrQnlOYW1lKHRoaXMuc3RhY2tOYW1lKTtcbiAgfVxuXG4gIGFzeW5jIGNyZWF0ZU5ld0NmbkRlcGxveSgpOiBQcm9taXNlPENsb3VkRm9ybWF0aW9uRGVwbG95bWVudHM+IHtcbiAgICAvLyBVU0VSLUlOUFVUOiBPcHRpb25hbCBQcm9maWxlIE5hbWUgb3IgRGVmYXVsdFxuICAgIGNvbnN0IHNka1Byb3ZpZGVyID0gYXdhaXQgU2RrUHJvdmlkZXIud2l0aEF3c0NsaUNvbXBhdGlibGVEZWZhdWx0cyh7XG4gICAgICAvLyBwcm9maWxlOiAneW91ciB+Ly5hd3MvY29uZmlnIHByb2ZpbGUgbmFtZSBoZXJlJyxcbiAgICAgIHByb2ZpbGU6IHRoaXMucHJvZmlsZU5hbWUsXG4gICAgfSk7XG5cbiAgICByZXR1cm4gbmV3IENsb3VkRm9ybWF0aW9uRGVwbG95bWVudHMoeyBzZGtQcm92aWRlciB9KTtcbiAgfVxuXG4gIGFzeW5jIGRlcGxveSgpIHtcbiAgICB0aGlzLnN5bnRoZXNpemVTdGFjaygpO1xuICAgIGNvbnN0IGNsb3VkRm9ybWF0aW9uID0gYXdhaXQgdGhpcy5jcmVhdGVOZXdDZm5EZXBsb3koKTtcbiAgICBjb25zdCBkZXBsb3lSZXN1bHRQcm9taXNlID0gYXdhaXQgY2xvdWRGb3JtYXRpb24uZGVwbG95U3RhY2soe1xuICAgICAgLy8gVE9ETzogQWRkcmVzcyBDbG91ZEZvcm1hdGlvblN0YWNrQXJ0aWZhY3Qgc2VwYXJhdGUgZGVmaW5pdGlvbnNcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHN0YWNrOiB0aGlzLnN0YWNrQXJ0aWZhY3QsXG4gICAgICB1c2VQcmV2aW91c1BhcmFtZXRlcnM6IHRydWUsXG4gICAgfSk7XG5cbiAgICByZXR1cm4gZGVwbG95UmVzdWx0UHJvbWlzZTtcbiAgfVxuXG4gIGFzeW5jIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5zeW50aGVzaXplU3RhY2soKTtcbiAgICBjb25zdCBjbG91ZEZvcm1hdGlvbiA9IGF3YWl0IHRoaXMuY3JlYXRlTmV3Q2ZuRGVwbG95KCk7XG4gICAgYXdhaXQgY2xvdWRGb3JtYXRpb24uZGVzdHJveVN0YWNrKHtcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHN0YWNrOiB0aGlzLnN0YWNrQXJ0aWZhY3QsXG4gICAgICB1c2VQcmV2aW91c1BhcmFtZXRlcnM6IHRydWUsXG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgZGVzdHJveVJlc3VsdDogXCJTdGFjayBEZXN0cm95ZWQgU3VjY2Vzc2Z1bGx5XCIsXG4gICAgfTtcbiAgfVxuXG4gIC8vIFRPRE86IGRlZmluZSBzdGFja0NvbmZpZyB0eXBlXG4gIGNvbnN0cnVjdG9yKFxuICAgIHNvdXJjZTogY2RrLkFwcCxcbiAgICBpZDogc3RyaW5nLFxuICAgIHN0YWNrQ29uZmlnOiBhbnksXG4gICAgcHJvcHM/OiBjZGsuU3RhY2tQcm9wc1xuICApIHtcbiAgICBzdXBlcihzb3VyY2UsIGlkLCBwcm9wcyk7XG4gICAgdGhpcy5hcHAgPSBzb3VyY2U7XG4gICAgdGhpcy5wcm9maWxlTmFtZSA9IHN0YWNrQ29uZmlnLnByb2ZpbGVOYW1lO1xuXG4gICAgaWYgKHN0YWNrQ29uZmlnLnRlbXBsYXRlKSB7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKFxuICAgICAgICBcIi4vY2RrLm91dC9zdGFjay50ZW1wbGF0ZS5qc29uXCIsXG4gICAgICAgIEpTT04uc3RyaW5naWZ5KHN0YWNrQ29uZmlnLnRlbXBsYXRlLCBudWxsLCAyKVxuICAgICAgKTtcblxuICAgICAgdGhpcy5pbXBvcnRlZFRlbXBsYXRlID0gbmV3IGNmbmluYy5DZm5JbmNsdWRlKHRoaXMsIFwiVGVtcGxhdGVcIiwge1xuICAgICAgICB0ZW1wbGF0ZUZpbGU6IFwiLi9jZGsub3V0L3N0YWNrLnRlbXBsYXRlLmpzb25cIixcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufVxuIl19