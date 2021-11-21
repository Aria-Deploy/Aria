<script>
  import "../styles/tailwind-output.css";
  import Sidebar from "$lib/sidebar/sidebar.svelte"
</script>

<div class="absolute flex w-full h-full antialiased">
  <Sidebar />
  <div class="pl-48 flex-grow w-full h-full bg-gray-50">
    <slot />
  </div>
</div>
