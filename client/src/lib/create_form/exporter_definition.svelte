<script>
  import { loop_guard } from "svelte/internal";
  import { fade } from "svelte/transition";
  export let format,
    setStackConfig,
    exporters = [];

  const addExporter = () => (exporters = [...exporters, {}]);
  
  let totalExporters = 0;
  $: totalExporters = exporters.length;

  $: setStackConfig("exporters", exporters);

</script>

<div class="flex flex-col mt-7">
  <div>
    <p class={format.labelClass + " pt-2 float-left"}>Prometheus Exporters</p>
    <button
      type="button"
      class={format.labelClass +
        " float-right px-2 py-1 rounded-md bg-blue-100"}
      on:click|self|preventDefault={addExporter}
    >
      Add Exporters
    </button>
  </div>
  <div class="flex flex-col">
    {#each exporters as exporter, exporterIdx (exporterIdx)}
      <div class="flex flex-row gap-2 mb-2">
        <div>
          <input
          id={`exporter-jobName-${exporterIdx}`}
          class={format.fieldClass}
          placeholder="Provide Job Name"
          bind:value={exporters[exporterIdx]['jobName']}
          required
          />
        </div>
        <div>
          <input
          id={`exporter-port-${exporterIdx}`}
          type="number"
          class={format.fieldClass}
          placeholder="Provide Port"
          bind:value={exporters[exporterIdx]['port']}
          min="0"
          max="65535"
          step="1"
          required
          />
        </div>
      </div>
    {/each}
    </div>
</div>
