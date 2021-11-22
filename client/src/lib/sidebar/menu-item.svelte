<script>
  export let route;
  export let title;
</script>

<a
  href={route}
  class="flex items-center space-x-3 text-indigo p-2 rounded-md font-medium focus:bg-blue-700"
>
  <span class="text-gray-400">
    <svg
      class="h-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <slot />
    </svg>
  </span>
  <span>{title}</span>
</a>
