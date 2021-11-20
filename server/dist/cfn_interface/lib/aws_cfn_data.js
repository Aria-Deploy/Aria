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
        const stacksInfoRes = await _cfnClient.send(stacksInfoCmd);
        const stacksInfo = stacksInfoRes.Stacks.filter((stack) => {
            return stack.Outputs.some(({ OutputKey }) => OutputKey === "ariacanary");
        });
        const formattedStacks = await Promise.all(stacksInfo.map(async (stack) => {
            const stackInfo = {
                stackName: stack.StackName,
                stackArn: stack.StackId,
                stackOutputs: stack.Outputs,
                canaryRule: {},
                config: {},
            };
            const stackConfigObj = stack.Outputs.find(({ OutputKey }) => OutputKey === "ariaconfig");
            const stackConfig = JSON.parse(stackConfigObj.OutputValue);
            stackInfo.config = stackConfig;
            const allRulesCmd = new client_elastic_load_balancing_v2_1.DescribeRulesCommand({
                ListenerArn: stackConfig.selectedListenerArn,
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
                            stackInfo.canaryRule = rule;
                    });
                });
            }
            return stackInfo;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXdzX2Nmbl9kYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2Nmbl9pbnRlcmZhY2UvbGliL2F3c19jZm5fZGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNEVBQXdFO0FBQ3hFLGlEQUFtQztBQUVuQyxvREFNNkI7QUFFN0IsMEVBSXdDO0FBRXhDLG9EQUEwRTtBQUMxRSxnR0FXbUQ7QUFHbkQsMERBQTBEO0FBRTFELDZDQUE2QztBQUM3QyxJQUFJLG9CQUFvQixHQUFRLEVBQUUsQ0FBQztBQUNuQyxJQUFJLFVBQWdDLENBQUM7QUFDckMsSUFBSSxVQUFxQixDQUFDO0FBQzFCLElBQUksVUFBcUIsQ0FBQztBQUMxQixJQUFJLFlBQTBDLENBQUM7QUFDL0MsSUFBSSxJQUF5QyxDQUFDO0FBRWpDLFFBQUEsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztBQUNqQyxNQUFNLHFCQUFxQixHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsb0JBQW9CLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFFekQsS0FBSyxVQUFVLFdBQVcsQ0FBQyxXQUFtQjtJQUNuRCxJQUFJO1FBQ0YsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQ2pFLHNFQUFzRTtRQUN0RSxVQUFVLEdBQUcsSUFBSSw0Q0FBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM5QyxhQUFhO1FBQ2IsVUFBVSxHQUFHLElBQUksc0JBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNuQyxhQUFhO1FBQ2IsVUFBVSxHQUFHLElBQUksc0JBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNuQyxhQUFhO1FBQ2IsWUFBWSxHQUFHLElBQUksK0RBQTRCLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDekQ7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDcEI7QUFDSCxDQUFDO0FBZEQsa0NBY0M7QUFFTSxLQUFLLFVBQVUsV0FBVztJQUMvQixNQUFNLFVBQVUsR0FBRyxJQUFJLGdDQUFtQixDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQy9DLE1BQU0sV0FBVyxHQUFHLE1BQU0sVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN0RCxPQUFPLFdBQVcsQ0FBQyxJQUFJLENBQUM7QUFDMUIsQ0FBQztBQUpELGtDQUlDO0FBRUQsd0JBQXdCO0FBQ2pCLEtBQUssVUFBVSxtQkFBbUI7SUFDdkMsTUFBTSx5QkFBeUIsR0FBRyxJQUFJLDhDQUFpQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzVFLE1BQU0seUJBQXlCLEdBQUcsTUFBTSxVQUFVLENBQUMsSUFBSSxDQUNyRCx5QkFBeUIsQ0FDMUIsQ0FBQztJQUNGLE1BQU0sdUJBQXVCLEdBQUcseUJBQXlCLENBQUMsa0JBQWtCLENBQUM7SUFFN0UsTUFBTSxlQUFlLEdBQUcsSUFBSSxxQ0FBd0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN6RCxNQUFNLFVBQVUsR0FBRyxNQUFNLFVBQVUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7SUFFMUQsTUFBTSxZQUFZLEdBQVEsRUFBRSxDQUFDO0lBQzdCLFVBQVUsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7UUFDdkMsR0FBRyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRTtZQUNsQyxZQUFZLENBQUMsSUFBSSxDQUFDO2dCQUNoQixVQUFVLEVBQUUsUUFBUSxDQUFDLFVBQVU7Z0JBQy9CLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUTtnQkFDM0IsS0FBSyxFQUFFLFFBQVEsQ0FBQyxLQUFLO2dCQUNyQixjQUFjLEVBQUUsUUFBUSxDQUFDLGNBQWM7Z0JBQ3ZDLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxTQUFVLENBQUMsZ0JBQWdCO2FBQ3ZELENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFFSCxNQUFNLFVBQVUsR0FBRyxJQUFJLCtEQUE0QixDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3hELE1BQU0sVUFBVSxHQUFHLE1BQU0sWUFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN2RCxrQ0FBa0M7SUFDbEMsTUFBTSxVQUFVLEdBQUcsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUNsQyxVQUFVLENBQUMsYUFBYyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLEVBQUU7UUFDbkQsSUFDRSxZQUFZLENBQUMsS0FBSyxFQUFFLElBQUksS0FBSyxRQUFRO1lBQ3JDLFlBQVksQ0FBQyxJQUFJLEtBQUssYUFBYSxFQUNuQztZQUNBLE1BQU0sZUFBZSxHQUFRO2dCQUMzQixnQkFBZ0IsRUFBRSxZQUFZLENBQUMsZ0JBQWdCO2dCQUMvQyxlQUFlLEVBQUUsWUFBWSxDQUFDLGVBQWU7Z0JBQzdDLDBCQUEwQixFQUFFLFlBQVksQ0FBQyxjQUFjO2FBQ3hELENBQUM7WUFFRixNQUFNLGVBQWUsR0FBRyxJQUFJLDJEQUF3QixDQUFDO2dCQUNuRCxlQUFlLEVBQUUsWUFBWSxDQUFDLGVBQWU7YUFDOUMsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxlQUFlLEdBQUcsTUFBTSxZQUFZLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ2pFLE1BQU0sYUFBYSxHQUFHLGVBQWUsQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUNsRSxXQUFXLEVBQUUsUUFBUSxDQUFDLFdBQVc7Z0JBQ2pDLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSTthQUNwQixDQUFDLENBQUMsQ0FBQztZQUNKLGVBQWUsQ0FBQyxTQUFTLEdBQUcsYUFBYSxDQUFDO1lBRTFDLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSw4REFBMkIsQ0FBQztnQkFDekQsZUFBZSxFQUFFLFlBQVksQ0FBQyxlQUFlO2FBQzlDLENBQUMsQ0FBQztZQUNILE1BQU0sa0JBQWtCLEdBQUcsTUFBTSxZQUFZLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDdkUsTUFBTSxnQkFBZ0IsR0FBRyxrQkFBa0IsQ0FBQyxZQUFZLEVBQUUsR0FBRyxDQUMzRCxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDaEIsY0FBYyxFQUFFLFdBQVcsQ0FBQyxjQUFjO2dCQUMxQyxJQUFJLEVBQUUsV0FBVyxDQUFDLElBQUk7Z0JBQ3RCLGVBQWUsRUFBRSxXQUFXLENBQUMsZUFBZTthQUM3QyxDQUFDLENBQ0gsQ0FBQztZQUNGLGVBQWUsQ0FBQyxPQUFPLEdBQUcsZ0JBQWdCLENBQUM7WUFFM0MsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUNmLGVBQWUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxNQUFXLEVBQUUsRUFBRTtnQkFDaEQsTUFBTSxlQUFlLEdBQUcsSUFBSSw4REFBMkIsQ0FBQztvQkFDdEQsY0FBYyxFQUFFLE1BQU0sQ0FBQyxjQUFjO2lCQUN0QyxDQUFDLENBQUM7Z0JBQ0gsTUFBTSxlQUFlLEdBQUcsTUFBTSxZQUFZLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUNqRSxNQUFNLFdBQVcsR0FBRyxlQUFlLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxDQUMvRCxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU8sQ0FBQyxFQUFFLENBQ3hCLENBQUM7Z0JBQ0YsTUFBTSxDQUFDLFNBQVMsR0FBRyxXQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxFQUFFLEVBQUU7b0JBQ2pELE9BQU8sWUFBWSxDQUFDLElBQUksQ0FDdEIsQ0FBQyxRQUFhLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEtBQUssVUFBVSxDQUN0RCxDQUFDO2dCQUNKLENBQUMsQ0FBQyxDQUFDO2dCQUNILE9BQU87WUFDVCxDQUFDLENBQUMsQ0FDSCxDQUFDO1lBRUYsT0FBTyxlQUFlLENBQUM7U0FDeEI7SUFDSCxDQUFDLENBQUMsQ0FDSCxDQUFDO0lBRUYsT0FBTyxVQUFVLENBQUM7QUFDcEIsQ0FBQztBQXJGRCxrREFxRkM7QUFFTSxLQUFLLFVBQVUsZ0JBQWdCLENBQUMsV0FBbUI7SUFDeEQsTUFBTSxZQUFZLEdBQUcsSUFBSSxxQ0FBd0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN0RCxNQUFNLFFBQVEsR0FBRyxNQUFNLFVBQVUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDckQsSUFBSSxHQUFHO1FBQ0wsT0FBTyxFQUFFLFFBQVEsQ0FBQyxPQUFRO1FBQzFCLE1BQU0sRUFBRSxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNO0tBQ2pELENBQUM7QUFDSixDQUFDO0FBUEQsNENBT0M7QUFFTSxLQUFLLFVBQVUsaUJBQWlCO0lBQ3JDLElBQUk7UUFDRixxQkFBcUIsRUFBRSxDQUFDO1FBQ3hCLE1BQU0sZUFBZSxHQUFHLE1BQU0sOENBQXFCLEVBQUUsQ0FBQztRQUN0RCxLQUFLLE1BQU0sT0FBTyxJQUFJLGVBQWUsQ0FBQyxVQUFVLEVBQUU7WUFDaEQsb0JBQW9CLENBQUMsT0FBTyxDQUFDLEdBQUc7Z0JBQzlCLEdBQUcsZUFBZSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUM7Z0JBQ3RDLFdBQVcsRUFBRTtvQkFDWCxHQUFHLGVBQWUsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDO2lCQUM1QzthQUNGLENBQUM7U0FDSDtRQUVELE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3pELE9BQU8sUUFBUSxDQUFDO0tBQ2pCO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDZCxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25CLE9BQU8sS0FBSyxDQUFDO0tBQ2Q7QUFDSCxDQUFDO0FBbkJELDhDQW1CQztBQUVNLEtBQUssVUFBVSxlQUFlO0lBQ25DLElBQUk7UUFDRixNQUFNLGFBQWEsR0FBRyxJQUFJLDZDQUFxQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3BELE1BQU0sYUFBYSxHQUFHLE1BQU0sVUFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUMzRCxNQUFNLFVBQVUsR0FBRyxhQUFhLENBQUMsTUFBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQ3hELE9BQU8sS0FBSyxDQUFDLE9BQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxTQUFTLEtBQUssWUFBWSxDQUFDLENBQUM7UUFDNUUsQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLGVBQWUsR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQ3ZDLFVBQVUsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQzdCLE1BQU0sU0FBUyxHQUFHO2dCQUNoQixTQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVM7Z0JBQzFCLFFBQVEsRUFBRSxLQUFLLENBQUMsT0FBTztnQkFDdkIsWUFBWSxFQUFFLEtBQUssQ0FBQyxPQUFPO2dCQUMzQixVQUFVLEVBQUUsRUFBVTtnQkFDdEIsTUFBTSxFQUFFLEVBQVM7YUFDbEIsQ0FBQztZQUVGLE1BQU0sY0FBYyxHQUFHLEtBQUssQ0FBQyxPQUFRLENBQUMsSUFBSSxDQUN4QyxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxDQUFDLFNBQVMsS0FBSyxZQUFZLENBQzlDLENBQUM7WUFDRixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWUsQ0FBQyxXQUFZLENBQUMsQ0FBQztZQUM3RCxTQUFTLENBQUMsTUFBTSxHQUFHLFdBQVcsQ0FBQztZQUUvQixNQUFNLFdBQVcsR0FBRyxJQUFJLHVEQUFvQixDQUFDO2dCQUMzQyxXQUFXLEVBQUUsV0FBVyxDQUFDLG1CQUFtQjthQUM3QyxDQUFDLENBQUM7WUFDSCxNQUFNLFNBQVMsR0FBRyxNQUFNLFlBQVksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFdkQsS0FBSyxNQUFNLElBQUksSUFBSSxTQUFTLENBQUMsS0FBTSxFQUFFO2dCQUNuQyxNQUFNLFVBQVUsR0FBRyxJQUFJLHNEQUFtQixDQUFDO29CQUN6QyxhQUFhO29CQUNiLFlBQVksRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7aUJBQzdCLENBQUMsQ0FBQztnQkFDSCxNQUFNLFFBQVEsR0FBRyxNQUFNLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3JELFFBQVEsQ0FBQyxlQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO29CQUM1QyxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO3dCQUM1QixJQUFJLEdBQUcsQ0FBQyxHQUFHLEtBQUssa0JBQWtCOzRCQUFFLFNBQVMsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO29CQUNsRSxDQUFDLENBQUMsQ0FBQztnQkFDTCxDQUFDLENBQUMsQ0FBQzthQUNKO1lBRUQsT0FBTyxTQUFTLENBQUM7UUFDbkIsQ0FBQyxDQUFDLENBQ0gsQ0FBQztRQUVGLE9BQU8sZUFBZSxDQUFDO0tBQ3hCO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDZCxPQUFPLENBQUMsR0FBRyxDQUNULG1FQUFtRSxFQUNuRSxLQUFLLENBQ04sQ0FBQztRQUNGLE9BQU8sRUFBRSxDQUFDO0tBQ1g7QUFDSCxDQUFDO0FBdERELDBDQXNEQztBQUVNLEtBQUssVUFBVSxtQkFBbUIsQ0FBQyxLQUFhO0lBQ3JELE1BQU0sU0FBUyxHQUFHO1FBQ2hCLEtBQUs7UUFDTCxpQkFBaUIsRUFBRSxFQUFjO1FBQ2pDLGVBQWUsRUFBRSxFQUFjO1FBQy9CLGdCQUFnQixFQUFFLEVBQWM7S0FDakMsQ0FBQztJQUVGLElBQUk7UUFDRixNQUFNLFVBQVUsR0FBRyxJQUFJLG1DQUFzQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2xELE1BQU0sZUFBZSxHQUFHLE1BQU0sVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUUxRCxlQUFlLENBQUMsT0FBTyxHQUFHLGVBQWUsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDO1FBQ3hELGVBQWUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7WUFDekMsSUFBSSxNQUFNLENBQUMsS0FBSyxLQUFLLFNBQVMsQ0FBQyxLQUFLO2dCQUFFLE9BQU87WUFDN0MsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDO1lBQ3pDLElBQUksQ0FBQyxTQUFTLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLFFBQVMsQ0FBQztnQkFDbEQsU0FBUyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxRQUFTLENBQUMsQ0FBQztZQUU5QyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUN4QixJQUFJLENBQUMsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFNLENBQUM7b0JBQUUsT0FBTyxLQUFLLENBQUM7Z0JBQzlELElBQUksR0FBRyxDQUFDLEtBQUssS0FBSyxRQUFRO29CQUN4QixTQUFTLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUyxDQUFDLENBQUM7Z0JBQ25ELElBQUksR0FBRyxDQUFDLEtBQUssS0FBSyxTQUFTO29CQUN6QixTQUFTLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFTLENBQUMsQ0FBQztnQkFDcEQsT0FBTyxJQUFJLENBQUM7WUFDZCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxTQUFTLENBQUM7S0FDbEI7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbkIsT0FBTyxLQUFLLENBQUM7S0FDZDtBQUNILENBQUM7QUFsQ0Qsa0RBa0NDO0FBRU0sS0FBSyxVQUFVLGtCQUFrQixDQUFDLE9BQWU7SUFDdEQsSUFBSTtRQUNGLE1BQU0scUJBQXFCLEdBQUcsSUFBSSwwQ0FBa0IsQ0FBQztZQUNuRCxTQUFTLEVBQUUsT0FBTztTQUNuQixDQUFDLENBQUM7UUFDSCxNQUFNLHFCQUFxQixHQUFHLE1BQU0sVUFBVSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQzNFLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsWUFBWSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQzVFLE9BQU8sWUFBWSxDQUFDO0tBQ3JCO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDZCxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3BCO0FBQ0gsQ0FBQztBQVhELGdEQVdDO0FBRUQsbUNBQW1DO0FBQzVCLEtBQUssVUFBVSxrQkFBa0IsQ0FBQyxhQUFrQjtJQUN6RCxNQUFNLGFBQWEsR0FBRyxJQUFJLG9EQUFpQixDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzNELE1BQU0sa0JBQWtCLEdBQUcsTUFBTSxZQUFZLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ2xFLE9BQU8sa0JBQWtCLENBQUM7QUFDNUIsQ0FBQztBQUpELGdEQUlDO0FBRU0sS0FBSyxVQUFVLGtCQUFrQixDQUFDLE9BQVk7SUFDbkQsTUFBTSxhQUFhLEdBQUcsSUFBSSxvREFBaUIsQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDekQsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLFlBQVksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDaEUsT0FBTyxnQkFBZ0IsQ0FBQztBQUMxQixDQUFDO0FBSkQsZ0RBSUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBsb2FkU2hhcmVkQ29uZmlnRmlsZXMgfSBmcm9tIFwiQGF3cy1zZGsvc2hhcmVkLWluaS1maWxlLWxvYWRlclwiO1xuaW1wb3J0ICogYXMganNfeWFtbCBmcm9tIFwianMteWFtbFwiO1xuaW1wb3J0ICogYXMgY2xpZW50RWMyIGZyb20gXCJAYXdzLXNkay9jbGllbnQtZWMyXCI7XG5pbXBvcnQge1xuICBFQzJDbGllbnQsXG4gIERlc2NyaWJlVnBjc0NvbW1hbmQsXG4gIERlc2NyaWJlU3VibmV0c0NvbW1hbmQsXG4gIERlc2NyaWJlSW5zdGFuY2VzQ29tbWFuZCxcbiAgRGVzY3JpYmVTZWN1cml0eUdyb3VwUnVsZXNDb21tYW5kLFxufSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWVjMlwiO1xuXG5pbXBvcnQge1xuICBDbG91ZEZvcm1hdGlvbkNsaWVudCxcbiAgR2V0VGVtcGxhdGVDb21tYW5kLFxuICBEZXNjcmliZVN0YWNrc0NvbW1hbmQsXG59IGZyb20gXCJAYXdzLXNkay9jbGllbnQtY2xvdWRmb3JtYXRpb25cIjtcblxuaW1wb3J0IHsgU1RTQ2xpZW50LCBHZXRDYWxsZXJJZGVudGl0eUNvbW1hbmQgfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LXN0c1wiO1xuaW1wb3J0IHtcbiAgRWxhc3RpY0xvYWRCYWxhbmNpbmdWMkNsaWVudCxcbiAgRGVzY3JpYmVMb2FkQmFsYW5jZXJzQ29tbWFuZCxcbiAgQ3JlYXRlUnVsZUNvbW1hbmQsXG4gIERlc2NyaWJlTGlzdGVuZXJzQ29tbWFuZCxcbiAgRGVzY3JpYmVUYXJnZXRHcm91cHNDb21tYW5kLFxuICBEZXNjcmliZVRhcmdldEhlYWx0aENvbW1hbmQsXG4gIERlc2NyaWJlUnVsZXNDb21tYW5kLFxuICBEZXNjcmliZVRhZ3NDb21tYW5kLFxuICBEZWxldGVSdWxlQ29tbWFuZCxcbiAgUnVsZSxcbn0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1lbGFzdGljLWxvYWQtYmFsYW5jaW5nLXYyXCI7XG5pbXBvcnQgeyBWcGMgfSBmcm9tIFwiQGF3cy1jZGsvYXdzLWVjMlwiO1xuaW1wb3J0IHsgQ29uZmlndXJhdGlvblNlcnZpY2VQbGFjZWhvbGRlcnMgfSBmcm9tIFwiYXdzLXNkay9saWIvY29uZmlnX3NlcnZpY2VfcGxhY2Vob2xkZXJzXCI7XG4vLyBUT0RPOiBIYW5kbGUgcmVxdWVzdCBlcnJvcnMgYmFjayB0byBjbGllbnQgZm9yIG1lc3NhZ2VzXG5cbi8vIFRPRE86IERlZmluZSB0eXBlIGZvciBfYWNjb3VudHNDcmVkZW50aWFsc1xubGV0IF9hY2NvdW50c0NyZWRlbnRpYWxzOiBhbnkgPSB7fTtcbmxldCBfY2ZuQ2xpZW50OiBDbG91ZEZvcm1hdGlvbkNsaWVudDtcbmxldCBfZWMyQ2xpZW50OiBFQzJDbGllbnQ7XG5sZXQgX3N0c0NsaWVudDogU1RTQ2xpZW50O1xubGV0IF9lbHZiMkNsaWVudDogRWxhc3RpY0xvYWRCYWxhbmNpbmdWMkNsaWVudDtcbmxldCBfZW52OiB7IGFjY291bnQ6IHN0cmluZzsgcmVnaW9uOiBzdHJpbmcgfTtcblxuZXhwb3J0IGNvbnN0IGdldEVudiA9ICgpID0+IF9lbnY7XG5jb25zdCBfcmVzZXRBY2NDcmVkZW5ldGlhbHMgPSAoKSA9PiAoX2FjY291bnRzQ3JlZGVudGlhbHMgPSB7fSk7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGllbnRzSW5pdChwcm9maWxlTmFtZTogc3RyaW5nKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgY29uZmlnID0gSlNPTi5zdHJpbmdpZnkoX2FjY291bnRzQ3JlZGVudGlhbHNbcHJvZmlsZU5hbWVdKTtcbiAgICAvLyBAdHMtaWdub3JlIHBhc3NpbmcgYW4gb2JqZWN0IHJlc3VsdHMgaW4gZXJyb3IsIEFXUydzIGZhdWx0IG5vdCBtaW5lXG4gICAgX2NmbkNsaWVudCA9IG5ldyBDbG91ZEZvcm1hdGlvbkNsaWVudChjb25maWcpO1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBfZWMyQ2xpZW50ID0gbmV3IEVDMkNsaWVudChjb25maWcpO1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBfc3RzQ2xpZW50ID0gbmV3IFNUU0NsaWVudChjb25maWcpO1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBfZWx2YjJDbGllbnQgPSBuZXcgRWxhc3RpY0xvYWRCYWxhbmNpbmdWMkNsaWVudChjb25maWcpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VnBjc0luZm8oKSB7XG4gIGNvbnN0IGdldFZwY3NDbWQgPSBuZXcgRGVzY3JpYmVWcGNzQ29tbWFuZCh7fSk7XG4gIGNvbnN0IHByb2ZpbGVWcGNzID0gYXdhaXQgX2VjMkNsaWVudC5zZW5kKGdldFZwY3NDbWQpO1xuICByZXR1cm4gcHJvZmlsZVZwY3MuVnBjcztcbn1cblxuLy8gVE9ETyBkZWZpbmUgdnBjcyB0eXBlXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0TG9hZEJhbGFuY2VySW5mbygpIHtcbiAgY29uc3QgZ2V0U2VjdXJpdHlHcm91cHNSdWxlc0NtZCA9IG5ldyBEZXNjcmliZVNlY3VyaXR5R3JvdXBSdWxlc0NvbW1hbmQoe30pO1xuICBjb25zdCBnZXRTZWN1cml0eUdyb3Vwc1J1bGVzUmVzID0gYXdhaXQgX2VjMkNsaWVudC5zZW5kKFxuICAgIGdldFNlY3VyaXR5R3JvdXBzUnVsZXNDbWRcbiAgKTtcbiAgY29uc3Qgc2VjdXJpdHlHcm91cHNSdWxlc0luZm8gPSBnZXRTZWN1cml0eUdyb3Vwc1J1bGVzUmVzLlNlY3VyaXR5R3JvdXBSdWxlcztcblxuICBjb25zdCBnZXRJbnN0YW5jZXNDbWQgPSBuZXcgRGVzY3JpYmVJbnN0YW5jZXNDb21tYW5kKHt9KTtcbiAgY29uc3QgZ2V0SW5zdFJlcyA9IGF3YWl0IF9lYzJDbGllbnQuc2VuZChnZXRJbnN0YW5jZXNDbWQpO1xuXG4gIGNvbnN0IGFsbEluc3RhbmNlczogYW55ID0gW107XG4gIGdldEluc3RSZXMuUmVzZXJ2YXRpb25zPy5mb3JFYWNoKChyZXMpID0+IHtcbiAgICByZXMuSW5zdGFuY2VzPy5mb3JFYWNoKChpbnN0YW5jZSkgPT4ge1xuICAgICAgYWxsSW5zdGFuY2VzLnB1c2goe1xuICAgICAgICBpbnN0YW5jZUlkOiBpbnN0YW5jZS5JbnN0YW5jZUlkLFxuICAgICAgICBTdWJuZXRJZDogaW5zdGFuY2UuU3VibmV0SWQsXG4gICAgICAgIFZwY0lkOiBpbnN0YW5jZS5WcGNJZCxcbiAgICAgICAgU2VjdXJpdHlHcm91cHM6IGluc3RhbmNlLlNlY3VyaXR5R3JvdXBzLFxuICAgICAgICBBdmFpbGFiaWxpdHlab25lOiBpbnN0YW5jZS5QbGFjZW1lbnQhLkF2YWlsYWJpbGl0eVpvbmUsXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgY29uc3QgZ2V0RWxic0NtZCA9IG5ldyBEZXNjcmliZUxvYWRCYWxhbmNlcnNDb21tYW5kKHt9KTtcbiAgY29uc3QgZ2V0RWxic1JlcyA9IGF3YWl0IF9lbHZiMkNsaWVudC5zZW5kKGdldEVsYnNDbWQpO1xuICAvLyBUT0RPIGRlZmluZSB0eXBlIGZvciBhY3RpdmVFbGJzXG4gIGNvbnN0IGFjdGl2ZUFsYnMgPSBhd2FpdCBQcm9taXNlLmFsbChcbiAgICBnZXRFbGJzUmVzLkxvYWRCYWxhbmNlcnMhLm1hcChhc3luYyAobG9hZEJhbGFuY2VyKSA9PiB7XG4gICAgICBpZiAoXG4gICAgICAgIGxvYWRCYWxhbmNlci5TdGF0ZT8uQ29kZSA9PT0gXCJhY3RpdmVcIiAmJlxuICAgICAgICBsb2FkQmFsYW5jZXIuVHlwZSA9PT0gXCJhcHBsaWNhdGlvblwiXG4gICAgICApIHtcbiAgICAgICAgY29uc3QgbG9hZEJhbGFuY2VyT2JqOiBhbnkgPSB7XG4gICAgICAgICAgTG9hZEJhbGFuY2VyTmFtZTogbG9hZEJhbGFuY2VyLkxvYWRCYWxhbmNlck5hbWUsXG4gICAgICAgICAgTG9hZEJhbGFuY2VyQXJuOiBsb2FkQmFsYW5jZXIuTG9hZEJhbGFuY2VyQXJuLFxuICAgICAgICAgIExvYWRCYWxhbmNlclNlY3VyaXR5R3JvdXBzOiBsb2FkQmFsYW5jZXIuU2VjdXJpdHlHcm91cHMsXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgZ2V0TGlzdGVuZXJzQ21kID0gbmV3IERlc2NyaWJlTGlzdGVuZXJzQ29tbWFuZCh7XG4gICAgICAgICAgTG9hZEJhbGFuY2VyQXJuOiBsb2FkQmFsYW5jZXIuTG9hZEJhbGFuY2VyQXJuLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgZ2V0TGlzdGVuZXJzUmVzID0gYXdhaXQgX2VsdmIyQ2xpZW50LnNlbmQoZ2V0TGlzdGVuZXJzQ21kKTtcbiAgICAgICAgY29uc3QgbGlzdGVuZXJzSW5mbyA9IGdldExpc3RlbmVyc1Jlcy5MaXN0ZW5lcnM/Lm1hcCgobGlzdGVuZXIpID0+ICh7XG4gICAgICAgICAgTGlzdGVuZXJBcm46IGxpc3RlbmVyLkxpc3RlbmVyQXJuLFxuICAgICAgICAgIFBvcnQ6IGxpc3RlbmVyLlBvcnQsXG4gICAgICAgIH0pKTtcbiAgICAgICAgbG9hZEJhbGFuY2VyT2JqLkxpc3RlbmVycyA9IGxpc3RlbmVyc0luZm87XG5cbiAgICAgICAgY29uc3QgZ2V0VGFyZ2V0R3JvdXBzQ21kID0gbmV3IERlc2NyaWJlVGFyZ2V0R3JvdXBzQ29tbWFuZCh7XG4gICAgICAgICAgTG9hZEJhbGFuY2VyQXJuOiBsb2FkQmFsYW5jZXIuTG9hZEJhbGFuY2VyQXJuLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgZ2V0VGFyZ2V0R3JvdXBzUmVzID0gYXdhaXQgX2VsdmIyQ2xpZW50LnNlbmQoZ2V0VGFyZ2V0R3JvdXBzQ21kKTtcbiAgICAgICAgY29uc3QgdGFyZ2V0R3JvdXBzSW5mbyA9IGdldFRhcmdldEdyb3Vwc1Jlcy5UYXJnZXRHcm91cHM/Lm1hcChcbiAgICAgICAgICAodGFyZ2V0R3JvdXApID0+ICh7XG4gICAgICAgICAgICBUYXJnZXRHcm91cEFybjogdGFyZ2V0R3JvdXAuVGFyZ2V0R3JvdXBBcm4sXG4gICAgICAgICAgICBQb3J0OiB0YXJnZXRHcm91cC5Qb3J0LFxuICAgICAgICAgICAgVGFyZ2V0R3JvdXBOYW1lOiB0YXJnZXRHcm91cC5UYXJnZXRHcm91cE5hbWUsXG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICAgICAgbG9hZEJhbGFuY2VyT2JqLlRhcmdldHMgPSB0YXJnZXRHcm91cHNJbmZvO1xuXG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKFxuICAgICAgICAgIGxvYWRCYWxhbmNlck9iai5UYXJnZXRzLm1hcChhc3luYyAodGFyZ2V0OiBhbnkpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldEhlYWx0aENtZCA9IG5ldyBEZXNjcmliZVRhcmdldEhlYWx0aENvbW1hbmQoe1xuICAgICAgICAgICAgICBUYXJnZXRHcm91cEFybjogdGFyZ2V0LlRhcmdldEdyb3VwQXJuLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXRIZWFsdGhSZXMgPSBhd2FpdCBfZWx2YjJDbGllbnQuc2VuZCh0YXJnZXRIZWFsdGhDbWQpO1xuICAgICAgICAgICAgY29uc3QgaW5zdGFuY2VJZHMgPSB0YXJnZXRIZWFsdGhSZXMuVGFyZ2V0SGVhbHRoRGVzY3JpcHRpb25zPy5tYXAoXG4gICAgICAgICAgICAgIChkZXMpID0+IGRlcy5UYXJnZXQhLklkXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdGFyZ2V0Lkluc3RhbmNlcyA9IGluc3RhbmNlSWRzIS5tYXAoKGluc3RhbmNlSWQpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIGFsbEluc3RhbmNlcy5maW5kKFxuICAgICAgICAgICAgICAgIChpbnN0YW5jZTogYW55KSA9PiBpbnN0YW5jZS5pbnN0YW5jZUlkID09PSBpbnN0YW5jZUlkXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9KVxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiBsb2FkQmFsYW5jZXJPYmo7XG4gICAgICB9XG4gICAgfSlcbiAgKTtcblxuICByZXR1cm4gYWN0aXZlQWxicztcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoQWNjb3VudEluZm8ocHJvZmlsZU5hbWU6IHN0cmluZykge1xuICBjb25zdCBhY2NvdW50SWRDbWQgPSBuZXcgR2V0Q2FsbGVySWRlbnRpdHlDb21tYW5kKHt9KTtcbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBfc3RzQ2xpZW50LnNlbmQoYWNjb3VudElkQ21kKTtcbiAgX2VudiA9IHtcbiAgICBhY2NvdW50OiByZXNwb25zZS5BY2NvdW50ISxcbiAgICByZWdpb246IF9hY2NvdW50c0NyZWRlbnRpYWxzW3Byb2ZpbGVOYW1lXS5yZWdpb24sXG4gIH07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaFByb2ZpbGVzSW5mbygpIHtcbiAgdHJ5IHtcbiAgICBfcmVzZXRBY2NDcmVkZW5ldGlhbHMoKTtcbiAgICBjb25zdCBhd3NQcm9maWxlc0luZm8gPSBhd2FpdCBsb2FkU2hhcmVkQ29uZmlnRmlsZXMoKTtcbiAgICBmb3IgKGNvbnN0IHByb2ZpbGUgaW4gYXdzUHJvZmlsZXNJbmZvLmNvbmZpZ0ZpbGUpIHtcbiAgICAgIF9hY2NvdW50c0NyZWRlbnRpYWxzW3Byb2ZpbGVdID0ge1xuICAgICAgICAuLi5hd3NQcm9maWxlc0luZm8uY29uZmlnRmlsZVtwcm9maWxlXSxcbiAgICAgICAgY3JlZGVudGlhbHM6IHtcbiAgICAgICAgICAuLi5hd3NQcm9maWxlc0luZm8uY3JlZGVudGlhbHNGaWxlW3Byb2ZpbGVdLFxuICAgICAgICB9LFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb25zdCBwcm9maWxlcyA9IE9iamVjdC5rZXlzKGF3c1Byb2ZpbGVzSW5mby5jb25maWdGaWxlKTtcbiAgICByZXR1cm4gcHJvZmlsZXM7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgIHJldHVybiBlcnJvcjtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmV0Y2hTdGFja3NJbmZvKCkge1xuICB0cnkge1xuICAgIGNvbnN0IHN0YWNrc0luZm9DbWQgPSBuZXcgRGVzY3JpYmVTdGFja3NDb21tYW5kKHt9KTtcbiAgICBjb25zdCBzdGFja3NJbmZvUmVzID0gYXdhaXQgX2NmbkNsaWVudC5zZW5kKHN0YWNrc0luZm9DbWQpO1xuICAgIGNvbnN0IHN0YWNrc0luZm8gPSBzdGFja3NJbmZvUmVzLlN0YWNrcyEuZmlsdGVyKChzdGFjaykgPT4ge1xuICAgICAgcmV0dXJuIHN0YWNrLk91dHB1dHMhLnNvbWUoKHsgT3V0cHV0S2V5IH0pID0+IE91dHB1dEtleSA9PT0gXCJhcmlhY2FuYXJ5XCIpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgZm9ybWF0dGVkU3RhY2tzID0gYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgICBzdGFja3NJbmZvLm1hcChhc3luYyAoc3RhY2spID0+IHtcbiAgICAgICAgY29uc3Qgc3RhY2tJbmZvID0ge1xuICAgICAgICAgIHN0YWNrTmFtZTogc3RhY2suU3RhY2tOYW1lLFxuICAgICAgICAgIHN0YWNrQXJuOiBzdGFjay5TdGFja0lkLFxuICAgICAgICAgIHN0YWNrT3V0cHV0czogc3RhY2suT3V0cHV0cyxcbiAgICAgICAgICBjYW5hcnlSdWxlOiB7fSBhcyBSdWxlLFxuICAgICAgICAgIGNvbmZpZzoge30gYXMgYW55LFxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IHN0YWNrQ29uZmlnT2JqID0gc3RhY2suT3V0cHV0cyEuZmluZChcbiAgICAgICAgICAoeyBPdXRwdXRLZXkgfSkgPT4gT3V0cHV0S2V5ID09PSBcImFyaWFjb25maWdcIlxuICAgICAgICApO1xuICAgICAgICBjb25zdCBzdGFja0NvbmZpZyA9IEpTT04ucGFyc2Uoc3RhY2tDb25maWdPYmohLk91dHB1dFZhbHVlISk7XG4gICAgICAgIHN0YWNrSW5mby5jb25maWcgPSBzdGFja0NvbmZpZztcblxuICAgICAgICBjb25zdCBhbGxSdWxlc0NtZCA9IG5ldyBEZXNjcmliZVJ1bGVzQ29tbWFuZCh7XG4gICAgICAgICAgTGlzdGVuZXJBcm46IHN0YWNrQ29uZmlnLnNlbGVjdGVkTGlzdGVuZXJBcm4sXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBydWxlc0luZm8gPSBhd2FpdCBfZWx2YjJDbGllbnQuc2VuZChhbGxSdWxlc0NtZCk7XG5cbiAgICAgICAgZm9yIChjb25zdCBydWxlIG9mIHJ1bGVzSW5mby5SdWxlcyEpIHtcbiAgICAgICAgICBjb25zdCBnZXRUYWdzQ21kID0gbmV3IERlc2NyaWJlVGFnc0NvbW1hbmQoe1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgUmVzb3VyY2VBcm5zOiBbcnVsZS5SdWxlQXJuXSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBjb25zdCBydWxlVGFncyA9IGF3YWl0IF9lbHZiMkNsaWVudC5zZW5kKGdldFRhZ3NDbWQpO1xuICAgICAgICAgIHJ1bGVUYWdzLlRhZ0Rlc2NyaXB0aW9ucyEuZm9yRWFjaCgodGFnRGVzYykgPT4ge1xuICAgICAgICAgICAgdGFnRGVzYy5UYWdzPy5mb3JFYWNoKCh0YWcpID0+IHtcbiAgICAgICAgICAgICAgaWYgKHRhZy5LZXkgPT09IFwiaXNBcmlhQ2FuYXJ5UnVsZVwiKSBzdGFja0luZm8uY2FuYXJ5UnVsZSA9IHJ1bGU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzdGFja0luZm87XG4gICAgICB9KVxuICAgICk7XG5cbiAgICByZXR1cm4gZm9ybWF0dGVkU3RhY2tzO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUubG9nKFxuICAgICAgXCJUaGUgZm9sbG93aW5nIGVycm9yIG9jY3VyZWQgd2hlbiB0cnlpbmcgdG8gZmV0Y2ggcHJvZmlsZSBzdGFja3M6IFwiLFxuICAgICAgZXJyb3JcbiAgICApO1xuICAgIHJldHVybiBbXTtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0QXpQdWJQcml2U3VibmV0cyh2cGNJZDogc3RyaW5nKSB7XG4gIGNvbnN0IHZwY0NvbmZpZyA9IHtcbiAgICB2cGNJZCxcbiAgICBhdmFpbGFiaWxpdHlab25lczogW10gYXMgc3RyaW5nW10sXG4gICAgcHVibGljU3VibmV0SWRzOiBbXSBhcyBzdHJpbmdbXSxcbiAgICBwcml2YXRlU3VibmV0SWRzOiBbXSBhcyBzdHJpbmdbXSxcbiAgfTtcblxuICB0cnkge1xuICAgIGNvbnN0IHN1Ym5ldHNDbWQgPSBuZXcgRGVzY3JpYmVTdWJuZXRzQ29tbWFuZCh7fSk7XG4gICAgY29uc3Qgc3VibmV0c1Jlc3BvbnNlID0gYXdhaXQgX2VjMkNsaWVudC5zZW5kKHN1Ym5ldHNDbWQpO1xuXG4gICAgc3VibmV0c1Jlc3BvbnNlLlN1Ym5ldHMgPSBzdWJuZXRzUmVzcG9uc2UuU3VibmV0cyB8fCBbXTtcbiAgICBzdWJuZXRzUmVzcG9uc2UuU3VibmV0cy5mb3JFYWNoKChzdWJuZXQpID0+IHtcbiAgICAgIGlmIChzdWJuZXQuVnBjSWQgIT09IHZwY0NvbmZpZy52cGNJZCkgcmV0dXJuO1xuICAgICAgY29uc3Qgc3VibmV0QXogPSBzdWJuZXQuQXZhaWxhYmlsaXR5Wm9uZTtcbiAgICAgIGlmICghdnBjQ29uZmlnLmF2YWlsYWJpbGl0eVpvbmVzLmluY2x1ZGVzKHN1Ym5ldEF6ISkpXG4gICAgICAgIHZwY0NvbmZpZy5hdmFpbGFiaWxpdHlab25lcy5wdXNoKHN1Ym5ldEF6ISk7XG5cbiAgICAgIHN1Ym5ldC5UYWdzPy5zb21lKCh0YWcpID0+IHtcbiAgICAgICAgaWYgKCFbXCJQcml2YXRlXCIsIFwiUHVibGljXCJdLmluY2x1ZGVzKHRhZy5WYWx1ZSEpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmICh0YWcuVmFsdWUgPT09IFwiUHVibGljXCIpXG4gICAgICAgICAgdnBjQ29uZmlnLnB1YmxpY1N1Ym5ldElkcy5wdXNoKHN1Ym5ldC5TdWJuZXRJZCEpO1xuICAgICAgICBpZiAodGFnLlZhbHVlID09PSBcIlByaXZhdGVcIilcbiAgICAgICAgICB2cGNDb25maWcucHJpdmF0ZVN1Ym5ldElkcy5wdXNoKHN1Ym5ldC5TdWJuZXRJZCEpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHZwY0NvbmZpZztcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgcmV0dXJuIGVycm9yO1xuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaFN0YWNrVGVtcGxhdGUoc3RhY2tJZDogc3RyaW5nKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgZmV0Y2hTdGFja1RlbXBsYXRlQ21kID0gbmV3IEdldFRlbXBsYXRlQ29tbWFuZCh7XG4gICAgICBTdGFja05hbWU6IHN0YWNrSWQsXG4gICAgfSk7XG4gICAgY29uc3QgZXhpc3RpbmdTdGFja1RlbXBsYXRlID0gYXdhaXQgX2NmbkNsaWVudC5zZW5kKGZldGNoU3RhY2tUZW1wbGF0ZUNtZCk7XG4gICAgY29uc3QganNvblRlbXBsYXRlID0ganNfeWFtbC5sb2FkKGV4aXN0aW5nU3RhY2tUZW1wbGF0ZS5UZW1wbGF0ZUJvZHkgfHwgXCJcIik7XG4gICAgcmV0dXJuIGpzb25UZW1wbGF0ZTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gIH1cbn1cblxuLy8gVE9ETyBkZWZpbmUgdHlwZSBmb3IgbmV3UnVsZUFybnNcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjcmVhdGVMaXN0ZW5lclJ1bGUobmV3UnVsZUNvbmZpZzogYW55KSB7XG4gIGNvbnN0IGNyZWF0ZVJ1bGVDbWQgPSBuZXcgQ3JlYXRlUnVsZUNvbW1hbmQobmV3UnVsZUNvbmZpZyk7XG4gIGNvbnN0IGNyZWF0ZVJ1bGVSZXNwb25zZSA9IGF3YWl0IF9lbHZiMkNsaWVudC5zZW5kKGNyZWF0ZVJ1bGVDbWQpO1xuICByZXR1cm4gY3JlYXRlUnVsZVJlc3BvbnNlO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVsZXRlTGlzdGVuZXJSdWxlKFJ1bGVBcm46IGFueSkge1xuICBjb25zdCBkZWxldGVSdWxlQ21kID0gbmV3IERlbGV0ZVJ1bGVDb21tYW5kKHsgUnVsZUFybiB9KTtcbiAgY29uc3QgZGVsZXRlUnVsZVJlc3VsdCA9IGF3YWl0IF9lbHZiMkNsaWVudC5zZW5kKGRlbGV0ZVJ1bGVDbWQpO1xuICByZXR1cm4gZGVsZXRlUnVsZVJlc3VsdDtcbn1cbiJdfQ==