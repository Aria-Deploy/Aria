import * as store from '../stores'
import * as api from '$lib/api_interface'

export async function selectProfile(event) {
  const profile = event.target.value;
  store.resourceData.set([]);
  store.existingStackInfo.set([]);
  const profileData = await api.getResourceData(profile);
  store.resourceData.set(profileData.profileResources);
  store.existingStackInfo.set(profileData.existingStackInfo);
  store.selectedAwsProfile.set(profile);
}
