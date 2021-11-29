<script>
  import InfraSelection from "$lib/create_form/infra_selection.svelte";
  import RuleDefinition from "$lib/create_form/rule_definition.svelte";
  import AppImages from "$lib/create_form/app_images.svelte";
  import { selectedAwsProfile, resourceData } from "../../stores";
  import { onMount } from "svelte";
  import { getResourceData, deployCanary } from "$lib/api_interface";

  onMount(async () => await getResourceData($selectedAwsProfile));

  const rowClass = "flex flex-row gap-3 mt-8";
  const labelClass =
    "block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2";
  const fieldClass =
    "form-select block w-full text-gray-700 border border-gray-200 rounded py-2 px-2 leading-tight focus:outline-none focus:bg-white focus:border-gray-500";
  const format = { rowClass, labelClass, fieldClass };

  const stackConfig = {};
  stackConfig.profileName = $selectedAwsProfile;

  function setStackConfig(key, value) {
    stackConfig[key] = value;
  }

  async function submitNewCanary() {
    const deployResult = await deployCanary(stackConfig);
    console.log(deployResult);
    await getResourceData($selectedAwsProfile);
  }
</script>

<div class="flex flex-row bg-blue-50" />
<form class="px-5" on:submit|preventDefault={submitNewCanary}>
  <button type="submit" disabled style="display: none" aria-hidden="true" />
  <div class={rowClass}>
    <div class="flex flex-col w-4/12">
      <label for="stackName" class={labelClass}>Canary Stack Title</label>
      <input
        id="stackName"
        class={fieldClass}
        bind:value={stackConfig.stackName}
        placeholder="Enter Title"
        required
      />
    </div>
    <div class="flex flex-col flex-grow">
      <label for="stackName" class={labelClass}>
        Canary Stack Description
      </label>
      <input
        id="stackName"
        class={fieldClass}
        bind:value={stackConfig.stackDescription}
        placeholder="Enter Description"
        required
      />
    </div>
  </div>
  <InfraSelection {format} {setStackConfig} />
  <RuleDefinition {format} {setStackConfig} />
  <AppImages {format} {setStackConfig} />
  <input
    type="submit"
    class="float-right py-2 px-4 my-4 text-xl font-semibold bg-blue-600 text-white rounded-md shadow-xl hover:shadow-2xl hover:bg-blue-700 transition duration-500"
  />
</form>
