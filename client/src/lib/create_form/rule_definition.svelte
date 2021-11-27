<script>
  import { fade } from "svelte/transition";
  export let format,
    setStackConfig,
    conditions = [{}];

  function addCondition() {
    conditions = [...conditions, []];
    console.log(conditions);
  }

  function chooseCondition(event) {
    const updatedConditions = [...conditions];
    const id = event.target.id;
    const value = event.target.value;

    if (value === "http-request-method") {
      updatedConditions[id].Field = "http-request-method";
      updatedConditions[id].HttpRequestMethodConfig = {
        Values: [""],
      };
    }
    conditions = updatedConditions;
  }

  let totalValues = 0;
  function addValue(conditionIdx, key, valueIdx) {
    return function (event) {
      const updatedConditions = [...conditions];
      updatedConditions[conditionIdx][key].Values[valueIdx] =
        event.target.value;
      setStackConfig("conditions", updatedConditions);
      totalValues += 1;
    };
  }

  $: totalValues = conditions.reduce((acc, condition) => {
    for (const key in condition) {
      if (key === "Field") continue;
      if (!condition[key].Values) continue;
      acc += condition[key].Values.length;
    }
    return acc;
  }, 0);

  let isStickySession = false;
  $: setStackConfig("isStickySesssion", isStickySession);

  let priority;
  $: setStackConfig("priority", priority);

  let weight;
  $: setStackConfig("weight", weight);
</script>

<div class={format.rowClass}>
  <div class="flex flex-col">
    <label for="stackName" class={format.labelClass}>Sticky Sessions</label>
    <input
      type="checkbox"
      id="stackName"
      class={format.fieldClass}
      bind:checked={isStickySession}
    />
  </div>
  <div class="flex flex-col">
    <label for="stackName" class={format.labelClass}>
      Analysis Traffic Weight
    </label>
    <input
      type="number"
      id="stackName"
      class={format.fieldClass}
      bind:value={weight}
      placeholder="0-20"
      min="0"
      max="20"
      required
    />
  </div>
  <div class="flex flex-col">
    <label for="stackName" class={format.labelClass}>Rule Priority</label>
    <input
      type="number"
      id="stackName"
      class={format.fieldClass}
      bind:value={priority}
      placeholder="0-999"
      min="0"
      max="999"
      required
    />
  </div>
</div>
<div class="flex flex-col mt-7">
  {#if totalValues < 5}
    <div>
      <p class={format.labelClass + " pt-2 float-left"}>Conditions</p>
      <button
        class={format.labelClass +
          " float-right px-2 py-1 rounded-md bg-blue-100"}
        on:click|self|preventDefault={addCondition}
      >
        Add Condition
      </button>
    </div>
  {/if}
  <div class="flex flex-col">
    {#each conditions as condition, conditionIdx}
      <div class="flex flex-row gap-2 mb-1">
        <select
          id={conditionIdx}
          class={format.fieldClass + " w-1/3"}
          transition:fade|local={{ duration: 200 }}
          on:change|preventDefault={chooseCondition}
          required
        >
          <option value="" selected disabled hidden>Condition Type</option>
          <option value="" disabled>Select Type</option>
          <option value="Host Header" disabled>Host Header</option>
          <option value="Path" disabled>Path</option>
          <option value="HTTP Header" disabled>HTTP Header</option>
          <option value="http-request-method">HTTP Request Method</option>
          <option value="Query String" disabled>Query String</option>
          <option value="Source IP" disabled>Source IP</option>
        </select>
        {#if condition.Field}
          {#each Object.keys(condition) as key}
            {#if key !== "Field"}
              {#each condition[key].Values as _, idx}
                <input
                  class={format.fieldClass + " w-1/3"}
                  placeHolder="Enter Value"
                  in:fade={{ duration: 100 }}
                  on:change={addValue(conditionIdx, key, idx)}
                />
              {/each}
            {/if}
          {/each}
        {/if}
      </div>
    {/each}
  </div>
</div>
