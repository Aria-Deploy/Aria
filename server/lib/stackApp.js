"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StackApp = void 0;
const cdk = require("@aws-cdk/core");
const aws_auth_1 = require("aws-cdk/lib/api/aws-auth");
const cloudformation_deployments_1 = require("aws-cdk/lib/api/cloudformation-deployments");
class StackApp extends cdk.Stack {
    constructor(source, id, props) {
        super(source, id, props);
        this.app = source;
    }
    get availabilityZones() {
        // TODO: Map to VPC availability zone(s)
        return ["us-west-2a"];
    }
    async synthesizeStack() {
        this.stackArtifact = this.app.synth().getStackByName(this.stackName);
    }
    async createNewCfnDeploy() {
        // USER-INPUT: Optional Profile Name or Default
        const sdkProvider = await aws_auth_1.SdkProvider.withAwsCliCompatibleDefaults({
            // profile: 'your ~/.aws/config profile name here',
            profile: "default",
        });
        return new cloudformation_deployments_1.CloudFormationDeployments({ sdkProvider });
    }
    async deploy() {
        await this.synthesizeStack();
        const cloudFormation = await this.createNewCfnDeploy();
        const deployResultPromise = await cloudFormation.deployStack({
            // TODO: Address CloudFormationStackArtifact separate definitions
            // @ts-ignore
            stack: this.stackArtifact,
        });
        console.log(deployResultPromise);
        const destroyPromise = await cloudFormation.destroyStack({
            // TODO: Address CloudFormationStackArtifact separate defintions
            // @ts-ignore
            stack: this.stackArtifact,
        });
        console.log(destroyPromise);
    }
}
exports.StackApp = StackApp;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhY2tBcHAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzdGFja0FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxQ0FBcUM7QUFFckMsdURBQXVEO0FBQ3ZELDJGQUF1RjtBQUV2RixNQUFhLFFBQVMsU0FBUSxHQUFHLENBQUMsS0FBSztJQTBDckMsWUFBWSxNQUFlLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQzdELEtBQUssQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3pCLElBQUksQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDO0lBQ3BCLENBQUM7SUF6Q0QsSUFBSSxpQkFBaUI7UUFDbkIsd0NBQXdDO1FBQ3hDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUN4QixDQUFDO0lBRUQsS0FBSyxDQUFDLGVBQWU7UUFDbkIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDdkUsQ0FBQztJQUVELEtBQUssQ0FBQyxrQkFBa0I7UUFDdEIsK0NBQStDO1FBQy9DLE1BQU0sV0FBVyxHQUFHLE1BQU0sc0JBQVcsQ0FBQyw0QkFBNEIsQ0FBQztZQUNqRSxtREFBbUQ7WUFDbkQsT0FBTyxFQUFFLFNBQVM7U0FDbkIsQ0FBQyxDQUFDO1FBRUgsT0FBTyxJQUFJLHNEQUF5QixDQUFDLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRUQsS0FBSyxDQUFDLE1BQU07UUFDVixNQUFNLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUM3QixNQUFNLGNBQWMsR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQ3ZELE1BQU0sbUJBQW1CLEdBQUcsTUFBTSxjQUFjLENBQUMsV0FBVyxDQUFDO1lBQzNELGlFQUFpRTtZQUNqRSxhQUFhO1lBQ2IsS0FBSyxFQUFFLElBQUksQ0FBQyxhQUFhO1NBQzFCLENBQUMsQ0FBQztRQUVILE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUVqQyxNQUFNLGNBQWMsR0FBRyxNQUFNLGNBQWMsQ0FBQyxZQUFZLENBQUM7WUFDdkQsZ0VBQWdFO1lBQ2hFLGFBQWE7WUFDYixLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWE7U0FDMUIsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUM5QixDQUFDO0NBTUY7QUE5Q0QsNEJBOENDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gXCJAYXdzLWNkay9jb3JlXCI7XG5pbXBvcnQgKiBhcyBjeGFwaSBmcm9tIFwiQGF3cy1jZGsvY3gtYXBpXCI7XG5pbXBvcnQgeyBTZGtQcm92aWRlciB9IGZyb20gXCJhd3MtY2RrL2xpYi9hcGkvYXdzLWF1dGhcIjtcbmltcG9ydCB7IENsb3VkRm9ybWF0aW9uRGVwbG95bWVudHMgfSBmcm9tIFwiYXdzLWNkay9saWIvYXBpL2Nsb3VkZm9ybWF0aW9uLWRlcGxveW1lbnRzXCI7XG5cbmV4cG9ydCBjbGFzcyBTdGFja0FwcCBleHRlbmRzIGNkay5TdGFjayB7XG4gIHByaXZhdGUgc3RhY2tBcnRpZmFjdDogY3hhcGkuQ2xvdWRGb3JtYXRpb25TdGFja0FydGlmYWN0O1xuICBwcml2YXRlIGFwcDogY2RrLkFwcDtcblxuICBnZXQgYXZhaWxhYmlsaXR5Wm9uZXMoKTogc3RyaW5nW10ge1xuICAgIC8vIFRPRE86IE1hcCB0byBWUEMgYXZhaWxhYmlsaXR5IHpvbmUocylcbiAgICByZXR1cm4gW1widXMtd2VzdC0yYVwiXTtcbiAgfVxuXG4gIGFzeW5jIHN5bnRoZXNpemVTdGFjaygpIHtcbiAgICB0aGlzLnN0YWNrQXJ0aWZhY3QgPSB0aGlzLmFwcC5zeW50aCgpLmdldFN0YWNrQnlOYW1lKHRoaXMuc3RhY2tOYW1lKTtcbiAgfVxuXG4gIGFzeW5jIGNyZWF0ZU5ld0NmbkRlcGxveSgpOiBQcm9taXNlPENsb3VkRm9ybWF0aW9uRGVwbG95bWVudHM+IHtcbiAgICAvLyBVU0VSLUlOUFVUOiBPcHRpb25hbCBQcm9maWxlIE5hbWUgb3IgRGVmYXVsdFxuICAgIGNvbnN0IHNka1Byb3ZpZGVyID0gYXdhaXQgU2RrUHJvdmlkZXIud2l0aEF3c0NsaUNvbXBhdGlibGVEZWZhdWx0cyh7XG4gICAgICAvLyBwcm9maWxlOiAneW91ciB+Ly5hd3MvY29uZmlnIHByb2ZpbGUgbmFtZSBoZXJlJyxcbiAgICAgIHByb2ZpbGU6IFwiZGVmYXVsdFwiLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIG5ldyBDbG91ZEZvcm1hdGlvbkRlcGxveW1lbnRzKHsgc2RrUHJvdmlkZXIgfSk7XG4gIH1cblxuICBhc3luYyBkZXBsb3koKSB7XG4gICAgYXdhaXQgdGhpcy5zeW50aGVzaXplU3RhY2soKTtcbiAgICBjb25zdCBjbG91ZEZvcm1hdGlvbiA9IGF3YWl0IHRoaXMuY3JlYXRlTmV3Q2ZuRGVwbG95KCk7XG4gICAgY29uc3QgZGVwbG95UmVzdWx0UHJvbWlzZSA9IGF3YWl0IGNsb3VkRm9ybWF0aW9uLmRlcGxveVN0YWNrKHtcbiAgICAgIC8vIFRPRE86IEFkZHJlc3MgQ2xvdWRGb3JtYXRpb25TdGFja0FydGlmYWN0IHNlcGFyYXRlIGRlZmluaXRpb25zXG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICBzdGFjazogdGhpcy5zdGFja0FydGlmYWN0LFxuICAgIH0pO1xuXG4gICAgY29uc29sZS5sb2coZGVwbG95UmVzdWx0UHJvbWlzZSk7XG5cbiAgICBjb25zdCBkZXN0cm95UHJvbWlzZSA9IGF3YWl0IGNsb3VkRm9ybWF0aW9uLmRlc3Ryb3lTdGFjayh7XG4gICAgICAvLyBUT0RPOiBBZGRyZXNzIENsb3VkRm9ybWF0aW9uU3RhY2tBcnRpZmFjdCBzZXBhcmF0ZSBkZWZpbnRpb25zXG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICBzdGFjazogdGhpcy5zdGFja0FydGlmYWN0LFxuICAgIH0pO1xuICAgIGNvbnNvbGUubG9nKGRlc3Ryb3lQcm9taXNlKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHNvdXJjZTogY2RrLkFwcCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNvdXJjZSwgaWQsIHByb3BzKTtcbiAgICB0aGlzLmFwcCA9IHNvdXJjZTtcbiAgfVxufVxuIl19