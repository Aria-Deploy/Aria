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
    constructor(id, stackConfig, props) {
        const app = new cdk.App();
        super(app, id, props);
        this.profileName = stackConfig.profileName;
        this.app = app;
        fs.writeFileSync("./cdk.out/stack.template.json", JSON.stringify(stackConfig.template, null, 2));
        new cfninc.CfnInclude(this, "Template", {
            templateFile: "./cdk.out/stack.template.json",
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhpc3Rpbmdfc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY2ZuX2ludGVyZmFjZS9saWIvZXhpc3Rpbmdfc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG1EQUFxQztBQUdyQyx3RUFBMEQ7QUFDMUQsdUNBQXlCO0FBQ3pCLHVEQUF1RDtBQUN2RCwyRkFBdUY7QUFHdkYsTUFBYSxhQUFjLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFxQzFDLGdDQUFnQztJQUNoQyxZQUFZLEVBQVUsRUFBRSxXQUFnQixFQUFFLEtBQXNCO1FBQzlELE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzFCLEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQztRQUMzQyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUVmLEVBQUUsQ0FBQyxhQUFhLENBQ2QsK0JBQStCLEVBQy9CLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQzlDLENBQUM7UUFFRixJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRTtZQUN0QyxZQUFZLEVBQUUsK0JBQStCO1NBQzlDLENBQUMsQ0FBQztJQUNMLENBQUM7SUE3Q0QsSUFBSSxpQkFBaUI7UUFDbkIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDO0lBQzFDLENBQUM7SUFFRCxlQUFlO1FBQ2IsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDdkUsQ0FBQztJQUVELEtBQUssQ0FBQyxrQkFBa0I7UUFDdEIsK0NBQStDO1FBQy9DLE1BQU0sV0FBVyxHQUFHLE1BQU0sc0JBQVcsQ0FBQyw0QkFBNEIsQ0FBQztZQUNqRSxtREFBbUQ7WUFDbkQsT0FBTyxFQUFFLElBQUksQ0FBQyxXQUFXO1NBQzFCLENBQUMsQ0FBQztRQUVILE9BQU8sSUFBSSxzREFBeUIsQ0FBQyxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUVELEtBQUssQ0FBQyxNQUFNO1FBQ1YsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3ZCLE1BQU0sY0FBYyxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDdkQsTUFBTSxtQkFBbUIsR0FBRyxNQUFNLGNBQWMsQ0FBQyxXQUFXLENBQUM7WUFDM0QsaUVBQWlFO1lBQ2pFLGFBQWE7WUFDYixLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWE7U0FDMUIsQ0FBQyxDQUFDO1FBRUgsT0FBTyxtQkFBbUIsQ0FBQztJQUM3QixDQUFDO0NBa0JGO0FBckRELHNDQXFEQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiQGF3cy1jZGsvY29yZVwiO1xuaW1wb3J0ICogYXMgY3hhcGkgZnJvbSBcIkBhd3MtY2RrL2N4LWFwaVwiO1xuaW1wb3J0ICogYXMgZWMyIGZyb20gXCJAYXdzLWNkay9hd3MtZWMyXCI7XG5pbXBvcnQgKiBhcyBjZm5pbmMgZnJvbSBcIkBhd3MtY2RrL2Nsb3VkZm9ybWF0aW9uLWluY2x1ZGVcIjtcbmltcG9ydCAqIGFzIGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0IHsgU2RrUHJvdmlkZXIgfSBmcm9tIFwiYXdzLWNkay9saWIvYXBpL2F3cy1hdXRoXCI7XG5pbXBvcnQgeyBDbG91ZEZvcm1hdGlvbkRlcGxveW1lbnRzIH0gZnJvbSBcImF3cy1jZGsvbGliL2FwaS9jbG91ZGZvcm1hdGlvbi1kZXBsb3ltZW50c1wiO1xuaW1wb3J0IHsgVnBjQXR0cmlidXRlcyB9IGZyb20gXCJAYXdzLWNkay9hd3MtZWMyXCI7XG5cbmV4cG9ydCBjbGFzcyBFeGlzdGluZ1N0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgcHJpdmF0ZSBzdGFja0FydGlmYWN0OiBjeGFwaS5DbG91ZEZvcm1hdGlvblN0YWNrQXJ0aWZhY3Q7XG4gIHByaXZhdGUgYXBwOiBjZGsuQXBwO1xuICBwcml2YXRlIHZwY0NvbmZpZzogVnBjQXR0cmlidXRlcztcbiAgcHJpdmF0ZSBwcm9maWxlTmFtZTogc3RyaW5nO1xuICBwdWJsaWMgdnBjOiBlYzIuSVZwYztcblxuICBnZXQgYXZhaWxhYmlsaXR5Wm9uZXMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiB0aGlzLnZwY0NvbmZpZy5hdmFpbGFiaWxpdHlab25lcztcbiAgfVxuXG4gIHN5bnRoZXNpemVTdGFjaygpIHtcbiAgICB0aGlzLnN0YWNrQXJ0aWZhY3QgPSB0aGlzLmFwcC5zeW50aCgpLmdldFN0YWNrQnlOYW1lKHRoaXMuc3RhY2tOYW1lKTtcbiAgfVxuXG4gIGFzeW5jIGNyZWF0ZU5ld0NmbkRlcGxveSgpOiBQcm9taXNlPENsb3VkRm9ybWF0aW9uRGVwbG95bWVudHM+IHtcbiAgICAvLyBVU0VSLUlOUFVUOiBPcHRpb25hbCBQcm9maWxlIE5hbWUgb3IgRGVmYXVsdFxuICAgIGNvbnN0IHNka1Byb3ZpZGVyID0gYXdhaXQgU2RrUHJvdmlkZXIud2l0aEF3c0NsaUNvbXBhdGlibGVEZWZhdWx0cyh7XG4gICAgICAvLyBwcm9maWxlOiAneW91ciB+Ly5hd3MvY29uZmlnIHByb2ZpbGUgbmFtZSBoZXJlJyxcbiAgICAgIHByb2ZpbGU6IHRoaXMucHJvZmlsZU5hbWUsXG4gICAgfSk7XG5cbiAgICByZXR1cm4gbmV3IENsb3VkRm9ybWF0aW9uRGVwbG95bWVudHMoeyBzZGtQcm92aWRlciB9KTtcbiAgfVxuXG4gIGFzeW5jIGRlcGxveSgpIHtcbiAgICB0aGlzLnN5bnRoZXNpemVTdGFjaygpO1xuICAgIGNvbnN0IGNsb3VkRm9ybWF0aW9uID0gYXdhaXQgdGhpcy5jcmVhdGVOZXdDZm5EZXBsb3koKTtcbiAgICBjb25zdCBkZXBsb3lSZXN1bHRQcm9taXNlID0gYXdhaXQgY2xvdWRGb3JtYXRpb24uZGVwbG95U3RhY2soe1xuICAgICAgLy8gVE9ETzogQWRkcmVzcyBDbG91ZEZvcm1hdGlvblN0YWNrQXJ0aWZhY3Qgc2VwYXJhdGUgZGVmaW5pdGlvbnNcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHN0YWNrOiB0aGlzLnN0YWNrQXJ0aWZhY3QsXG4gICAgfSk7XG5cbiAgICByZXR1cm4gZGVwbG95UmVzdWx0UHJvbWlzZTtcbiAgfVxuXG4gIC8vIFRPRE86IGRlZmluZSBzdGFja0NvbmZpZyB0eXBlXG4gIGNvbnN0cnVjdG9yKGlkOiBzdHJpbmcsIHN0YWNrQ29uZmlnOiBhbnksIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBjb25zdCBhcHAgPSBuZXcgY2RrLkFwcCgpO1xuICAgIHN1cGVyKGFwcCwgaWQsIHByb3BzKTtcbiAgICB0aGlzLnByb2ZpbGVOYW1lID0gc3RhY2tDb25maWcucHJvZmlsZU5hbWU7XG4gICAgdGhpcy5hcHAgPSBhcHA7XG5cbiAgICBmcy53cml0ZUZpbGVTeW5jKFxuICAgICAgXCIuL2Nkay5vdXQvc3RhY2sudGVtcGxhdGUuanNvblwiLFxuICAgICAgSlNPTi5zdHJpbmdpZnkoc3RhY2tDb25maWcudGVtcGxhdGUsIG51bGwsIDIpXG4gICAgKTtcblxuICAgIG5ldyBjZm5pbmMuQ2ZuSW5jbHVkZSh0aGlzLCBcIlRlbXBsYXRlXCIsIHtcbiAgICAgIHRlbXBsYXRlRmlsZTogXCIuL2Nkay5vdXQvc3RhY2sudGVtcGxhdGUuanNvblwiLFxuICAgIH0pO1xuICB9XG59XG4iXX0=