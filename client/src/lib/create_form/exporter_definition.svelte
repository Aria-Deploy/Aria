<script>
  import { getContext } from "svelte";
  import { slide } from "svelte/transition";
  export let exporters = [];

  const stackConfig = getContext("stackConfig");
  const format = getContext("format");

  const addExporter = () => (exporters = [...exporters, {}]);

  let totalExporters = 0;
  $: totalExporters = exporters.length;

  $: $stackConfig.exporters = exporters;
</script>

<div class="flex flex-col mt-5 px-4">
  <div class="flex flex-col">
    <p class={format.labelClass + " pt-2"}>Prometheus Exporters</p>
    {#each exporters as exporter, exporterIdx (exporterIdx)}
      <div
        class="flex flex-row gap-2 mt-1"
        transition:slide={{ duration: 500 }}
      >
        <div>
          <input
            id={`exporter-jobName-${exporterIdx}`}
            class={format.fieldClass}
            placeholder="Provide Job Name"
            bind:value={exporters[exporterIdx]["jobName"]}
            required
          />
        </div>
        <div>
          <input
            id={`exporter-port-${exporterIdx}`}
            type="number"
            class={format.fieldClass}
            placeholder="Provide Port"
            bind:value={exporters[exporterIdx]["port"]}
            min="0"
            max="65535"
            step="1"
            required
          />
        </div>
      </div>
    {/each}
    <div>
      <button
        type="button"
        class={format.labelClass + " mt-2 px-2 py-1 rounded-md bg-aria-teal/30"}
        on:click|self|preventDefault={addExporter}
      >
        Add Exporters
      </button>
    </div>
  </div>
</div>
