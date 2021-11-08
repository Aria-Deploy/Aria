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
exports.fetchStackTemplate = exports.setAzPubPrivSubnets = exports.setConfigVpcId = exports.fetchStackVpcConfig = exports.fetchStacksInfo = exports.fetchProfilesInfo = exports.fetchAccountInfo = exports.clientsInit = exports.getEnv = void 0;
const shared_ini_file_loader_1 = require("@aws-sdk/shared-ini-file-loader");
const js_yaml = __importStar(require("js-yaml"));
const client_ec2_1 = require("@aws-sdk/client-ec2");
const client_cloudformation_1 = require("@aws-sdk/client-cloudformation");
const client_sts_1 = require("@aws-sdk/client-sts");
// TODO: Handle request errors back to client for messages
// TODO: Define type for _accountsCredentials
let _accountsCredentials = {};
let _cfnClient;
let _ec2Client;
let _stsClient;
let _env;
// TODO: Define type for _vpcConfig
let _vpcConfig = {
    vpcId: "",
    availabilityZones: [],
    publicSubnetIds: [],
    privateSubnetIds: [],
};
exports.getEnv = () => _env;
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
        // @ts-ignore
        _stsClient = new client_sts_1.STSClient(config);
    }
    catch (error) {
        console.log(error);
    }
}
exports.clientsInit = clientsInit;
async function fetchAccountInfo(profileName) {
    const accountIdCmd = new client_sts_1.GetCallerIdentityCommand({});
    const response = await _stsClient.send(accountIdCmd);
    _env = {
        account: response.Account,
        region: _accountsCredentials[profileName].region,
    };
    console.log("_env: ", _env);
}
exports.fetchAccountInfo = fetchAccountInfo;
async function fetchProfilesInfo() {
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
exports.fetchProfilesInfo = fetchProfilesInfo;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXdzX2Nmbl9kYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2Nmbl9pbnRlcmZhY2UvbGliL2F3c19jZm5fZGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNEVBQXdFO0FBQ3hFLGlEQUFtQztBQUNuQyxvREFJNkI7QUFFN0IsMEVBSXdDO0FBRXhDLG9EQUEwRTtBQUMxRSwwREFBMEQ7QUFFMUQsNkNBQTZDO0FBQzdDLElBQUksb0JBQW9CLEdBQVEsRUFBRSxDQUFDO0FBQ25DLElBQUksVUFBZ0MsQ0FBQztBQUNyQyxJQUFJLFVBQXFCLENBQUM7QUFDMUIsSUFBSSxVQUFxQixDQUFDO0FBQzFCLElBQUksSUFBeUMsQ0FBQztBQUM5QyxtQ0FBbUM7QUFDbkMsSUFBSSxVQUFVLEdBQUc7SUFDZixLQUFLLEVBQUUsRUFBRTtJQUNULGlCQUFpQixFQUFFLEVBQWM7SUFDakMsZUFBZSxFQUFFLEVBQWM7SUFDL0IsZ0JBQWdCLEVBQUUsRUFBYztDQUNqQyxDQUFDO0FBRVcsUUFBQSxNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO0FBQ2pDLE1BQU0scUJBQXFCLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxvQkFBb0IsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUVoRSxNQUFNLGVBQWUsR0FBRyxHQUFHLEVBQUU7SUFDM0IsVUFBVSxHQUFHO1FBQ1gsS0FBSyxFQUFFLEVBQUU7UUFDVCxpQkFBaUIsRUFBRSxFQUFFO1FBQ3JCLGVBQWUsRUFBRSxFQUFFO1FBQ25CLGdCQUFnQixFQUFFLEVBQUU7S0FDckIsQ0FBQztBQUNKLENBQUMsQ0FBQztBQUVLLEtBQUssVUFBVSxXQUFXLENBQUMsV0FBbUI7SUFDbkQsSUFBSTtRQUNGLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNqRSxzRUFBc0U7UUFDdEUsVUFBVSxHQUFHLElBQUksNENBQW9CLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDOUMsYUFBYTtRQUNiLFVBQVUsR0FBRyxJQUFJLHNCQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbkMsYUFBYTtRQUNiLFVBQVUsR0FBRyxJQUFJLHNCQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDcEM7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDcEI7QUFDSCxDQUFDO0FBWkQsa0NBWUM7QUFFTSxLQUFLLFVBQVUsZ0JBQWdCLENBQUMsV0FBbUI7SUFDeEQsTUFBTSxZQUFZLEdBQUcsSUFBSSxxQ0FBd0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN0RCxNQUFNLFFBQVEsR0FBRyxNQUFNLFVBQVUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDckQsSUFBSSxHQUFHO1FBQ0wsT0FBTyxFQUFFLFFBQVEsQ0FBQyxPQUFRO1FBQzFCLE1BQU0sRUFBRSxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNO0tBQ2pELENBQUM7SUFDRixPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM5QixDQUFDO0FBUkQsNENBUUM7QUFFTSxLQUFLLFVBQVUsaUJBQWlCO0lBQ3JDLElBQUk7UUFDRixxQkFBcUIsRUFBRSxDQUFDO1FBQ3hCLE1BQU0sZUFBZSxHQUFHLE1BQU0sOENBQXFCLEVBQUUsQ0FBQztRQUN0RCxLQUFLLE1BQU0sT0FBTyxJQUFJLGVBQWUsQ0FBQyxVQUFVLEVBQUU7WUFDaEQsb0JBQW9CLENBQUMsT0FBTyxDQUFDLEdBQUc7Z0JBQzlCLEdBQUcsZUFBZSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUM7Z0JBQ3RDLFdBQVcsRUFBRTtvQkFDWCxHQUFHLGVBQWUsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDO2lCQUM1QzthQUNGLENBQUM7U0FDSDtRQUVELE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3pELE9BQU8sUUFBUSxDQUFDO0tBQ2pCO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDZCxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25CLE9BQU8sS0FBSyxDQUFDO0tBQ2Q7QUFDSCxDQUFDO0FBbkJELDhDQW1CQztBQUVNLEtBQUssVUFBVSxlQUFlO0lBQ25DLElBQUk7UUFDRixNQUFNLGFBQWEsR0FBRyxJQUFJLDZDQUFxQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3BELE1BQU0sVUFBVSxHQUFHLE1BQU0sVUFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUV4RCxVQUFVLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDO1FBQzVDLE1BQU0sZUFBZSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDdEQsS0FBSyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztZQUNwQyxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FDakMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxTQUFTLEtBQUssWUFBWSxDQUM5QyxDQUFDO1lBQ0YsT0FBTztnQkFDTCxTQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVM7Z0JBQzFCLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTztnQkFDdEIsUUFBUTthQUNULENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sZUFBZSxDQUFDO0tBQ3hCO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDZCxPQUFPLENBQUMsR0FBRyxDQUNULG1FQUFtRSxFQUNuRSxLQUFLLENBQ04sQ0FBQztRQUNGLE9BQU8sRUFBRSxDQUFDO0tBQ1g7QUFDSCxDQUFDO0FBMUJELDBDQTBCQztBQUVNLEtBQUssVUFBVSxtQkFBbUIsQ0FBQyxPQUFlO0lBQ3ZELGVBQWUsRUFBRSxDQUFDO0lBQ2xCLE1BQU0sY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzlCLE1BQU0sbUJBQW1CLEVBQUUsQ0FBQztJQUM1QixPQUFPLFVBQVUsQ0FBQztBQUNwQixDQUFDO0FBTEQsa0RBS0M7QUFFTSxLQUFLLFVBQVUsY0FBYyxDQUFDLE9BQWU7SUFDbEQsSUFBSTtRQUNGLE1BQU0sTUFBTSxHQUFHLElBQUksZ0NBQW1CLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDM0MsYUFBYTtRQUNiLE1BQU0sV0FBVyxHQUFHLE1BQU0sVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsRCxNQUFNLFFBQVEsR0FBRyxXQUFXLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUN4QyxNQUFNLEtBQUssR0FBVyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO1lBQ2pELElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQztZQUNoQixJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUU7Z0JBQ1osR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtvQkFDdkIsSUFBSSxHQUFHLENBQUMsS0FBSyxLQUFLLE9BQU87d0JBQUUsS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFNLENBQUM7Z0JBQ2hELENBQUMsQ0FBQyxDQUFDO2FBQ0o7WUFDRCxPQUFPLEtBQUssQ0FBQztRQUNmLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVQLFVBQVUsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0tBQzFCO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDZCxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3BCO0FBQ0gsQ0FBQztBQXBCRCx3Q0FvQkM7QUFFTSxLQUFLLFVBQVUsbUJBQW1CO0lBQ3ZDLElBQUk7UUFDRixNQUFNLFVBQVUsR0FBRyxJQUFJLG1DQUFzQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2xELE1BQU0sZUFBZSxHQUFHLE1BQU0sVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUUxRCxlQUFlLENBQUMsT0FBTyxHQUFHLGVBQWUsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDO1FBQ3hELGVBQWUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7WUFDekMsSUFBSSxNQUFNLENBQUMsS0FBSyxLQUFLLFVBQVUsQ0FBQyxLQUFLO2dCQUFFLE9BQU87WUFDOUMsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDO1lBQ3pDLElBQUksQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLFFBQVMsQ0FBQztnQkFDbkQsVUFBVSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxRQUFTLENBQUMsQ0FBQztZQUUvQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUN4QixJQUFJLENBQUMsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFNLENBQUM7b0JBQUUsT0FBTyxLQUFLLENBQUM7Z0JBQzlELElBQUksR0FBRyxDQUFDLEtBQUssS0FBSyxRQUFRO29CQUN4QixVQUFVLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUyxDQUFDLENBQUM7Z0JBQ3BELElBQUksR0FBRyxDQUFDLEtBQUssS0FBSyxTQUFTO29CQUN6QixVQUFVLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFTLENBQUMsQ0FBQztnQkFDckQsT0FBTyxJQUFJLENBQUM7WUFDZCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0tBQ0o7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDcEI7QUFDSCxDQUFDO0FBeEJELGtEQXdCQztBQUVNLEtBQUssVUFBVSxrQkFBa0IsQ0FBQyxPQUFlO0lBQ3RELElBQUk7UUFDRixNQUFNLHFCQUFxQixHQUFHLElBQUksMENBQWtCLENBQUM7WUFDbkQsU0FBUyxFQUFFLE9BQU87U0FDbkIsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxxQkFBcUIsR0FBRyxNQUFNLFVBQVUsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUMzRSxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFlBQVksSUFBSSxFQUFFLENBQUMsQ0FBQztRQUM1RSxPQUFPLFlBQVksQ0FBQztLQUNyQjtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ2QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNwQjtBQUNILENBQUM7QUFYRCxnREFXQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGxvYWRTaGFyZWRDb25maWdGaWxlcyB9IGZyb20gXCJAYXdzLXNkay9zaGFyZWQtaW5pLWZpbGUtbG9hZGVyXCI7XG5pbXBvcnQgKiBhcyBqc195YW1sIGZyb20gXCJqcy15YW1sXCI7XG5pbXBvcnQge1xuICBFQzJDbGllbnQsXG4gIERlc2NyaWJlVnBjc0NvbW1hbmQsXG4gIERlc2NyaWJlU3VibmV0c0NvbW1hbmQsXG59IGZyb20gXCJAYXdzLXNkay9jbGllbnQtZWMyXCI7XG5cbmltcG9ydCB7XG4gIENsb3VkRm9ybWF0aW9uQ2xpZW50LFxuICBHZXRUZW1wbGF0ZUNvbW1hbmQsXG4gIERlc2NyaWJlU3RhY2tzQ29tbWFuZCxcbn0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1jbG91ZGZvcm1hdGlvblwiO1xuXG5pbXBvcnQgeyBTVFNDbGllbnQsIEdldENhbGxlcklkZW50aXR5Q29tbWFuZCB9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtc3RzXCI7XG4vLyBUT0RPOiBIYW5kbGUgcmVxdWVzdCBlcnJvcnMgYmFjayB0byBjbGllbnQgZm9yIG1lc3NhZ2VzXG5cbi8vIFRPRE86IERlZmluZSB0eXBlIGZvciBfYWNjb3VudHNDcmVkZW50aWFsc1xubGV0IF9hY2NvdW50c0NyZWRlbnRpYWxzOiBhbnkgPSB7fTtcbmxldCBfY2ZuQ2xpZW50OiBDbG91ZEZvcm1hdGlvbkNsaWVudDtcbmxldCBfZWMyQ2xpZW50OiBFQzJDbGllbnQ7XG5sZXQgX3N0c0NsaWVudDogU1RTQ2xpZW50O1xubGV0IF9lbnY6IHsgYWNjb3VudDogc3RyaW5nOyByZWdpb246IHN0cmluZyB9O1xuLy8gVE9ETzogRGVmaW5lIHR5cGUgZm9yIF92cGNDb25maWdcbmxldCBfdnBjQ29uZmlnID0ge1xuICB2cGNJZDogXCJcIixcbiAgYXZhaWxhYmlsaXR5Wm9uZXM6IFtdIGFzIHN0cmluZ1tdLFxuICBwdWJsaWNTdWJuZXRJZHM6IFtdIGFzIHN0cmluZ1tdLFxuICBwcml2YXRlU3VibmV0SWRzOiBbXSBhcyBzdHJpbmdbXSxcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRFbnYgPSAoKSA9PiBfZW52O1xuY29uc3QgX3Jlc2V0QWNjQ3JlZGVuZXRpYWxzID0gKCkgPT4gKF9hY2NvdW50c0NyZWRlbnRpYWxzID0ge30pO1xuXG5jb25zdCBfcmVzZXRWcGNDb25maWcgPSAoKSA9PiB7XG4gIF92cGNDb25maWcgPSB7XG4gICAgdnBjSWQ6IFwiXCIsXG4gICAgYXZhaWxhYmlsaXR5Wm9uZXM6IFtdLFxuICAgIHB1YmxpY1N1Ym5ldElkczogW10sXG4gICAgcHJpdmF0ZVN1Ym5ldElkczogW10sXG4gIH07XG59O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xpZW50c0luaXQocHJvZmlsZU5hbWU6IHN0cmluZykge1xuICB0cnkge1xuICAgIGNvbnN0IGNvbmZpZyA9IEpTT04uc3RyaW5naWZ5KF9hY2NvdW50c0NyZWRlbnRpYWxzW3Byb2ZpbGVOYW1lXSk7XG4gICAgLy8gQHRzLWlnbm9yZSBwYXNzaW5nIGFuIG9iamVjdCByZXN1bHRzIGluIGVycm9yLCBBV1MncyBmYXVsdCBub3QgbWluZVxuICAgIF9jZm5DbGllbnQgPSBuZXcgQ2xvdWRGb3JtYXRpb25DbGllbnQoY29uZmlnKTtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgX2VjMkNsaWVudCA9IG5ldyBFQzJDbGllbnQoY29uZmlnKTtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgX3N0c0NsaWVudCA9IG5ldyBTVFNDbGllbnQoY29uZmlnKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoQWNjb3VudEluZm8ocHJvZmlsZU5hbWU6IHN0cmluZykge1xuICBjb25zdCBhY2NvdW50SWRDbWQgPSBuZXcgR2V0Q2FsbGVySWRlbnRpdHlDb21tYW5kKHt9KTtcbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBfc3RzQ2xpZW50LnNlbmQoYWNjb3VudElkQ21kKTtcbiAgX2VudiA9IHtcbiAgICBhY2NvdW50OiByZXNwb25zZS5BY2NvdW50ISxcbiAgICByZWdpb246IF9hY2NvdW50c0NyZWRlbnRpYWxzW3Byb2ZpbGVOYW1lXS5yZWdpb24sXG4gIH07XG4gIGNvbnNvbGUubG9nKFwiX2VudjogXCIsIF9lbnYpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmV0Y2hQcm9maWxlc0luZm8oKSB7XG4gIHRyeSB7XG4gICAgX3Jlc2V0QWNjQ3JlZGVuZXRpYWxzKCk7XG4gICAgY29uc3QgYXdzUHJvZmlsZXNJbmZvID0gYXdhaXQgbG9hZFNoYXJlZENvbmZpZ0ZpbGVzKCk7XG4gICAgZm9yIChjb25zdCBwcm9maWxlIGluIGF3c1Byb2ZpbGVzSW5mby5jb25maWdGaWxlKSB7XG4gICAgICBfYWNjb3VudHNDcmVkZW50aWFsc1twcm9maWxlXSA9IHtcbiAgICAgICAgLi4uYXdzUHJvZmlsZXNJbmZvLmNvbmZpZ0ZpbGVbcHJvZmlsZV0sXG4gICAgICAgIGNyZWRlbnRpYWxzOiB7XG4gICAgICAgICAgLi4uYXdzUHJvZmlsZXNJbmZvLmNyZWRlbnRpYWxzRmlsZVtwcm9maWxlXSxcbiAgICAgICAgfSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3QgcHJvZmlsZXMgPSBPYmplY3Qua2V5cyhhd3NQcm9maWxlc0luZm8uY29uZmlnRmlsZSk7XG4gICAgcmV0dXJuIHByb2ZpbGVzO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICByZXR1cm4gZXJyb3I7XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoU3RhY2tzSW5mbygpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBzdGFja3NJbmZvQ21kID0gbmV3IERlc2NyaWJlU3RhY2tzQ29tbWFuZCh7fSk7XG4gICAgY29uc3Qgc3RhY2tzSW5mbyA9IGF3YWl0IF9jZm5DbGllbnQuc2VuZChzdGFja3NJbmZvQ21kKTtcblxuICAgIHN0YWNrc0luZm8uU3RhY2tzID0gc3RhY2tzSW5mby5TdGFja3MgfHwgW107XG4gICAgY29uc3QgZm9ybWF0dGVkU3RhY2tzID0gc3RhY2tzSW5mby5TdGFja3MubWFwKChzdGFjaykgPT4ge1xuICAgICAgc3RhY2suT3V0cHV0cyA9IHN0YWNrLk91dHB1dHMgfHwgW107XG4gICAgICBjb25zdCBpc0NhbmFyeSA9IHN0YWNrLk91dHB1dHMuc29tZShcbiAgICAgICAgKHsgT3V0cHV0S2V5IH0pID0+IE91dHB1dEtleSA9PT0gXCJhcmlhY2FuYXJ5XCJcbiAgICAgICk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdGFja05hbWU6IHN0YWNrLlN0YWNrTmFtZSxcbiAgICAgICAgc3RhY2tJZDogc3RhY2suU3RhY2tJZCxcbiAgICAgICAgaXNDYW5hcnksXG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGZvcm1hdHRlZFN0YWNrcztcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmxvZyhcbiAgICAgIFwiVGhlIGZvbGxvd2luZyBlcnJvciBvY2N1cmVkIHdoZW4gdHJ5aW5nIHRvIGZldGNoIHByb2ZpbGUgc3RhY2tzOiBcIixcbiAgICAgIGVycm9yXG4gICAgKTtcbiAgICByZXR1cm4gW107XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoU3RhY2tWcGNDb25maWcoc3RhY2tJZDogc3RyaW5nKSB7XG4gIF9yZXNldFZwY0NvbmZpZygpO1xuICBhd2FpdCBzZXRDb25maWdWcGNJZChzdGFja0lkKTtcbiAgYXdhaXQgc2V0QXpQdWJQcml2U3VibmV0cygpO1xuICByZXR1cm4gX3ZwY0NvbmZpZztcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldENvbmZpZ1ZwY0lkKHN0YWNrSWQ6IHN0cmluZykge1xuICB0cnkge1xuICAgIGNvbnN0IHZwY0NtZCA9IG5ldyBEZXNjcmliZVZwY3NDb21tYW5kKHt9KTtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgY29uc3QgdnBjUmVzcG9uc2UgPSBhd2FpdCBfZWMyQ2xpZW50LnNlbmQodnBjQ21kKTtcbiAgICBjb25zdCB2cGNzTGlzdCA9IHZwY1Jlc3BvbnNlLlZwY3MgfHwgW107XG4gICAgY29uc3QgdnBjSWQ6IHN0cmluZyA9IHZwY3NMaXN0LnJlZHVjZSgoYWNjLCB2cGMpID0+IHtcbiAgICAgIGxldCB2cGNJZCA9IGFjYztcbiAgICAgIGlmICh2cGMuVGFncykge1xuICAgICAgICB2cGMuVGFncy5mb3JFYWNoKCh0YWcpID0+IHtcbiAgICAgICAgICBpZiAodGFnLlZhbHVlID09PSBzdGFja0lkKSB2cGNJZCA9IHZwYy5WcGNJZCE7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZwY0lkO1xuICAgIH0sIFwiXCIpO1xuXG4gICAgX3ZwY0NvbmZpZy52cGNJZCA9IHZwY0lkO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0QXpQdWJQcml2U3VibmV0cygpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBzdWJuZXRzQ21kID0gbmV3IERlc2NyaWJlU3VibmV0c0NvbW1hbmQoe30pO1xuICAgIGNvbnN0IHN1Ym5ldHNSZXNwb25zZSA9IGF3YWl0IF9lYzJDbGllbnQuc2VuZChzdWJuZXRzQ21kKTtcblxuICAgIHN1Ym5ldHNSZXNwb25zZS5TdWJuZXRzID0gc3VibmV0c1Jlc3BvbnNlLlN1Ym5ldHMgfHwgW107XG4gICAgc3VibmV0c1Jlc3BvbnNlLlN1Ym5ldHMuZm9yRWFjaCgoc3VibmV0KSA9PiB7XG4gICAgICBpZiAoc3VibmV0LlZwY0lkICE9PSBfdnBjQ29uZmlnLnZwY0lkKSByZXR1cm47XG4gICAgICBjb25zdCBzdWJuZXRBeiA9IHN1Ym5ldC5BdmFpbGFiaWxpdHlab25lO1xuICAgICAgaWYgKCFfdnBjQ29uZmlnLmF2YWlsYWJpbGl0eVpvbmVzLmluY2x1ZGVzKHN1Ym5ldEF6ISkpXG4gICAgICAgIF92cGNDb25maWcuYXZhaWxhYmlsaXR5Wm9uZXMucHVzaChzdWJuZXRBeiEpO1xuXG4gICAgICBzdWJuZXQuVGFncz8uc29tZSgodGFnKSA9PiB7XG4gICAgICAgIGlmICghW1wiUHJpdmF0ZVwiLCBcIlB1YmxpY1wiXS5pbmNsdWRlcyh0YWcuVmFsdWUhKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAodGFnLlZhbHVlID09PSBcIlB1YmxpY1wiKVxuICAgICAgICAgIF92cGNDb25maWcucHVibGljU3VibmV0SWRzLnB1c2goc3VibmV0LlN1Ym5ldElkISk7XG4gICAgICAgIGlmICh0YWcuVmFsdWUgPT09IFwiUHJpdmF0ZVwiKVxuICAgICAgICAgIF92cGNDb25maWcucHJpdmF0ZVN1Ym5ldElkcy5wdXNoKHN1Ym5ldC5TdWJuZXRJZCEpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmV0Y2hTdGFja1RlbXBsYXRlKHN0YWNrSWQ6IHN0cmluZykge1xuICB0cnkge1xuICAgIGNvbnN0IGZldGNoU3RhY2tUZW1wbGF0ZUNtZCA9IG5ldyBHZXRUZW1wbGF0ZUNvbW1hbmQoe1xuICAgICAgU3RhY2tOYW1lOiBzdGFja0lkLFxuICAgIH0pO1xuICAgIGNvbnN0IGV4aXN0aW5nU3RhY2tUZW1wbGF0ZSA9IGF3YWl0IF9jZm5DbGllbnQuc2VuZChmZXRjaFN0YWNrVGVtcGxhdGVDbWQpO1xuICAgIGNvbnN0IGpzb25UZW1wbGF0ZSA9IGpzX3lhbWwubG9hZChleGlzdGluZ1N0YWNrVGVtcGxhdGUuVGVtcGxhdGVCb2R5IHx8IFwiXCIpO1xuICAgIHJldHVybiBqc29uVGVtcGxhdGU7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5sb2coZXJyb3IpO1xuICB9XG59XG4iXX0=