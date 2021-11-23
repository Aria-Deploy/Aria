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
        console.log('stackConfig in existing stack: ', stackConfig);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhpc3Rpbmdfc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY2ZuX2ludGVyZmFjZS9saWIvZXhpc3Rpbmdfc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG1EQUFxQztBQUdyQyx3RUFBMEQ7QUFDMUQsdUNBQXlCO0FBQ3pCLHVEQUF1RDtBQUN2RCwyRkFBdUY7QUFJdkYsTUFBYSxhQUFjLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFxRDFDLGdDQUFnQztJQUNoQyxZQUNFLE1BQWUsRUFDZixFQUFVLEVBQ1YsV0FBZ0IsRUFDaEIsS0FBc0I7UUFFdEIsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDekIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQ0FBaUMsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUM1RCxJQUFJLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQztRQUNsQixJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQyxXQUFXLENBQUM7UUFFM0MsSUFBSSxXQUFXLENBQUMsUUFBUSxFQUFFO1lBQ3hCLEVBQUUsQ0FBQyxhQUFhLENBQ2QsK0JBQStCLEVBQy9CLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQzlDLENBQUM7WUFFRixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUU7Z0JBQzlELFlBQVksRUFBRSwrQkFBK0I7YUFDOUMsQ0FBQyxDQUFDO1NBQ0o7SUFDSCxDQUFDO0lBbkVELElBQUksaUJBQWlCO1FBQ25CLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQztJQUMxQyxDQUFDO0lBRUQsZUFBZTtRQUNiLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7SUFFRCxLQUFLLENBQUMsa0JBQWtCO1FBQ3RCLCtDQUErQztRQUMvQyxNQUFNLFdBQVcsR0FBRyxNQUFNLHNCQUFXLENBQUMsNEJBQTRCLENBQUM7WUFDakUsbURBQW1EO1lBQ25ELE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBVztTQUMxQixDQUFDLENBQUM7UUFFSCxPQUFPLElBQUksc0RBQXlCLENBQUMsRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFFRCxLQUFLLENBQUMsTUFBTTtRQUNWLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN2QixNQUFNLGNBQWMsR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQ3ZELE1BQU0sbUJBQW1CLEdBQUcsTUFBTSxjQUFjLENBQUMsV0FBVyxDQUFDO1lBQzNELGlFQUFpRTtZQUNqRSxhQUFhO1lBQ2IsS0FBSyxFQUFFLElBQUksQ0FBQyxhQUFhO1lBQ3pCLHFCQUFxQixFQUFFLElBQUk7U0FDNUIsQ0FBQyxDQUFDO1FBRUgsT0FBTyxtQkFBbUIsQ0FBQztJQUM3QixDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQU87UUFDWCxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDdkIsTUFBTSxjQUFjLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUN2RCxNQUFNLGNBQWMsQ0FBQyxZQUFZLENBQUM7WUFDaEMsYUFBYTtZQUNiLEtBQUssRUFBRSxJQUFJLENBQUMsYUFBYTtZQUN6QixxQkFBcUIsRUFBRSxJQUFJO1NBQzVCLENBQUMsQ0FBQztRQUVILE9BQU87WUFDTCxhQUFhLEVBQUUsOEJBQThCO1NBQzlDLENBQUM7SUFDSixDQUFDO0NBeUJGO0FBNUVELHNDQTRFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiQGF3cy1jZGsvY29yZVwiO1xuaW1wb3J0ICogYXMgY3hhcGkgZnJvbSBcIkBhd3MtY2RrL2N4LWFwaVwiO1xuaW1wb3J0ICogYXMgZWMyIGZyb20gXCJAYXdzLWNkay9hd3MtZWMyXCI7XG5pbXBvcnQgKiBhcyBjZm5pbmMgZnJvbSBcIkBhd3MtY2RrL2Nsb3VkZm9ybWF0aW9uLWluY2x1ZGVcIjtcbmltcG9ydCAqIGFzIGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0IHsgU2RrUHJvdmlkZXIgfSBmcm9tIFwiYXdzLWNkay9saWIvYXBpL2F3cy1hdXRoXCI7XG5pbXBvcnQgeyBDbG91ZEZvcm1hdGlvbkRlcGxveW1lbnRzIH0gZnJvbSBcImF3cy1jZGsvbGliL2FwaS9jbG91ZGZvcm1hdGlvbi1kZXBsb3ltZW50c1wiO1xuaW1wb3J0IHsgVnBjQXR0cmlidXRlcyB9IGZyb20gXCJAYXdzLWNkay9hd3MtZWMyXCI7XG5pbXBvcnQgeyBDbG91ZEZvcm1hdGlvbiB9IGZyb20gXCJhd3Mtc2RrXCI7XG5cbmV4cG9ydCBjbGFzcyBFeGlzdGluZ1N0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgcHJpdmF0ZSBzdGFja0FydGlmYWN0OiBjeGFwaS5DbG91ZEZvcm1hdGlvblN0YWNrQXJ0aWZhY3Q7XG4gIHByaXZhdGUgYXBwOiBjZGsuQXBwO1xuICBwcml2YXRlIHZwY0NvbmZpZzogVnBjQXR0cmlidXRlcztcbiAgcHJpdmF0ZSBwcm9maWxlTmFtZTogc3RyaW5nO1xuICBwdWJsaWMgdnBjOiBlYzIuSVZwYztcbiAgcHVibGljIGltcG9ydGVkVGVtcGxhdGU6IGNmbmluYy5DZm5JbmNsdWRlO1xuXG4gIGdldCBhdmFpbGFiaWxpdHlab25lcygpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIHRoaXMudnBjQ29uZmlnLmF2YWlsYWJpbGl0eVpvbmVzO1xuICB9XG5cbiAgc3ludGhlc2l6ZVN0YWNrKCkge1xuICAgIHRoaXMuc3RhY2tBcnRpZmFjdCA9IHRoaXMuYXBwLnN5bnRoKCkuZ2V0U3RhY2tCeU5hbWUodGhpcy5zdGFja05hbWUpO1xuICB9XG5cbiAgYXN5bmMgY3JlYXRlTmV3Q2ZuRGVwbG95KCk6IFByb21pc2U8Q2xvdWRGb3JtYXRpb25EZXBsb3ltZW50cz4ge1xuICAgIC8vIFVTRVItSU5QVVQ6IE9wdGlvbmFsIFByb2ZpbGUgTmFtZSBvciBEZWZhdWx0XG4gICAgY29uc3Qgc2RrUHJvdmlkZXIgPSBhd2FpdCBTZGtQcm92aWRlci53aXRoQXdzQ2xpQ29tcGF0aWJsZURlZmF1bHRzKHtcbiAgICAgIC8vIHByb2ZpbGU6ICd5b3VyIH4vLmF3cy9jb25maWcgcHJvZmlsZSBuYW1lIGhlcmUnLFxuICAgICAgcHJvZmlsZTogdGhpcy5wcm9maWxlTmFtZSxcbiAgICB9KTtcblxuICAgIHJldHVybiBuZXcgQ2xvdWRGb3JtYXRpb25EZXBsb3ltZW50cyh7IHNka1Byb3ZpZGVyIH0pO1xuICB9XG5cbiAgYXN5bmMgZGVwbG95KCkge1xuICAgIHRoaXMuc3ludGhlc2l6ZVN0YWNrKCk7XG4gICAgY29uc3QgY2xvdWRGb3JtYXRpb24gPSBhd2FpdCB0aGlzLmNyZWF0ZU5ld0NmbkRlcGxveSgpO1xuICAgIGNvbnN0IGRlcGxveVJlc3VsdFByb21pc2UgPSBhd2FpdCBjbG91ZEZvcm1hdGlvbi5kZXBsb3lTdGFjayh7XG4gICAgICAvLyBUT0RPOiBBZGRyZXNzIENsb3VkRm9ybWF0aW9uU3RhY2tBcnRpZmFjdCBzZXBhcmF0ZSBkZWZpbml0aW9uc1xuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgc3RhY2s6IHRoaXMuc3RhY2tBcnRpZmFjdCxcbiAgICAgIHVzZVByZXZpb3VzUGFyYW1ldGVyczogdHJ1ZSxcbiAgICB9KTtcblxuICAgIHJldHVybiBkZXBsb3lSZXN1bHRQcm9taXNlO1xuICB9XG5cbiAgYXN5bmMgZGVzdHJveSgpIHtcbiAgICB0aGlzLnN5bnRoZXNpemVTdGFjaygpO1xuICAgIGNvbnN0IGNsb3VkRm9ybWF0aW9uID0gYXdhaXQgdGhpcy5jcmVhdGVOZXdDZm5EZXBsb3koKTtcbiAgICBhd2FpdCBjbG91ZEZvcm1hdGlvbi5kZXN0cm95U3RhY2soe1xuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgc3RhY2s6IHRoaXMuc3RhY2tBcnRpZmFjdCxcbiAgICAgIHVzZVByZXZpb3VzUGFyYW1ldGVyczogdHJ1ZSxcbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICBkZXN0cm95UmVzdWx0OiBcIlN0YWNrIERlc3Ryb3llZCBTdWNjZXNzZnVsbHlcIixcbiAgICB9O1xuICB9XG5cbiAgLy8gVE9ETzogZGVmaW5lIHN0YWNrQ29uZmlnIHR5cGVcbiAgY29uc3RydWN0b3IoXG4gICAgc291cmNlOiBjZGsuQXBwLFxuICAgIGlkOiBzdHJpbmcsXG4gICAgc3RhY2tDb25maWc6IGFueSxcbiAgICBwcm9wcz86IGNkay5TdGFja1Byb3BzXG4gICkge1xuICAgIHN1cGVyKHNvdXJjZSwgaWQsIHByb3BzKTtcbiAgICBjb25zb2xlLmxvZygnc3RhY2tDb25maWcgaW4gZXhpc3Rpbmcgc3RhY2s6ICcsIHN0YWNrQ29uZmlnKTtcbiAgICB0aGlzLmFwcCA9IHNvdXJjZTtcbiAgICB0aGlzLnByb2ZpbGVOYW1lID0gc3RhY2tDb25maWcucHJvZmlsZU5hbWU7XG5cbiAgICBpZiAoc3RhY2tDb25maWcudGVtcGxhdGUpIHtcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoXG4gICAgICAgIFwiLi9jZGsub3V0L3N0YWNrLnRlbXBsYXRlLmpzb25cIixcbiAgICAgICAgSlNPTi5zdHJpbmdpZnkoc3RhY2tDb25maWcudGVtcGxhdGUsIG51bGwsIDIpXG4gICAgICApO1xuXG4gICAgICB0aGlzLmltcG9ydGVkVGVtcGxhdGUgPSBuZXcgY2ZuaW5jLkNmbkluY2x1ZGUodGhpcywgXCJUZW1wbGF0ZVwiLCB7XG4gICAgICAgIHRlbXBsYXRlRmlsZTogXCIuL2Nkay5vdXQvc3RhY2sudGVtcGxhdGUuanNvblwiLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG4iXX0=