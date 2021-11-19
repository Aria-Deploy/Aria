<script>
  import { onMount } from "svelte";
  import Card from "$lib/card.svelte";
  import Banner from "$lib/banner.svelte";
  import { getResourceData } from "$lib/api_interface";
  import { existingStackInfo } from "../stores";

  onMount(async () => {
    const data = await getResourceData("default");
    existingStackInfo.set(data.existingStackInfo);
    console.log($existingStackInfo);
  });
</script>

<Banner />
<div class="pr-5">
  {#each $existingStackInfo as stack, idx}
    <Card stackInfo={stack} />
  {/each}
</div>
