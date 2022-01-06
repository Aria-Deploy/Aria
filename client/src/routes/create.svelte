<script>
  import { setContext } from "svelte";
  import { writable } from "svelte/store";
  import InfraSelection from "$lib/create_form/infra_selection.svelte";
  import RuleDefinition from "$lib/create_form/rule_definition.svelte";
  import ExporterDefinition from "$lib/create_form/exporter_definition.svelte";
  import AppImages from "$lib/create_form/app_images.svelte";
  import Banner from "$lib/banner.svelte";

  import {
    selectedAwsProfile,
    resourceData,
    currentDeployName,
  } from "../stores";
  import { onMount } from "svelte";
  import { getResourceData, deployCanary } from "$lib/api_interface";
  import SubformToggle from "$lib/create_form/subform_toggle.svelte";

  onMount(async () => await getResourceData($selectedAwsProfile));

  const rowClass = "flex flex-row gap-3 pt-6";
  const labelClass =
    "block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2";
  const fieldClass =
    "form-select block w-full text-gray-700 border border-gray-200 rounded py-2 px-2 leading-tight focus:outline-none focus:bg-white focus:border-gray-500";
  const format = { rowClass, labelClass, fieldClass };
  setContext("format", format);

  let stackConfig = writable({ profileName: $selectedAwsProfile });
  setContext("stackConfig", stackConfig);

  const subFormCompletionStatus = writable([false, false, false]);
  setContext("subFormCompletionStatus", subFormCompletionStatus);

  async function submitNewCanary() {
    $currentDeployName = `aria-canary-${$stackConfig["selectedAlbName"]}`;
    const deployResult = await deployCanary($stackConfig);
    console.log(deployResult);
    await getResourceData($selectedAwsProfile);
  }

  const subFormToShow = writable(0);
  setContext("subFormToShow", subFormToShow);

  let deployEnabled;
  $: deployEnabled = $subFormCompletionStatus.some((status) => !status);

  const deployBtnEnabledFormat =
    "bg-aria-orange/80 shadow-xl hover:shadow-2xl hover:bg-aria-orange hover:scale-101 transition duration-500";
  let deployBtnFormat;
  $: deployBtnFormat = deployEnabled
    ? "bg-aria-silver/80 cursor-default"
    : deployBtnEnabledFormat;
</script>

<Banner title={"Create New Deployment"}>
  <button
    disabled={deployEnabled}
    class="py-2 px-4 my-4 font-semibold text-white rounded-md {deployBtnFormat}"
    on:click={submitNewCanary}>DEPLOY</button
  >
</Banner>
<SubformToggle title={"Define Infrastructure"} toggleId={0}>
  <InfraSelection />
</SubformToggle>
<SubformToggle title={"Traffic Segmentation"} toggleId={1}>
  <RuleDefinition />
</SubformToggle>
<SubformToggle title={"Application Images"} toggleId={2}>
  <AppImages />
  <ExporterDefinition />
</SubformToggle>
