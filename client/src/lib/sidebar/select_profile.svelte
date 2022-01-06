<script>
  import Modal from "$lib/modal.svelte";
  import { selectProfile } from "$lib/actions";
  import { getUserProfiles } from "$lib/api_interface";
  import { selectedAwsProfile } from "../../stores";

  let awsProfiles = getUserProfiles();

  const chooseProfile = async (event) => await selectProfile(event);
</script>

{#if !$selectedAwsProfile}
  {#await awsProfiles then profiles}
    <Modal>
      <div class="bg-aria-green pl-3 pr-24 pt-3 pb-1 rounded-t-lg">
        <p class="font-aria-baloo text-aria-grey text-2xl font-light">
          AWS Account
        </p>
      </div>
      <div class="p-5">
        <select class="bg-aria-grey text-aria-green" on:change={chooseProfile}>
          <option value="none" selected disabled hidden>
            Select Profile
          </option>
          {#each profiles as profile}
            <option value={profile}>{profile}</option>
          {/each}
        </select>
      </div>
    </Modal>
  {/await}
{/if}
