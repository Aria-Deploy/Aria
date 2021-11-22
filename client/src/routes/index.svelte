<script>
  import CanaryStackCard from "$lib/canary_stack_card.svelte";
  import Banner from "$lib/banner.svelte";
  import { existingStackInfo, selectedAwsProfile } from "../stores";
  import { getResourceData } from "$lib/api_interface";
  import { onMount } from "svelte";
</script>

<Banner />
<div class="pr-5">
  {#each $existingStackInfo as stack}
    <CanaryStackCard stackInfo={stack} />
  {/each}
</div>
