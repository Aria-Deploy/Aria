<script>
  export let route;
  export let title;
</script>

<a
  href={route}
  class="flex items-center pl-4 py-2 space-x-2 text-aria-grey font-semibold"
>
  <span class="text-aria-silver">
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
