<script>
  import Modal from "$lib/modal.svelte";
  import { fetchExistingStacks } from "$lib/api_interface";
  import {
    selectedAwsProfile,
    existingStackInfo,
    currentDeployName,
  } from "../../stores";

  let awsDeploymentConfirmed = false;

  async function confirmDeployment(newStackName) {
    if (!$currentDeployName) return;
    while (true) {
      await sleep(250);
      let currentStacks = await fetchExistingStacks($selectedAwsProfile);
      awsDeploymentConfirmed = currentStacks.find(
        (stack) => stack.config.awsStackName === newStackName
      );
      if (awsDeploymentConfirmed) break;
    }
    console.log("broke while loop");
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  $: (async () => confirmDeployment($currentDeployName))();
  $: awsDeploymentConfirmed = awsDeploymentConfirmed;
</script>

{#if $currentDeployName}
  <Modal>
    <div
      class="bg-aria-green pl-3 pr-24 pt-3 pb-1 rounded-t-lg drop-shadow-md shadow-inner"
    >
      <p class="font-aria-baloo text-aria-grey text-2xl font-light">
        Deploy Initiated
      </p>
    </div>
    {#if !awsDeploymentConfirmed}
      <div class="flex flex-col items-center p-5 shadow-inner">
        <div class="text-gray-500">Awaiting AWS confirmation</div>
        <div class="loader-dots block relative w-20 h-5 mt-2">
          <div
            class="absolute top-0 mt-1 w-3 h-3 rounded-full bg-aria-yellow"
          />
          <div
            class="absolute top-0 mt-1 w-3 h-3 rounded-full bg-aria-yellow"
          />
          <div
            class="absolute top-0 mt-1 w-3 h-3 rounded-full bg-aria-yellow"
          />
          <div
            class="absolute top-0 mt-1 w-3 h-3 rounded-full bg-aria-yellow"
          />
        </div>
      </div>
    {:else}
      <div class="py-4 ml-6 mr-10 flex flex-col items-start text-aria-black/70">
        <div class="mb-2">AWS Resource Creation Initiated</div>
        <div>
          Reference the Status menu to <br /> inspect individual resource status
        </div>
        <div class="flex flex-row w-full justify-end">
          <a
            class="mt-4 -mr-2 py-2 px-3 text-aria-grey bg-aria-teal rounded-3xl"
            href="/"
            on:click={() => {
              $currentDeployName = "";
              awsDeploymentConfirmed = false;
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 scale-150"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </a>
        </div>
      </div>
    {/if}
  </Modal>
{/if}

<style>
  .loader-dots div {
    animation-timing-function: cubic-bezier(0, 1, 1, 0);
  }
  .loader-dots div:nth-child(1) {
    left: 8px;
    animation: loader-dots1 0.6s infinite;
  }
  .loader-dots div:nth-child(2) {
    left: 8px;
    animation: loader-dots2 0.6s infinite;
  }
  .loader-dots div:nth-child(3) {
    left: 32px;
    animation: loader-dots2 0.6s infinite;
  }
  .loader-dots div:nth-child(4) {
    left: 56px;
    animation: loader-dots3 0.6s infinite;
  }
  @keyframes loader-dots1 {
    0% {
      transform: scale(0);
    }
    100% {
      transform: scale(1);
    }
  }
  @keyframes loader-dots3 {
    0% {
      transform: scale(1);
    }
    100% {
      transform: scale(0);
    }
  }
  @keyframes loader-dots2 {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(24px, 0);
    }
  }
</style>
