<script>
  import { getContext } from "svelte";

  const stackConfig = getContext("stackConfig");
  const format = getContext("format");

  let canaryImgPath,
    baselineImgPath,
    canaryComposePath,
    baselineComposePath;


  $: $stackConfig.canaryImgPath = canaryImgPath?.substr(12);
  $: $stackConfig.baselineImgPath = baselineImgPath?.substr(12);
  $: $stackConfig.canaryComposePath = canaryComposePath?.substr(12);
  $: $stackConfig.baselineComposePath = baselineComposePath?.substr(12);
</script>

<div class="p-3 pt-6">
  <div>
    <label class={format.labelClass} for="instance">HealthCheck Path</label>
    <input
      class={format.fieldClass + " w-1/2 mb-10"}
      bind:value={$stackConfig.healthCheckPath}
      required
    />
  </div>
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
</div>
