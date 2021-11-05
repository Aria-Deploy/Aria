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
exports.fetchStackTemplate = exports.setAzPubPrivSubnets = exports.setConfigVpcId = exports.fetchStackVpcConfig = exports.fetchAwsStackInfo = exports.fetchAwsProfilesInfo = exports.clientsInit = exports.getCfnClient = void 0;
const shared_ini_file_loader_1 = require("@aws-sdk/shared-ini-file-loader");
const js_yaml = __importStar(require("js-yaml"));
const client_ec2_1 = require("@aws-sdk/client-ec2");
const client_cloudformation_1 = require("@aws-sdk/client-cloudformation");
// TODO: Handle request errors back to client for messages
// TODO: Define type for _accountsCredentials
let _accountsCredentials = {};
let _cfnClient;
let _ec2client;
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
        _ec2client = new client_ec2_1.EC2Client(_accountsCredentials[profileName]);
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
async function fetchAwsStackInfo() {
    try {
        const fetchActiveListsCmd = new client_cloudformation_1.ListStacksCommand({});
        const allUserStacks = await _cfnClient.send(fetchActiveListsCmd);
        const activeStacks = allUserStacks.StackSummaries?.filter((stack) => !stack.DeletionTime);
        return activeStacks;
    }
    catch (error) {
        console.log(error);
        return error;
    }
}
exports.fetchAwsStackInfo = fetchAwsStackInfo;
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
        const vpcResponse = await _ec2client.send(vpcCmd);
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
        const subnetsResponse = await _ec2client.send(subnetsCmd);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXdzX2Nmbl9kYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2Nmbl9pbnRlcmZhY2UvbGliL2F3c19jZm5fZGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNEVBQXdFO0FBQ3hFLGlEQUFtQztBQUNuQyxvREFJNkI7QUFFN0IsMEVBSXdDO0FBQ3hDLDBEQUEwRDtBQUUxRCw2Q0FBNkM7QUFDN0MsSUFBSSxvQkFBb0IsR0FBUSxFQUFFLENBQUM7QUFDbkMsSUFBSSxVQUFnQyxDQUFDO0FBQ3JDLElBQUksVUFBcUIsQ0FBQztBQUMxQixtQ0FBbUM7QUFDbkMsSUFBSSxVQUFVLEdBQUc7SUFDZixLQUFLLEVBQUUsRUFBRTtJQUNULGlCQUFpQixFQUFFLEVBQWM7SUFDakMsZUFBZSxFQUFFLEVBQWM7SUFDL0IsZ0JBQWdCLEVBQUUsRUFBYztDQUNqQyxDQUFDO0FBRVcsUUFBQSxZQUFZLEdBQUcsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDO0FBQzdDLE1BQU0scUJBQXFCLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxvQkFBb0IsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUVoRSxNQUFNLGVBQWUsR0FBRyxHQUFHLEVBQUU7SUFDM0IsVUFBVSxHQUFHO1FBQ1gsS0FBSyxFQUFFLEVBQUU7UUFDVCxpQkFBaUIsRUFBRSxFQUFFO1FBQ3JCLGVBQWUsRUFBRSxFQUFFO1FBQ25CLGdCQUFnQixFQUFFLEVBQUU7S0FDckIsQ0FBQztBQUNKLENBQUMsQ0FBQztBQUVLLEtBQUssVUFBVSxXQUFXLENBQUMsV0FBbUI7SUFDbkQsSUFBSTtRQUNGLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNqRSxzRUFBc0U7UUFDdEUsVUFBVSxHQUFHLElBQUksNENBQW9CLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFOUMs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Z0JBQ3JELE9BQU8sSUFBSSxDQUFDO1lBQ2QsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztLQUNKO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDZCxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3BCO0FBQ0gsQ0FBQztBQXhCRCxrREF3QkM7QUFFTSxLQUFLLFVBQVUsa0JBQWtCLENBQUMsT0FBZTtJQUN0RCxJQUFJO1FBQ0YsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLDBDQUFrQixDQUFDO1lBQ25ELFNBQVMsRUFBRSxPQUFPO1NBQ25CLENBQUMsQ0FBQztRQUNILE1BQU0scUJBQXFCLEdBQUcsTUFBTSxVQUFVLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDM0UsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxZQUFZLElBQUksRUFBRSxDQUFDLENBQUM7UUFDNUUsT0FBTyxZQUFZLENBQUM7S0FDckI7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDcEI7QUFDSCxDQUFDO0FBWEQsZ0RBV0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBsb2FkU2hhcmVkQ29uZmlnRmlsZXMgfSBmcm9tIFwiQGF3cy1zZGsvc2hhcmVkLWluaS1maWxlLWxvYWRlclwiO1xuaW1wb3J0ICogYXMganNfeWFtbCBmcm9tIFwianMteWFtbFwiO1xuaW1wb3J0IHtcbiAgRUMyQ2xpZW50LFxuICBEZXNjcmliZVZwY3NDb21tYW5kLFxuICBEZXNjcmliZVN1Ym5ldHNDb21tYW5kLFxufSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWVjMlwiO1xuXG5pbXBvcnQge1xuICBDbG91ZEZvcm1hdGlvbkNsaWVudCxcbiAgTGlzdFN0YWNrc0NvbW1hbmQsXG4gIEdldFRlbXBsYXRlQ29tbWFuZCxcbn0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1jbG91ZGZvcm1hdGlvblwiO1xuLy8gVE9ETzogSGFuZGxlIHJlcXVlc3QgZXJyb3JzIGJhY2sgdG8gY2xpZW50IGZvciBtZXNzYWdlc1xuXG4vLyBUT0RPOiBEZWZpbmUgdHlwZSBmb3IgX2FjY291bnRzQ3JlZGVudGlhbHNcbmxldCBfYWNjb3VudHNDcmVkZW50aWFsczogYW55ID0ge307XG5sZXQgX2NmbkNsaWVudDogQ2xvdWRGb3JtYXRpb25DbGllbnQ7XG5sZXQgX2VjMmNsaWVudDogRUMyQ2xpZW50O1xuLy8gVE9ETzogRGVmaW5lIHR5cGUgZm9yIF92cGNDb25maWdcbmxldCBfdnBjQ29uZmlnID0ge1xuICB2cGNJZDogXCJcIixcbiAgYXZhaWxhYmlsaXR5Wm9uZXM6IFtdIGFzIHN0cmluZ1tdLFxuICBwdWJsaWNTdWJuZXRJZHM6IFtdIGFzIHN0cmluZ1tdLFxuICBwcml2YXRlU3VibmV0SWRzOiBbXSBhcyBzdHJpbmdbXSxcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRDZm5DbGllbnQgPSAoKSA9PiBfY2ZuQ2xpZW50O1xuY29uc3QgX3Jlc2V0QWNjQ3JlZGVuZXRpYWxzID0gKCkgPT4gKF9hY2NvdW50c0NyZWRlbnRpYWxzID0ge30pO1xuXG5jb25zdCBfcmVzZXRWcGNDb25maWcgPSAoKSA9PiB7XG4gIF92cGNDb25maWcgPSB7XG4gICAgdnBjSWQ6IFwiXCIsXG4gICAgYXZhaWxhYmlsaXR5Wm9uZXM6IFtdLFxuICAgIHB1YmxpY1N1Ym5ldElkczogW10sXG4gICAgcHJpdmF0ZVN1Ym5ldElkczogW10sXG4gIH07XG59O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xpZW50c0luaXQocHJvZmlsZU5hbWU6IHN0cmluZykge1xuICB0cnkge1xuICAgIGNvbnN0IGNvbmZpZyA9IEpTT04uc3RyaW5naWZ5KF9hY2NvdW50c0NyZWRlbnRpYWxzW3Byb2ZpbGVOYW1lXSk7XG4gICAgLy8gQHRzLWlnbm9yZSBwYXNzaW5nIGFuIG9iamVjdCByZXN1bHRzIGluIGVycm9yLCBBV1MncyBmYXVsdCBub3QgbWluZVxuICAgIF9jZm5DbGllbnQgPSBuZXcgQ2xvdWRGb3JtYXRpb25DbGllbnQoY29uZmlnKTtcblxuICAgIF9lYzJjbGllbnQgPSBuZXcgRUMyQ2xpZW50KF9hY2NvdW50c0NyZWRlbnRpYWxzW3Byb2ZpbGVOYW1lXSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5sb2coZXJyb3IpO1xuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaEF3c1Byb2ZpbGVzSW5mbygpIHtcbiAgdHJ5IHtcbiAgICBfcmVzZXRBY2NDcmVkZW5ldGlhbHMoKTtcbiAgICBjb25zdCBhd3NQcm9maWxlc0luZm8gPSBhd2FpdCBsb2FkU2hhcmVkQ29uZmlnRmlsZXMoKTtcblxuICAgIGZvciAoY29uc3QgcHJvZmlsZSBpbiBhd3NQcm9maWxlc0luZm8uY29uZmlnRmlsZSkge1xuICAgICAgX2FjY291bnRzQ3JlZGVudGlhbHNbcHJvZmlsZV0gPSB7XG4gICAgICAgIC4uLmF3c1Byb2ZpbGVzSW5mby5jb25maWdGaWxlW3Byb2ZpbGVdLFxuICAgICAgICBjcmVkZW50aWFsczoge1xuICAgICAgICAgIC4uLmF3c1Byb2ZpbGVzSW5mby5jcmVkZW50aWFsc0ZpbGVbcHJvZmlsZV0sXG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgIH1cbiAgICBjb25zdCBwcm9maWxlcyA9IE9iamVjdC5rZXlzKGF3c1Byb2ZpbGVzSW5mby5jb25maWdGaWxlKTtcbiAgICByZXR1cm4gcHJvZmlsZXM7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgIHJldHVybiBlcnJvcjtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmV0Y2hBd3NTdGFja0luZm8oKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgZmV0Y2hBY3RpdmVMaXN0c0NtZCA9IG5ldyBMaXN0U3RhY2tzQ29tbWFuZCh7fSk7XG4gICAgY29uc3QgYWxsVXNlclN0YWNrcyA9IGF3YWl0IF9jZm5DbGllbnQuc2VuZChmZXRjaEFjdGl2ZUxpc3RzQ21kKTtcbiAgICBjb25zdCBhY3RpdmVTdGFja3MgPSBhbGxVc2VyU3RhY2tzLlN0YWNrU3VtbWFyaWVzPy5maWx0ZXIoXG4gICAgICAoc3RhY2spID0+ICFzdGFjay5EZWxldGlvblRpbWVcbiAgICApO1xuXG4gICAgcmV0dXJuIGFjdGl2ZVN0YWNrcztcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgcmV0dXJuIGVycm9yO1xuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaFN0YWNrVnBjQ29uZmlnKHN0YWNrSWQ6IHN0cmluZykge1xuICBfcmVzZXRWcGNDb25maWcoKTtcbiAgYXdhaXQgc2V0Q29uZmlnVnBjSWQoc3RhY2tJZCk7XG4gIGF3YWl0IHNldEF6UHViUHJpdlN1Ym5ldHMoKTtcbiAgcmV0dXJuIF92cGNDb25maWc7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRDb25maWdWcGNJZChzdGFja0lkOiBzdHJpbmcpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCB2cGNDbWQgPSBuZXcgRGVzY3JpYmVWcGNzQ29tbWFuZCh7fSk7XG4gICAgY29uc3QgdnBjUmVzcG9uc2UgPSBhd2FpdCBfZWMyY2xpZW50LnNlbmQodnBjQ21kKTtcbiAgICBjb25zdCB2cGNzTGlzdCA9IHZwY1Jlc3BvbnNlLlZwY3MgfHwgW107XG4gICAgY29uc3QgdnBjSWQ6IHN0cmluZyA9IHZwY3NMaXN0LnJlZHVjZSgoYWNjLCB2cGMpID0+IHtcbiAgICAgIGxldCB2cGNJZCA9IGFjYztcbiAgICAgIGlmICh2cGMuVGFncykge1xuICAgICAgICB2cGMuVGFncy5mb3JFYWNoKCh0YWcpID0+IHtcbiAgICAgICAgICBpZiAodGFnLlZhbHVlID09PSBzdGFja0lkKSB2cGNJZCA9IHZwYy5WcGNJZCE7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZwY0lkO1xuICAgIH0sIFwiXCIpO1xuXG4gICAgX3ZwY0NvbmZpZy52cGNJZCA9IHZwY0lkO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0QXpQdWJQcml2U3VibmV0cygpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBzdWJuZXRzQ21kID0gbmV3IERlc2NyaWJlU3VibmV0c0NvbW1hbmQoe30pO1xuICAgIGNvbnN0IHN1Ym5ldHNSZXNwb25zZSA9IGF3YWl0IF9lYzJjbGllbnQuc2VuZChzdWJuZXRzQ21kKTtcblxuICAgIHN1Ym5ldHNSZXNwb25zZS5TdWJuZXRzID0gc3VibmV0c1Jlc3BvbnNlLlN1Ym5ldHMgfHwgW107XG4gICAgc3VibmV0c1Jlc3BvbnNlLlN1Ym5ldHMuZm9yRWFjaCgoc3VibmV0KSA9PiB7XG4gICAgICBpZiAoc3VibmV0LlZwY0lkICE9PSBfdnBjQ29uZmlnLnZwY0lkKSByZXR1cm47XG4gICAgICBjb25zdCBzdWJuZXRBeiA9IHN1Ym5ldC5BdmFpbGFiaWxpdHlab25lO1xuICAgICAgaWYgKCFfdnBjQ29uZmlnLmF2YWlsYWJpbGl0eVpvbmVzLmluY2x1ZGVzKHN1Ym5ldEF6ISkpXG4gICAgICAgIF92cGNDb25maWcuYXZhaWxhYmlsaXR5Wm9uZXMucHVzaChzdWJuZXRBeiEpO1xuXG4gICAgICBzdWJuZXQuVGFncz8uc29tZSgodGFnKSA9PiB7XG4gICAgICAgIGlmICghW1wiUHJpdmF0ZVwiLCBcIlB1YmxpY1wiXS5pbmNsdWRlcyh0YWcuVmFsdWUhKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAodGFnLlZhbHVlID09PSBcIlB1YmxpY1wiKVxuICAgICAgICAgIF92cGNDb25maWcucHVibGljU3VibmV0SWRzLnB1c2goc3VibmV0LlN1Ym5ldElkISk7XG4gICAgICAgIGlmICh0YWcuVmFsdWUgPT09IFwiUHJpdmF0ZVwiKVxuICAgICAgICAgIF92cGNDb25maWcucHJpdmF0ZVN1Ym5ldElkcy5wdXNoKHN1Ym5ldC5TdWJuZXRJZCEpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmV0Y2hTdGFja1RlbXBsYXRlKHN0YWNrSWQ6IHN0cmluZykge1xuICB0cnkge1xuICAgIGNvbnN0IGZldGNoU3RhY2tUZW1wbGF0ZUNtZCA9IG5ldyBHZXRUZW1wbGF0ZUNvbW1hbmQoe1xuICAgICAgU3RhY2tOYW1lOiBzdGFja0lkLFxuICAgIH0pO1xuICAgIGNvbnN0IGV4aXN0aW5nU3RhY2tUZW1wbGF0ZSA9IGF3YWl0IF9jZm5DbGllbnQuc2VuZChmZXRjaFN0YWNrVGVtcGxhdGVDbWQpO1xuICAgIGNvbnN0IGpzb25UZW1wbGF0ZSA9IGpzX3lhbWwubG9hZChleGlzdGluZ1N0YWNrVGVtcGxhdGUuVGVtcGxhdGVCb2R5IHx8IFwiXCIpO1xuICAgIHJldHVybiBqc29uVGVtcGxhdGU7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5sb2coZXJyb3IpO1xuICB9XG59XG4iXX0=