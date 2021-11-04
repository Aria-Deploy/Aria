import { loadSharedConfigFiles } from "@aws-sdk/shared-ini-file-loader";
import {
  EC2Client,
  DescribeVpcsCommand,
  DescribeSubnetsCommand,
} from "@aws-sdk/client-ec2";

import {
  CloudFormationClient,
  ListStacksCommand,
  GetTemplateCommand,
} from "@aws-sdk/client-cloudformation";
// TODO: Handle request errors back to client for messages

// TODO: Define type for _accountsCredentials
let _accountsCredentials: any = {};

export async function fetchAwsProfilesInfo() {
  try {
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
    return [];
  }
}

export async function fetchAwsStackInfo(profile: string) {
  const config = JSON.stringify(_accountsCredentials[profile]);
  const client = new CloudFormationClient(config);
  const fetchActiveListsCmd = new ListStacksCommand({});

  try {
    const allUserStacks = await client.send(fetchActiveListsCmd);
    const activeStacks = allUserStacks.StackSummaries?.filter(
      (stack) => !stack.DeletionTime
    );

    return activeStacks;
  } catch (error) {
    console.log(error);
    return {};
  }
}
