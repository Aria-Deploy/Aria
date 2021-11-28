<script>
  import { fade } from "svelte/transition";
  export let format,
    setStackConfig,
    conditions = [{}];

  const addCondition = () => (conditions = [...conditions, {}]);

  const conditionDisplay = [
    { display: "Path", type: "path-pattern", regex: "" },
    { display: "Reqeust Method", type: "http-request-method", regex: "" },
    { display: "Host Header", type: "host-header", regex: "" },
    { display: "HTTP Header", type: "http-header", regex: "" },
    { display: "Query String", type: "query-string", regex: "" },
    { display: "Source IP", type: "source-ip", regex: "" },
  ];

  const conditionTypes = {
    "path-pattern": "PathPatternConfig",
    "http-request-method": "HttpRequestMethodConfig",
    "host-header": "HostHeaderConfig",
    "http-header": "HttpHeaderConfig",
    "query-string": "QueryStringConfig",
    "source-ip": "SourceIpConfig",
  };

  function conditionSelected(type) {
    return conditions.some((condition) => condition["Field"] === type);
  }

  function chooseCondition(event) {
    const value = event.target.value;
    const updatedConditions = [...conditions];
    updatedConditions[event.target.id] = { Field: value };

    const condition = updatedConditions[event.target.id];
    if (value !== "query-string")
      condition[conditionTypes[value]] = { Values: [""] };
    else condition[conditionTypes[value]] = { Values: { Key: "", Value: "" } };

    conditions = updatedConditions;
    conditionDisplay = conditionDisplay;
  }

  function storeValue(conditionIdx, key, valueIdx) {
    return function (event) {
      const updatedConditions = [...conditions];
      updatedConditions[conditionIdx][key].Values[valueIdx] =
        event.target.value;
      conditions = updatedConditions;
      setStackConfig("conditions", updatedConditions);
    };
  }

  function addRemoveValues(action, conditionIdx, key) {
    return function () {
      const updatedConditions = [...conditions];
      const values = updatedConditions[conditionIdx][key].Values;

      if (action === "add") values.push("");
      else {
        if (values.length === 1 && updatedConditions.length === 1) return;
        if (values.length === 1) updatedConditions.splice(conditionIdx, 1);
        else values.pop();
      }

      conditions = updatedConditions;
      if (!conditions.length) {
        conditionDisplay = conditionDisplay;
        conditions = [{}];
      }
      setStackConfig("conditions", conditions);
    };
  }

  let totalValues = 0;
  $: totalValues = conditions.reduce((acc, condition) => {
    for (const key in condition) {
      if (key === "Field") continue;
      if (!condition[key].Values) continue;
      acc += condition[key].Values.length;
    }
    return acc;
  }, 0);

  let addConditionDisabled;
  $: addConditionDisabled = conditions.some((condition) => {
    const type = condition["Field"];
    if (!type) return true;
    return condition[conditionTypes[type]]["Values"].some((value) => !value);
  });

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
        type="button"
        class={format.labelClass +
          " float-right px-2 py-1 rounded-md bg-blue-100"}
        on:click|self|preventDefault={addCondition}
        disabled={addConditionDisabled}
      >
        Add Condition
      </button>
    </div>
  {/if}
  <div class="flex flex-col">
    {#each conditions as condition, conditionIdx (conditionIdx)}
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
          {#each conditionDisplay as cond (cond.display)}
            <option value={cond.type} disabled={conditionSelected(cond.type)}>
              {cond.display}
            </option>
          {/each}
        </select>
        {#if condition["Field"]}
          {#each condition[conditionTypes[condition["Field"]]].Values as _, idx (condition["Field"] + idx)}
            <input
              id={condition["Field"]}
              class={format.fieldClass + " w-1/3"}
              placeHolder="Enter Value"
              transition:fade|local={{ duration: 200 }}
              on:change={storeValue(
                conditionIdx,
                conditionTypes[condition["Field"]],
                idx
              )}
            />
          {/each}
          <div class="flex flex-col">
            {#if totalValues < 5}
              <button
                type="button"
                on:click={addRemoveValues(
                  "add",
                  conditionIdx,
                  conditionTypes[condition["Field"]]
                )}>+</button
              >
            {/if}
            {#if !(conditionIdx === 0 && condition[conditionTypes[condition.Field]].Values.length === 1)}
              <button
                type="button"
                on:click={addRemoveValues(
                  "remove",
                  conditionIdx,
                  conditionTypes[condition["Field"]]
                )}>-</button
              >
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
