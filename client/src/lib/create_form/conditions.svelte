<script>
  import { fade } from "svelte/transition";
  export let format;

  let conditions = [{}];
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
      updatedConditions[id].HttpRequsetmethodConfig = {
        Values: [""],
      };
    }
    conditions = updatedConditions;
  }

  const totalValues = 0;
  function addValue(conditionIdx, key, valueIdx) {
    return function (event) {
      const updatedConditions = [...conditions];
      updatedConditions[conditionIdx][key].Values[valueIdx] = event.target.value;
      conditions = updatedConditions; 
      totalValues += 1;
      console.log(conditions);
    };
  }

  // Conditions: [
  //   {
  //     Field: 'http-request-method',
  //     HttpRequestMethodConfig: {
  //       Values: ['GET']
  //     }
  //   }
  // ],
</script>

<div class="flex flex-col mt-7">
  <div class="">
    <p class={format.labelClass + " pt-2 float-left"}>Conditions</p>
    <button
      class={format.labelClass +
        " float-right px-2 py-1 rounded-md bg-blue-100"}
      on:click|self|preventDefault={addCondition}
    >
      Add Condition
    </button>
  </div>
  <div class="flex flex-col">
    {#each conditions as condition, conditionIdx}
      <div class="flex flex-row gap-2 mb-1">
        <select
          id={conditionIdx}
          class={format.fieldClass + " w-1/3"}
          transition:fade|local={{ duration: 200 }}
          on:change|preventDefault={chooseCondition}
        >
          <option value="" selected disabled hidden>Condition Type</option>
          <option value="" disabled>Select Type</option>
          <!-- <option value="Host Header">Host Header</option> -->
          <!-- <option value="Path">Path</option> -->
          <!-- <option value="HTTP Header">HTTP Header</option> -->
          <option value="http-request-method">HTTP Request Method</option>
          <!-- <option value="Query String">Query String</option> -->
          <!-- <option value="Source IP">Source IP</option> -->
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
