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
const aws_auth_1 = require("aws-cdk/lib/api/aws-auth");
const cloudformation_deployments_1 = require("aws-cdk/lib/api/cloudformation-deployments");
class ExistingStack extends cdk.Stack {
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
exports.ExistingStack = ExistingStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhpc2l0bmdfc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY2ZuX2ludGVyZmFjZS9saWIvZXhpc2l0bmdfc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG1EQUFxQztBQUVyQyx1REFBdUQ7QUFDdkQsMkZBQXVGO0FBRXZGLE1BQWEsYUFBYyxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBMEMxQyxZQUFZLE1BQWUsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDN0QsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDekIsSUFBSSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUM7SUFDcEIsQ0FBQztJQXpDRCxJQUFJLGlCQUFpQjtRQUNuQix3Q0FBd0M7UUFDeEMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFFRCxLQUFLLENBQUMsZUFBZTtRQUNuQixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN2RSxDQUFDO0lBRUQsS0FBSyxDQUFDLGtCQUFrQjtRQUN0QiwrQ0FBK0M7UUFDL0MsTUFBTSxXQUFXLEdBQUcsTUFBTSxzQkFBVyxDQUFDLDRCQUE0QixDQUFDO1lBQ2pFLG1EQUFtRDtZQUNuRCxPQUFPLEVBQUUsU0FBUztTQUNuQixDQUFDLENBQUM7UUFFSCxPQUFPLElBQUksc0RBQXlCLENBQUMsRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFFRCxLQUFLLENBQUMsTUFBTTtRQUNWLE1BQU0sSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQzdCLE1BQU0sY0FBYyxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDdkQsTUFBTSxtQkFBbUIsR0FBRyxNQUFNLGNBQWMsQ0FBQyxXQUFXLENBQUM7WUFDM0QsaUVBQWlFO1lBQ2pFLGFBQWE7WUFDYixLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWE7U0FDMUIsQ0FBQyxDQUFDO1FBRUgsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBRWpDLE1BQU0sY0FBYyxHQUFHLE1BQU0sY0FBYyxDQUFDLFlBQVksQ0FBQztZQUN2RCxnRUFBZ0U7WUFDaEUsYUFBYTtZQUNiLEtBQUssRUFBRSxJQUFJLENBQUMsYUFBYTtTQUMxQixDQUFDLENBQUM7UUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzlCLENBQUM7Q0FNRjtBQTlDRCxzQ0E4Q0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSBcIkBhd3MtY2RrL2NvcmVcIjtcbmltcG9ydCAqIGFzIGN4YXBpIGZyb20gXCJAYXdzLWNkay9jeC1hcGlcIjtcbmltcG9ydCB7IFNka1Byb3ZpZGVyIH0gZnJvbSBcImF3cy1jZGsvbGliL2FwaS9hd3MtYXV0aFwiO1xuaW1wb3J0IHsgQ2xvdWRGb3JtYXRpb25EZXBsb3ltZW50cyB9IGZyb20gXCJhd3MtY2RrL2xpYi9hcGkvY2xvdWRmb3JtYXRpb24tZGVwbG95bWVudHNcIjtcblxuZXhwb3J0IGNsYXNzIEV4aXN0aW5nU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBwcml2YXRlIHN0YWNrQXJ0aWZhY3Q6IGN4YXBpLkNsb3VkRm9ybWF0aW9uU3RhY2tBcnRpZmFjdDtcbiAgcHJpdmF0ZSBhcHA6IGNkay5BcHA7XG5cbiAgZ2V0IGF2YWlsYWJpbGl0eVpvbmVzKCk6IHN0cmluZ1tdIHtcbiAgICAvLyBUT0RPOiBNYXAgdG8gVlBDIGF2YWlsYWJpbGl0eSB6b25lKHMpXG4gICAgcmV0dXJuIFtcInVzLXdlc3QtMmFcIl07XG4gIH1cblxuICBhc3luYyBzeW50aGVzaXplU3RhY2soKSB7XG4gICAgdGhpcy5zdGFja0FydGlmYWN0ID0gdGhpcy5hcHAuc3ludGgoKS5nZXRTdGFja0J5TmFtZSh0aGlzLnN0YWNrTmFtZSk7XG4gIH1cblxuICBhc3luYyBjcmVhdGVOZXdDZm5EZXBsb3koKTogUHJvbWlzZTxDbG91ZEZvcm1hdGlvbkRlcGxveW1lbnRzPiB7XG4gICAgLy8gVVNFUi1JTlBVVDogT3B0aW9uYWwgUHJvZmlsZSBOYW1lIG9yIERlZmF1bHRcbiAgICBjb25zdCBzZGtQcm92aWRlciA9IGF3YWl0IFNka1Byb3ZpZGVyLndpdGhBd3NDbGlDb21wYXRpYmxlRGVmYXVsdHMoe1xuICAgICAgLy8gcHJvZmlsZTogJ3lvdXIgfi8uYXdzL2NvbmZpZyBwcm9maWxlIG5hbWUgaGVyZScsXG4gICAgICBwcm9maWxlOiBcImRlZmF1bHRcIixcbiAgICB9KTtcblxuICAgIHJldHVybiBuZXcgQ2xvdWRGb3JtYXRpb25EZXBsb3ltZW50cyh7IHNka1Byb3ZpZGVyIH0pO1xuICB9XG5cbiAgYXN5bmMgZGVwbG95KCkge1xuICAgIGF3YWl0IHRoaXMuc3ludGhlc2l6ZVN0YWNrKCk7XG4gICAgY29uc3QgY2xvdWRGb3JtYXRpb24gPSBhd2FpdCB0aGlzLmNyZWF0ZU5ld0NmbkRlcGxveSgpO1xuICAgIGNvbnN0IGRlcGxveVJlc3VsdFByb21pc2UgPSBhd2FpdCBjbG91ZEZvcm1hdGlvbi5kZXBsb3lTdGFjayh7XG4gICAgICAvLyBUT0RPOiBBZGRyZXNzIENsb3VkRm9ybWF0aW9uU3RhY2tBcnRpZmFjdCBzZXBhcmF0ZSBkZWZpbml0aW9uc1xuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgc3RhY2s6IHRoaXMuc3RhY2tBcnRpZmFjdCxcbiAgICB9KTtcblxuICAgIGNvbnNvbGUubG9nKGRlcGxveVJlc3VsdFByb21pc2UpO1xuXG4gICAgY29uc3QgZGVzdHJveVByb21pc2UgPSBhd2FpdCBjbG91ZEZvcm1hdGlvbi5kZXN0cm95U3RhY2soe1xuICAgICAgLy8gVE9ETzogQWRkcmVzcyBDbG91ZEZvcm1hdGlvblN0YWNrQXJ0aWZhY3Qgc2VwYXJhdGUgZGVmaW50aW9uc1xuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgc3RhY2s6IHRoaXMuc3RhY2tBcnRpZmFjdCxcbiAgICB9KTtcbiAgICBjb25zb2xlLmxvZyhkZXN0cm95UHJvbWlzZSk7XG4gIH1cblxuICBjb25zdHJ1Y3Rvcihzb3VyY2U6IGNkay5BcHAsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzb3VyY2UsIGlkLCBwcm9wcyk7XG4gICAgdGhpcy5hcHAgPSBzb3VyY2U7XG4gIH1cbn1cbiJdfQ==