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
    "form-select block w-full text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500";

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
    const formData = new FormData(event.target);
    const formProps = Object.fromEntries(formData);
    console.log(formProps);
  }
</script>

<Modal>
  <div class="flex flex-row bg-blue-50">
    <div class="flex-grow font-semibold text-2xl text-regal-blue">
      Create Canary Form
    </div>
    <div class="flex-shrink" on:click={() => showCreateCanaryForm.set(false)}>
      <svg
        class="h-6 text-gray-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 20 20"
        stroke="currentColor"
      >
        <path
          fill="gray"
          d="M11.469,10l7.08-7.08c0.406-0.406,0.406-1.064,0-1.469c-0.406-0.406-1.063-0.406-1.469,0L10,8.53l-7.081-7.08
							c-0.406-0.406-1.064-0.406-1.469,0c-0.406,0.406-0.406,1.063,0,1.469L8.531,10L1.45,17.081c-0.406,0.406-0.406,1.064,0,1.469
							c0.203,0.203,0.469,0.304,0.735,0.304c0.266,0,0.531-0.101,0.735-0.304L10,11.469l7.08,7.081c0.203,0.203,0.469,0.304,0.735,0.304
							c0.267,0,0.532-0.101,0.735-0.304c0.406-0.406,0.406-1.064,0-1.469L11.469,10z"
        /></svg
      >
    </div>
  </div>
  <form class="px-5" on:submit|preventDefault={submitNewCanary}>
    <div class={rowClass}>
      <div class="flex flex-col w-4/12">
        <label for="stackName" class={labelClass}>Canary Stack Title</label>
        <input id="stackName" class={fieldClass} bind:value={stackName} />
      </div>
      <div class="flex flex-col flex-grow">
        <label for="stackName" class={labelClass}>
          Canary Stack Description
        </label>
        <input
          id="stackName"
          class={fieldClass}
          bind:value={stackDescription}
        />
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
        >Deployment Analysis</legend
      >
      {#if isOpen}
        <div transition:slide|local={{ duration: 300 }}>
          <div class={rowClass + " mt-0"}>
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
                accept=".yml"
                id="stackName"
                style="padding: 5px;"
                bind:value={canaryImgPath}
                required
              />
            </div>
          </div>
          <div class={rowClass}>
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
                accept=".tar"
                id="stackName"
                style="padding: 5px;"
                bind:value={canaryImgPath}
                required
              />
            </div>
          </div>
        </div>
      {/if}
    </fieldset>
    <div>
      <input
        type="submit"
        class="py-2 px-4 bg-blue-600 text-white rounded-md shadow-xl hover:shadow-2xl hover:bg-blue-700 transition duration-500"
      />
    </div>
  </form>
</Modal>
