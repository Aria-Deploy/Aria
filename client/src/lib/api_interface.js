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
            Enabled: stackConfig.isStickySession
          },
          TargetGroups: [
            {
              TargetGroupArn: stackConfig.TargetGroupArn,
              Weight: 200 - (2 * stackConfig.weight)
            },
            {
              TargetGroupArn: 'Insert Canary Target ARN',
              Weight: stackConfig.weight
            },
            {
              TargetGroupArn: 'Insert Baseline Target ARN',
              Weight: stackConfig.weight
            }
          ]
        }
      }
    ],
    Conditions: stackConfig.conditions,
    ListenerArn: stackConfig.selectedListenerArn,
    Priority: stackConfig.priority,
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

export async function getStackStatus(instanceIds) {
  const response = await axios.post(`${apiRoute}/status`, { instanceIds });
  return response.data;
}

export async function getTargetHealth(TargetGroupArn) {
  const response = await axios.post(`${apiRoute}/health`, { TargetGroupArn });
  return response.data;
}