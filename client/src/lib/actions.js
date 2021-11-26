import * as store from '../stores'
import * as api from '$lib/api_interface'

export async function selectProfile(event) {
  const profile = event.target.value;
  console.log(profile);
  store.resourceData.set([]);
  store.existingStackInfo.set([]);
  await api.getResourceData(profile);
  store.selectedAwsProfile.set(profile);
}
