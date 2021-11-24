<script>
  import Modal from "svelte-simple-modal";
  import { slide } from 'svelte/transition'
</script>

<Modal>
  <div
    class="z-10 absolute flex justify-center h-screen w-screen bg-black bg-opacity-60"
  >
    <div class="p-4 w-7/12 m-auto bg-white">
      <slot />
    </div>
  </div>
</Modal>
