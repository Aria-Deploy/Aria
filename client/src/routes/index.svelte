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
    class="py-2 px-4 bg-aria-green text-aria-grey font-semibold rounded-md shadow-xl hover:shadow-3xl hover:bg-aria-teal transition duration-500"
  >
    <a href="/create">CREATE NEW</a>
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
