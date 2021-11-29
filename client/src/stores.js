import { browser } from "$app/env";
import { writable } from "svelte/store";

export const selectedAwsProfile = writable('');
export const resourceData = writable([]);
export const existingStackInfo = writable([]);

createLocalStorage("selectedAwsProfile", selectedAwsProfile);
createLocalStorage("resourceData", resourceData);
createLocalStorage("existingStackInfo", existingStackInfo);

function createLocalStorage(localStorageName, localStorageValue) {
  if (!browser) return;

  const localValue = JSON.parse(localStorage.getItem(localStorageName));
  if (localValue) localStorageValue.set(localValue);

  localStorageValue.subscribe(value => {
    localStorage.setItem(localStorageName, JSON.stringify(value));
  });
}
