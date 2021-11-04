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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhY2tBcHAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGliL3N0YWNrQXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFDQUFxQztBQUVyQyx1REFBdUQ7QUFDdkQsMkZBQXVGO0FBRXZGLE1BQWEsUUFBUyxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBMENyQyxZQUFZLE1BQWUsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDN0QsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDekIsSUFBSSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUM7SUFDcEIsQ0FBQztJQXpDRCxJQUFJLGlCQUFpQjtRQUNuQix3Q0FBd0M7UUFDeEMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFFRCxLQUFLLENBQUMsZUFBZTtRQUNuQixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN2RSxDQUFDO0lBRUQsS0FBSyxDQUFDLGtCQUFrQjtRQUN0QiwrQ0FBK0M7UUFDL0MsTUFBTSxXQUFXLEdBQUcsTUFBTSxzQkFBVyxDQUFDLDRCQUE0QixDQUFDO1lBQ2pFLG1EQUFtRDtZQUNuRCxPQUFPLEVBQUUsU0FBUztTQUNuQixDQUFDLENBQUM7UUFFSCxPQUFPLElBQUksc0RBQXlCLENBQUMsRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFFRCxLQUFLLENBQUMsTUFBTTtRQUNWLE1BQU0sSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQzdCLE1BQU0sY0FBYyxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDdkQsTUFBTSxtQkFBbUIsR0FBRyxNQUFNLGNBQWMsQ0FBQyxXQUFXLENBQUM7WUFDM0QsaUVBQWlFO1lBQ2pFLGFBQWE7WUFDYixLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWE7U0FDMUIsQ0FBQyxDQUFDO1FBRUgsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBRWpDLE1BQU0sY0FBYyxHQUFHLE1BQU0sY0FBYyxDQUFDLFlBQVksQ0FBQztZQUN2RCxnRUFBZ0U7WUFDaEUsYUFBYTtZQUNiLEtBQUssRUFBRSxJQUFJLENBQUMsYUFBYTtTQUMxQixDQUFDLENBQUM7UUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzlCLENBQUM7Q0FNRjtBQTlDRCw0QkE4Q0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSBcIkBhd3MtY2RrL2NvcmVcIjtcbmltcG9ydCAqIGFzIGN4YXBpIGZyb20gXCJAYXdzLWNkay9jeC1hcGlcIjtcbmltcG9ydCB7IFNka1Byb3ZpZGVyIH0gZnJvbSBcImF3cy1jZGsvbGliL2FwaS9hd3MtYXV0aFwiO1xuaW1wb3J0IHsgQ2xvdWRGb3JtYXRpb25EZXBsb3ltZW50cyB9IGZyb20gXCJhd3MtY2RrL2xpYi9hcGkvY2xvdWRmb3JtYXRpb24tZGVwbG95bWVudHNcIjtcblxuZXhwb3J0IGNsYXNzIFN0YWNrQXBwIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgcHJpdmF0ZSBzdGFja0FydGlmYWN0OiBjeGFwaS5DbG91ZEZvcm1hdGlvblN0YWNrQXJ0aWZhY3Q7XG4gIHByaXZhdGUgYXBwOiBjZGsuQXBwO1xuXG4gIGdldCBhdmFpbGFiaWxpdHlab25lcygpOiBzdHJpbmdbXSB7XG4gICAgLy8gVE9ETzogTWFwIHRvIFZQQyBhdmFpbGFiaWxpdHkgem9uZShzKVxuICAgIHJldHVybiBbXCJ1cy13ZXN0LTJhXCJdO1xuICB9XG5cbiAgYXN5bmMgc3ludGhlc2l6ZVN0YWNrKCkge1xuICAgIHRoaXMuc3RhY2tBcnRpZmFjdCA9IHRoaXMuYXBwLnN5bnRoKCkuZ2V0U3RhY2tCeU5hbWUodGhpcy5zdGFja05hbWUpO1xuICB9XG5cbiAgYXN5bmMgY3JlYXRlTmV3Q2ZuRGVwbG95KCk6IFByb21pc2U8Q2xvdWRGb3JtYXRpb25EZXBsb3ltZW50cz4ge1xuICAgIC8vIFVTRVItSU5QVVQ6IE9wdGlvbmFsIFByb2ZpbGUgTmFtZSBvciBEZWZhdWx0XG4gICAgY29uc3Qgc2RrUHJvdmlkZXIgPSBhd2FpdCBTZGtQcm92aWRlci53aXRoQXdzQ2xpQ29tcGF0aWJsZURlZmF1bHRzKHtcbiAgICAgIC8vIHByb2ZpbGU6ICd5b3VyIH4vLmF3cy9jb25maWcgcHJvZmlsZSBuYW1lIGhlcmUnLFxuICAgICAgcHJvZmlsZTogXCJkZWZhdWx0XCIsXG4gICAgfSk7XG5cbiAgICByZXR1cm4gbmV3IENsb3VkRm9ybWF0aW9uRGVwbG95bWVudHMoeyBzZGtQcm92aWRlciB9KTtcbiAgfVxuXG4gIGFzeW5jIGRlcGxveSgpIHtcbiAgICBhd2FpdCB0aGlzLnN5bnRoZXNpemVTdGFjaygpO1xuICAgIGNvbnN0IGNsb3VkRm9ybWF0aW9uID0gYXdhaXQgdGhpcy5jcmVhdGVOZXdDZm5EZXBsb3koKTtcbiAgICBjb25zdCBkZXBsb3lSZXN1bHRQcm9taXNlID0gYXdhaXQgY2xvdWRGb3JtYXRpb24uZGVwbG95U3RhY2soe1xuICAgICAgLy8gVE9ETzogQWRkcmVzcyBDbG91ZEZvcm1hdGlvblN0YWNrQXJ0aWZhY3Qgc2VwYXJhdGUgZGVmaW5pdGlvbnNcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHN0YWNrOiB0aGlzLnN0YWNrQXJ0aWZhY3QsXG4gICAgfSk7XG5cbiAgICBjb25zb2xlLmxvZyhkZXBsb3lSZXN1bHRQcm9taXNlKTtcblxuICAgIGNvbnN0IGRlc3Ryb3lQcm9taXNlID0gYXdhaXQgY2xvdWRGb3JtYXRpb24uZGVzdHJveVN0YWNrKHtcbiAgICAgIC8vIFRPRE86IEFkZHJlc3MgQ2xvdWRGb3JtYXRpb25TdGFja0FydGlmYWN0IHNlcGFyYXRlIGRlZmludGlvbnNcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHN0YWNrOiB0aGlzLnN0YWNrQXJ0aWZhY3QsXG4gICAgfSk7XG4gICAgY29uc29sZS5sb2coZGVzdHJveVByb21pc2UpO1xuICB9XG5cbiAgY29uc3RydWN0b3Ioc291cmNlOiBjZGsuQXBwLCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc291cmNlLCBpZCwgcHJvcHMpO1xuICAgIHRoaXMuYXBwID0gc291cmNlO1xuICB9XG59XG4iXX0=