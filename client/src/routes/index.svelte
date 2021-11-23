<script>
  import CanaryStackCard from "$lib/canary_stack_card.svelte";
  import Banner from "$lib/banner.svelte";
  import { existingStackInfo } from "../stores";
</script>

<Banner />
<div class="pr-5">
  {#each $existingStackInfo as stack}
    <CanaryStackCard stackInfo={stack} />
  {/each}
</div>
