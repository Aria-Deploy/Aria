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
exports.createListenerRule = exports.fetchStackTemplate = exports.setAzPubPrivSubnets = exports.fetchStacksInfo = exports.fetchProfilesInfo = exports.fetchAccountInfo = exports.getLoadBalancerInfo = exports.getVpcsInfo = exports.clientsInit = exports.getEnv = void 0;
const shared_ini_file_loader_1 = require("@aws-sdk/shared-ini-file-loader");
const js_yaml = __importStar(require("js-yaml"));
const client_ec2_1 = require("@aws-sdk/client-ec2");
const client_cloudformation_1 = require("@aws-sdk/client-cloudformation");
const client_sts_1 = require("@aws-sdk/client-sts");
const client_elastic_load_balancing_v2_1 = require("@aws-sdk/client-elastic-load-balancing-v2");
// TODO: Handle request errors back to client for messages
// TODO: Define type for _accountsCredentials
let _accountsCredentials = {};
let _cfnClient;
let _ec2Client;
let _stsClient;
let _elvb2Client;
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
        // @ts-ignore
        _elvb2Client = new client_elastic_load_balancing_v2_1.ElasticLoadBalancingV2Client(config);
    }
    catch (error) {
        console.log(error);
    }
}
exports.clientsInit = clientsInit;
async function getVpcsInfo() {
    const getVpcsCmd = new client_ec2_1.DescribeVpcsCommand({});
    const profileVpcs = await _ec2Client.send(getVpcsCmd);
    return profileVpcs.Vpcs;
}
exports.getVpcsInfo = getVpcsInfo;
// TODO define vpcs type
async function getLoadBalancerInfo() {
    const getSecurityGroupsRulesCmd = new client_ec2_1.DescribeSecurityGroupRulesCommand({});
    const getSecurityGroupsRulesRes = await _ec2Client.send(getSecurityGroupsRulesCmd);
    const securityGroupsRulesInfo = getSecurityGroupsRulesRes.SecurityGroupRules;
    const getInstancesCmd = new client_ec2_1.DescribeInstancesCommand({});
    const getInstRes = await _ec2Client.send(getInstancesCmd);
    const allInstances = [];
    getInstRes.Reservations?.forEach((res) => {
        res.Instances?.forEach((instance) => {
            allInstances.push({
                instanceId: instance.InstanceId,
                SubnetId: instance.SubnetId,
                VpcId: instance.VpcId,
                SecurityGroups: instance.SecurityGroups,
                AvailabilityZone: instance.Placement.AvailabilityZone,
            });
        });
    });
    const getElbsCmd = new client_elastic_load_balancing_v2_1.DescribeLoadBalancersCommand({});
    const getElbsRes = await _elvb2Client.send(getElbsCmd);
    // TODO define type for activeElbs
    const activeAlbs = await Promise.all(getElbsRes.LoadBalancers.map(async (loadBalancer) => {
        if (loadBalancer.State?.Code === "active" &&
            loadBalancer.Type === "application") {
            const loadBalancerObj = {
                LoadBalancerName: loadBalancer.LoadBalancerName,
                LoadBalancerArn: loadBalancer.LoadBalancerArn,
                LoadBalancerSecurityGroups: loadBalancer.SecurityGroups,
            };
            const getListenersCmd = new client_elastic_load_balancing_v2_1.DescribeListenersCommand({
                LoadBalancerArn: loadBalancer.LoadBalancerArn,
            });
            const getListenersRes = await _elvb2Client.send(getListenersCmd);
            const listenersInfo = getListenersRes.Listeners?.map((listener) => ({
                ListenerArn: listener.ListenerArn,
                Port: listener.Port,
            }));
            loadBalancerObj.Listeners = listenersInfo;
            const getTargetGroupsCmd = new client_elastic_load_balancing_v2_1.DescribeTargetGroupsCommand({
                LoadBalancerArn: loadBalancer.LoadBalancerArn,
            });
            const getTargetGroupsRes = await _elvb2Client.send(getTargetGroupsCmd);
            const targetGroupsInfo = getTargetGroupsRes.TargetGroups?.map((targetGroup) => ({
                TargetGroupArn: targetGroup.TargetGroupArn,
                Port: targetGroup.Port,
                TargetGroupName: targetGroup.TargetGroupName,
            }));
            loadBalancerObj.Targets = targetGroupsInfo;
            await Promise.all(loadBalancerObj.Targets.map(async (target) => {
                const targetHealthCmd = new client_elastic_load_balancing_v2_1.DescribeTargetHealthCommand({
                    TargetGroupArn: target.TargetGroupArn,
                });
                const targetHealthRes = await _elvb2Client.send(targetHealthCmd);
                const instanceIds = targetHealthRes.TargetHealthDescriptions?.map((des) => des.Target.Id);
                target.Instances = instanceIds.map((instanceId) => {
                    return allInstances.find((instance) => instance.instanceId === instanceId);
                });
                return;
            }));
            return loadBalancerObj;
        }
    }));
    return activeAlbs;
}
exports.getLoadBalancerInfo = getLoadBalancerInfo;
async function fetchAccountInfo(profileName) {
    const accountIdCmd = new client_sts_1.GetCallerIdentityCommand({});
    const response = await _stsClient.send(accountIdCmd);
    _env = {
        account: response.Account,
        region: _accountsCredentials[profileName].region,
    };
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
// export async function fetchStackVpcConfig(stackId: string) {
//   _resetVpcConfig();
//   await setConfigVpcId(stackId);
//   await setAzPubPrivSubnets();
//   return _vpcConfig;
// }
// export async function setConfigVpcId(stackId: string) {
//   try {
//     const vpcCmd = new DescribeVpcsCommand({});
//     // @ts-ignore
//     const vpcResponse = await _ec2Client.send(vpcCmd);
//     const vpcsList = vpcResponse.Vpcs || [];
//     const vpcId: string = vpcsList.reduce((acc, vpc) => {
//       let vpcId = acc;
//       if (vpc.Tags) {
//         vpc.Tags.forEach((tag) => {
//           if (tag.Value === stackId) vpcId = vpc.VpcId!;
//         });
//       }
//       return vpcId;
//     }, "");
//     _vpcConfig.vpcId = vpcId;
//   } catch (error) {
//     console.log(error);
//   }
// }
async function setAzPubPrivSubnets(vpcId) {
    const vpcConfig = {
        vpcId,
        availabilityZones: [],
        publicSubnetIds: [],
        privateSubnetIds: [],
    };
    try {
        const subnetsCmd = new client_ec2_1.DescribeSubnetsCommand({});
        const subnetsResponse = await _ec2Client.send(subnetsCmd);
        subnetsResponse.Subnets = subnetsResponse.Subnets || [];
        subnetsResponse.Subnets.forEach((subnet) => {
            if (subnet.VpcId !== vpcConfig.vpcId)
                return;
            const subnetAz = subnet.AvailabilityZone;
            if (!vpcConfig.availabilityZones.includes(subnetAz))
                vpcConfig.availabilityZones.push(subnetAz);
            subnet.Tags?.some((tag) => {
                if (!["Private", "Public"].includes(tag.Value))
                    return false;
                if (tag.Value === "Public")
                    vpcConfig.publicSubnetIds.push(subnet.SubnetId);
                if (tag.Value === "Private")
                    vpcConfig.privateSubnetIds.push(subnet.SubnetId);
                return true;
            });
        });
        return vpcConfig;
    }
    catch (error) {
        console.log(error);
        return error;
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
// TODO define type for newRuleArns
async function createListenerRule(newRuleConfig) {
    const createRuleCmd = new client_elastic_load_balancing_v2_1.CreateRuleCommand(newRuleConfig);
    const createRuleResponse = await _elvb2Client.send(createRuleCmd);
    return createRuleResponse;
}
exports.createListenerRule = createListenerRule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXdzX2Nmbl9kYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2Nmbl9pbnRlcmZhY2UvbGliL2F3c19jZm5fZGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNEVBQXdFO0FBQ3hFLGlEQUFtQztBQUVuQyxvREFPNkI7QUFFN0IsMEVBSXdDO0FBRXhDLG9EQUEwRTtBQUMxRSxnR0FPbUQ7QUFFbkQsMERBQTBEO0FBRTFELDZDQUE2QztBQUM3QyxJQUFJLG9CQUFvQixHQUFRLEVBQUUsQ0FBQztBQUNuQyxJQUFJLFVBQWdDLENBQUM7QUFDckMsSUFBSSxVQUFxQixDQUFDO0FBQzFCLElBQUksVUFBcUIsQ0FBQztBQUMxQixJQUFJLFlBQTBDLENBQUM7QUFDL0MsSUFBSSxJQUF5QyxDQUFDO0FBQzlDLG1DQUFtQztBQUNuQyxJQUFJLFVBQVUsR0FBRztJQUNmLEtBQUssRUFBRSxFQUFFO0lBQ1QsaUJBQWlCLEVBQUUsRUFBYztJQUNqQyxlQUFlLEVBQUUsRUFBYztJQUMvQixnQkFBZ0IsRUFBRSxFQUFjO0NBQ2pDLENBQUM7QUFFVyxRQUFBLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUM7QUFDakMsTUFBTSxxQkFBcUIsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLG9CQUFvQixHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBRWhFLE1BQU0sZUFBZSxHQUFHLEdBQUcsRUFBRTtJQUMzQixVQUFVLEdBQUc7UUFDWCxLQUFLLEVBQUUsRUFBRTtRQUNULGlCQUFpQixFQUFFLEVBQUU7UUFDckIsZUFBZSxFQUFFLEVBQUU7UUFDbkIsZ0JBQWdCLEVBQUUsRUFBRTtLQUNyQixDQUFDO0FBQ0osQ0FBQyxDQUFDO0FBRUssS0FBSyxVQUFVLFdBQVcsQ0FBQyxXQUFtQjtJQUNuRCxJQUFJO1FBQ0YsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0Is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TyxZQUFZLENBQUM7S0FDckI7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDcEI7QUFDSCxDQUFDO0FBWEQsZ0RBV0M7QUFFRCxtQ0FBbUM7QUFDNUIsS0FBSyxVQUFVLGtCQUFrQixDQUFDLGFBQWtCO0lBQ3pELE1BQU0sYUFBYSxHQUFHLElBQUksb0RBQWlCLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDM0QsTUFBTSxrQkFBa0IsR0FBRyxNQUFNLFlBQVksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDbEUsT0FBTyxrQkFBa0IsQ0FBQztBQUM1QixDQUFDO0FBSkQsZ0RBSUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBsb2FkU2hhcmVkQ29uZmlnRmlsZXMgfSBmcm9tIFwiQGF3cy1zZGsvc2hhcmVkLWluaS1maWxlLWxvYWRlclwiO1xuaW1wb3J0ICogYXMganNfeWFtbCBmcm9tIFwianMteWFtbFwiO1xuaW1wb3J0ICogYXMgY2xpZW50RWMyIGZyb20gXCJAYXdzLXNkay9jbGllbnQtZWMyXCI7XG5pbXBvcnQge1xuICBFQzJDbGllbnQsXG4gIERlc2NyaWJlVnBjc0NvbW1hbmQsXG4gIERlc2NyaWJlU3VibmV0c0NvbW1hbmQsXG4gIERlc2NyaWJlSW5zdGFuY2VzQ29tbWFuZCxcbiAgRGVzY3JpYmVTZWN1cml0eUdyb3VwUnVsZXNSZXF1ZXN0LFxuICBEZXNjcmliZVNlY3VyaXR5R3JvdXBSdWxlc0NvbW1hbmQsXG59IGZyb20gXCJAYXdzLXNkay9jbGllbnQtZWMyXCI7XG5cbmltcG9ydCB7XG4gIENsb3VkRm9ybWF0aW9uQ2xpZW50LFxuICBHZXRUZW1wbGF0ZUNvbW1hbmQsXG4gIERlc2NyaWJlU3RhY2tzQ29tbWFuZCxcbn0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1jbG91ZGZvcm1hdGlvblwiO1xuXG5pbXBvcnQgeyBTVFNDbGllbnQsIEdldENhbGxlcklkZW50aXR5Q29tbWFuZCB9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtc3RzXCI7XG5pbXBvcnQge1xuICBFbGFzdGljTG9hZEJhbGFuY2luZ1YyQ2xpZW50LFxuICBEZXNjcmliZUxvYWRCYWxhbmNlcnNDb21tYW5kLFxuICBDcmVhdGVSdWxlQ29tbWFuZCxcbiAgRGVzY3JpYmVMaXN0ZW5lcnNDb21tYW5kLFxuICBEZXNjcmliZVRhcmdldEdyb3Vwc0NvbW1hbmQsXG4gIERlc2NyaWJlVGFyZ2V0SGVhbHRoQ29tbWFuZCxcbn0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1lbGFzdGljLWxvYWQtYmFsYW5jaW5nLXYyXCI7XG5pbXBvcnQgeyBWcGMgfSBmcm9tIFwiQGF3cy1jZGsvYXdzLWVjMlwiO1xuLy8gVE9ETzogSGFuZGxlIHJlcXVlc3QgZXJyb3JzIGJhY2sgdG8gY2xpZW50IGZvciBtZXNzYWdlc1xuXG4vLyBUT0RPOiBEZWZpbmUgdHlwZSBmb3IgX2FjY291bnRzQ3JlZGVudGlhbHNcbmxldCBfYWNjb3VudHNDcmVkZW50aWFsczogYW55ID0ge307XG5sZXQgX2NmbkNsaWVudDogQ2xvdWRGb3JtYXRpb25DbGllbnQ7XG5sZXQgX2VjMkNsaWVudDogRUMyQ2xpZW50O1xubGV0IF9zdHNDbGllbnQ6IFNUU0NsaWVudDtcbmxldCBfZWx2YjJDbGllbnQ6IEVsYXN0aWNMb2FkQmFsYW5jaW5nVjJDbGllbnQ7XG5sZXQgX2VudjogeyBhY2NvdW50OiBzdHJpbmc7IHJlZ2lvbjogc3RyaW5nIH07XG4vLyBUT0RPOiBEZWZpbmUgdHlwZSBmb3IgX3ZwY0NvbmZpZ1xubGV0IF92cGNDb25maWcgPSB7XG4gIHZwY0lkOiBcIlwiLFxuICBhdmFpbGFiaWxpdHlab25lczogW10gYXMgc3RyaW5nW10sXG4gIHB1YmxpY1N1Ym5ldElkczogW10gYXMgc3RyaW5nW10sXG4gIHByaXZhdGVTdWJuZXRJZHM6IFtdIGFzIHN0cmluZ1tdLFxufTtcblxuZXhwb3J0IGNvbnN0IGdldEVudiA9ICgpID0+IF9lbnY7XG5jb25zdCBfcmVzZXRBY2NDcmVkZW5ldGlhbHMgPSAoKSA9PiAoX2FjY291bnRzQ3JlZGVudGlhbHMgPSB7fSk7XG5cbmNvbnN0IF9yZXNldFZwY0NvbmZpZyA9ICgpID0+IHtcbiAgX3ZwY0NvbmZpZyA9IHtcbiAgICB2cGNJZDogXCJcIixcbiAgICBhdmFpbGFiaWxpdHlab25lczogW10sXG4gICAgcHVibGljU3VibmV0SWRzOiBbXSxcbiAgICBwcml2YXRlU3VibmV0SWRzOiBbXSxcbiAgfTtcbn07XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGllbnRzSW5pdChwcm9maWxlTmFtZTogc3RyaW5nKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgY29uZmlnID0gSlNPTi5zdHJpbmdpZnkoX2FjY291bnRzQ3JlZGVudGlhbHNbcHJvZmlsZU5hbWVdKTtcbiAgICAvLyBAdHMtaWdub3JlIHBhc3NpbmcgYW4gb2JqZWN0IHJlc3VsdHMgaW4gZXJyb3IsIEFXUydzIGZhdWx0IG5vdCBtaW5lXG4gICAgX2NmbkNsaWVudCA9IG5ldyBDbG91ZEZvcm1hdGlvbkNsaWVudChjb25maWcpO1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBfZWMyQ2xpZW50ID0gbmV3IEVDMkNsaWVudChjb25maWcpO1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBfc3RzQ2xpZW50ID0gbmV3IFNUU0NsaWVudChjb25maWcpO1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBfZWx2YjJDbGllbnQgPSBuZXcgRWxhc3RpY0xvYWRCYWxhbmNpbmdWMkNsaWVudChjb25maWcpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VnBjc0luZm8oKSB7XG4gIGNvbnN0IGdldFZwY3NDbWQgPSBuZXcgRGVzY3JpYmVWcGNzQ29tbWFuZCh7fSk7XG4gIGNvbnN0IHByb2ZpbGVWcGNzID0gYXdhaXQgX2VjMkNsaWVudC5zZW5kKGdldFZwY3NDbWQpO1xuICByZXR1cm4gcHJvZmlsZVZwY3MuVnBjcztcbn1cblxuLy8gVE9ETyBkZWZpbmUgdnBjcyB0eXBlXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0TG9hZEJhbGFuY2VySW5mbygpIHtcbiAgY29uc3QgZ2V0U2VjdXJpdHlHcm91cHNSdWxlc0NtZCA9IG5ldyBEZXNjcmliZVNlY3VyaXR5R3JvdXBSdWxlc0NvbW1hbmQoe30pO1xuICBjb25zdCBnZXRTZWN1cml0eUdyb3Vwc1J1bGVzUmVzID0gYXdhaXQgX2VjMkNsaWVudC5zZW5kKFxuICAgIGdldFNlY3VyaXR5R3JvdXBzUnVsZXNDbWRcbiAgKTtcbiAgY29uc3Qgc2VjdXJpdHlHcm91cHNSdWxlc0luZm8gPSBnZXRTZWN1cml0eUdyb3Vwc1J1bGVzUmVzLlNlY3VyaXR5R3JvdXBSdWxlcztcblxuICBjb25zdCBnZXRJbnN0YW5jZXNDbWQgPSBuZXcgRGVzY3JpYmVJbnN0YW5jZXNDb21tYW5kKHt9KTtcbiAgY29uc3QgZ2V0SW5zdFJlcyA9IGF3YWl0IF9lYzJDbGllbnQuc2VuZChnZXRJbnN0YW5jZXNDbWQpO1xuXG4gIGNvbnN0IGFsbEluc3RhbmNlczogYW55ID0gW107XG4gIGdldEluc3RSZXMuUmVzZXJ2YXRpb25zPy5mb3JFYWNoKChyZXMpID0+IHtcbiAgICByZXMuSW5zdGFuY2VzPy5mb3JFYWNoKChpbnN0YW5jZSkgPT4ge1xuICAgICAgYWxsSW5zdGFuY2VzLnB1c2goe1xuICAgICAgICBpbnN0YW5jZUlkOiBpbnN0YW5jZS5JbnN0YW5jZUlkLFxuICAgICAgICBTdWJuZXRJZDogaW5zdGFuY2UuU3VibmV0SWQsXG4gICAgICAgIFZwY0lkOiBpbnN0YW5jZS5WcGNJZCxcbiAgICAgICAgU2VjdXJpdHlHcm91cHM6IGluc3RhbmNlLlNlY3VyaXR5R3JvdXBzLFxuICAgICAgICBBdmFpbGFiaWxpdHlab25lOiBpbnN0YW5jZS5QbGFjZW1lbnQhLkF2YWlsYWJpbGl0eVpvbmUsXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgY29uc3QgZ2V0RWxic0NtZCA9IG5ldyBEZXNjcmliZUxvYWRCYWxhbmNlcnNDb21tYW5kKHt9KTtcbiAgY29uc3QgZ2V0RWxic1JlcyA9IGF3YWl0IF9lbHZiMkNsaWVudC5zZW5kKGdldEVsYnNDbWQpO1xuICAvLyBUT0RPIGRlZmluZSB0eXBlIGZvciBhY3RpdmVFbGJzXG4gIGNvbnN0IGFjdGl2ZUFsYnMgPSBhd2FpdCBQcm9taXNlLmFsbChcbiAgICBnZXRFbGJzUmVzLkxvYWRCYWxhbmNlcnMhLm1hcChhc3luYyAobG9hZEJhbGFuY2VyKSA9PiB7XG4gICAgICBpZiAoXG4gICAgICAgIGxvYWRCYWxhbmNlci5TdGF0ZT8uQ29kZSA9PT0gXCJhY3RpdmVcIiAmJlxuICAgICAgICBsb2FkQmFsYW5jZXIuVHlwZSA9PT0gXCJhcHBsaWNhdGlvblwiXG4gICAgICApIHtcbiAgICAgICAgY29uc3QgbG9hZEJhbGFuY2VyT2JqOiBhbnkgPSB7XG4gICAgICAgICAgTG9hZEJhbGFuY2VyTmFtZTogbG9hZEJhbGFuY2VyLkxvYWRCYWxhbmNlck5hbWUsXG4gICAgICAgICAgTG9hZEJhbGFuY2VyQXJuOiBsb2FkQmFsYW5jZXIuTG9hZEJhbGFuY2VyQXJuLFxuICAgICAgICAgIExvYWRCYWxhbmNlclNlY3VyaXR5R3JvdXBzOiBsb2FkQmFsYW5jZXIuU2VjdXJpdHlHcm91cHMsXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgZ2V0TGlzdGVuZXJzQ21kID0gbmV3IERlc2NyaWJlTGlzdGVuZXJzQ29tbWFuZCh7XG4gICAgICAgICAgTG9hZEJhbGFuY2VyQXJuOiBsb2FkQmFsYW5jZXIuTG9hZEJhbGFuY2VyQXJuLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgZ2V0TGlzdGVuZXJzUmVzID0gYXdhaXQgX2VsdmIyQ2xpZW50LnNlbmQoZ2V0TGlzdGVuZXJzQ21kKTtcbiAgICAgICAgY29uc3QgbGlzdGVuZXJzSW5mbyA9IGdldExpc3RlbmVyc1Jlcy5MaXN0ZW5lcnM/Lm1hcCgobGlzdGVuZXIpID0+ICh7XG4gICAgICAgICAgTGlzdGVuZXJBcm46IGxpc3RlbmVyLkxpc3RlbmVyQXJuLFxuICAgICAgICAgIFBvcnQ6IGxpc3RlbmVyLlBvcnQsXG4gICAgICAgIH0pKTtcbiAgICAgICAgbG9hZEJhbGFuY2VyT2JqLkxpc3RlbmVycyA9IGxpc3RlbmVyc0luZm87XG5cbiAgICAgICAgY29uc3QgZ2V0VGFyZ2V0R3JvdXBzQ21kID0gbmV3IERlc2NyaWJlVGFyZ2V0R3JvdXBzQ29tbWFuZCh7XG4gICAgICAgICAgTG9hZEJhbGFuY2VyQXJuOiBsb2FkQmFsYW5jZXIuTG9hZEJhbGFuY2VyQXJuLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgZ2V0VGFyZ2V0R3JvdXBzUmVzID0gYXdhaXQgX2VsdmIyQ2xpZW50LnNlbmQoZ2V0VGFyZ2V0R3JvdXBzQ21kKTtcbiAgICAgICAgY29uc3QgdGFyZ2V0R3JvdXBzSW5mbyA9IGdldFRhcmdldEdyb3Vwc1Jlcy5UYXJnZXRHcm91cHM/Lm1hcChcbiAgICAgICAgICAodGFyZ2V0R3JvdXApID0+ICh7XG4gICAgICAgICAgICBUYXJnZXRHcm91cEFybjogdGFyZ2V0R3JvdXAuVGFyZ2V0R3JvdXBBcm4sXG4gICAgICAgICAgICBQb3J0OiB0YXJnZXRHcm91cC5Qb3J0LFxuICAgICAgICAgICAgVGFyZ2V0R3JvdXBOYW1lOiB0YXJnZXRHcm91cC5UYXJnZXRHcm91cE5hbWUsXG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICAgICAgbG9hZEJhbGFuY2VyT2JqLlRhcmdldHMgPSB0YXJnZXRHcm91cHNJbmZvO1xuXG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKFxuICAgICAgICAgIGxvYWRCYWxhbmNlck9iai5UYXJnZXRzLm1hcChhc3luYyAodGFyZ2V0OiBhbnkpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldEhlYWx0aENtZCA9IG5ldyBEZXNjcmliZVRhcmdldEhlYWx0aENvbW1hbmQoe1xuICAgICAgICAgICAgICBUYXJnZXRHcm91cEFybjogdGFyZ2V0LlRhcmdldEdyb3VwQXJuLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXRIZWFsdGhSZXMgPSBhd2FpdCBfZWx2YjJDbGllbnQuc2VuZCh0YXJnZXRIZWFsdGhDbWQpO1xuICAgICAgICAgICAgY29uc3QgaW5zdGFuY2VJZHMgPSB0YXJnZXRIZWFsdGhSZXMuVGFyZ2V0SGVhbHRoRGVzY3JpcHRpb25zPy5tYXAoXG4gICAgICAgICAgICAgIChkZXMpID0+IGRlcy5UYXJnZXQhLklkXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdGFyZ2V0Lkluc3RhbmNlcyA9IGluc3RhbmNlSWRzIS5tYXAoKGluc3RhbmNlSWQpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIGFsbEluc3RhbmNlcy5maW5kKFxuICAgICAgICAgICAgICAgIChpbnN0YW5jZTogYW55KSA9PiBpbnN0YW5jZS5pbnN0YW5jZUlkID09PSBpbnN0YW5jZUlkXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9KVxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiBsb2FkQmFsYW5jZXJPYmo7XG4gICAgICB9XG4gICAgfSlcbiAgKTtcblxuICByZXR1cm4gYWN0aXZlQWxicztcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoQWNjb3VudEluZm8ocHJvZmlsZU5hbWU6IHN0cmluZykge1xuICBjb25zdCBhY2NvdW50SWRDbWQgPSBuZXcgR2V0Q2FsbGVySWRlbnRpdHlDb21tYW5kKHt9KTtcbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBfc3RzQ2xpZW50LnNlbmQoYWNjb3VudElkQ21kKTtcbiAgX2VudiA9IHtcbiAgICBhY2NvdW50OiByZXNwb25zZS5BY2NvdW50ISxcbiAgICByZWdpb246IF9hY2NvdW50c0NyZWRlbnRpYWxzW3Byb2ZpbGVOYW1lXS5yZWdpb24sXG4gIH07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaFByb2ZpbGVzSW5mbygpIHtcbiAgdHJ5IHtcbiAgICBfcmVzZXRBY2NDcmVkZW5ldGlhbHMoKTtcbiAgICBjb25zdCBhd3NQcm9maWxlc0luZm8gPSBhd2FpdCBsb2FkU2hhcmVkQ29uZmlnRmlsZXMoKTtcbiAgICBmb3IgKGNvbnN0IHByb2ZpbGUgaW4gYXdzUHJvZmlsZXNJbmZvLmNvbmZpZ0ZpbGUpIHtcbiAgICAgIF9hY2NvdW50c0NyZWRlbnRpYWxzW3Byb2ZpbGVdID0ge1xuICAgICAgICAuLi5hd3NQcm9maWxlc0luZm8uY29uZmlnRmlsZVtwcm9maWxlXSxcbiAgICAgICAgY3JlZGVudGlhbHM6IHtcbiAgICAgICAgICAuLi5hd3NQcm9maWxlc0luZm8uY3JlZGVudGlhbHNGaWxlW3Byb2ZpbGVdLFxuICAgICAgICB9LFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb25zdCBwcm9maWxlcyA9IE9iamVjdC5rZXlzKGF3c1Byb2ZpbGVzSW5mby5jb25maWdGaWxlKTtcbiAgICByZXR1cm4gcHJvZmlsZXM7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgIHJldHVybiBlcnJvcjtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmV0Y2hTdGFja3NJbmZvKCkge1xuICB0cnkge1xuICAgIGNvbnN0IHN0YWNrc0luZm9DbWQgPSBuZXcgRGVzY3JpYmVTdGFja3NDb21tYW5kKHt9KTtcbiAgICBjb25zdCBzdGFja3NJbmZvID0gYXdhaXQgX2NmbkNsaWVudC5zZW5kKHN0YWNrc0luZm9DbWQpO1xuXG4gICAgc3RhY2tzSW5mby5TdGFja3MgPSBzdGFja3NJbmZvLlN0YWNrcyB8fCBbXTtcbiAgICBjb25zdCBmb3JtYXR0ZWRTdGFja3MgPSBzdGFja3NJbmZvLlN0YWNrcy5tYXAoKHN0YWNrKSA9PiB7XG4gICAgICBzdGFjay5PdXRwdXRzID0gc3RhY2suT3V0cHV0cyB8fCBbXTtcbiAgICAgIGNvbnN0IGlzQ2FuYXJ5ID0gc3RhY2suT3V0cHV0cy5zb21lKFxuICAgICAgICAoeyBPdXRwdXRLZXkgfSkgPT4gT3V0cHV0S2V5ID09PSBcImFyaWFjYW5hcnlcIlxuICAgICAgKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0YWNrTmFtZTogc3RhY2suU3RhY2tOYW1lLFxuICAgICAgICBzdGFja0lkOiBzdGFjay5TdGFja0lkLFxuICAgICAgICBpc0NhbmFyeSxcbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICByZXR1cm4gZm9ybWF0dGVkU3RhY2tzO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUubG9nKFxuICAgICAgXCJUaGUgZm9sbG93aW5nIGVycm9yIG9jY3VyZWQgd2hlbiB0cnlpbmcgdG8gZmV0Y2ggcHJvZmlsZSBzdGFja3M6IFwiLFxuICAgICAgZXJyb3JcbiAgICApO1xuICAgIHJldHVybiBbXTtcbiAgfVxufVxuXG4vLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gZmV0Y2hTdGFja1ZwY0NvbmZpZyhzdGFja0lkOiBzdHJpbmcpIHtcbi8vICAgX3Jlc2V0VnBjQ29uZmlnKCk7XG4vLyAgIGF3YWl0IHNldENvbmZpZ1ZwY0lkKHN0YWNrSWQpO1xuLy8gICBhd2FpdCBzZXRBelB1YlByaXZTdWJuZXRzKCk7XG4vLyAgIHJldHVybiBfdnBjQ29uZmlnO1xuLy8gfVxuXG4vLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0Q29uZmlnVnBjSWQoc3RhY2tJZDogc3RyaW5nKSB7XG4vLyAgIHRyeSB7XG4vLyAgICAgY29uc3QgdnBjQ21kID0gbmV3IERlc2NyaWJlVnBjc0NvbW1hbmQoe30pO1xuLy8gICAgIC8vIEB0cy1pZ25vcmVcbi8vICAgICBjb25zdCB2cGNSZXNwb25zZSA9IGF3YWl0IF9lYzJDbGllbnQuc2VuZCh2cGNDbWQpO1xuLy8gICAgIGNvbnN0IHZwY3NMaXN0ID0gdnBjUmVzcG9uc2UuVnBjcyB8fCBbXTtcbi8vICAgICBjb25zdCB2cGNJZDogc3RyaW5nID0gdnBjc0xpc3QucmVkdWNlKChhY2MsIHZwYykgPT4ge1xuLy8gICAgICAgbGV0IHZwY0lkID0gYWNjO1xuLy8gICAgICAgaWYgKHZwYy5UYWdzKSB7XG4vLyAgICAgICAgIHZwYy5UYWdzLmZvckVhY2goKHRhZykgPT4ge1xuLy8gICAgICAgICAgIGlmICh0YWcuVmFsdWUgPT09IHN0YWNrSWQpIHZwY0lkID0gdnBjLlZwY0lkITtcbi8vICAgICAgICAgfSk7XG4vLyAgICAgICB9XG4vLyAgICAgICByZXR1cm4gdnBjSWQ7XG4vLyAgICAgfSwgXCJcIik7XG5cbi8vICAgICBfdnBjQ29uZmlnLnZwY0lkID0gdnBjSWQ7XG4vLyAgIH0gY2F0Y2ggKGVycm9yKSB7XG4vLyAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuLy8gICB9XG4vLyB9XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRBelB1YlByaXZTdWJuZXRzKHZwY0lkOiBzdHJpbmcpIHtcbiAgY29uc3QgdnBjQ29uZmlnID0ge1xuICAgIHZwY0lkLFxuICAgIGF2YWlsYWJpbGl0eVpvbmVzOiBbXSBhcyBzdHJpbmdbXSxcbiAgICBwdWJsaWNTdWJuZXRJZHM6IFtdIGFzIHN0cmluZ1tdLFxuICAgIHByaXZhdGVTdWJuZXRJZHM6IFtdIGFzIHN0cmluZ1tdLFxuICB9O1xuXG4gIHRyeSB7XG4gICAgY29uc3Qgc3VibmV0c0NtZCA9IG5ldyBEZXNjcmliZVN1Ym5ldHNDb21tYW5kKHt9KTtcbiAgICBjb25zdCBzdWJuZXRzUmVzcG9uc2UgPSBhd2FpdCBfZWMyQ2xpZW50LnNlbmQoc3VibmV0c0NtZCk7XG5cbiAgICBzdWJuZXRzUmVzcG9uc2UuU3VibmV0cyA9IHN1Ym5ldHNSZXNwb25zZS5TdWJuZXRzIHx8IFtdO1xuICAgIHN1Ym5ldHNSZXNwb25zZS5TdWJuZXRzLmZvckVhY2goKHN1Ym5ldCkgPT4ge1xuICAgICAgaWYgKHN1Ym5ldC5WcGNJZCAhPT0gdnBjQ29uZmlnLnZwY0lkKSByZXR1cm47XG4gICAgICBjb25zdCBzdWJuZXRBeiA9IHN1Ym5ldC5BdmFpbGFiaWxpdHlab25lO1xuICAgICAgaWYgKCF2cGNDb25maWcuYXZhaWxhYmlsaXR5Wm9uZXMuaW5jbHVkZXMoc3VibmV0QXohKSlcbiAgICAgICAgdnBjQ29uZmlnLmF2YWlsYWJpbGl0eVpvbmVzLnB1c2goc3VibmV0QXohKTtcblxuICAgICAgc3VibmV0LlRhZ3M/LnNvbWUoKHRhZykgPT4ge1xuICAgICAgICBpZiAoIVtcIlByaXZhdGVcIiwgXCJQdWJsaWNcIl0uaW5jbHVkZXModGFnLlZhbHVlISkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKHRhZy5WYWx1ZSA9PT0gXCJQdWJsaWNcIilcbiAgICAgICAgICB2cGNDb25maWcucHVibGljU3VibmV0SWRzLnB1c2goc3VibmV0LlN1Ym5ldElkISk7XG4gICAgICAgIGlmICh0YWcuVmFsdWUgPT09IFwiUHJpdmF0ZVwiKVxuICAgICAgICAgIHZwY0NvbmZpZy5wcml2YXRlU3VibmV0SWRzLnB1c2goc3VibmV0LlN1Ym5ldElkISk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdnBjQ29uZmlnO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICByZXR1cm4gZXJyb3I7XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoU3RhY2tUZW1wbGF0ZShzdGFja0lkOiBzdHJpbmcpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBmZXRjaFN0YWNrVGVtcGxhdGVDbWQgPSBuZXcgR2V0VGVtcGxhdGVDb21tYW5kKHtcbiAgICAgIFN0YWNrTmFtZTogc3RhY2tJZCxcbiAgICB9KTtcbiAgICBjb25zdCBleGlzdGluZ1N0YWNrVGVtcGxhdGUgPSBhd2FpdCBfY2ZuQ2xpZW50LnNlbmQoZmV0Y2hTdGFja1RlbXBsYXRlQ21kKTtcbiAgICBjb25zdCBqc29uVGVtcGxhdGUgPSBqc195YW1sLmxvYWQoZXhpc3RpbmdTdGFja1RlbXBsYXRlLlRlbXBsYXRlQm9keSB8fCBcIlwiKTtcbiAgICByZXR1cm4ganNvblRlbXBsYXRlO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgfVxufVxuXG4vLyBUT0RPIGRlZmluZSB0eXBlIGZvciBuZXdSdWxlQXJuc1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZUxpc3RlbmVyUnVsZShuZXdSdWxlQ29uZmlnOiBhbnkpIHtcbiAgY29uc3QgY3JlYXRlUnVsZUNtZCA9IG5ldyBDcmVhdGVSdWxlQ29tbWFuZChuZXdSdWxlQ29uZmlnKTtcbiAgY29uc3QgY3JlYXRlUnVsZVJlc3BvbnNlID0gYXdhaXQgX2VsdmIyQ2xpZW50LnNlbmQoY3JlYXRlUnVsZUNtZCk7XG4gIHJldHVybiBjcmVhdGVSdWxlUmVzcG9uc2U7XG59XG4iXX0=