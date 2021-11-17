import { writable } from "svelte/store";

export const userProfiles = writable();
export const selectedProfile = writable();
export const profileStacks = writable([]);
export const profileResourceData = writable([]);
