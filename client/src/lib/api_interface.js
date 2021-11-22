import axios from 'axios'

const apiRoute = `http://localhost:5000/api`;

export async function getUserProfiles() {
  const response = await axios.get(`${apiRoute}/profiles`);
  return response.data;
}

export async function getResourceData(selectedProfile) {
  const apiURI = `${apiRoute}/resources-data/${selectedProfile}`;
  const response = await axios(apiURI);
  return response.data;
}

export async function getResourcesData(event) {
  selectedProfile.set($userProfiles[event.target.value]);
  const apiURI = `${apiRoute}/resources-data/${$selectedProfile}`;
  const response = await axios(apiURI);
  const profileResourceDataRes = response.data;
  profileResourceData.set(response.data.profileResources);
  profileStacks.set(response.data.existingStackInfo);
  console.log(profileResourceDataRes);
}

export async function deployCanary() {
  const apiURI = `${apiRoute}/deploy-canary`;
  const securityGroupIds = selectedInstance.SecurityGroups.map((sg) => ({
    groupId: sg.GroupId
  }));
  const newRuleConfig = {
    Actions: [
      {
        Type: 'forward',
        ForwardConfig: {
          TargetGroupStickinessConfig: {
            Enabled: false
          },
          TargetGroups: [
            {
              TargetGroupArn: selectedTarget.TargetGroupArn,
              Weight: 50
            },
            {
              TargetGroupArn: 'Insert Canary Target ARN',
              Weight: 50
            }
          ]
        }
      }
    ],
    Conditions: [
      {
        Field: 'http-request-method',
        HttpRequestMethodConfig: {
          Values: ['GET']
        }
      }
    ],
    ListenerArn: selectedListener.ListenerArn,
    Priority: 1,
    Tags: [{ Key: 'isAriaCanaryRule', Value: selectedAlb.LoadBalancerName }]
  };
  const response = await axios.put(apiURI, {
    profileName,
    vpcId: selectedInstance.VpcId,
    selectedAlbName: selectedAlb.LoadBalancerName,
    selectedListenerArn: selectedListener.ListenerArn,
    securityGroupIds,
    newRuleConfig
  });
  console.log(response.data)
  return response.data

export async function destroyCanaryStack(stackInfo) {
  const response = await axios.put(`${apiRoute}/destroy-canary`, {
    profileName: stackInfo.selectedProfile,
    stackName: stackInfo.stackName,
    stackArn: stackInfo.stackArn,
    canaryRuleArn: stackInfo.canaryRuleArn
  });
  return response.data;
}