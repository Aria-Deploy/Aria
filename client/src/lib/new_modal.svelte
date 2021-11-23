<script>
  import Modal from "svelte-simple-modal";
</script>

<Modal>
  <div class="z-10 absolute h-screen w-screen bg-black bg-opacity-60">
  <div class="flex h-3/5 w-screen">
    <div class="p-4 m-auto bg-white">
      <slot />
    </div>
  </div>
</div>
</Modal>
