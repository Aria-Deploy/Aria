<script>
  import { onMount } from "svelte";
  import Card from "$lib/card.svelte"
  import Banner from "$lib/banner.svelte"
  import { getResourceData } from "$lib/api_interface";
  import { existingStackInfo } from "../stores"
  let descrption = "This is a descrption of the canary";

  onMount(async () => {
    const data = await getResourceData('default');
    existingStackInfo.set(data.existingStackInfo);
    console.log($existingStackInfo);
  });

</script>
  <Banner />
  <div class="pr-5">
    
    <Card title={"Test Canary"} description={descrption}/>
    <Card title={"Microservice A Test"} description={descrption}/>
    <Card title={"HomePage Canary"} description={descrption}/>
    <Card title={"SNS Service"} description={descrption}/>
    <Card title={"400 Error Bug Fix"} description={descrption}/>
  </div>