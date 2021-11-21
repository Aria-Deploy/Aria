import { writable } from "svelte/store";

export const resourceData = writable(JSON.parse(localStorage.getItem("resourceData")) || []);
export const existingStackInfo = writable(JSON.parse(localStorage.getItem("existingStackInfo")) || []);

resourceData.subscribe(value => {
  localStorage.setItem("resourceData", JSON.stringify(value))
});
existingStackInfo.subscribe(value => {
  localStorage.setItem("existingStackInfo", JSON.stringify(value));
});


