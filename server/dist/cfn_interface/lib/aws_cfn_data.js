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
async function fetchAwsStackInfo() {
    try {
        const fetchActiveListsCmd = new client_cloudformation_1.ListStacksCommand({});
        const allUserStacks = await _cfnClient.send(fetchActiveListsCmd);
        const activeStacks = allUserStacks.StackSummaries?.filter((stack) => !stack.DeletionTime);
        return activeStacks;
    }
    catch (error) {
        console.log("The following error occured when trying to fetch profile stacks: ", error);
        return [];
    }
}
exports.fetchAwsStackInfo = fetchAwsStackInfo;
async function fetchStackVpcConfig(stackId) {
    _resetVpcConfig();
    await setConfigVpcId(stackId);
    console.log(_vpcConfig);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXdzX2Nmbl9kYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2Nmbl9pbnRlcmZhY2UvbGliL2F3c19jZm5fZGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNEVBQXdFO0FBQ3hFLGlEQUFtQztBQUNuQyxvREFJNkI7QUFFN0IsMEVBSXdDO0FBQ3hDLDBEQUEwRDtBQUUxRCw2Q0FBNkM7QUFDN0MsSUFBSSxvQkFBb0IsR0FBUSxFQUFFLENBQUM7QUFDbkMsSUFBSSxVQUFnQyxDQUFDO0FBQ3JDLElBQUksVUFBcUIsQ0FBQztBQUMxQixtQ0FBbUM7QUFDbkMsSUFBSSxVQUFVLEdBQUc7SUFDZixLQUFLLEVBQUUsRUFBRTtJQUNULGlCQUFpQixFQUFFLEVBQWM7SUFDakMsZUFBZSxFQUFFLEVBQWM7SUFDL0IsZ0JBQWdCLEVBQUUsRUFBYztDQUNqQyxDQUFDO0FBRVcsUUFBQSxZQUFZLEdBQUcsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDO0FBQzdDLE1BQU0scUJBQXFCLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxvQkFBb0IsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUVoRSxNQUFNLGVBQWUsR0FBRyxHQUFHLEVBQUU7SUFDM0IsVUFBVSxHQUFHO1FBQ1gsS0FBSyxFQUFFLEVBQUU7UUFDVCxpQkFBaUIsRUFBRSxFQUFFO1FBQ3JCLGVBQWUsRUFBRSxFQUFFO1FBQ25CLGdCQUFnQixFQUFFLEVBQUU7S0FDckIsQ0FBQztBQUNKLENBQUMsQ0FBQztBQUVLLEtBQUssVUFBVSxXQUFXLENBQUMsV0FBbUI7SUFDbkQsSUFBSTtRQUNGLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNqRSxzRUFBc0U7UUFDdEUsVUFBVSxHQUFHLElBQUksNENBQW9CLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDOUMs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LFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVMsQ0FBQyxDQUFDO2dCQUNyRCxPQUFPLElBQUksQ0FBQztZQUNkLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7S0FDSjtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ2QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNwQjtBQUNILENBQUM7QUF4QkQsa0RBd0JDO0FBRU0sS0FBSyxVQUFVLGtCQUFrQixDQUFDLE9BQWU7SUFDdEQsSUFBSTtRQUNGLE1BQU0scUJBQXFCLEdBQUcsSUFBSSwwQ0FBa0IsQ0FBQztZQUNuRCxTQUFTLEVBQUUsT0FBTztTQUNuQixDQUFDLENBQUM7UUFDSCxNQUFNLHFCQUFxQixHQUFHLE1BQU0sVUFBVSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQzNFLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsWUFBWSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQzVFLE9BQU8sWUFBWSxDQUFDO0tBQ3JCO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDZCxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3BCO0FBQ0gsQ0FBQztBQVhELGdEQVdDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgbG9hZFNoYXJlZENvbmZpZ0ZpbGVzIH0gZnJvbSBcIkBhd3Mtc2RrL3NoYXJlZC1pbmktZmlsZS1sb2FkZXJcIjtcbmltcG9ydCAqIGFzIGpzX3lhbWwgZnJvbSBcImpzLXlhbWxcIjtcbmltcG9ydCB7XG4gIEVDMkNsaWVudCxcbiAgRGVzY3JpYmVWcGNzQ29tbWFuZCxcbiAgRGVzY3JpYmVTdWJuZXRzQ29tbWFuZCxcbn0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1lYzJcIjtcblxuaW1wb3J0IHtcbiAgQ2xvdWRGb3JtYXRpb25DbGllbnQsXG4gIExpc3RTdGFja3NDb21tYW5kLFxuICBHZXRUZW1wbGF0ZUNvbW1hbmQsXG59IGZyb20gXCJAYXdzLXNkay9jbGllbnQtY2xvdWRmb3JtYXRpb25cIjtcbi8vIFRPRE86IEhhbmRsZSByZXF1ZXN0IGVycm9ycyBiYWNrIHRvIGNsaWVudCBmb3IgbWVzc2FnZXNcblxuLy8gVE9ETzogRGVmaW5lIHR5cGUgZm9yIF9hY2NvdW50c0NyZWRlbnRpYWxzXG5sZXQgX2FjY291bnRzQ3JlZGVudGlhbHM6IGFueSA9IHt9O1xubGV0IF9jZm5DbGllbnQ6IENsb3VkRm9ybWF0aW9uQ2xpZW50O1xubGV0IF9lYzJDbGllbnQ6IEVDMkNsaWVudDtcbi8vIFRPRE86IERlZmluZSB0eXBlIGZvciBfdnBjQ29uZmlnXG5sZXQgX3ZwY0NvbmZpZyA9IHtcbiAgdnBjSWQ6IFwiXCIsXG4gIGF2YWlsYWJpbGl0eVpvbmVzOiBbXSBhcyBzdHJpbmdbXSxcbiAgcHVibGljU3VibmV0SWRzOiBbXSBhcyBzdHJpbmdbXSxcbiAgcHJpdmF0ZVN1Ym5ldElkczogW10gYXMgc3RyaW5nW10sXG59O1xuXG5leHBvcnQgY29uc3QgZ2V0Q2ZuQ2xpZW50ID0gKCkgPT4gX2NmbkNsaWVudDtcbmNvbnN0IF9yZXNldEFjY0NyZWRlbmV0aWFscyA9ICgpID0+IChfYWNjb3VudHNDcmVkZW50aWFscyA9IHt9KTtcblxuY29uc3QgX3Jlc2V0VnBjQ29uZmlnID0gKCkgPT4ge1xuICBfdnBjQ29uZmlnID0ge1xuICAgIHZwY0lkOiBcIlwiLFxuICAgIGF2YWlsYWJpbGl0eVpvbmVzOiBbXSxcbiAgICBwdWJsaWNTdWJuZXRJZHM6IFtdLFxuICAgIHByaXZhdGVTdWJuZXRJZHM6IFtdLFxuICB9O1xufTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsaWVudHNJbml0KHByb2ZpbGVOYW1lOiBzdHJpbmcpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBjb25maWcgPSBKU09OLnN0cmluZ2lmeShfYWNjb3VudHNDcmVkZW50aWFsc1twcm9maWxlTmFtZV0pO1xuICAgIC8vIEB0cy1pZ25vcmUgcGFzc2luZyBhbiBvYmplY3QgcmVzdWx0cyBpbiBlcnJvciwgQVdTJ3MgZmF1bHQgbm90IG1pbmVcbiAgICBfY2ZuQ2xpZW50ID0gbmV3IENsb3VkRm9ybWF0aW9uQ2xpZW50KGNvbmZpZyk7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIF9lYzJDbGllbnQgPSBuZXcgRUMyQ2xpZW50KGNvbmZpZyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5sb2coZXJyb3IpO1xuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaEF3c1Byb2ZpbGVzSW5mbygpIHtcbiAgdHJ5IHtcbiAgICBfcmVzZXRBY2NDcmVkZW5ldGlhbHMoKTtcbiAgICBjb25zdCBhd3NQcm9maWxlc0luZm8gPSBhd2FpdCBsb2FkU2hhcmVkQ29uZmlnRmlsZXMoKTtcblxuICAgIGZvciAoY29uc3QgcHJvZmlsZSBpbiBhd3NQcm9maWxlc0luZm8uY29uZmlnRmlsZSkge1xuICAgICAgX2FjY291bnRzQ3JlZGVudGlhbHNbcHJvZmlsZV0gPSB7XG4gICAgICAgIC4uLmF3c1Byb2ZpbGVzSW5mby5jb25maWdGaWxlW3Byb2ZpbGVdLFxuICAgICAgICBjcmVkZW50aWFsczoge1xuICAgICAgICAgIC4uLmF3c1Byb2ZpbGVzSW5mby5jcmVkZW50aWFsc0ZpbGVbcHJvZmlsZV0sXG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgIH1cbiAgICBjb25zdCBwcm9maWxlcyA9IE9iamVjdC5rZXlzKGF3c1Byb2ZpbGVzSW5mby5jb25maWdGaWxlKTtcbiAgICByZXR1cm4gcHJvZmlsZXM7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgIHJldHVybiBlcnJvcjtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmV0Y2hBd3NTdGFja0luZm8oKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgZmV0Y2hBY3RpdmVMaXN0c0NtZCA9IG5ldyBMaXN0U3RhY2tzQ29tbWFuZCh7fSk7XG4gICAgY29uc3QgYWxsVXNlclN0YWNrcyA9IGF3YWl0IF9jZm5DbGllbnQuc2VuZChmZXRjaEFjdGl2ZUxpc3RzQ21kKTtcbiAgICBjb25zdCBhY3RpdmVTdGFja3MgPSBhbGxVc2VyU3RhY2tzLlN0YWNrU3VtbWFyaWVzPy5maWx0ZXIoXG4gICAgICAoc3RhY2spID0+ICFzdGFjay5EZWxldGlvblRpbWVcbiAgICApO1xuXG4gICAgcmV0dXJuIGFjdGl2ZVN0YWNrcztcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmxvZyhcbiAgICAgIFwiVGhlIGZvbGxvd2luZyBlcnJvciBvY2N1cmVkIHdoZW4gdHJ5aW5nIHRvIGZldGNoIHByb2ZpbGUgc3RhY2tzOiBcIixcbiAgICAgIGVycm9yXG4gICAgKTtcbiAgICByZXR1cm4gW107XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoU3RhY2tWcGNDb25maWcoc3RhY2tJZDogc3RyaW5nKSB7XG4gIF9yZXNldFZwY0NvbmZpZygpO1xuICBhd2FpdCBzZXRDb25maWdWcGNJZChzdGFja0lkKTtcbiAgY29uc29sZS5sb2coX3ZwY0NvbmZpZyk7XG4gIGF3YWl0IHNldEF6UHViUHJpdlN1Ym5ldHMoKTtcbiAgcmV0dXJuIF92cGNDb25maWc7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRDb25maWdWcGNJZChzdGFja0lkOiBzdHJpbmcpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCB2cGNDbWQgPSBuZXcgRGVzY3JpYmVWcGNzQ29tbWFuZCh7fSk7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGNvbnN0IHZwY1Jlc3BvbnNlID0gYXdhaXQgX2VjMkNsaWVudC5zZW5kKHZwY0NtZCk7XG4gICAgY29uc3QgdnBjc0xpc3QgPSB2cGNSZXNwb25zZS5WcGNzIHx8IFtdO1xuICAgIGNvbnN0IHZwY0lkOiBzdHJpbmcgPSB2cGNzTGlzdC5yZWR1Y2UoKGFjYywgdnBjKSA9PiB7XG4gICAgICBsZXQgdnBjSWQgPSBhY2M7XG4gICAgICBpZiAodnBjLlRhZ3MpIHtcbiAgICAgICAgdnBjLlRhZ3MuZm9yRWFjaCgodGFnKSA9PiB7XG4gICAgICAgICAgaWYgKHRhZy5WYWx1ZSA9PT0gc3RhY2tJZCkgdnBjSWQgPSB2cGMuVnBjSWQhO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2cGNJZDtcbiAgICB9LCBcIlwiKTtcblxuICAgIF92cGNDb25maWcudnBjSWQgPSB2cGNJZDtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldEF6UHViUHJpdlN1Ym5ldHMoKSB7XG4gIHRyeSB7XG4gICAgY29uc3Qgc3VibmV0c0NtZCA9IG5ldyBEZXNjcmliZVN1Ym5ldHNDb21tYW5kKHt9KTtcbiAgICBjb25zdCBzdWJuZXRzUmVzcG9uc2UgPSBhd2FpdCBfZWMyQ2xpZW50LnNlbmQoc3VibmV0c0NtZCk7XG5cbiAgICBzdWJuZXRzUmVzcG9uc2UuU3VibmV0cyA9IHN1Ym5ldHNSZXNwb25zZS5TdWJuZXRzIHx8IFtdO1xuICAgIHN1Ym5ldHNSZXNwb25zZS5TdWJuZXRzLmZvckVhY2goKHN1Ym5ldCkgPT4ge1xuICAgICAgaWYgKHN1Ym5ldC5WcGNJZCAhPT0gX3ZwY0NvbmZpZy52cGNJZCkgcmV0dXJuO1xuICAgICAgY29uc3Qgc3VibmV0QXogPSBzdWJuZXQuQXZhaWxhYmlsaXR5Wm9uZTtcbiAgICAgIGlmICghX3ZwY0NvbmZpZy5hdmFpbGFiaWxpdHlab25lcy5pbmNsdWRlcyhzdWJuZXRBeiEpKVxuICAgICAgICBfdnBjQ29uZmlnLmF2YWlsYWJpbGl0eVpvbmVzLnB1c2goc3VibmV0QXohKTtcblxuICAgICAgc3VibmV0LlRhZ3M/LnNvbWUoKHRhZykgPT4ge1xuICAgICAgICBpZiAoIVtcIlByaXZhdGVcIiwgXCJQdWJsaWNcIl0uaW5jbHVkZXModGFnLlZhbHVlISkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKHRhZy5WYWx1ZSA9PT0gXCJQdWJsaWNcIilcbiAgICAgICAgICBfdnBjQ29uZmlnLnB1YmxpY1N1Ym5ldElkcy5wdXNoKHN1Ym5ldC5TdWJuZXRJZCEpO1xuICAgICAgICBpZiAodGFnLlZhbHVlID09PSBcIlByaXZhdGVcIilcbiAgICAgICAgICBfdnBjQ29uZmlnLnByaXZhdGVTdWJuZXRJZHMucHVzaChzdWJuZXQuU3VibmV0SWQhKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoU3RhY2tUZW1wbGF0ZShzdGFja0lkOiBzdHJpbmcpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBmZXRjaFN0YWNrVGVtcGxhdGVDbWQgPSBuZXcgR2V0VGVtcGxhdGVDb21tYW5kKHtcbiAgICAgIFN0YWNrTmFtZTogc3RhY2tJZCxcbiAgICB9KTtcbiAgICBjb25zdCBleGlzdGluZ1N0YWNrVGVtcGxhdGUgPSBhd2FpdCBfY2ZuQ2xpZW50LnNlbmQoZmV0Y2hTdGFja1RlbXBsYXRlQ21kKTtcbiAgICBjb25zdCBqc29uVGVtcGxhdGUgPSBqc195YW1sLmxvYWQoZXhpc3RpbmdTdGFja1RlbXBsYXRlLlRlbXBsYXRlQm9keSB8fCBcIlwiKTtcbiAgICByZXR1cm4ganNvblRlbXBsYXRlO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgfVxufVxuIl19