<script>
  import Modal from "svelte-simple-modal";
</script>

<Modal>
  <div
    class="z-10 absolute flex justify-center h-screen w-screen bg-black bg-opacity-60"
  >
    <div class="font-aria-montserrat mt-56 mb-auto bg-aria-grey rounded-lg">
      <slot />
    </div>
  </div>
</Modal>
