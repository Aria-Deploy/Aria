<script>
  import "../styles/tailwind-output.css";
  import Modal from "$lib/new_modal.svelte";
  import Sidebar from "$lib/sidebar/sidebar.svelte";
  import { selectProfile } from "$lib/actions";
  import {
    selectedAwsProfile,
    existingStackInfo,
    resourceData,
  } from "../stores";
  import { getUserProfiles, getResourceData } from "$lib/api_interface";
  import { onMount } from "svelte";

  let awsProfiles;
  onMount(async () => {
    awsProfiles = await getUserProfiles();
  });
</script>

{#if !$selectedAwsProfile && awsProfiles}
  <Modal>
    <p class="text-4xl">Select AWS Profile</p>
    <select on:change={selectProfile}>
      <option value="none" selected disabled hidden>Select AWS Profile</option>
      {#each awsProfiles as profile}
        <option value={profile}>{profile}</option>
      {/each}
    </select>
  </Modal>
{/if}

<div class="absolute flex w-full h-full antialiased">
  <Sidebar />
  <div class="pl-48 flex-grow w-full h-full bg-gray-50">
    <slot />
  </div>
</div>
