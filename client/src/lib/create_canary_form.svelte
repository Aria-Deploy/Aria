<script>
  import { onMount } from "svelte";
  import { resourceData } from "../stores";
  import { getResourceData } from "$lib/api_interface";

  let selectedAlb, selectedListener, selectedTarget, selectedInstance;

  onMount(async () => {
    const data = await getResourceData("default");
    resourceData.set(data.profileResources);
    console.log($resourceData);
  });

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
</script>

<form class="w-full max-w-lg">
  <div class="flex flex-wrap -mx-3 mb-6">
    <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
      <label
        class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
        for="load-balancer"
      >
        Load Balancer
      </label>
      <select
        class="form-select block w-full text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
        id="load-balancer"
        on:change={selectAlb}
        disabled={!$resourceData.length}
      >
        <option value="none" selected disabled hidden>Select ALB</option>
        {#if $resourceData}
          {#each $resourceData as alb, idx}
            <option value={`${idx}`}>{alb.LoadBalancerName}</option>
          {/each}
        {/if}
      </select>
    </div>
    <div class="w-full md:w-1/2 px-3">
      <label
        class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
        for="listener"
      >
        Listener
      </label>
      <select
        class="form-select block w-full text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
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
  <div class="flex flex-wrap -mx-3 mb-6">
    <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
      <label
        class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
        for="target-group"
      >
        Target Group
      </label>
      <select
        class="form-select block w-full text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
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
    <div class="w-full md:w-1/2 px-3">
      <label
        class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
        for="instance"
      >
        Instance
      </label>
      <select
        class="form-select block w-full text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
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
  </div>

  <div class="flex-shrink">
    <button
      class="py-2 px-4 bg-blue-600 text-white rounded-md shadow-xl hover:shadow-2xl hover:bg-blue-700 transition duration-500"
    >
      Deploy Canary
    </button>
  </div>
</form>
