import { loadSharedConfigFiles } from "@aws-sdk/shared-ini-file-loader";
import * as js_yaml from "js-yaml";
import * as clientEc2 from "@aws-sdk/client-ec2";
import {
  EC2Client,
  DescribeVpcsCommand,
  DescribeSubnetsCommand,
  DescribeInstancesCommand,
  DescribeSecurityGroupRulesCommand,
} from "@aws-sdk/client-ec2";

import {
  CloudFormationClient,
  GetTemplateCommand,
  DescribeStacksCommand,
} from "@aws-sdk/client-cloudformation";

import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";
import {
  ElasticLoadBalancingV2Client,
  DescribeLoadBalancersCommand,
  CreateRuleCommand,
  DescribeListenersCommand,
  DescribeTargetGroupsCommand,
  DescribeTargetHealthCommand,
  DescribeRulesCommand,
  DescribeTagsCommand,
  DeleteRuleCommand,
  Rule,
} from "@aws-sdk/client-elastic-load-balancing-v2";
import { Vpc } from "@aws-cdk/aws-ec2";
import { ConfigurationServicePlaceholders } from "aws-sdk/lib/config_service_placeholders";
// TODO: Handle request errors back to client for messages

// TODO: Define type for _accountsCredentials
let _accountsCredentials: any = {};
let _cfnClient: CloudFormationClient;
let _ec2Client: EC2Client;
let _stsClient: STSClient;
let _elvb2Client: ElasticLoadBalancingV2Client;
let _env: { account: string; region: string };

export const getEnv = () => _env;
const _resetAccCredenetials = () => (_accountsCredentials = {});

export async function clientsInit(profileName: string) {
  try {
    const config = JSON.stringify(_accountsCredentials[profileName]);
    // @ts-ignore passing an object results in error, AWS's fault not mine
    _cfnClient = new CloudFormationClient(config);
    // @ts-ignore
    _ec2Client = new EC2Client(config);
    // @ts-ignore
    _stsClient = new STSClient(config);
    // @ts-ignore
    _elvb2Client = new ElasticLoadBalancingV2Client(config);
  } catch (error) {
    console.log(error);
  }
}

export async function getVpcsInfo() {
  const getVpcsCmd = new DescribeVpcsCommand({});
  const profileVpcs = await _ec2Client.send(getVpcsCmd);
  return profileVpcs.Vpcs;
}

// TODO define vpcs type
export async function getLoadBalancerInfo() {
  const getSecurityGroupsRulesCmd = new DescribeSecurityGroupRulesCommand({});
  const getSecurityGroupsRulesRes = await _ec2Client.send(
    getSecurityGroupsRulesCmd
  );
  const securityGroupsRulesInfo = getSecurityGroupsRulesRes.SecurityGroupRules;

  const getInstancesCmd = new DescribeInstancesCommand({});
  const getInstRes = await _ec2Client.send(getInstancesCmd);

  const allInstances: any = [];
  getInstRes.Reservations?.forEach((res) => {
    res.Instances?.forEach((instance) => {
      allInstances.push({
        instanceId: instance.InstanceId,
        SubnetId: instance.SubnetId,
        VpcId: instance.VpcId,
        SecurityGroups: instance.SecurityGroups,
        AvailabilityZone: instance.Placement!.AvailabilityZone,
      });
    });
  });

  const getElbsCmd = new DescribeLoadBalancersCommand({});
  const getElbsRes = await _elvb2Client.send(getElbsCmd);
  // TODO define type for activeElbs
  const activeAlbs = await Promise.all(
    getElbsRes.LoadBalancers!.map(async (loadBalancer) => {
      if (
        loadBalancer.State?.Code === "active" &&
        loadBalancer.Type === "application"
      ) {
        const loadBalancerObj: any = {
          LoadBalancerName: loadBalancer.LoadBalancerName,
          LoadBalancerArn: loadBalancer.LoadBalancerArn,
          LoadBalancerSecurityGroups: loadBalancer.SecurityGroups,
        };

        const getListenersCmd = new DescribeListenersCommand({
          LoadBalancerArn: loadBalancer.LoadBalancerArn,
        });
        const getListenersRes = await _elvb2Client.send(getListenersCmd);
        const listenersInfo = getListenersRes.Listeners?.map((listener) => ({
          ListenerArn: listener.ListenerArn,
          Port: listener.Port,
        }));
        loadBalancerObj.Listeners = listenersInfo;

        const getTargetGroupsCmd = new DescribeTargetGroupsCommand({
          LoadBalancerArn: loadBalancer.LoadBalancerArn,
        });
        const getTargetGroupsRes = await _elvb2Client.send(getTargetGroupsCmd);
        const targetGroupsInfo = getTargetGroupsRes.TargetGroups?.map(
          (targetGroup) => ({
            TargetGroupArn: targetGroup.TargetGroupArn,
            Port: targetGroup.Port,
            TargetGroupName: targetGroup.TargetGroupName,
          })
        );
        loadBalancerObj.Targets = targetGroupsInfo;

        await Promise.all(
          loadBalancerObj.Targets.map(async (target: any) => {
            const targetHealthCmd = new DescribeTargetHealthCommand({
              TargetGroupArn: target.TargetGroupArn,
            });
            const targetHealthRes = await _elvb2Client.send(targetHealthCmd);
            const instanceIds = targetHealthRes.TargetHealthDescriptions?.map(
              (des) => des.Target!.Id
            );
            target.Instances = instanceIds!.map((instanceId) => {
              return allInstances.find(
                (instance: any) => instance.instanceId === instanceId
              );
            });
            return;
          })
        );

        return loadBalancerObj;
      }
    })
  );

  return activeAlbs;
}

