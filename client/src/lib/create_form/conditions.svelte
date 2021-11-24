<script>
  export let format;

  let conditions = [{}];
  function addCondition() {
    conditions = conditions.concat({});
  }
</script>

<button on:click|preventDefault={addCondition}>Add Condition</button>
<div class={format.rowClass}>
  <div>
    <label class={format.labelClass} for="instance">Instance</label>
    {#each conditions as _, conditionIdx}
      <select id={conditionIdx} class={format.fieldClass + " mb-2"}>
        <option value="" selected disabled hidden>Condition Type</option>
        <option value="" disabled>Select Type</option>
        <option value="Host Header">Host Header</option>
        <option value="Path">Path</option>
        <option value="HTTP Header">HTTP Header</option>
        <option value="HTTP Request Method">HTTP Request Method</option>
        <option value="Query String">Query String</option>
        <option value="Source IP">Source IP</option>
      </select>
    {/each}
  </div>
</div>
