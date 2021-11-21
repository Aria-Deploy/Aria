import axios from 'axios'

const apiRoute = `http://localhost:5000/api`;

export async function getResourceData(selectedProfile) {
  const apiURI = `${apiRoute}/resources-data/${selectedProfile}`;
  const response = await axios(apiURI);
  return response.data;
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