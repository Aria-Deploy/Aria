<script>
  import Modal from "$lib/modal.svelte";
  import CanaryForm from "$lib/create_canary_form.svelte";

  let showModal = false;

  const handleToggleModal = () => {
    showModal = !showModal;
  };
</script>

<div class="bg-blue-100 flex flex-row px-9 py-12 shadow">
  <div class="flex-grow">
    <div class="text-left text-2xl">
      <div class="text-regal-blue text-4xl font-bold">Canary Deployment</div>
      <div class="text-blue-500">Blahblahblah.</div>
    </div>
  </div>

  <div class="flex-shrink">
    <button
      on:click={() => handleToggleModal()}
      class="py-2 px-4 bg-blue-600 text-white rounded-md shadow-xl hover:shadow-2xl hover:bg-blue-700 transition duration-500"
    >
      Create New
    </button>
  </div>
</div>

<Modal open={showModal} on:close={() => handleToggleModal()}>
  <svelte:fragment slot="body">
    <CanaryForm />
  </svelte:fragment>
</Modal>
