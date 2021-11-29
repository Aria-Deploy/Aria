<script>
  export let format, setStackConfig;
  let canaryImgPath = "",
    baselineImgPath = "",
    canaryComposePath = "",
    baselineComposePath = "";

  $: setStackConfig("canaryImgPath", canaryImgPath.substr(12));
  $: setStackConfig("baselineImgPath", baselineImgPath.substr(12));
  $: setStackConfig("canaryComposePath", canaryComposePath.substr(12));
  $: setStackConfig("baselineComposePath", baselineComposePath.substr(12));
</script>

<fieldset class="border border-solid border-gray-200 rounded-md p-3 mt-4">
  <legend class="text-gray-500">Service Images</legend>
  <div class="flex flex-row gap-3">
    <div class="flex flex-col">
      <label for="stackName" class={format.labelClass}>Canary Image </label>
      <input
        type="file"
        class={format.fieldClass + ` border-0`}
        accept=".tar"
        id="stackName"
        style="padding: 5px;"
        bind:value={canaryImgPath}
        required
      />
    </div>
    <div class="flex flex-col">
      <label for="stackName" class={format.labelClass}>Baseline Image</label>
      <input
        type="file"
        class={format.fieldClass + ` border-0`}
        accept=".tar"
        id="stackName"
        style="padding: 5px;"
        bind:value={baselineImgPath}
        required
      />
    </div>
  </div>
  <div class="flex flex-row gap-4 mt-2">
    <div class="flex flex-col">
      <label for="stackName" class={format.labelClass}>
        Canary Docker-Compose
      </label>
      <input
        type="file"
        class={format.fieldClass + ` border-0`}
        accept=".yml"
        id="stackName"
        style="padding: 5px;"
        bind:value={canaryComposePath}
        required
      />
    </div>
    <div class="flex flex-col">
      <label for="stackName" class={format.labelClass}>
        Baseline Docker-Compose
      </label>
      <input
        type="file"
        class={format.fieldClass + ` border-0`}
        accept=".yml"
        id="stackName"
        style="padding: 5px;"
        bind:value={baselineComposePath}
        required
      />
    </div>
  </div>
</fieldset>
