<script>
  import Modal from "$lib/new_modal.svelte";
  import { showCreateCanaryForm } from "../stores";
  import { onMount } from "svelte";
  import { resourceData } from "../stores";
  import { getResourceData } from "$lib/api_interface";

  let selectedAlb, selectedListener, selectedTarget, selectedInstance;

  onMount(async () => {
    const data = await getResourceData("default");
    resourceData.set(data.profileResources);
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

{#if $showCreateCanaryForm}
  <Modal>
    <div class="flex flex-col">
      <div class="flex flex-row bg-blue-50">
        <div class="flex-grow font-semibold text-2xl text-regal-blue">
          Create Canary Form
        </div>
        <div class="flex-shrink" on:click={() => showCreateCanaryForm.set(false)}>
          <svg
            class="h-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              fill="none"
              d="M15.898,4.045c-0.271-0.272-0.713-0.272-0.986,0l-4.71,4.711L5.493,4.045c-0.272-0.272-0.714-0.272-0.986,0s-0.272,0.714,0,0.986l4.709,4.711l-4.71,4.711c-0.272,0.271-0.272,0.713,0,0.986c0.136,0.136,0.314,0.203,0.492,0.203c0.179,0,0.357-0.067,0.493-0.203l4.711-4.711l4.71,4.711c0.137,0.136,0.314,0.203,0.494,0.203c0.178,0,0.355-0.067,0.492-0.203c0.273-0.273,0.273-0.715,0-0.986l-4.711-4.711l4.711-4.711C16.172,4.759,16.172,4.317,15.898,4.045z"
            /></svg
          >
        </div>
      </div>
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
                    <option value={`${idx}`}
                      >{targetGroup.TargetGroupName}</option
                    >
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
              <option value="none" selected disabled hidden
                >Select Instance</option
              >
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
    </div>
  </Modal>
{/if}
