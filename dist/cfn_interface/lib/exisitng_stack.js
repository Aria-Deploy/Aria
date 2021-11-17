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
        console.log(cdk.Stack.of(this).account);
    }
    get availabilityZones() {
        return this.vpcConfig.availabilityZones;
    }
    async synthesizeStack() {
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
        await this.synthesizeStack();
        const cloudFormation = await this.createNewCfnDeploy();
        const deployResultPromise = await cloudFormation.deployStack({
            // TODO: Address CloudFormationStackArtifact separate definitions
            // @ts-ignore
            stack: this.stackArtifact,
        });
        // console.log(deployResultPromise);
        // // const destroyPromise = await cloudFormation.destroyStack({
        // //   // TODO: Address CloudFormationStackArtifact separate defintions
        // //   // @ts-ignore
        // //   stack: this.stackArtifact,
        // // });
        // // console.log(destroyPromise);
        // return deployResultPromise
        return deployResultPromise;
    }
}
exports.ExistingStack = ExistingStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhpc2l0bmdfc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY2ZuX2ludGVyZmFjZS9saWIvZXhpc2l0bmdfc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG1EQUFxQztBQUdyQyx3RUFBMEQ7QUFDMUQsdUNBQXlCO0FBQ3pCLHVEQUF1RDtBQUN2RCwyRkFBdUY7QUFHdkYsTUFBYSxhQUFjLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUE4QzFDLGdDQUFnQztJQUNoQyxZQUNFLE1BQWUsRUFDZixFQUFVLEVBQ1YsV0FBZ0IsRUFDaEIsS0FBc0I7UUFFdEIsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDekIsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUMsV0FBVyxDQUFDO1FBQzNDLElBQUksQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDO1FBRWxCLEVBQUUsQ0FBQyxhQUFhLENBQ2QsdUNBQXVDLEVBQ3ZDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQzlDLENBQUM7UUFFRixNQUFNLFFBQVEsR0FBRyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRTtZQUN2RCxZQUFZLEVBQUUsdUNBQXVDO1NBQ3RELENBQUMsQ0FBQztRQUVILE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDekMsQ0FBQztJQTVERCxJQUFJLGlCQUFpQjtRQUNuQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsaUJBQWlCLENBQUM7SUFDMUMsQ0FBQztJQUVELEtBQUssQ0FBQyxlQUFlO1FBQ25CLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7SUFFRCxLQUFLLENBQUMsa0JBQWtCO1FBQ3RCLCtDQUErQztRQUMvQyxNQUFNLFdBQVcsR0FBRyxNQUFNLHNCQUFXLENBQUMsNEJBQTRCLENBQUM7WUFDakUsbURBQW1EO1lBQ25ELE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBVztTQUMxQixDQUFDLENBQUM7UUFFSCxPQUFPLElBQUksc0RBQXlCLENBQUMsRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFFRCxLQUFLLENBQUMsTUFBTTtRQUNWLE1BQU0sSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQzdCLE1BQU0sY0FBYyxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDdkQsTUFBTSxtQkFBbUIsR0FBRyxNQUFNLGNBQWMsQ0FBQyxXQUFXLENBQUM7WUFDM0QsaUVBQWlFO1lBQ2pFLGFBQWE7WUFDYixLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWE7U0FDMUIsQ0FBQyxDQUFDO1FBRUgsb0NBQW9DO1FBRXBDLGdFQUFnRTtRQUNoRSx3RUFBd0U7UUFDeEUscUJBQXFCO1FBQ3JCLGtDQUFrQztRQUNsQyxTQUFTO1FBQ1Qsa0NBQWtDO1FBQ2xDLDZCQUE2QjtRQUM3QixPQUFPLG1CQUFtQixDQUFDO0lBQzdCLENBQUM7Q0F3QkY7QUFwRUQsc0NBb0VDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gXCJAYXdzLWNkay9jb3JlXCI7XG5pbXBvcnQgKiBhcyBjeGFwaSBmcm9tIFwiQGF3cy1jZGsvY3gtYXBpXCI7XG5pbXBvcnQgKiBhcyBlYzIgZnJvbSBcIkBhd3MtY2RrL2F3cy1lYzJcIjtcbmltcG9ydCAqIGFzIGNmbmluYyBmcm9tIFwiQGF3cy1jZGsvY2xvdWRmb3JtYXRpb24taW5jbHVkZVwiO1xuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQgeyBTZGtQcm92aWRlciB9IGZyb20gXCJhd3MtY2RrL2xpYi9hcGkvYXdzLWF1dGhcIjtcbmltcG9ydCB7IENsb3VkRm9ybWF0aW9uRGVwbG95bWVudHMgfSBmcm9tIFwiYXdzLWNkay9saWIvYXBpL2Nsb3VkZm9ybWF0aW9uLWRlcGxveW1lbnRzXCI7XG5pbXBvcnQgeyBWcGNBdHRyaWJ1dGVzIH0gZnJvbSBcIkBhd3MtY2RrL2F3cy1lYzJcIjtcblxuZXhwb3J0IGNsYXNzIEV4aXN0aW5nU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBwcml2YXRlIHN0YWNrQXJ0aWZhY3Q6IGN4YXBpLkNsb3VkRm9ybWF0aW9uU3RhY2tBcnRpZmFjdDtcbiAgcHJpdmF0ZSBhcHA6IGNkay5BcHA7XG4gIHByaXZhdGUgdnBjQ29uZmlnOiBWcGNBdHRyaWJ1dGVzO1xuICBwcml2YXRlIHByb2ZpbGVOYW1lOiBzdHJpbmc7XG4gIHB1YmxpYyB2cGM6IGVjMi5JVnBjO1xuXG4gIGdldCBhdmFpbGFiaWxpdHlab25lcygpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIHRoaXMudnBjQ29uZmlnLmF2YWlsYWJpbGl0eVpvbmVzO1xuICB9XG5cbiAgYXN5bmMgc3ludGhlc2l6ZVN0YWNrKCkge1xuICAgIHRoaXMuc3RhY2tBcnRpZmFjdCA9IHRoaXMuYXBwLnN5bnRoKCkuZ2V0U3RhY2tCeU5hbWUodGhpcy5zdGFja05hbWUpO1xuICB9XG5cbiAgYXN5bmMgY3JlYXRlTmV3Q2ZuRGVwbG95KCk6IFByb21pc2U8Q2xvdWRGb3JtYXRpb25EZXBsb3ltZW50cz4ge1xuICAgIC8vIFVTRVItSU5QVVQ6IE9wdGlvbmFsIFByb2ZpbGUgTmFtZSBvciBEZWZhdWx0XG4gICAgY29uc3Qgc2RrUHJvdmlkZXIgPSBhd2FpdCBTZGtQcm92aWRlci53aXRoQXdzQ2xpQ29tcGF0aWJsZURlZmF1bHRzKHtcbiAgICAgIC8vIHByb2ZpbGU6ICd5b3VyIH4vLmF3cy9jb25maWcgcHJvZmlsZSBuYW1lIGhlcmUnLFxuICAgICAgcHJvZmlsZTogdGhpcy5wcm9maWxlTmFtZSxcbiAgICB9KTtcblxuICAgIHJldHVybiBuZXcgQ2xvdWRGb3JtYXRpb25EZXBsb3ltZW50cyh7IHNka1Byb3ZpZGVyIH0pO1xuICB9XG5cbiAgYXN5bmMgZGVwbG95KCkge1xuICAgIGF3YWl0IHRoaXMuc3ludGhlc2l6ZVN0YWNrKCk7XG4gICAgY29uc3QgY2xvdWRGb3JtYXRpb24gPSBhd2FpdCB0aGlzLmNyZWF0ZU5ld0NmbkRlcGxveSgpO1xuICAgIGNvbnN0IGRlcGxveVJlc3VsdFByb21pc2UgPSBhd2FpdCBjbG91ZEZvcm1hdGlvbi5kZXBsb3lTdGFjayh7XG4gICAgICAvLyBUT0RPOiBBZGRyZXNzIENsb3VkRm9ybWF0aW9uU3RhY2tBcnRpZmFjdCBzZXBhcmF0ZSBkZWZpbml0aW9uc1xuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgc3RhY2s6IHRoaXMuc3RhY2tBcnRpZmFjdCxcbiAgICB9KTtcblxuICAgIC8vIGNvbnNvbGUubG9nKGRlcGxveVJlc3VsdFByb21pc2UpO1xuXG4gICAgLy8gLy8gY29uc3QgZGVzdHJveVByb21pc2UgPSBhd2FpdCBjbG91ZEZvcm1hdGlvbi5kZXN0cm95U3RhY2soe1xuICAgIC8vIC8vICAgLy8gVE9ETzogQWRkcmVzcyBDbG91ZEZvcm1hdGlvblN0YWNrQXJ0aWZhY3Qgc2VwYXJhdGUgZGVmaW50aW9uc1xuICAgIC8vIC8vICAgLy8gQHRzLWlnbm9yZVxuICAgIC8vIC8vICAgc3RhY2s6IHRoaXMuc3RhY2tBcnRpZmFjdCxcbiAgICAvLyAvLyB9KTtcbiAgICAvLyAvLyBjb25zb2xlLmxvZyhkZXN0cm95UHJvbWlzZSk7XG4gICAgLy8gcmV0dXJuIGRlcGxveVJlc3VsdFByb21pc2VcbiAgICByZXR1cm4gZGVwbG95UmVzdWx0UHJvbWlzZTtcbiAgfVxuXG4gIC8vIFRPRE86IGRlZmluZSBzdGFja0NvbmZpZyB0eXBlXG4gIGNvbnN0cnVjdG9yKFxuICAgIHNvdXJjZTogY2RrLkFwcCxcbiAgICBpZDogc3RyaW5nLFxuICAgIHN0YWNrQ29uZmlnOiBhbnksXG4gICAgcHJvcHM/OiBjZGsuU3RhY2tQcm9wc1xuICApIHtcbiAgICBzdXBlcihzb3VyY2UsIGlkLCBwcm9wcyk7XG4gICAgdGhpcy5wcm9maWxlTmFtZSA9IHN0YWNrQ29uZmlnLnByb2ZpbGVOYW1lO1xuICAgIHRoaXMuYXBwID0gc291cmNlO1xuXG4gICAgZnMud3JpdGVGaWxlU3luYyhcbiAgICAgIFwiLi9jZGsub3V0L0V4aXN0aW5nU3RhY2sudGVtcGxhdGUuanNvblwiLFxuICAgICAgSlNPTi5zdHJpbmdpZnkoc3RhY2tDb25maWcudGVtcGxhdGUsIG51bGwsIDIpXG4gICAgKTtcblxuICAgIGNvbnN0IHRlbXBsYXRlID0gbmV3IGNmbmluYy5DZm5JbmNsdWRlKHRoaXMsIFwiVGVtcGxhdGVcIiwge1xuICAgICAgdGVtcGxhdGVGaWxlOiBcIi4vY2RrLm91dC9FeGlzdGluZ1N0YWNrLnRlbXBsYXRlLmpzb25cIixcbiAgICB9KTtcblxuICAgIGNvbnNvbGUubG9nKGNkay5TdGFjay5vZih0aGlzKS5hY2NvdW50KVxuICB9XG59XG4iXX0=