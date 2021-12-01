import { resourceData, existingStackInfo, selectedAwsProfile } from '../stores'
import * as api from '$lib/api_interface'

export async function selectProfile(event) {
  const profile = event.target.value;
  resourceData.set([]);
  existingStackInfo.set([]);
  await api.getResourceData(profile);
  selectedAwsProfile.set(profile);
}

