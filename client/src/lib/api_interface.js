import axios from 'axios'
import { resourceData, existingStackInfo } from '../stores';

const apiRoute = `http://localhost:5000/api`;

export async function getUserProfiles() {
  const response = await axios.get(`${apiRoute}/profiles`);
  return response.data;
}

export async function getResourceData(selectedProfile) {
  const apiURI = `${apiRoute}/resources-data/${selectedProfile}`;
  const response = await axios(apiURI);
  resourceData.set(response.data.profileResources);
  existingStackInfo.set(response.data.existingStackInfo);
}

export async function deployCanary(stackConfig) {
  const apiURI = `${apiRoute}/deploy-canary`;

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
              TargetGroupArn: stackConfig.TargetGroupArn,
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
    Conditions: stackConfig.conditions,
    ListenerArn: stackConfig.selectedListenerArn,
    Priority: 1,
    Tags: [{ Key: 'isAriaCanaryRule', Value: stackConfig.selectedAlbName }]
  };

  const response = await axios.put(apiURI, {
    ...stackConfig,
    newRuleConfig
  });
  return response.data
}

export async function destroyCanaryStack(stackInfo) {
  const response = await axios.put(`${apiRoute}/destroy-canary`, {
    profileName: stackInfo.selectedProfile,
    stackName: stackInfo.stackName,
    stackArn: stackInfo.stackArn,
    canaryRuleArn: stackInfo.canaryRuleArn
  });
  return response.data;
}