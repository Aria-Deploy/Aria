<script>
  import CanaryStackCard from "$lib/deployments/canary_stack_card.svelte";
  import Banner from "$lib/banner.svelte";
  import { existingStackInfo } from "../stores";

  let selectedCard;
  const setSelectedCard = (idx) => () => {
    if (selectedCard === idx) selectedCard = undefined;
    else selectedCard = idx;
  };

  let description = "Create, access, and destroy Aria canary deployments";
</script>

<Banner title={"Canary Deployments"} {description}>
  <button
    class="py-2 px-4 bg-blue-600 text-white rounded-md shadow-xl hover:shadow-2xl hover:bg-blue-700 transition duration-500"
  >
    <a href="/create">Create New</a>
  </button>
</Banner>
<div class="pr-5">
  {#each $existingStackInfo as stackInfo, idx}
    {#if stackInfo.outputs.ariacanary && stackInfo.config.stackStatus === "CREATE_COMPLETE"}
      <CanaryStackCard
        {stackInfo}
        {selectedCard}
        setSelectedCard={setSelectedCard(idx)}
        id={idx}
      />
    {/if}
  {/each}
</div>
