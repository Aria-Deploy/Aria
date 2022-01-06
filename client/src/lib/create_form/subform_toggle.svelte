<script>
  import { getContext } from "svelte";
  import { slide, fade } from "svelte/transition";

  export let title, toggleId;

  let subFormToShow = getContext("subFormToShow");
  const subFormCompletionStatus = getContext("subFormCompletionStatus");
  const setSubFormToShow = () => ($subFormToShow = toggleId);
  let showSubForm;
  $: showSubForm = $subFormToShow === toggleId;

  const submitSubForm = () => {
    $subFormCompletionStatus[toggleId] = true;
    $subFormToShow = $subFormCompletionStatus.findIndex((status) => !status);
  };

  let subFormColor;
  $: subFormColor = $subFormCompletionStatus[toggleId]
    ? "bg-aria-teal/30"
    : "bg-aria-silver";
</script>

<!-- <fieldset class="border border-solid border-aria-silver rounded-md p-3 mt-4"> -->
<div class="border-aria-grey my-6 mx-3 px-1 py-3 rounded-md {subFormColor}">
  <div class="flex flex-column justify-between">
    <div class="ml-5 pb-2 italic text-aria-grey font-semibold">{title}</div>
    {#if !showSubForm}
      <div
        class="flex-shrink px-3 text-aria-green font-semibold text-2xl cursor-pointer"
        on:click={setSubFormToShow}
        transition:fade|local={{ duration: 200 }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 9l4-4 4 4m0 6l-4 4-4-4"
          />
        </svg>
      </div>
    {/if}
  </div>
  {#if $subFormToShow === toggleId}
    <div
      class="px-3 border-t border-aria-grey"
      transition:slide|local={{ duration: 500 }}
    >
      <form on:submit|preventDefault={submitSubForm}>
        <button
          type="submit"
          disabled
          style="display: none"
          aria-hidden="true"
        />
        <slot />
        <div class="flex flex-row justify-end mt-2">
          <input
            type="submit"
            class="py-1 px-3 my-4 text-lg font-medium bg-aria-teal text-white rounded-md shadow-xl hover:shadow-2xl hover:bg-aria-green transition duration-500"
          />
        </div>
      </form>
    </div>
  {/if}
</div>
