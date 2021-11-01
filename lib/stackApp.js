"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StackApp = void 0;
const cdk = require("@aws-cdk/core");
const aws_auth_1 = require("aws-cdk/lib/api/aws-auth");
const cloudformation_deployments_1 = require("aws-cdk/lib/api/cloudformation-deployments");
class StackApp extends cdk.Stack {
    constructor(id, props) {
        const app = new cdk.App();
        super(app, id, props);
        this.app = app;
    }
    get availabilityZones() {
        // TODO: Map to VPC availability zone(s)
        return ["us-east-1c"];
    }
    async synthesizeStack() {
        this.stackArtifact = this.app.synth().getStackByName(this.stackName);
    }
    async deploy() {
        await this.synthesizeStack();
        // USER-INPUT: Optional Profile Name or Default
        const sdkProvider = await aws_auth_1.SdkProvider.withAwsCliCompatibleDefaults({
            // profile: 'your ~/.aws/config profile name here',
            profile: "default",
        });
        const cloudFormation = new cloudformation_deployments_1.CloudFormationDeployments({ sdkProvider });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhY2tBcHAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzdGFja0FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxQ0FBcUM7QUFFckMsdURBQXVEO0FBQ3ZELDJGQUF1RjtBQUV2RixNQUFhLFFBQVMsU0FBUSxHQUFHLENBQUMsS0FBSztJQXNDckMsWUFBWSxFQUFVLEVBQUUsS0FBc0I7UUFDNUMsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDMUIsS0FBSyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdEIsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDakIsQ0FBQztJQXRDRCxJQUFJLGlCQUFpQjtRQUNuQix3Q0FBd0M7UUFDeEMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFFTSxLQUFLLENBQUMsZUFBZTtRQUMxQixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN2RSxDQUFDO0lBRUQsS0FBSyxDQUFDLE1BQU07UUFDVixNQUFNLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUM3QiwrQ0FBK0M7UUFDL0MsTUFBTSxXQUFXLEdBQUcsTUFBTSxzQkFBVyxDQUFDLDRCQUE0QixDQUFDO1lBQ2pFLG1EQUFtRDtZQUNuRCxPQUFPLEVBQUUsU0FBUztTQUNuQixDQUFDLENBQUM7UUFFSCxNQUFNLGNBQWMsR0FBRyxJQUFJLHNEQUF5QixDQUFDLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUN0RSxNQUFNLG1CQUFtQixHQUFHLE1BQU0sY0FBYyxDQUFDLFdBQVcsQ0FBQztZQUMzRCxpRUFBaUU7WUFDakUsYUFBYTtZQUNiLEtBQUssRUFBRSxJQUFJLENBQUMsYUFBYTtTQUMxQixDQUFDLENBQUM7UUFFSCxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFFakMsTUFBTSxjQUFjLEdBQUcsTUFBTSxjQUFjLENBQUMsWUFBWSxDQUFDO1lBQ3ZELGdFQUFnRTtZQUNoRSxhQUFhO1lBQ2IsS0FBSyxFQUFFLElBQUksQ0FBQyxhQUFhO1NBQzFCLENBQUMsQ0FBQztRQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDOUIsQ0FBQztDQU9GO0FBM0NELDRCQTJDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiQGF3cy1jZGsvY29yZVwiO1xuaW1wb3J0ICogYXMgY3hhcGkgZnJvbSBcIkBhd3MtY2RrL2N4LWFwaVwiO1xuaW1wb3J0IHsgU2RrUHJvdmlkZXIgfSBmcm9tIFwiYXdzLWNkay9saWIvYXBpL2F3cy1hdXRoXCI7XG5pbXBvcnQgeyBDbG91ZEZvcm1hdGlvbkRlcGxveW1lbnRzIH0gZnJvbSBcImF3cy1jZGsvbGliL2FwaS9jbG91ZGZvcm1hdGlvbi1kZXBsb3ltZW50c1wiO1xuXG5leHBvcnQgY2xhc3MgU3RhY2tBcHAgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBwcml2YXRlIHN0YWNrQXJ0aWZhY3Q6IGN4YXBpLkNsb3VkRm9ybWF0aW9uU3RhY2tBcnRpZmFjdDtcbiAgcHVibGljIGFwcDogY2RrLkFwcDtcblxuICBnZXQgYXZhaWxhYmlsaXR5Wm9uZXMoKTogc3RyaW5nW10ge1xuICAgIC8vIFRPRE86IE1hcCB0byBWUEMgYXZhaWxhYmlsaXR5IHpvbmUocylcbiAgICByZXR1cm4gW1widXMtZWFzdC0xY1wiXTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBzeW50aGVzaXplU3RhY2soKSB7XG4gICAgdGhpcy5zdGFja0FydGlmYWN0ID0gdGhpcy5hcHAuc3ludGgoKS5nZXRTdGFja0J5TmFtZSh0aGlzLnN0YWNrTmFtZSk7XG4gIH1cblxuICBhc3luYyBkZXBsb3koKSB7XG4gICAgYXdhaXQgdGhpcy5zeW50aGVzaXplU3RhY2soKTtcbiAgICAvLyBVU0VSLUlOUFVUOiBPcHRpb25hbCBQcm9maWxlIE5hbWUgb3IgRGVmYXVsdFxuICAgIGNvbnN0IHNka1Byb3ZpZGVyID0gYXdhaXQgU2RrUHJvdmlkZXIud2l0aEF3c0NsaUNvbXBhdGlibGVEZWZhdWx0cyh7XG4gICAgICAvLyBwcm9maWxlOiAneW91ciB+Ly5hd3MvY29uZmlnIHByb2ZpbGUgbmFtZSBoZXJlJyxcbiAgICAgIHByb2ZpbGU6IFwiZGVmYXVsdFwiLFxuICAgIH0pO1xuXG4gICAgY29uc3QgY2xvdWRGb3JtYXRpb24gPSBuZXcgQ2xvdWRGb3JtYXRpb25EZXBsb3ltZW50cyh7IHNka1Byb3ZpZGVyIH0pO1xuICAgIGNvbnN0IGRlcGxveVJlc3VsdFByb21pc2UgPSBhd2FpdCBjbG91ZEZvcm1hdGlvbi5kZXBsb3lTdGFjayh7XG4gICAgICAvLyBUT0RPOiBBZGRyZXNzIENsb3VkRm9ybWF0aW9uU3RhY2tBcnRpZmFjdCBzZXBhcmF0ZSBkZWZpbml0aW9uc1xuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgc3RhY2s6IHRoaXMuc3RhY2tBcnRpZmFjdCxcbiAgICB9KTtcblxuICAgIGNvbnNvbGUubG9nKGRlcGxveVJlc3VsdFByb21pc2UpO1xuXG4gICAgY29uc3QgZGVzdHJveVByb21pc2UgPSBhd2FpdCBjbG91ZEZvcm1hdGlvbi5kZXN0cm95U3RhY2soe1xuICAgICAgLy8gVE9ETzogQWRkcmVzcyBDbG91ZEZvcm1hdGlvblN0YWNrQXJ0aWZhY3Qgc2VwYXJhdGUgZGVmaW50aW9uc1xuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgc3RhY2s6IHRoaXMuc3RhY2tBcnRpZmFjdCxcbiAgICB9KTtcbiAgICBjb25zb2xlLmxvZyhkZXN0cm95UHJvbWlzZSk7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcbiAgICBzdXBlcihhcHAsIGlkLCBwcm9wcyk7XG4gICAgdGhpcy5hcHAgPSBhcHA7XG4gIH1cbn1cbiJdfQ==