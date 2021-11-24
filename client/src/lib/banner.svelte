<script>
  import { showCreateCanaryForm } from '../stores'
</script>


<div class="bg-blue-50 flex flex-row px-9 py-10 shadow">
  <div class="flex-grow">
    <div class="text-left">
      <div class="text-regal-blue text-4xl font-bold">Canary Deployments</div>
      <div class="text-gray-500 text-lg py-1">
        Create, destroy, and manage existing Aria canary deployments
      </div>
    </div>
  </div>

  <div class="flex-shrink">
    <button
      on:click={() => showCreateCanaryForm.set(true)}
      class="py-2 px-4 bg-blue-600 text-white rounded-md shadow-xl hover:shadow-2xl hover:bg-blue-700 transition duration-500"
    >
      Create New
    </button>
  </div>
</div>
