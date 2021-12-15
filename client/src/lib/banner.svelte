<script>
  export let title,
    description = undefined;
</script>

<div class="bg-white flex flex-row items-center h-32 px-9 py-8 shadow">
  <div class="flex-grow">
    <div class="text-left">
      <div class="text-aria-green font-aria-baloo text-4xl font-bold py-1">{title}</div>
      {#if description}
        <div class="text-gray-500 text-lg">{description}</div>
      {/if}
    </div>
  </div>

  <div class="flex-shrink">
    <slot />
  </div>
</div>
