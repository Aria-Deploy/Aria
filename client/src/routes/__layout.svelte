<script>
  import "../styles/tailwind-output.css";
  import Sidebar from "$lib/sidebar/sidebar.svelte";
  import SelectProfileForm from "$lib/sidebar/select_profile.svelte";
</script>

<SelectProfileForm />
<div
  class="font-aria-montserrat absolute flex w-full h-full min-h-max antialiased"
>
  <Sidebar />
  <div class="pl-48 flex-grow">
    <slot />
  </div>
</div>
