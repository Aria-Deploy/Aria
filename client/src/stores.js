import { writable } from "svelte/store";

export const userProfiles = writable()
export const selectedProfileStacks = writable([]) 
export const selectedAccStack = writable({
  profile: "",
  "stack": {},
})