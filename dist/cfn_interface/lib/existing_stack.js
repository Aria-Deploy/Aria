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
        return "Stack Destroyed Successfully";
    }
}
exports.ExistingStack = ExistingStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhpc3Rpbmdfc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY2ZuX2ludGVyZmFjZS9saWIvZXhpc3Rpbmdfc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG1EQUFxQztBQUdyQyx3RUFBMEQ7QUFDMUQsdUNBQXlCO0FBQ3pCLHVEQUF1RDtBQUN2RCwyRkFBdUY7QUFJdkYsTUFBYSxhQUFjLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFtRDFDLGdDQUFnQztJQUNoQyxZQUNFLE1BQWUsRUFDZixFQUFVLEVBQ1YsV0FBZ0IsRUFDaEIsS0FBc0I7UUFFdEIsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDekIsSUFBSSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUM7UUFDbEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUMsV0FBVyxDQUFDO1FBRTNDLElBQUksV0FBVyxDQUFDLFFBQVEsRUFBRTtZQUN4QixFQUFFLENBQUMsYUFBYSxDQUNkLCtCQUErQixFQUMvQixJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUM5QyxDQUFDO1lBRUYsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFO2dCQUM5RCxZQUFZLEVBQUUsK0JBQStCO2FBQzlDLENBQUMsQ0FBQztTQUNKO0lBQ0gsQ0FBQztJQWhFRCxJQUFJLGlCQUFpQjtRQUNuQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsaUJBQWlCLENBQUM7SUFDMUMsQ0FBQztJQUVELGVBQWU7UUFDYixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN2RSxDQUFDO0lBRUQsS0FBSyxDQUFDLGtCQUFrQjtRQUN0QiwrQ0FBK0M7UUFDL0MsTUFBTSxXQUFXLEdBQUcsTUFBTSxzQkFBVyxDQUFDLDRCQUE0QixDQUFDO1lBQ2pFLG1EQUFtRDtZQUNuRCxPQUFPLEVBQUUsSUFBSSxDQUFDLFdBQVc7U0FDMUIsQ0FBQyxDQUFDO1FBRUgsT0FBTyxJQUFJLHNEQUF5QixDQUFDLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRUQsS0FBSyxDQUFDLE1BQU07UUFDVixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDdkIsTUFBTSxjQUFjLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUN2RCxNQUFNLG1CQUFtQixHQUFHLE1BQU0sY0FBYyxDQUFDLFdBQVcsQ0FBQztZQUMzRCxpRUFBaUU7WUFDakUsYUFBYTtZQUNiLEtBQUssRUFBRSxJQUFJLENBQUMsYUFBYTtZQUN6QixxQkFBcUIsRUFBRSxJQUFJO1NBQzVCLENBQUMsQ0FBQztRQUVILE9BQU8sbUJBQW1CLENBQUM7SUFDN0IsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPO1FBQ1gsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3ZCLE1BQU0sY0FBYyxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDdkQsTUFBTSxjQUFjLENBQUMsWUFBWSxDQUFDO1lBQ2hDLGFBQWE7WUFDYixLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWE7WUFDekIscUJBQXFCLEVBQUUsSUFBSTtTQUM1QixDQUFDLENBQUM7UUFFSCxPQUFPLDhCQUE4QixDQUFDO0lBQ3hDLENBQUM7Q0F3QkY7QUF6RUQsc0NBeUVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gXCJAYXdzLWNkay9jb3JlXCI7XG5pbXBvcnQgKiBhcyBjeGFwaSBmcm9tIFwiQGF3cy1jZGsvY3gtYXBpXCI7XG5pbXBvcnQgKiBhcyBlYzIgZnJvbSBcIkBhd3MtY2RrL2F3cy1lYzJcIjtcbmltcG9ydCAqIGFzIGNmbmluYyBmcm9tIFwiQGF3cy1jZGsvY2xvdWRmb3JtYXRpb24taW5jbHVkZVwiO1xuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQgeyBTZGtQcm92aWRlciB9IGZyb20gXCJhd3MtY2RrL2xpYi9hcGkvYXdzLWF1dGhcIjtcbmltcG9ydCB7IENsb3VkRm9ybWF0aW9uRGVwbG95bWVudHMgfSBmcm9tIFwiYXdzLWNkay9saWIvYXBpL2Nsb3VkZm9ybWF0aW9uLWRlcGxveW1lbnRzXCI7XG5pbXBvcnQgeyBWcGNBdHRyaWJ1dGVzIH0gZnJvbSBcIkBhd3MtY2RrL2F3cy1lYzJcIjtcbmltcG9ydCB7IENsb3VkRm9ybWF0aW9uIH0gZnJvbSBcImF3cy1zZGtcIjtcblxuZXhwb3J0IGNsYXNzIEV4aXN0aW5nU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBwcml2YXRlIHN0YWNrQXJ0aWZhY3Q6IGN4YXBpLkNsb3VkRm9ybWF0aW9uU3RhY2tBcnRpZmFjdDtcbiAgcHJpdmF0ZSBhcHA6IGNkay5BcHA7XG4gIHByaXZhdGUgdnBjQ29uZmlnOiBWcGNBdHRyaWJ1dGVzO1xuICBwcml2YXRlIHByb2ZpbGVOYW1lOiBzdHJpbmc7XG4gIHB1YmxpYyB2cGM6IGVjMi5JVnBjO1xuICBwdWJsaWMgaW1wb3J0ZWRUZW1wbGF0ZTogY2ZuaW5jLkNmbkluY2x1ZGU7XG5cbiAgZ2V0IGF2YWlsYWJpbGl0eVpvbmVzKCk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gdGhpcy52cGNDb25maWcuYXZhaWxhYmlsaXR5Wm9uZXM7XG4gIH1cblxuICBzeW50aGVzaXplU3RhY2soKSB7XG4gICAgdGhpcy5zdGFja0FydGlmYWN0ID0gdGhpcy5hcHAuc3ludGgoKS5nZXRTdGFja0J5TmFtZSh0aGlzLnN0YWNrTmFtZSk7XG4gIH1cblxuICBhc3luYyBjcmVhdGVOZXdDZm5EZXBsb3koKTogUHJvbWlzZTxDbG91ZEZvcm1hdGlvbkRlcGxveW1lbnRzPiB7XG4gICAgLy8gVVNFUi1JTlBVVDogT3B0aW9uYWwgUHJvZmlsZSBOYW1lIG9yIERlZmF1bHRcbiAgICBjb25zdCBzZGtQcm92aWRlciA9IGF3YWl0IFNka1Byb3ZpZGVyLndpdGhBd3NDbGlDb21wYXRpYmxlRGVmYXVsdHMoe1xuICAgICAgLy8gcHJvZmlsZTogJ3lvdXIgfi8uYXdzL2NvbmZpZyBwcm9maWxlIG5hbWUgaGVyZScsXG4gICAgICBwcm9maWxlOiB0aGlzLnByb2ZpbGVOYW1lLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIG5ldyBDbG91ZEZvcm1hdGlvbkRlcGxveW1lbnRzKHsgc2RrUHJvdmlkZXIgfSk7XG4gIH1cblxuICBhc3luYyBkZXBsb3koKSB7XG4gICAgdGhpcy5zeW50aGVzaXplU3RhY2soKTtcbiAgICBjb25zdCBjbG91ZEZvcm1hdGlvbiA9IGF3YWl0IHRoaXMuY3JlYXRlTmV3Q2ZuRGVwbG95KCk7XG4gICAgY29uc3QgZGVwbG95UmVzdWx0UHJvbWlzZSA9IGF3YWl0IGNsb3VkRm9ybWF0aW9uLmRlcGxveVN0YWNrKHtcbiAgICAgIC8vIFRPRE86IEFkZHJlc3MgQ2xvdWRGb3JtYXRpb25TdGFja0FydGlmYWN0IHNlcGFyYXRlIGRlZmluaXRpb25zXG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICBzdGFjazogdGhpcy5zdGFja0FydGlmYWN0LFxuICAgICAgdXNlUHJldmlvdXNQYXJhbWV0ZXJzOiB0cnVlLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGRlcGxveVJlc3VsdFByb21pc2U7XG4gIH1cblxuICBhc3luYyBkZXN0cm95KCkge1xuICAgIHRoaXMuc3ludGhlc2l6ZVN0YWNrKCk7XG4gICAgY29uc3QgY2xvdWRGb3JtYXRpb24gPSBhd2FpdCB0aGlzLmNyZWF0ZU5ld0NmbkRlcGxveSgpO1xuICAgIGF3YWl0IGNsb3VkRm9ybWF0aW9uLmRlc3Ryb3lTdGFjayh7XG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICBzdGFjazogdGhpcy5zdGFja0FydGlmYWN0LFxuICAgICAgdXNlUHJldmlvdXNQYXJhbWV0ZXJzOiB0cnVlLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFwiU3RhY2sgRGVzdHJveWVkIFN1Y2Nlc3NmdWxseVwiO1xuICB9XG5cbiAgLy8gVE9ETzogZGVmaW5lIHN0YWNrQ29uZmlnIHR5cGVcbiAgY29uc3RydWN0b3IoXG4gICAgc291cmNlOiBjZGsuQXBwLFxuICAgIGlkOiBzdHJpbmcsXG4gICAgc3RhY2tDb25maWc6IGFueSxcbiAgICBwcm9wcz86IGNkay5TdGFja1Byb3BzXG4gICkge1xuICAgIHN1cGVyKHNvdXJjZSwgaWQsIHByb3BzKTtcbiAgICB0aGlzLmFwcCA9IHNvdXJjZTtcbiAgICB0aGlzLnByb2ZpbGVOYW1lID0gc3RhY2tDb25maWcucHJvZmlsZU5hbWU7XG5cbiAgICBpZiAoc3RhY2tDb25maWcudGVtcGxhdGUpIHtcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoXG4gICAgICAgIFwiLi9jZGsub3V0L3N0YWNrLnRlbXBsYXRlLmpzb25cIixcbiAgICAgICAgSlNPTi5zdHJpbmdpZnkoc3RhY2tDb25maWcudGVtcGxhdGUsIG51bGwsIDIpXG4gICAgICApO1xuXG4gICAgICB0aGlzLmltcG9ydGVkVGVtcGxhdGUgPSBuZXcgY2ZuaW5jLkNmbkluY2x1ZGUodGhpcywgXCJUZW1wbGF0ZVwiLCB7XG4gICAgICAgIHRlbXBsYXRlRmlsZTogXCIuL2Nkay5vdXQvc3RhY2sudGVtcGxhdGUuanNvblwiLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG4iXX0=