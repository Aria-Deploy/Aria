<script>
  import Card from "$lib/card.svelte";
  import Banner from "$lib/banner.svelte";
  import { getResourceData } from "$lib/api_interface";
  import { existingStackInfo } from "../stores";

  async function updateState() {
    const data = await getResourceData("default");
    existingStackInfo.set(data.existingStackInfo);
    console.log($existingStackInfo);
  }
  updateState();
</script>

<Banner />
<div class="pr-5">
  {#each $existingStackInfo as stack}
    <Card stackInfo={stack} />
  {/each}
</div>
