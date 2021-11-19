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
exports.deleteListenerRule = exports.createListenerRule = exports.fetchStackTemplate = exports.setAzPubPrivSubnets = exports.fetchStacksInfo = exports.fetchProfilesInfo = exports.fetchAccountInfo = exports.getLoadBalancerInfo = exports.getVpcsInfo = exports.clientsInit = exports.getEnv = void 0;
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
exports.getEnv = () => _env;
const _resetAccCredenetials = () => (_accountsCredentials = {});
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
        const formattedStacks = Promise.all(stacksInfo.Stacks.map(async (stack) => {
            stack.Outputs = stack.Outputs || [];
            const isCanary = stack.Outputs.some(({ OutputKey }) => OutputKey === "ariacanary");
            let listenerArn, canaryRule;
            if (isCanary) {
                const listenerArnObj = stack.Outputs.find(({ OutputKey }) => OutputKey === "listenerArn");
                listenerArn = listenerArnObj?.OutputValue;
                const allRulesCmd = new client_elastic_load_balancing_v2_1.DescribeRulesCommand({
                    ListenerArn: listenerArnObj?.OutputValue,
                });
                const rulesInfo = await _elvb2Client.send(allRulesCmd);
                for (const rule of rulesInfo.Rules) {
                    const getTagsCmd = new client_elastic_load_balancing_v2_1.DescribeTagsCommand({
                        // @ts-ignore
                        ResourceArns: [rule.RuleArn],
                    });
                    const ruleTags = await _elvb2Client.send(getTagsCmd);
                    ruleTags.TagDescriptions.forEach((tagDesc) => {
                        tagDesc.Tags?.forEach((tag) => {
                            if (tag.Key === "isAriaCanaryRule")
                                canaryRule = rule;
                        });
                    });
                }
            }
            return {
                stackName: stack.StackName,
                stackArn: stack.StackId,
                stackOutputs: stack.Outputs,
                isCanary,
                listenerArn,
                canaryRule,
            };
        }));
        return formattedStacks;
    }
    catch (error) {
        console.log("The following error occured when trying to fetch profile stacks: ", error);
        return [];
    }
}
exports.fetchStacksInfo = fetchStacksInfo;
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
async function deleteListenerRule(RuleArn) {
    const deleteRuleCmd = new client_elastic_load_balancing_v2_1.DeleteRuleCommand({ RuleArn });
    const deleteRuleResult = await _elvb2Client.send(deleteRuleCmd);
    return deleteRuleResult;
}
exports.deleteListenerRule = deleteListenerRule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXdzX2Nmbl9kYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2Nmbl9pbnRlcmZhY2UvbGliL2F3c19jZm5fZGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNEVBQXdFO0FBQ3hFLGlEQUFtQztBQUVuQyxvREFPNkI7QUFFN0IsMEVBSXdDO0FBRXhDLG9EQUEwRTtBQUMxRSxnR0FVbUQ7QUFFbkQsMERBQTBEO0FBRTFELDZDQUE2QztBQUM3QyxJQUFJLG9CQUFvQixHQUFRLEVBQUUsQ0FBQztBQUNuQyxJQUFJLFVBQWdDLENBQUM7QUFDckMsSUFBSSxVQUFxQixDQUFDO0FBQzFCLElBQUksVUFBcUIsQ0FBQztBQUMxQixJQUFJLFlBQTBDLENBQUM7QUFDL0MsSUFBSSxJQUF5QyxDQUFDO0FBRWpDLFFBQUEsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztBQUNqQyxNQUFNLHFCQUFxQixHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsb0JBQW9CLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFFekQsS0FBSyxVQUFVLFdBQVcsQ0FBQyxXQUFtQjtJQUNuRCxJQUFJO1FBQ0YsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQ2pFLHNFQUFzRTtRQUN0RSxVQUFVLEdBQUcsSUFBSSw0Q0FBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM5QyxhQUFhO1FBQ2IsVUFBVSxHQUFHLElBQUksc0JBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNuQyxhQUFhO1FBQ2IsVUFBVSxHQUFHLElBQUksc0JBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNuQyxhQUFhO1FBQ2IsWUFBWSxHQUFHLElBQUksK0RBQTRCLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDekQ7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNk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Q0Qsa0RBa0NDO0FBRU0sS0FBSyxVQUFVLGtCQUFrQixDQUFDLE9BQWU7SUFDdEQsSUFBSTtRQUNGLE1BQU0scUJBQXFCLEdBQUcsSUFBSSwwQ0FBa0IsQ0FBQztZQUNuRCxTQUFTLEVBQUUsT0FBTztTQUNuQixDQUFDLENBQUM7UUFDSCxNQUFNLHFCQUFxQixHQUFHLE1BQU0sVUFBVSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQzNFLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsWUFBWSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQzVFLE9BQU8sWUFBWSxDQUFDO0tBQ3JCO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDZCxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3BCO0FBQ0gsQ0FBQztBQVhELGdEQVdDO0FBRUQsbUNBQW1DO0FBQzVCLEtBQUssVUFBVSxrQkFBa0IsQ0FBQyxhQUFrQjtJQUN6RCxNQUFNLGFBQWEsR0FBRyxJQUFJLG9EQUFpQixDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzNELE1BQU0sa0JBQWtCLEdBQUcsTUFBTSxZQUFZLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ2xFLE9BQU8sa0JBQWtCLENBQUM7QUFDNUIsQ0FBQztBQUpELGdEQUlDO0FBRU0sS0FBSyxVQUFVLGtCQUFrQixDQUFDLE9BQVk7SUFDbkQsTUFBTSxhQUFhLEdBQUcsSUFBSSxvREFBaUIsQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDekQsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLFlBQVksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDaEUsT0FBTyxnQkFBZ0IsQ0FBQztBQUMxQixDQUFDO0FBSkQsZ0RBSUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBsb2FkU2hhcmVkQ29uZmlnRmlsZXMgfSBmcm9tIFwiQGF3cy1zZGsvc2hhcmVkLWluaS1maWxlLWxvYWRlclwiO1xuaW1wb3J0ICogYXMganNfeWFtbCBmcm9tIFwianMteWFtbFwiO1xuaW1wb3J0ICogYXMgY2xpZW50RWMyIGZyb20gXCJAYXdzLXNkay9jbGllbnQtZWMyXCI7XG5pbXBvcnQge1xuICBFQzJDbGllbnQsXG4gIERlc2NyaWJlVnBjc0NvbW1hbmQsXG4gIERlc2NyaWJlU3VibmV0c0NvbW1hbmQsXG4gIERlc2NyaWJlSW5zdGFuY2VzQ29tbWFuZCxcbiAgRGVzY3JpYmVTZWN1cml0eUdyb3VwUnVsZXNSZXF1ZXN0LFxuICBEZXNjcmliZVNlY3VyaXR5R3JvdXBSdWxlc0NvbW1hbmQsXG59IGZyb20gXCJAYXdzLXNkay9jbGllbnQtZWMyXCI7XG5cbmltcG9ydCB7XG4gIENsb3VkRm9ybWF0aW9uQ2xpZW50LFxuICBHZXRUZW1wbGF0ZUNvbW1hbmQsXG4gIERlc2NyaWJlU3RhY2tzQ29tbWFuZCxcbn0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1jbG91ZGZvcm1hdGlvblwiO1xuXG5pbXBvcnQgeyBTVFNDbGllbnQsIEdldENhbGxlcklkZW50aXR5Q29tbWFuZCB9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtc3RzXCI7XG5pbXBvcnQge1xuICBFbGFzdGljTG9hZEJhbGFuY2luZ1YyQ2xpZW50LFxuICBEZXNjcmliZUxvYWRCYWxhbmNlcnNDb21tYW5kLFxuICBDcmVhdGVSdWxlQ29tbWFuZCxcbiAgRGVzY3JpYmVMaXN0ZW5lcnNDb21tYW5kLFxuICBEZXNjcmliZVRhcmdldEdyb3Vwc0NvbW1hbmQsXG4gIERlc2NyaWJlVGFyZ2V0SGVhbHRoQ29tbWFuZCxcbiAgRGVzY3JpYmVSdWxlc0NvbW1hbmQsXG4gIERlc2NyaWJlVGFnc0NvbW1hbmQsXG4gIERlbGV0ZVJ1bGVDb21tYW5kLFxufSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWVsYXN0aWMtbG9hZC1iYWxhbmNpbmctdjJcIjtcbmltcG9ydCB7IFZwYyB9IGZyb20gXCJAYXdzLWNkay9hd3MtZWMyXCI7XG4vLyBUT0RPOiBIYW5kbGUgcmVxdWVzdCBlcnJvcnMgYmFjayB0byBjbGllbnQgZm9yIG1lc3NhZ2VzXG5cbi8vIFRPRE86IERlZmluZSB0eXBlIGZvciBfYWNjb3VudHNDcmVkZW50aWFsc1xubGV0IF9hY2NvdW50c0NyZWRlbnRpYWxzOiBhbnkgPSB7fTtcbmxldCBfY2ZuQ2xpZW50OiBDbG91ZEZvcm1hdGlvbkNsaWVudDtcbmxldCBfZWMyQ2xpZW50OiBFQzJDbGllbnQ7XG5sZXQgX3N0c0NsaWVudDogU1RTQ2xpZW50O1xubGV0IF9lbHZiMkNsaWVudDogRWxhc3RpY0xvYWRCYWxhbmNpbmdWMkNsaWVudDtcbmxldCBfZW52OiB7IGFjY291bnQ6IHN0cmluZzsgcmVnaW9uOiBzdHJpbmcgfTtcblxuZXhwb3J0IGNvbnN0IGdldEVudiA9ICgpID0+IF9lbnY7XG5jb25zdCBfcmVzZXRBY2NDcmVkZW5ldGlhbHMgPSAoKSA9PiAoX2FjY291bnRzQ3JlZGVudGlhbHMgPSB7fSk7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGllbnRzSW5pdChwcm9maWxlTmFtZTogc3RyaW5nKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgY29uZmlnID0gSlNPTi5zdHJpbmdpZnkoX2FjY291bnRzQ3JlZGVudGlhbHNbcHJvZmlsZU5hbWVdKTtcbiAgICAvLyBAdHMtaWdub3JlIHBhc3NpbmcgYW4gb2JqZWN0IHJlc3VsdHMgaW4gZXJyb3IsIEFXUydzIGZhdWx0IG5vdCBtaW5lXG4gICAgX2NmbkNsaWVudCA9IG5ldyBDbG91ZEZvcm1hdGlvbkNsaWVudChjb25maWcpO1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBfZWMyQ2xpZW50ID0gbmV3IEVDMkNsaWVudChjb25maWcpO1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBfc3RzQ2xpZW50ID0gbmV3IFNUU0NsaWVudChjb25maWcpO1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBfZWx2YjJDbGllbnQgPSBuZXcgRWxhc3RpY0xvYWRCYWxhbmNpbmdWMkNsaWVudChjb25maWcpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VnBjc0luZm8oKSB7XG4gIGNvbnN0IGdldFZwY3NDbWQgPSBuZXcgRGVzY3JpYmVWcGNzQ29tbWFuZCh7fSk7XG4gIGNvbnN0IHByb2ZpbGVWcGNzID0gYXdhaXQgX2VjMkNsaWVudC5zZW5kKGdldFZwY3NDbWQpO1xuICByZXR1cm4gcHJvZmlsZVZwY3MuVnBjcztcbn1cblxuLy8gVE9ETyBkZWZpbmUgdnBjcyB0eXBlXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0TG9hZEJhbGFuY2VySW5mbygpIHtcbiAgY29uc3QgZ2V0U2VjdXJpdHlHcm91cHNSdWxlc0NtZCA9IG5ldyBEZXNjcmliZVNlY3VyaXR5R3JvdXBSdWxlc0NvbW1hbmQoe30pO1xuICBjb25zdCBnZXRTZWN1cml0eUdyb3Vwc1J1bGVzUmVzID0gYXdhaXQgX2VjMkNsaWVudC5zZW5kKFxuICAgIGdldFNlY3VyaXR5R3JvdXBzUnVsZXNDbWRcbiAgKTtcbiAgY29uc3Qgc2VjdXJpdHlHcm91cHNSdWxlc0luZm8gPSBnZXRTZWN1cml0eUdyb3Vwc1J1bGVzUmVzLlNlY3VyaXR5R3JvdXBSdWxlcztcblxuICBjb25zdCBnZXRJbnN0YW5jZXNDbWQgPSBuZXcgRGVzY3JpYmVJbnN0YW5jZXNDb21tYW5kKHt9KTtcbiAgY29uc3QgZ2V0SW5zdFJlcyA9IGF3YWl0IF9lYzJDbGllbnQuc2VuZChnZXRJbnN0YW5jZXNDbWQpO1xuXG4gIGNvbnN0IGFsbEluc3RhbmNlczogYW55ID0gW107XG4gIGdldEluc3RSZXMuUmVzZXJ2YXRpb25zPy5mb3JFYWNoKChyZXMpID0+IHtcbiAgICByZXMuSW5zdGFuY2VzPy5mb3JFYWNoKChpbnN0YW5jZSkgPT4ge1xuICAgICAgYWxsSW5zdGFuY2VzLnB1c2goe1xuICAgICAgICBpbnN0YW5jZUlkOiBpbnN0YW5jZS5JbnN0YW5jZUlkLFxuICAgICAgICBTdWJuZXRJZDogaW5zdGFuY2UuU3VibmV0SWQsXG4gICAgICAgIFZwY0lkOiBpbnN0YW5jZS5WcGNJZCxcbiAgICAgICAgU2VjdXJpdHlHcm91cHM6IGluc3RhbmNlLlNlY3VyaXR5R3JvdXBzLFxuICAgICAgICBBdmFpbGFiaWxpdHlab25lOiBpbnN0YW5jZS5QbGFjZW1lbnQhLkF2YWlsYWJpbGl0eVpvbmUsXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgY29uc3QgZ2V0RWxic0NtZCA9IG5ldyBEZXNjcmliZUxvYWRCYWxhbmNlcnNDb21tYW5kKHt9KTtcbiAgY29uc3QgZ2V0RWxic1JlcyA9IGF3YWl0IF9lbHZiMkNsaWVudC5zZW5kKGdldEVsYnNDbWQpO1xuICAvLyBUT0RPIGRlZmluZSB0eXBlIGZvciBhY3RpdmVFbGJzXG4gIGNvbnN0IGFjdGl2ZUFsYnMgPSBhd2FpdCBQcm9taXNlLmFsbChcbiAgICBnZXRFbGJzUmVzLkxvYWRCYWxhbmNlcnMhLm1hcChhc3luYyAobG9hZEJhbGFuY2VyKSA9PiB7XG4gICAgICBpZiAoXG4gICAgICAgIGxvYWRCYWxhbmNlci5TdGF0ZT8uQ29kZSA9PT0gXCJhY3RpdmVcIiAmJlxuICAgICAgICBsb2FkQmFsYW5jZXIuVHlwZSA9PT0gXCJhcHBsaWNhdGlvblwiXG4gICAgICApIHtcbiAgICAgICAgY29uc3QgbG9hZEJhbGFuY2VyT2JqOiBhbnkgPSB7XG4gICAgICAgICAgTG9hZEJhbGFuY2VyTmFtZTogbG9hZEJhbGFuY2VyLkxvYWRCYWxhbmNlck5hbWUsXG4gICAgICAgICAgTG9hZEJhbGFuY2VyQXJuOiBsb2FkQmFsYW5jZXIuTG9hZEJhbGFuY2VyQXJuLFxuICAgICAgICAgIExvYWRCYWxhbmNlclNlY3VyaXR5R3JvdXBzOiBsb2FkQmFsYW5jZXIuU2VjdXJpdHlHcm91cHMsXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgZ2V0TGlzdGVuZXJzQ21kID0gbmV3IERlc2NyaWJlTGlzdGVuZXJzQ29tbWFuZCh7XG4gICAgICAgICAgTG9hZEJhbGFuY2VyQXJuOiBsb2FkQmFsYW5jZXIuTG9hZEJhbGFuY2VyQXJuLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgZ2V0TGlzdGVuZXJzUmVzID0gYXdhaXQgX2VsdmIyQ2xpZW50LnNlbmQoZ2V0TGlzdGVuZXJzQ21kKTtcbiAgICAgICAgY29uc3QgbGlzdGVuZXJzSW5mbyA9IGdldExpc3RlbmVyc1Jlcy5MaXN0ZW5lcnM/Lm1hcCgobGlzdGVuZXIpID0+ICh7XG4gICAgICAgICAgTGlzdGVuZXJBcm46IGxpc3RlbmVyLkxpc3RlbmVyQXJuLFxuICAgICAgICAgIFBvcnQ6IGxpc3RlbmVyLlBvcnQsXG4gICAgICAgIH0pKTtcbiAgICAgICAgbG9hZEJhbGFuY2VyT2JqLkxpc3RlbmVycyA9IGxpc3RlbmVyc0luZm87XG5cbiAgICAgICAgY29uc3QgZ2V0VGFyZ2V0R3JvdXBzQ21kID0gbmV3IERlc2NyaWJlVGFyZ2V0R3JvdXBzQ29tbWFuZCh7XG4gICAgICAgICAgTG9hZEJhbGFuY2VyQXJuOiBsb2FkQmFsYW5jZXIuTG9hZEJhbGFuY2VyQXJuLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgZ2V0VGFyZ2V0R3JvdXBzUmVzID0gYXdhaXQgX2VsdmIyQ2xpZW50LnNlbmQoZ2V0VGFyZ2V0R3JvdXBzQ21kKTtcbiAgICAgICAgY29uc3QgdGFyZ2V0R3JvdXBzSW5mbyA9IGdldFRhcmdldEdyb3Vwc1Jlcy5UYXJnZXRHcm91cHM/Lm1hcChcbiAgICAgICAgICAodGFyZ2V0R3JvdXApID0+ICh7XG4gICAgICAgICAgICBUYXJnZXRHcm91cEFybjogdGFyZ2V0R3JvdXAuVGFyZ2V0R3JvdXBBcm4sXG4gICAgICAgICAgICBQb3J0OiB0YXJnZXRHcm91cC5Qb3J0LFxuICAgICAgICAgICAgVGFyZ2V0R3JvdXBOYW1lOiB0YXJnZXRHcm91cC5UYXJnZXRHcm91cE5hbWUsXG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICAgICAgbG9hZEJhbGFuY2VyT2JqLlRhcmdldHMgPSB0YXJnZXRHcm91cHNJbmZvO1xuXG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKFxuICAgICAgICAgIGxvYWRCYWxhbmNlck9iai5UYXJnZXRzLm1hcChhc3luYyAodGFyZ2V0OiBhbnkpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldEhlYWx0aENtZCA9IG5ldyBEZXNjcmliZVRhcmdldEhlYWx0aENvbW1hbmQoe1xuICAgICAgICAgICAgICBUYXJnZXRHcm91cEFybjogdGFyZ2V0LlRhcmdldEdyb3VwQXJuLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXRIZWFsdGhSZXMgPSBhd2FpdCBfZWx2YjJDbGllbnQuc2VuZCh0YXJnZXRIZWFsdGhDbWQpO1xuICAgICAgICAgICAgY29uc3QgaW5zdGFuY2VJZHMgPSB0YXJnZXRIZWFsdGhSZXMuVGFyZ2V0SGVhbHRoRGVzY3JpcHRpb25zPy5tYXAoXG4gICAgICAgICAgICAgIChkZXMpID0+IGRlcy5UYXJnZXQhLklkXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdGFyZ2V0Lkluc3RhbmNlcyA9IGluc3RhbmNlSWRzIS5tYXAoKGluc3RhbmNlSWQpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIGFsbEluc3RhbmNlcy5maW5kKFxuICAgICAgICAgICAgICAgIChpbnN0YW5jZTogYW55KSA9PiBpbnN0YW5jZS5pbnN0YW5jZUlkID09PSBpbnN0YW5jZUlkXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9KVxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiBsb2FkQmFsYW5jZXJPYmo7XG4gICAgICB9XG4gICAgfSlcbiAgKTtcblxuICByZXR1cm4gYWN0aXZlQWxicztcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoQWNjb3VudEluZm8ocHJvZmlsZU5hbWU6IHN0cmluZykge1xuICBjb25zdCBhY2NvdW50SWRDbWQgPSBuZXcgR2V0Q2FsbGVySWRlbnRpdHlDb21tYW5kKHt9KTtcbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBfc3RzQ2xpZW50LnNlbmQoYWNjb3VudElkQ21kKTtcbiAgX2VudiA9IHtcbiAgICBhY2NvdW50OiByZXNwb25zZS5BY2NvdW50ISxcbiAgICByZWdpb246IF9hY2NvdW50c0NyZWRlbnRpYWxzW3Byb2ZpbGVOYW1lXS5yZWdpb24sXG4gIH07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaFByb2ZpbGVzSW5mbygpIHtcbiAgdHJ5IHtcbiAgICBfcmVzZXRBY2NDcmVkZW5ldGlhbHMoKTtcbiAgICBjb25zdCBhd3NQcm9maWxlc0luZm8gPSBhd2FpdCBsb2FkU2hhcmVkQ29uZmlnRmlsZXMoKTtcbiAgICBmb3IgKGNvbnN0IHByb2ZpbGUgaW4gYXdzUHJvZmlsZXNJbmZvLmNvbmZpZ0ZpbGUpIHtcbiAgICAgIF9hY2NvdW50c0NyZWRlbnRpYWxzW3Byb2ZpbGVdID0ge1xuICAgICAgICAuLi5hd3NQcm9maWxlc0luZm8uY29uZmlnRmlsZVtwcm9maWxlXSxcbiAgICAgICAgY3JlZGVudGlhbHM6IHtcbiAgICAgICAgICAuLi5hd3NQcm9maWxlc0luZm8uY3JlZGVudGlhbHNGaWxlW3Byb2ZpbGVdLFxuICAgICAgICB9LFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb25zdCBwcm9maWxlcyA9IE9iamVjdC5rZXlzKGF3c1Byb2ZpbGVzSW5mby5jb25maWdGaWxlKTtcbiAgICByZXR1cm4gcHJvZmlsZXM7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgIHJldHVybiBlcnJvcjtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmV0Y2hTdGFja3NJbmZvKCkge1xuICB0cnkge1xuICAgIGNvbnN0IHN0YWNrc0luZm9DbWQgPSBuZXcgRGVzY3JpYmVTdGFja3NDb21tYW5kKHt9KTtcbiAgICBjb25zdCBzdGFja3NJbmZvID0gYXdhaXQgX2NmbkNsaWVudC5zZW5kKHN0YWNrc0luZm9DbWQpO1xuXG4gICAgc3RhY2tzSW5mby5TdGFja3MgPSBzdGFja3NJbmZvLlN0YWNrcyB8fCBbXTtcbiAgICBjb25zdCBmb3JtYXR0ZWRTdGFja3MgPSBQcm9taXNlLmFsbChcbiAgICAgIHN0YWNrc0luZm8uU3RhY2tzLm1hcChhc3luYyAoc3RhY2spID0+IHtcbiAgICAgICAgc3RhY2suT3V0cHV0cyA9IHN0YWNrLk91dHB1dHMgfHwgW107XG4gICAgICAgIGNvbnN0IGlzQ2FuYXJ5ID0gc3RhY2suT3V0cHV0cy5zb21lKFxuICAgICAgICAgICh7IE91dHB1dEtleSB9KSA9PiBPdXRwdXRLZXkgPT09IFwiYXJpYWNhbmFyeVwiXG4gICAgICAgICk7XG5cbiAgICAgICAgbGV0IGxpc3RlbmVyQXJuLCBjYW5hcnlSdWxlO1xuICAgICAgICBpZiAoaXNDYW5hcnkpIHtcbiAgICAgICAgICBjb25zdCBsaXN0ZW5lckFybk9iaiA9IHN0YWNrLk91dHB1dHMuZmluZChcbiAgICAgICAgICAgICh7IE91dHB1dEtleSB9KSA9PiBPdXRwdXRLZXkgPT09IFwibGlzdGVuZXJBcm5cIlxuICAgICAgICAgICk7XG4gICAgICAgICAgbGlzdGVuZXJBcm4gPSBsaXN0ZW5lckFybk9iaj8uT3V0cHV0VmFsdWU7XG5cbiAgICAgICAgICBjb25zdCBhbGxSdWxlc0NtZCA9IG5ldyBEZXNjcmliZVJ1bGVzQ29tbWFuZCh7XG4gICAgICAgICAgICBMaXN0ZW5lckFybjogbGlzdGVuZXJBcm5PYmo/Lk91dHB1dFZhbHVlLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGNvbnN0IHJ1bGVzSW5mbyA9IGF3YWl0IF9lbHZiMkNsaWVudC5zZW5kKGFsbFJ1bGVzQ21kKTtcblxuICAgICAgICAgIGZvciAoY29uc3QgcnVsZSBvZiBydWxlc0luZm8uUnVsZXMhKSB7XG4gICAgICAgICAgICBjb25zdCBnZXRUYWdzQ21kID0gbmV3IERlc2NyaWJlVGFnc0NvbW1hbmQoe1xuICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgIFJlc291cmNlQXJuczogW3J1bGUuUnVsZUFybl0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IHJ1bGVUYWdzID0gYXdhaXQgX2VsdmIyQ2xpZW50LnNlbmQoZ2V0VGFnc0NtZCk7XG4gICAgICAgICAgICBydWxlVGFncy5UYWdEZXNjcmlwdGlvbnMhLmZvckVhY2goKHRhZ0Rlc2MpID0+IHtcbiAgICAgICAgICAgICAgdGFnRGVzYy5UYWdzPy5mb3JFYWNoKCh0YWcpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGFnLktleSA9PT0gXCJpc0FyaWFDYW5hcnlSdWxlXCIpIGNhbmFyeVJ1bGUgPSBydWxlO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3RhY2tOYW1lOiBzdGFjay5TdGFja05hbWUsXG4gICAgICAgICAgc3RhY2tBcm46IHN0YWNrLlN0YWNrSWQsXG4gICAgICAgICAgc3RhY2tPdXRwdXRzOiBzdGFjay5PdXRwdXRzLFxuICAgICAgICAgIGlzQ2FuYXJ5LFxuICAgICAgICAgIGxpc3RlbmVyQXJuLFxuICAgICAgICAgIGNhbmFyeVJ1bGUsXG4gICAgICAgIH07XG4gICAgICB9KVxuICAgICk7XG5cbiAgICByZXR1cm4gZm9ybWF0dGVkU3RhY2tzO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUubG9nKFxuICAgICAgXCJUaGUgZm9sbG93aW5nIGVycm9yIG9jY3VyZWQgd2hlbiB0cnlpbmcgdG8gZmV0Y2ggcHJvZmlsZSBzdGFja3M6IFwiLFxuICAgICAgZXJyb3JcbiAgICApO1xuICAgIHJldHVybiBbXTtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0QXpQdWJQcml2U3VibmV0cyh2cGNJZDogc3RyaW5nKSB7XG4gIGNvbnN0IHZwY0NvbmZpZyA9IHtcbiAgICB2cGNJZCxcbiAgICBhdmFpbGFiaWxpdHlab25lczogW10gYXMgc3RyaW5nW10sXG4gICAgcHVibGljU3VibmV0SWRzOiBbXSBhcyBzdHJpbmdbXSxcbiAgICBwcml2YXRlU3VibmV0SWRzOiBbXSBhcyBzdHJpbmdbXSxcbiAgfTtcblxuICB0cnkge1xuICAgIGNvbnN0IHN1Ym5ldHNDbWQgPSBuZXcgRGVzY3JpYmVTdWJuZXRzQ29tbWFuZCh7fSk7XG4gICAgY29uc3Qgc3VibmV0c1Jlc3BvbnNlID0gYXdhaXQgX2VjMkNsaWVudC5zZW5kKHN1Ym5ldHNDbWQpO1xuXG4gICAgc3VibmV0c1Jlc3BvbnNlLlN1Ym5ldHMgPSBzdWJuZXRzUmVzcG9uc2UuU3VibmV0cyB8fCBbXTtcbiAgICBzdWJuZXRzUmVzcG9uc2UuU3VibmV0cy5mb3JFYWNoKChzdWJuZXQpID0+IHtcbiAgICAgIGlmIChzdWJuZXQuVnBjSWQgIT09IHZwY0NvbmZpZy52cGNJZCkgcmV0dXJuO1xuICAgICAgY29uc3Qgc3VibmV0QXogPSBzdWJuZXQuQXZhaWxhYmlsaXR5Wm9uZTtcbiAgICAgIGlmICghdnBjQ29uZmlnLmF2YWlsYWJpbGl0eVpvbmVzLmluY2x1ZGVzKHN1Ym5ldEF6ISkpXG4gICAgICAgIHZwY0NvbmZpZy5hdmFpbGFiaWxpdHlab25lcy5wdXNoKHN1Ym5ldEF6ISk7XG5cbiAgICAgIHN1Ym5ldC5UYWdzPy5zb21lKCh0YWcpID0+IHtcbiAgICAgICAgaWYgKCFbXCJQcml2YXRlXCIsIFwiUHVibGljXCJdLmluY2x1ZGVzKHRhZy5WYWx1ZSEpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmICh0YWcuVmFsdWUgPT09IFwiUHVibGljXCIpXG4gICAgICAgICAgdnBjQ29uZmlnLnB1YmxpY1N1Ym5ldElkcy5wdXNoKHN1Ym5ldC5TdWJuZXRJZCEpO1xuICAgICAgICBpZiAodGFnLlZhbHVlID09PSBcIlByaXZhdGVcIilcbiAgICAgICAgICB2cGNDb25maWcucHJpdmF0ZVN1Ym5ldElkcy5wdXNoKHN1Ym5ldC5TdWJuZXRJZCEpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHZwY0NvbmZpZztcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgcmV0dXJuIGVycm9yO1xuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaFN0YWNrVGVtcGxhdGUoc3RhY2tJZDogc3RyaW5nKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgZmV0Y2hTdGFja1RlbXBsYXRlQ21kID0gbmV3IEdldFRlbXBsYXRlQ29tbWFuZCh7XG4gICAgICBTdGFja05hbWU6IHN0YWNrSWQsXG4gICAgfSk7XG4gICAgY29uc3QgZXhpc3RpbmdTdGFja1RlbXBsYXRlID0gYXdhaXQgX2NmbkNsaWVudC5zZW5kKGZldGNoU3RhY2tUZW1wbGF0ZUNtZCk7XG4gICAgY29uc3QganNvblRlbXBsYXRlID0ganNfeWFtbC5sb2FkKGV4aXN0aW5nU3RhY2tUZW1wbGF0ZS5UZW1wbGF0ZUJvZHkgfHwgXCJcIik7XG4gICAgcmV0dXJuIGpzb25UZW1wbGF0ZTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gIH1cbn1cblxuLy8gVE9ETyBkZWZpbmUgdHlwZSBmb3IgbmV3UnVsZUFybnNcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjcmVhdGVMaXN0ZW5lclJ1bGUobmV3UnVsZUNvbmZpZzogYW55KSB7XG4gIGNvbnN0IGNyZWF0ZVJ1bGVDbWQgPSBuZXcgQ3JlYXRlUnVsZUNvbW1hbmQobmV3UnVsZUNvbmZpZyk7XG4gIGNvbnN0IGNyZWF0ZVJ1bGVSZXNwb25zZSA9IGF3YWl0IF9lbHZiMkNsaWVudC5zZW5kKGNyZWF0ZVJ1bGVDbWQpO1xuICByZXR1cm4gY3JlYXRlUnVsZVJlc3BvbnNlO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVsZXRlTGlzdGVuZXJSdWxlKFJ1bGVBcm46IGFueSkge1xuICBjb25zdCBkZWxldGVSdWxlQ21kID0gbmV3IERlbGV0ZVJ1bGVDb21tYW5kKHsgUnVsZUFybiB9KTtcbiAgY29uc3QgZGVsZXRlUnVsZVJlc3VsdCA9IGF3YWl0IF9lbHZiMkNsaWVudC5zZW5kKGRlbGV0ZVJ1bGVDbWQpO1xuICByZXR1cm4gZGVsZXRlUnVsZVJlc3VsdDtcbn1cbiJdfQ==