<script>
  import { fade, slide } from "svelte/transition";
  import StackInfoDisplay from "$lib/deployments/stack_info_display.svelte";
  export let stackInfo, selectedCard, setSelectedCard, id;

  let arrowsRotation = "-rotate-180";
  $: arrowsRotation = selectedCard === id ? "-rotate-90" : "-rotate-180";
</script>

<div class="m-4 items-center justify-center w-full">
  <div class="containter px-4 w-full" in:fade={{ duration: 500 }}>
    <div
      class="w-full bg-aria-grey px-10 py-4 rounded-lg shadow-md relative hover:shadow-2xl transition duration-500"
    >
      <div class="flex flex-row">
        <div class="flex-grow">
          <h1 class="text-3xl text-aria-green font-aria-baloo">
            {stackInfo.config.stackName}
          </h1>
          <p class="text-gray-500 leading-6 tracking-normal">
            {stackInfo.config.stackDescription}
          </p>
        </div>
        <div class="flex-shrink">
          <button on:click={setSelectedCard()}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 stroke-current text-gray-500 opacity-90 transform transition-all duration-500 {arrowsRotation}"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        </div>
      </div>
      {#if selectedCard === id}
        <div class="w-full mt-4" transition:slide|local={{ duration: 500 }}>
          <StackInfoDisplay {stackInfo} />
        </div>
      {/if}
    </div>
  </div>
</div>
