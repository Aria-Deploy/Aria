<script>
  import { onMount } from "svelte";
  import Card from "$lib/card.svelte";
  import Banner from "$lib/banner.svelte";
  import { getResourceData } from "$lib/api_interface";
  import { existingStackInfo } from "../stores";
  let descrption = "This is a descrption of the canary";

  onMount(async () => {
    const data = await getResourceData("default");
    existingStackInfo.set(data.existingStackInfo);
    console.log($existingStackInfo);
  });
</script>

<Banner />
<div class="pr-5">
  {#each $existingStackInfo as stack, idx}
    {#if stack.isCanary}
      <Card stackInfo={stack} />
    {/if}
  {/each}
</div>
