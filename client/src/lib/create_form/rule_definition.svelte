<script>
  import { getContext } from "svelte";
  import { fade, slide } from "svelte/transition";
  export let conditions = [{}];

  const stackConfig = getContext("stackConfig");
  const format = getContext("format");

  const addCondition = () => (conditions = [...conditions, {}]);

  const validationRegex = {
    "source-ip": "^([0-9]{1,3}.){3}[0-9]{1,3}(/([0-9]|[1-2][0-9]|3[0-2]))?$",
    "host-header":
      "^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]).)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$",
    "http-request-method": "^[A-Z]+$",
    "path-pattern": "^/[/.a-zA-Z0-9-]*$",
    "http-header": "^[w-]+$",
  };

  const conditionDisplay = [
    { display: "Path", type: "path-pattern" },
    {
      display: "Request Method",
      type: "http-request-method",
    },
    { display: "Host Header", type: "host-header" },
    { display: "HTTP Header", type: "http-header" },
    { display: "Source IP", type: "source-ip" },
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
      $stackConfig.conditions = updatedConditions;
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
      $stackConfig.conditions = conditions;
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
  $: $stackConfig.isStickySesssion = isStickySession;

  let priority;
  $: $stackConfig.priority = priority;

  let weight;
  $: $stackConfig.weight = weight;
</script>

<div class={format.rowClass + " justify-around"}>
  <div class="flex flex-col">
    <label for="stackName" class={format.labelClass}>Sticky Sessions</label>
    <input
      type="checkbox"
      id="stackName"
      class:accent={"#000"}
      class={format.fieldClass + ' mt-2 scale-150'}
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
<div class="flex flex-row justify-center">
<div class="flex flex-col mt-7 w-10/12 m-x-auto">
  <p class={format.labelClass + " pt-2 float-left"}>Conditions</p>
  <div class="flex flex-col">
    {#each conditions as condition, conditionIdx (conditionIdx)}
      <div class="flex flex-row gap-2 mb-1">
        <select
          id={conditionIdx}
          class={format.fieldClass + ' w-1/4'}
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
              class={format.fieldClass + " w-1/5"}
              placeHolder="Enter Value"
              transition:fade|local={{ duration: 200 }}
              on:change={storeValue(
                conditionIdx,
                conditionTypes[condition["Field"]],
                idx
              )}
              pattern={validationRegex[condition["Field"]]}
              required
            />
          {/each}
          <div class="flex flex-col h-3/4">
            {#if totalValues < 5}
              <div
                class="flex-shrink"
                on:click={addRemoveValues(
                  "add",
                  conditionIdx,
                  conditionTypes[condition["Field"]]
                )}>+</div
              >
            {/if}
            {#if !(conditionIdx === 0 && condition[conditionTypes[condition.Field]].Values.length === 1)}
              <div
                on:click={addRemoveValues(
                  "remove",
                  conditionIdx,
                  conditionTypes[condition["Field"]]
                )}>-</div
              >
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </div>
  {#if totalValues < 5 && !addConditionDisabled}
    <div>
      <button
        type="button"
        class={format.labelClass +
          " px-2 py-1 mt-1 rounded-md bg-aria-teal/30"}
        on:click|self|preventDefault={addCondition}
        transition:slide|local={{duration:200}}
      >
        Add Condition
      </button>
    </div>
  {/if}
</div>
</div>
