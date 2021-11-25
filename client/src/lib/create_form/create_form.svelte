<script>
  import { slide } from "svelte/transition";
  import Modal from "$lib/modal.svelte";
  import Conditions from "$lib/create_form/conditions.svelte";
  import { showCreateCanaryForm } from "../../stores";
  import { onMount, onDestroy } from "svelte";
  import { resourceData } from "../../stores";
  import { getResourceData } from "$lib/api_interface";

  let profileName,
    selectedAlb,
    selectedListener,
    selectedTarget,
    selectedInstance,
    stackName,
    stackDescription,
    canaryImgPath,
    baselineImgPath,
    keyPair = "",
    deployDisabled = false,
    isOpen = false,
    conditions = [];

  onMount(async () => {
    const data = await getResourceData("default");
    resourceData.set(data.profileResources);
  });

  const rowClass = "flex flex-row gap-3 mt-8";
  const labelClass =
    "block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2";
  const fieldClass =
    "form-select block w-full text-gray-700 border border-gray-200 rounded py-2 px-2 leading-tight focus:outline-none focus:bg-white focus:border-gray-500";

  onDestroy(() => (isOpen = false));

  function selectAlb(event) {
    selectedAlb = { ...$resourceData[event.target.value] };
  }
  function selectListener(event) {
    selectedListener = { ...selectedAlb.Listeners[event.target.value] };
  }
  function selectTargetGroup(event) {
    selectedTarget = { ...selectedAlb.Targets[event.target.value] };
  }
  function selectInstance(event) {
    selectedInstance = { ...selectedTarget.Instances[event.target.value] };
    deployDisabled = false;
  }

  function submitNewCanary(event) {
    console.log(event.target);
  }
</script>

<div class="flex flex-row bg-blue-50" />
<form class="px-5" on:submit|preventDefault={submitNewCanary}>
  <button type="submit" disabled style="display: none" aria-hidden="true" />
  <div class={rowClass}>
    <div class="flex flex-col w-4/12">
      <label for="stackName" class={labelClass}>Canary Stack Title</label>
      <input id="stackName" class={fieldClass} bind:value={stackName} />
    </div>
    <div class="flex flex-col flex-grow">
      <label for="stackName" class={labelClass}>
        Canary Stack Description
      </label>
      <input id="stackName" class={fieldClass} bind:value={stackDescription} />
    </div>
  </div>
  <div class={rowClass}>
    <div>
      <label class={labelClass} for="load-balancer"> Load Balancer </label>
      <select
        class={fieldClass}
        id="load-balancer"
        on:change={selectAlb}
        disabled={!$resourceData.length}
        required
      >
        <option value="" selected disabled hidden>Select ALB</option>
        {#if $resourceData}
          <optgroup label="Load Balancer ID">
            {#each $resourceData as alb, idx}
              <option value={`${idx}`}>{alb.LoadBalancerName}</option>
            {/each}
          </optgroup>
        {/if}
      </select>
    </div>
    <div>
      <label class={labelClass} for="listener"> Listener </label>
      <select
        class={fieldClass}
        id="listener"
        on:change={selectListener}
        disabled={!selectedAlb}
      >
        <option value="none" selected disabled hidden>Select Port</option>
        {#if selectedAlb}
          {#each selectedAlb.Listeners as listener, idx}
            <option value={`${idx}`}>{listener.Port}</option>
          {/each}
        {/if}
      </select>
    </div>
  </div>
  <div class={rowClass}>
    <div>
      <label class={labelClass} for="target-group"> Target Group </label>
      <select
        class={fieldClass}
        id="target-group"
        on:change={selectTargetGroup}
        disabled={!selectedListener}
      >
        <option value="none" selected disabled hidden
          >Select Target Group</option
        >
        {#if selectedListener}
          {#each selectedAlb.Targets as targetGroup, idx}
            {#if targetGroup.Port === selectedListener.Port}
              <option value={`${idx}`}>{targetGroup.TargetGroupName}</option>
            {/if}
          {/each}
        {/if}
      </select>
    </div>
    <div>
      <label class={labelClass} for="instance">Instance</label>
      <select
        class={fieldClass}
        id="instance"
        on:change={selectInstance}
        disabled={!selectedTarget}
      >
        <option value="none" selected disabled hidden>Select Instance</option>
        {#if selectedTarget}
          {#each selectedTarget.Instances as instance, idx}
            <option value={`${idx}`}>{instance.instanceId}</option>
          {/each}
        {/if}
      </select>
    </div>
    <div>
      <label class={labelClass} for="instance"> Instance KeyPair </label>
      <input
        class={fieldClass}
        bind:value={keyPair}
        disabled={!selectedInstance}
      />
    </div>
  </div>
  <Conditions format={{ rowClass, fieldClass, labelClass }} />
  <fieldset class="border border-solid border-gray-200 rounded-md p-3 mt-4">
    <legend class="text-gray-500" on:click={() => (isOpen = !isOpen)}
      >Service Images</legend
    >
    <div class="flex flex-row gap-3">
      <div class="flex flex-col">
        <label for="stackName" class={labelClass}> Canary Image </label>
        <input
          type="file"
          class={fieldClass + ` border-0`}
          accept=".tar"
          id="stackName"
          style="padding: 5px;"
          bind:value={canaryImgPath}
          required
        />
      </div>
      <div class="flex flex-col">
        <label for="stackName" class={labelClass}> Baseline Image </label>
        <input
          type="file"
          class={fieldClass + ` border-0`}
          accept=".tar"
          id="stackName"
          style="padding: 5px;"
          bind:value={canaryImgPath}
          required
        />
      </div>
    </div>
    <div class="flex flex-row gap-4 mt-2">
      <div class="flex flex-col">
        <label for="stackName" class={labelClass}>
          Canary Docker-Compose
        </label>
        <input
          type="file"
          class={fieldClass + ` border-0`}
          accept=".yml"
          id="stackName"
          style="padding: 5px;"
          bind:value={canaryImgPath}
          required
        />
      </div>
      <div class="flex flex-col">
        <label for="stackName" class={labelClass}>
          Baseline Docker-Compose
        </label>
        <input
          type="file"
          class={fieldClass + ` border-0`}
          accept=".yml"
          id="stackName"
          style="padding: 5px;"
          bind:value={canaryImgPath}
          required
        />
      </div>
    </div>
  </fieldset>
  <input
    type="submit"
    class="float-right py-2 px-4 my-4 text-xl font-semibold bg-blue-600 text-white rounded-md shadow-xl hover:shadow-2xl hover:bg-blue-700 transition duration-500"
  />
</form>
