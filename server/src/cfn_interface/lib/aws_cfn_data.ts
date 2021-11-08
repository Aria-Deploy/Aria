import { loadSharedConfigFiles } from "@aws-sdk/shared-ini-file-loader";
import * as js_yaml from "js-yaml";
import {
  EC2Client,
  DescribeVpcsCommand,
  DescribeSubnetsCommand,
} from "@aws-sdk/client-ec2";

import {
  CloudFormationClient,
  GetTemplateCommand,
  DescribeStacksCommand,
  DescribeStackInstanceCommand,
} from "@aws-sdk/client-cloudformation";
// TODO: Handle request errors back to client for messages

// TODO: Define type for _accountsCredentials
let _accountsCredentials: any = {};
let _cfnClient: CloudFormationClient;
let _ec2Client: EC2Client;
// TODO: Define type for _vpcConfig
let _vpcConfig = {
  vpcId: "",
  availabilityZones: [] as string[],
  publicSubnetIds: [] as string[],
  privateSubnetIds: [] as string[],
};

export const getCfnClient = () => _cfnClient;
const _resetAccCredenetials = () => (_accountsCredentials = {});

const _resetVpcConfig = () => {
  _vpcConfig = {
    vpcId: "",
    availabilityZones: [],
    publicSubnetIds: [],
    privateSubnetIds: [],
  };
};

export async function clientsInit(profileName: string) {
  try {
    const config = JSON.stringify(_accountsCredentials[profileName]);
    // @ts-ignore passing an object results in error, AWS's fault not mine
    _cfnClient = new CloudFormationClient(config);
    // @ts-ignore
    _ec2Client = new EC2Client(config);
  } catch (error) {
    console.log(error);
  }
}

export async function fetchAwsProfilesInfo() {
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
    const stacksInfo = await _cfnClient.send(stacksInfoCmd);

    stacksInfo.Stacks = stacksInfo.Stacks || [];
    const formattedStacks = stacksInfo.Stacks.map((stack) => {
      stack.Outputs = stack.Outputs || [];
      const isCanary = stack.Outputs.some(
        ({ OutputKey }) => OutputKey === "ariacanary"
      );
      return {
        stackName: stack.StackName,
        stackId: stack.StackId,
        isCanary,
      };
    });

    return formattedStacks;
  } catch (error) {
    console.log(
      "The following error occured when trying to fetch profile stacks: ",
      error
    );
    return [];
  }
}

export async function fetchStackVpcConfig(stackId: string) {
  _resetVpcConfig();
  await setConfigVpcId(stackId);
  await setAzPubPrivSubnets();
  return _vpcConfig;
}

export async function setConfigVpcId(stackId: string) {
  try {
    const vpcCmd = new DescribeVpcsCommand({});
    // @ts-ignore
    const vpcResponse = await _ec2Client.send(vpcCmd);
    const vpcsList = vpcResponse.Vpcs || [];
    const vpcId: string = vpcsList.reduce((acc, vpc) => {
      let vpcId = acc;
      if (vpc.Tags) {
        vpc.Tags.forEach((tag) => {
          if (tag.Value === stackId) vpcId = vpc.VpcId!;
        });
      }
      return vpcId;
    }, "");

    _vpcConfig.vpcId = vpcId;
  } catch (error) {
    console.log(error);
  }
}

export async function setAzPubPrivSubnets() {
  try {
    const subnetsCmd = new DescribeSubnetsCommand({});
    const subnetsResponse = await _ec2Client.send(subnetsCmd);

    subnetsResponse.Subnets = subnetsResponse.Subnets || [];
    subnetsResponse.Subnets.forEach((subnet) => {
      if (subnet.VpcId !== _vpcConfig.vpcId) return;
      const subnetAz = subnet.AvailabilityZone;
      if (!_vpcConfig.availabilityZones.includes(subnetAz!))
        _vpcConfig.availabilityZones.push(subnetAz!);

      subnet.Tags?.some((tag) => {
        if (!["Private", "Public"].includes(tag.Value!)) return false;
        if (tag.Value === "Public")
          _vpcConfig.publicSubnetIds.push(subnet.SubnetId!);
        if (tag.Value === "Private")
          _vpcConfig.privateSubnetIds.push(subnet.SubnetId!);
        return true;
      });
    });
  } catch (error) {
    console.log(error);
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

export async function fetchStackMetaData(stackId: string) {
  const stackInfoCmd = new DescribeStackInstanceCommand({
    StackInstanceAccount: "750078097588",
    StackInstanceRegion: "us-west-2",
    StackSetName: 'cdk-stack',
  });
  const response = await _cfnClient.send(stackInfoCmd);
  return response.StackInstance;
}
