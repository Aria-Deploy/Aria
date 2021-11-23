<script>
  import Modal from "$lib/new_modal.svelte";
  import { selectProfile } from "$lib/actions";
  import { getUserProfiles } from "$lib/api_interface";
  import { selectedAwsProfile } from "../../stores";

  let awsProfiles = getUserProfiles();

  const chooseProfile = async (event) => await selectProfile(event);
</script>

{#if !$selectedAwsProfile}
  {#await awsProfiles then profiles}
    <Modal>
      <p class="text-4xl">Select AWS Profile</p>
      <select on:change={chooseProfile}>
        <option value="none" selected disabled hidden>
          Select AWS Profile
        </option>
        {#each profiles as profile}
          <option value={profile}>{profile}</option>
        {/each}
      </select>
    </Modal>
  {/await}
{/if}
