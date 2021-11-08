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
exports.fetchStackMetaData = exports.fetchStackTemplate = exports.setAzPubPrivSubnets = exports.setConfigVpcId = exports.fetchStackVpcConfig = exports.fetchStacksInfo = exports.fetchAwsProfilesInfo = exports.clientsInit = exports.getCfnClient = void 0;
const shared_ini_file_loader_1 = require("@aws-sdk/shared-ini-file-loader");
const js_yaml = __importStar(require("js-yaml"));
const client_ec2_1 = require("@aws-sdk/client-ec2");
const client_cloudformation_1 = require("@aws-sdk/client-cloudformation");
// TODO: Handle request errors back to client for messages
// TODO: Define type for _accountsCredentials
let _accountsCredentials = {};
let _cfnClient;
let _ec2Client;
// TODO: Define type for _vpcConfig
let _vpcConfig = {
    vpcId: "",
    availabilityZones: [],
    publicSubnetIds: [],
    privateSubnetIds: [],
};
exports.getCfnClient = () => _cfnClient;
const _resetAccCredenetials = () => (_accountsCredentials = {});
const _resetVpcConfig = () => {
    _vpcConfig = {
        vpcId: "",
        availabilityZones: [],
        publicSubnetIds: [],
        privateSubnetIds: [],
    };
};
async function clientsInit(profileName) {
    try {
        const config = JSON.stringify(_accountsCredentials[profileName]);
        // @ts-ignore passing an object results in error, AWS's fault not mine
        _cfnClient = new client_cloudformation_1.CloudFormationClient(config);
        // @ts-ignore
        _ec2Client = new client_ec2_1.EC2Client(config);
    }
    catch (error) {
        console.log(error);
    }
}
exports.clientsInit = clientsInit;
async function fetchAwsProfilesInfo() {
    try {
        _resetAccCredenetials();
        const awsProfilesInfo = await shared_ini_file_loader_1.loadSharedConfigFiles();
        for (const profile in awsProfilesInfo.configFile) {
            _accountsCredentials[profile] = {
                ...awsProfilesInfo.configFile[profile],
                credentials: {
                    ...awsProfilesInfo.credentialsFile[profile],
                },
            };
        }
        const profiles = Object.keys(awsProfilesInfo.configFile);
        return profiles;
    }
    catch (error) {
        console.log(error);
        return error;
    }
}
exports.fetchAwsProfilesInfo = fetchAwsProfilesInfo;
async function fetchStacksInfo() {
    try {
        const stacksInfoCmd = new client_cloudformation_1.DescribeStacksCommand({});
        const stacksInfo = await _cfnClient.send(stacksInfoCmd);
        stacksInfo.Stacks = stacksInfo.Stacks || [];
        const formattedStacks = stacksInfo.Stacks.map((stack) => {
            stack.Outputs = stack.Outputs || [];
            const isCanary = stack.Outputs.some(({ OutputKey }) => OutputKey === "ariacanary");
            return {
                stackName: stack.StackName,
                stackId: stack.StackId,
                isCanary,
            };
        });
        return formattedStacks;
    }
    catch (error) {
        console.log("The following error occured when trying to fetch profile stacks: ", error);
        return [];
    }
}
exports.fetchStacksInfo = fetchStacksInfo;
async function fetchStackVpcConfig(stackId) {
    _resetVpcConfig();
    await setConfigVpcId(stackId);
    await setAzPubPrivSubnets();
    return _vpcConfig;
}
exports.fetchStackVpcConfig = fetchStackVpcConfig;
async function setConfigVpcId(stackId) {
    try {
        const vpcCmd = new client_ec2_1.DescribeVpcsCommand({});
        // @ts-ignore
        const vpcResponse = await _ec2Client.send(vpcCmd);
        const vpcsList = vpcResponse.Vpcs || [];
        const vpcId = vpcsList.reduce((acc, vpc) => {
            let vpcId = acc;
            if (vpc.Tags) {
                vpc.Tags.forEach((tag) => {
                    if (tag.Value === stackId)
                        vpcId = vpc.VpcId;
                });
            }
            return vpcId;
        }, "");
        _vpcConfig.vpcId = vpcId;
    }
    catch (error) {
        console.log(error);
    }
}
exports.setConfigVpcId = setConfigVpcId;
async function setAzPubPrivSubnets() {
    try {
        const subnetsCmd = new client_ec2_1.DescribeSubnetsCommand({});
        const subnetsResponse = await _ec2Client.send(subnetsCmd);
        subnetsResponse.Subnets = subnetsResponse.Subnets || [];
        subnetsResponse.Subnets.forEach((subnet) => {
            if (subnet.VpcId !== _vpcConfig.vpcId)
                return;
            const subnetAz = subnet.AvailabilityZone;
            if (!_vpcConfig.availabilityZones.includes(subnetAz))
                _vpcConfig.availabilityZones.push(subnetAz);
            subnet.Tags?.some((tag) => {
                if (!["Private", "Public"].includes(tag.Value))
                    return false;
                if (tag.Value === "Public")
                    _vpcConfig.publicSubnetIds.push(subnet.SubnetId);
                if (tag.Value === "Private")
                    _vpcConfig.privateSubnetIds.push(subnet.SubnetId);
                return true;
            });
        });
    }
    catch (error) {
        console.log(error);
    }
}
exports.setAzPubPrivSubnets = setAzPubPrivSubnets;
async function fetchStackTemplate(stackId) {
    try {
        const fetchStackTemplateCmd = new client_cloudformation_1.GetTemplateCommand({
            StackName: stackId,
        });
        const existingStackTemplate = await _cfnClient.send(fetchStackTemplateCmd);
        const jsonTemplate = js_yaml.load(existingStackTemplate.TemplateBody || "");
        return jsonTemplate;
    }
    catch (error) {
        console.log(error);
    }
}
exports.fetchStackTemplate = fetchStackTemplate;
async function fetchStackMetaData(stackId) {
    const stackInfoCmd = new client_cloudformation_1.DescribeStackInstanceCommand({
        StackInstanceAccount: "750078097588",
        StackInstanceRegion: "us-west-2",
        StackSetName: 'cdk-stack',
    });
    const response = await _cfnClient.send(stackInfoCmd);
    return response.StackInstance;
}
exports.fetchStackMetaData = fetchStackMetaData;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXdzX2Nmbl9kYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2Nmbl9pbnRlcmZhY2UvbGliL2F3c19jZm5fZGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNEVBQXdFO0FBQ3hFLGlEQUFtQztBQUNuQyxvREFJNkI7QUFFN0IsMEVBS3dDO0FBQ3hDLDBEQUEwRDtBQUUxRCw2Q0FBNkM7QUFDN0MsSUFBSSxvQkFBb0IsR0FBUSxFQUFFLENBQUM7QUFDbkMsSUFBSSxVQUFnQyxDQUFDO0FBQ3JDLElBQUksVUFBcUIsQ0FBQztBQUMxQixtQ0FBbUM7QUFDbkMsSUFBSSxVQUFVLEdBQUc7SUFDZixLQUFLLEVBQUUsRUFBRTtJQUNULGlCQUFpQixFQUFFLEVBQWM7SUFDakMsZUFBZSxFQUFFLEVBQWM7SUFDL0IsZ0JBQWdCLEVBQUUsRUFBYztDQUNqQyxDQUFDO0FBRVcsUUFBQSxZQUFZLEdBQUcsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDO0FBQzdDLE1BQU0scUJBQXFCLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxvQkFBb0IsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUVoRSxNQUFNLGVBQWUsR0FBRyxHQUFHLEVBQUU7SUFDM0IsVUFBVSxHQUFHO1FBQ1gsS0FBSyxFQUFFLEVBQUU7UUFDVCxpQkFBaUIsRUFBRSxFQUFFO1FBQ3JCLGVBQWUsRUFBRSxFQUFFO1FBQ25CLGdCQUFnQixFQUFFLEVBQUU7S0FDckIsQ0FBQztBQUNKLENBQUMsQ0FBQztBQUVLLEtBQUssVUFBVSxXQUFXLENBQUMsV0FBbUI7SUFDbkQsSUFBSTtRQUNGLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNqRSxzRUFBc0U7UUFDdEUsVUFBVSxHQUFHLElBQUksNENBQW9CLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDOUMsYUFBYTtRQUNiLFVBQVUsR0FBRyxJQUFJLHNCQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDcEM7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDcEI7QUFDSCxDQUFDO0FBVkQsa0NBVUM7QUFFTSxLQUFLLFVBQVUsb0JBQW9CO0lBQ3hDLElBQUk7UUFDRixxQkFBcUIsRUFBRSxDQUFDO1FBQ3hCLE1BQU0sZUFBZSxHQUFHLE1BQU0sOENBQXFCLEVBQUUsQ0FBQztRQUN0RCxLQUFLLE1BQU0sT0FBTyxJQUFJLGVBQWUsQ0FBQyxVQUFVLEVBQUU7WUFDaEQsb0JBQW9CLENBQUMsT0FBTyxDQUFDLEdBQUc7Z0JBQzlCLEdBQUcsZUFBZSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUM7Z0JBQ3RDLFdBQVcsRUFBRTtvQkFDWCxHQUFHLGVBQWUsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDO2lCQUM1QzthQUNGLENBQUM7U0FDSDtRQUNELE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3pELE9BQU8sUUFBUSxDQUFDO0tBQ2pCO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDZCxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25CLE9BQU8sS0FBSyxDQUFDO0tBQ2Q7QUFDSCxDQUFDO0FBbEJELG9EQWtCQztBQUVNLEtBQUssVUFBVSxlQUFlO0lBQ25DLElBQUk7UUFDRixNQUFNLGFBQWEsR0FBRyxJQUFJLDZDQUFxQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3BELE1BQU0sVUFBVSxHQUFHLE1BQU0sVUFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUV4RCxVQUFVLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDO1FBQzVDLE1BQU0sZUFBZSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDdEQsS0FBSyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztZQUNwQyxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FDakMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxTQUFTLEtBQUssWUFBWSxDQUM5QyxDQUFDO1lBQ0YsT0FBTztnQkFDTCxTQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVM7Z0JBQzFCLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTztnQkFDdEIsUUFBUTthQUNULENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sZUFBZSxDQUFDO0tBQ3hCO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDZCxPQUFPLENBQUMsR0FBRyxDQUNULG1FQUFtRSxFQUNuRSxLQUFLLENBQ04sQ0FBQztRQUNGLE9BQU8sRUFBRSxDQUFDO0tBQ1g7QUFDSCxDQUFDO0FBMUJELDBDQTBCQztBQUVNLEtBQUssVUFBVSxtQkFBbUIsQ0FBQyxPQUFlO0lBQ3ZELGVBQWUsRUFBRSxDQUFDO0lBQ2xCLE1BQU0sY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzlCLE1BQU0sbUJBQW1CLEVBQUUsQ0FBQztJQUM1QixPQUFPLFVBQVUsQ0FBQztBQUNwQixDQUFDO0FBTEQsa0RBS0M7QUFFTSxLQUFLLFVBQVUsY0FBYyxDQUFDLE9BQWU7SUFDbEQsSUFBSTtRQUNGLE1BQU0sTUFBTSxHQUFHLElBQUksZ0NBQW1CLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDM0MsYUFBYTtRQUNiLE1BQU0sV0FBVyxHQUFHLE1BQU0sVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsRCxNQUFNLFFBQVEsR0FBRyxXQUFXLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUN4QyxNQUFNLEtBQUssR0FBVyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO1lBQ2pELElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQztZQUNoQixJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUU7Z0JBQ1osR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtvQkFDdkIsSUFBSSxHQUFHLENBQUMsS0FBSyxLQUFLLE9BQU87d0JBQUUsS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFNLENBQUM7Z0JBQ2hELENBQUMsQ0FBQyxDQUFDO2FBQ0o7WUFDRCxPQUFPLEtBQUssQ0FBQztRQUNmLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVQLFVBQVUsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0tBQzFCO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDZCxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3BCO0FBQ0gsQ0FBQztBQXBCRCx3Q0FvQkM7QUFFTSxLQUFLLFVBQVUsbUJBQW1CO0lBQ3ZDLElBQUk7UUFDRixNQUFNLFVBQVUsR0FBRyxJQUFJLG1DQUFzQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2xELE1BQU0sZUFBZSxHQUFHLE1BQU0sVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUUxRCxlQUFlLENBQUMsT0FBTyxHQUFHLGVBQWUsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDO1FBQ3hELGVBQWUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7WUFDekMsSUFBSSxNQUFNLENBQUMsS0FBSyxLQUFLLFVBQVUsQ0FBQyxLQUFLO2dCQUFFLE9BQU87WUFDOUMsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDO1lBQ3pDLElBQUksQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLFFBQVMsQ0FBQztnQkFDbkQsVUFBVSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxRQUFTLENBQUMsQ0FBQztZQUUvQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUN4QixJQUFJLENBQUMsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFNLENBQUM7b0JBQUUsT0FBTyxLQUFLLENBQUM7Z0JBQzlELElBQUksR0FBRyxDQUFDLEtBQUssS0FBSyxRQUFRO29CQUN4QixVQUFVLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUyxDQUFDLENBQUM7Z0JBQ3BELElBQUksR0FBRyxDQUFDLEtBQUssS0FBSyxTQUFTO29CQUN6QixVQUFVLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFTLENBQUMsQ0FBQztnQkFDckQsT0FBTyxJQUFJLENBQUM7WUFDZCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0tBQ0o7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDcEI7QUFDSCxDQUFDO0FBeEJELGtEQXdCQztBQUVNLEtBQUssVUFBVSxrQkFBa0IsQ0FBQyxPQUFlO0lBQ3RELElBQUk7UUFDRixNQUFNLHFCQUFxQixHQUFHLElBQUksMENBQWtCLENBQUM7WUFDbkQsU0FBUyxFQUFFLE9BQU87U0FDbkIsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxxQkFBcUIsR0FBRyxNQUFNLFVBQVUsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUMzRSxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFlBQVksSUFBSSxFQUFFLENBQUMsQ0FBQztRQUM1RSxPQUFPLFlBQVksQ0FBQztLQUNyQjtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ2QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNwQjtBQUNILENBQUM7QUFYRCxnREFXQztBQUVNLEtBQUssVUFBVSxrQkFBa0IsQ0FBQyxPQUFlO0lBQ3RELE1BQU0sWUFBWSxHQUFHLElBQUksb0RBQTRCLENBQUM7UUFDcEQsb0JBQW9CLEVBQUUsY0FBYztRQUNwQyxtQkFBbUIsRUFBRSxXQUFXO1FBQ2hDLFlBQVksRUFBRSxXQUFXO0tBQzFCLENBQUMsQ0FBQztJQUNILE1BQU0sUUFBUSxHQUFHLE1BQU0sVUFBVSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNyRCxPQUFPLFFBQVEsQ0FBQyxhQUFhLENBQUM7QUFDaEMsQ0FBQztBQVJELGdEQVFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgbG9hZFNoYXJlZENvbmZpZ0ZpbGVzIH0gZnJvbSBcIkBhd3Mtc2RrL3NoYXJlZC1pbmktZmlsZS1sb2FkZXJcIjtcbmltcG9ydCAqIGFzIGpzX3lhbWwgZnJvbSBcImpzLXlhbWxcIjtcbmltcG9ydCB7XG4gIEVDMkNsaWVudCxcbiAgRGVzY3JpYmVWcGNzQ29tbWFuZCxcbiAgRGVzY3JpYmVTdWJuZXRzQ29tbWFuZCxcbn0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1lYzJcIjtcblxuaW1wb3J0IHtcbiAgQ2xvdWRGb3JtYXRpb25DbGllbnQsXG4gIEdldFRlbXBsYXRlQ29tbWFuZCxcbiAgRGVzY3JpYmVTdGFja3NDb21tYW5kLFxuICBEZXNjcmliZVN0YWNrSW5zdGFuY2VDb21tYW5kLFxufSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWNsb3VkZm9ybWF0aW9uXCI7XG4vLyBUT0RPOiBIYW5kbGUgcmVxdWVzdCBlcnJvcnMgYmFjayB0byBjbGllbnQgZm9yIG1lc3NhZ2VzXG5cbi8vIFRPRE86IERlZmluZSB0eXBlIGZvciBfYWNjb3VudHNDcmVkZW50aWFsc1xubGV0IF9hY2NvdW50c0NyZWRlbnRpYWxzOiBhbnkgPSB7fTtcbmxldCBfY2ZuQ2xpZW50OiBDbG91ZEZvcm1hdGlvbkNsaWVudDtcbmxldCBfZWMyQ2xpZW50OiBFQzJDbGllbnQ7XG4vLyBUT0RPOiBEZWZpbmUgdHlwZSBmb3IgX3ZwY0NvbmZpZ1xubGV0IF92cGNDb25maWcgPSB7XG4gIHZwY0lkOiBcIlwiLFxuICBhdmFpbGFiaWxpdHlab25lczogW10gYXMgc3RyaW5nW10sXG4gIHB1YmxpY1N1Ym5ldElkczogW10gYXMgc3RyaW5nW10sXG4gIHByaXZhdGVTdWJuZXRJZHM6IFtdIGFzIHN0cmluZ1tdLFxufTtcblxuZXhwb3J0IGNvbnN0IGdldENmbkNsaWVudCA9ICgpID0+IF9jZm5DbGllbnQ7XG5jb25zdCBfcmVzZXRBY2NDcmVkZW5ldGlhbHMgPSAoKSA9PiAoX2FjY291bnRzQ3JlZGVudGlhbHMgPSB7fSk7XG5cbmNvbnN0IF9yZXNldFZwY0NvbmZpZyA9ICgpID0+IHtcbiAgX3ZwY0NvbmZpZyA9IHtcbiAgICB2cGNJZDogXCJcIixcbiAgICBhdmFpbGFiaWxpdHlab25lczogW10sXG4gICAgcHVibGljU3VibmV0SWRzOiBbXSxcbiAgICBwcml2YXRlU3VibmV0SWRzOiBbXSxcbiAgfTtcbn07XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGllbnRzSW5pdChwcm9maWxlTmFtZTogc3RyaW5nKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgY29uZmlnID0gSlNPTi5zdHJpbmdpZnkoX2FjY291bnRzQ3JlZGVudGlhbHNbcHJvZmlsZU5hbWVdKTtcbiAgICAvLyBAdHMtaWdub3JlIHBhc3NpbmcgYW4gb2JqZWN0IHJlc3VsdHMgaW4gZXJyb3IsIEFXUydzIGZhdWx0IG5vdCBtaW5lXG4gICAgX2NmbkNsaWVudCA9IG5ldyBDbG91ZEZvcm1hdGlvbkNsaWVudChjb25maWcpO1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBfZWMyQ2xpZW50ID0gbmV3IEVDMkNsaWVudChjb25maWcpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmV0Y2hBd3NQcm9maWxlc0luZm8oKSB7XG4gIHRyeSB7XG4gICAgX3Jlc2V0QWNjQ3JlZGVuZXRpYWxzKCk7XG4gICAgY29uc3QgYXdzUHJvZmlsZXNJbmZvID0gYXdhaXQgbG9hZFNoYXJlZENvbmZpZ0ZpbGVzKCk7XG4gICAgZm9yIChjb25zdCBwcm9maWxlIGluIGF3c1Byb2ZpbGVzSW5mby5jb25maWdGaWxlKSB7XG4gICAgICBfYWNjb3VudHNDcmVkZW50aWFsc1twcm9maWxlXSA9IHtcbiAgICAgICAgLi4uYXdzUHJvZmlsZXNJbmZvLmNvbmZpZ0ZpbGVbcHJvZmlsZV0sXG4gICAgICAgIGNyZWRlbnRpYWxzOiB7XG4gICAgICAgICAgLi4uYXdzUHJvZmlsZXNJbmZvLmNyZWRlbnRpYWxzRmlsZVtwcm9maWxlXSxcbiAgICAgICAgfSxcbiAgICAgIH07XG4gICAgfVxuICAgIGNvbnN0IHByb2ZpbGVzID0gT2JqZWN0LmtleXMoYXdzUHJvZmlsZXNJbmZvLmNvbmZpZ0ZpbGUpO1xuICAgIHJldHVybiBwcm9maWxlcztcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgcmV0dXJuIGVycm9yO1xuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaFN0YWNrc0luZm8oKSB7XG4gIHRyeSB7XG4gICAgY29uc3Qgc3RhY2tzSW5mb0NtZCA9IG5ldyBEZXNjcmliZVN0YWNrc0NvbW1hbmQoe30pO1xuICAgIGNvbnN0IHN0YWNrc0luZm8gPSBhd2FpdCBfY2ZuQ2xpZW50LnNlbmQoc3RhY2tzSW5mb0NtZCk7XG5cbiAgICBzdGFja3NJbmZvLlN0YWNrcyA9IHN0YWNrc0luZm8uU3RhY2tzIHx8IFtdO1xuICAgIGNvbnN0IGZvcm1hdHRlZFN0YWNrcyA9IHN0YWNrc0luZm8uU3RhY2tzLm1hcCgoc3RhY2spID0+IHtcbiAgICAgIHN0YWNrLk91dHB1dHMgPSBzdGFjay5PdXRwdXRzIHx8IFtdO1xuICAgICAgY29uc3QgaXNDYW5hcnkgPSBzdGFjay5PdXRwdXRzLnNvbWUoXG4gICAgICAgICh7IE91dHB1dEtleSB9KSA9PiBPdXRwdXRLZXkgPT09IFwiYXJpYWNhbmFyeVwiXG4gICAgICApO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3RhY2tOYW1lOiBzdGFjay5TdGFja05hbWUsXG4gICAgICAgIHN0YWNrSWQ6IHN0YWNrLlN0YWNrSWQsXG4gICAgICAgIGlzQ2FuYXJ5LFxuICAgICAgfTtcbiAgICB9KTtcblxuICAgIHJldHVybiBmb3JtYXR0ZWRTdGFja3M7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5sb2coXG4gICAgICBcIlRoZSBmb2xsb3dpbmcgZXJyb3Igb2NjdXJlZCB3aGVuIHRyeWluZyB0byBmZXRjaCBwcm9maWxlIHN0YWNrczogXCIsXG4gICAgICBlcnJvclxuICAgICk7XG4gICAgcmV0dXJuIFtdO1xuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaFN0YWNrVnBjQ29uZmlnKHN0YWNrSWQ6IHN0cmluZykge1xuICBfcmVzZXRWcGNDb25maWcoKTtcbiAgYXdhaXQgc2V0Q29uZmlnVnBjSWQoc3RhY2tJZCk7XG4gIGF3YWl0IHNldEF6UHViUHJpdlN1Ym5ldHMoKTtcbiAgcmV0dXJuIF92cGNDb25maWc7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRDb25maWdWcGNJZChzdGFja0lkOiBzdHJpbmcpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCB2cGNDbWQgPSBuZXcgRGVzY3JpYmVWcGNzQ29tbWFuZCh7fSk7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGNvbnN0IHZwY1Jlc3BvbnNlID0gYXdhaXQgX2VjMkNsaWVudC5zZW5kKHZwY0NtZCk7XG4gICAgY29uc3QgdnBjc0xpc3QgPSB2cGNSZXNwb25zZS5WcGNzIHx8IFtdO1xuICAgIGNvbnN0IHZwY0lkOiBzdHJpbmcgPSB2cGNzTGlzdC5yZWR1Y2UoKGFjYywgdnBjKSA9PiB7XG4gICAgICBsZXQgdnBjSWQgPSBhY2M7XG4gICAgICBpZiAodnBjLlRhZ3MpIHtcbiAgICAgICAgdnBjLlRhZ3MuZm9yRWFjaCgodGFnKSA9PiB7XG4gICAgICAgICAgaWYgKHRhZy5WYWx1ZSA9PT0gc3RhY2tJZCkgdnBjSWQgPSB2cGMuVnBjSWQhO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2cGNJZDtcbiAgICB9LCBcIlwiKTtcblxuICAgIF92cGNDb25maWcudnBjSWQgPSB2cGNJZDtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldEF6UHViUHJpdlN1Ym5ldHMoKSB7XG4gIHRyeSB7XG4gICAgY29uc3Qgc3VibmV0c0NtZCA9IG5ldyBEZXNjcmliZVN1Ym5ldHNDb21tYW5kKHt9KTtcbiAgICBjb25zdCBzdWJuZXRzUmVzcG9uc2UgPSBhd2FpdCBfZWMyQ2xpZW50LnNlbmQoc3VibmV0c0NtZCk7XG5cbiAgICBzdWJuZXRzUmVzcG9uc2UuU3VibmV0cyA9IHN1Ym5ldHNSZXNwb25zZS5TdWJuZXRzIHx8IFtdO1xuICAgIHN1Ym5ldHNSZXNwb25zZS5TdWJuZXRzLmZvckVhY2goKHN1Ym5ldCkgPT4ge1xuICAgICAgaWYgKHN1Ym5ldC5WcGNJZCAhPT0gX3ZwY0NvbmZpZy52cGNJZCkgcmV0dXJuO1xuICAgICAgY29uc3Qgc3VibmV0QXogPSBzdWJuZXQuQXZhaWxhYmlsaXR5Wm9uZTtcbiAgICAgIGlmICghX3ZwY0NvbmZpZy5hdmFpbGFiaWxpdHlab25lcy5pbmNsdWRlcyhzdWJuZXRBeiEpKVxuICAgICAgICBfdnBjQ29uZmlnLmF2YWlsYWJpbGl0eVpvbmVzLnB1c2goc3VibmV0QXohKTtcblxuICAgICAgc3VibmV0LlRhZ3M/LnNvbWUoKHRhZykgPT4ge1xuICAgICAgICBpZiAoIVtcIlByaXZhdGVcIiwgXCJQdWJsaWNcIl0uaW5jbHVkZXModGFnLlZhbHVlISkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKHRhZy5WYWx1ZSA9PT0gXCJQdWJsaWNcIilcbiAgICAgICAgICBfdnBjQ29uZmlnLnB1YmxpY1N1Ym5ldElkcy5wdXNoKHN1Ym5ldC5TdWJuZXRJZCEpO1xuICAgICAgICBpZiAodGFnLlZhbHVlID09PSBcIlByaXZhdGVcIilcbiAgICAgICAgICBfdnBjQ29uZmlnLnByaXZhdGVTdWJuZXRJZHMucHVzaChzdWJuZXQuU3VibmV0SWQhKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoU3RhY2tUZW1wbGF0ZShzdGFja0lkOiBzdHJpbmcpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBmZXRjaFN0YWNrVGVtcGxhdGVDbWQgPSBuZXcgR2V0VGVtcGxhdGVDb21tYW5kKHtcbiAgICAgIFN0YWNrTmFtZTogc3RhY2tJZCxcbiAgICB9KTtcbiAgICBjb25zdCBleGlzdGluZ1N0YWNrVGVtcGxhdGUgPSBhd2FpdCBfY2ZuQ2xpZW50LnNlbmQoZmV0Y2hTdGFja1RlbXBsYXRlQ21kKTtcbiAgICBjb25zdCBqc29uVGVtcGxhdGUgPSBqc195YW1sLmxvYWQoZXhpc3RpbmdTdGFja1RlbXBsYXRlLlRlbXBsYXRlQm9keSB8fCBcIlwiKTtcbiAgICByZXR1cm4ganNvblRlbXBsYXRlO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmV0Y2hTdGFja01ldGFEYXRhKHN0YWNrSWQ6IHN0cmluZykge1xuICBjb25zdCBzdGFja0luZm9DbWQgPSBuZXcgRGVzY3JpYmVTdGFja0luc3RhbmNlQ29tbWFuZCh7XG4gICAgU3RhY2tJbnN0YW5jZUFjY291bnQ6IFwiNzUwMDc4MDk3NTg4XCIsXG4gICAgU3RhY2tJbnN0YW5jZVJlZ2lvbjogXCJ1cy13ZXN0LTJcIixcbiAgICBTdGFja1NldE5hbWU6ICdjZGstc3RhY2snLFxuICB9KTtcbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBfY2ZuQ2xpZW50LnNlbmQoc3RhY2tJbmZvQ21kKTtcbiAgcmV0dXJuIHJlc3BvbnNlLlN0YWNrSW5zdGFuY2U7XG59XG4iXX0=