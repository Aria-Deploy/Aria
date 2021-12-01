<script>
  import CanaryStackCard from "$lib/deployments/canary_stack_card.svelte";
  import Banner from "$lib/banner.svelte";
  import { existingStackInfo } from "../stores";

  let description = "Create, manage, and destroy Aria canary deployments";
</script>

<Banner title={"Canary Deployments"} {description}>
  <button
    class="py-2 px-4 bg-blue-600 text-white rounded-md shadow-xl hover:shadow-2xl hover:bg-blue-700 transition duration-500"
  >
    <a href="/create">Create New</a>
  </button>
</Banner>
<div class="pr-5">
  {#each $existingStackInfo as stack}
    {#if stack.outputs.ariacanary && stack.config.stackStatus === "CREATE_COMPLETE"}
      <CanaryStackCard stackInfo={stack} />
    {/if}
  {/each}
</div>