export async function fetchAccountInfo(profileName: string) {
  const accountIdCmd = new GetCallerIdentityCommand({});
  const response = await _stsClient.send(accountIdCmd);
  _env = {
    account: response.Account!,
    region: _accountsCredentials[profileName].region,
  };
}

export async function fetchProfilesInfo() {
  try {
    _resetAccCredenetials();
    const awsProfilesInfo = await loadSharedConfigFiles();
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
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function fetchStacksInfo() {
  try {
    const stacksInfoCmd = new DescribeStacksCommand({});
    const stacksInfoRes = await _cfnClient.send(stacksInfoCmd);
    const stacksInfo = stacksInfoRes.Stacks!.filter((stack) => {
      return stack.Outputs!.some(({ OutputKey }) => OutputKey === "ariacanary");
    });

    const formattedStacks = await Promise.all(
      stacksInfo.map(async (stack) => {
        const stackInfo = {
          stackName: stack.StackName,
          stackArn: stack.StackId,
          stackOutputs: stack.Outputs,
          canaryRule: {} as Rule,
          config: {} as any,
        };

        const stackConfigObj = stack.Outputs!.find(
          ({ OutputKey }) => OutputKey === "ariaconfig"
        );
        const stackConfig = JSON.parse(stackConfigObj!.OutputValue!);
        stackInfo.config = stackConfig;

        const allRulesCmd = new DescribeRulesCommand({
          ListenerArn: stackConfig.selectedListenerArn,
        });
        const rulesInfo = await _elvb2Client.send(allRulesCmd);

        for (const rule of rulesInfo.Rules!) {
          const getTagsCmd = new DescribeTagsCommand({
            // @ts-ignore
            ResourceArns: [rule.RuleArn],
          });
          const ruleTags = await _elvb2Client.send(getTagsCmd);
          ruleTags.TagDescriptions!.forEach((tagDesc) => {
            tagDesc.Tags?.forEach((tag) => {
              if (tag.Key === "isAriaCanaryRule") stackInfo.canaryRule = rule;
            });
          });
        }

        return stackInfo;
      })
    );

    return formattedStacks;
  } catch (error) {
    console.log(
      "The following error occured when trying to fetch profile stacks: ",
      error
    );
    return [];
  }
}

export async function setAzPubPrivSubnets(vpcId: string) {
  const vpcConfig = {
    vpcId,
    availabilityZones: [] as string[],
    publicSubnetIds: [] as string[],
    privateSubnetIds: [] as string[],
  };

  try {
    const subnetsCmd = new DescribeSubnetsCommand({});
    const subnetsResponse = await _ec2Client.send(subnetsCmd);

    subnetsResponse.Subnets = subnetsResponse.Subnets || [];
    subnetsResponse.Subnets.forEach((subnet) => {
      if (subnet.VpcId !== vpcConfig.vpcId) return;
      const subnetAz = subnet.AvailabilityZone;
      if (!vpcConfig.availabilityZones.includes(subnetAz!))
        vpcConfig.availabilityZones.push(subnetAz!);

      subnet.Tags?.some((tag) => {
        if (!["Private", "Public"].includes(tag.Value!)) return false;
        if (tag.Value === "Public")
          vpcConfig.publicSubnetIds.push(subnet.SubnetId!);
        if (tag.Value === "Private")
          vpcConfig.privateSubnetIds.push(subnet.SubnetId!);
        return true;
      });
    });

    return vpcConfig;
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function fetchStackTemplate(stackId: string) {
  try {
    const fetchStackTemplateCmd = new GetTemplateCommand({
      StackName: stackId,
    });
    const existingStackTemplate = await _cfnClient.send(fetchStackTemplateCmd);
    const jsonTemplate = js_yaml.load(existingStackTemplate.TemplateBody || "");
    return jsonTemplate;
  } catch (error) {
    console.log(error);
  }
}

// TODO define type for newRuleArns
export async function createListenerRule(newRuleConfig: any) {
  const createRuleCmd = new CreateRuleCommand(newRuleConfig);
  const createRuleResponse = await _elvb2Client.send(createRuleCmd);
  return createRuleResponse;
}

export async function deleteListenerRule(RuleArn: any) {
  const deleteRuleCmd = new DeleteRuleCommand({ RuleArn });
  const deleteRuleResult = await _elvb2Client.send(deleteRuleCmd);
  return deleteRuleResult;
}
