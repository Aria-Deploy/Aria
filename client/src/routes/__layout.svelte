<script>
  import "../styles/tailwind-output.css";
  import Sidebar from "$lib/sidebar/sidebar.svelte";
  import SelectProfileForm from "$lib/modals/select_profile.svelte";
  import NewStackForm from "$lib/new_stack_form.svelte";
</script>

<SelectProfileForm />
<NewStackForm />

<div class="absolute flex w-full h-full antialiased">
  <Sidebar />
  <div class="pl-48 flex-grow w-full h-full bg-gray-50">
    <slot />
  </div>
</div>
