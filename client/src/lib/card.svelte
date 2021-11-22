<script>
  import StackInfoDisplay from "$lib/stack_info_display.svelte";
  export let stackInfo;
  let { config, canaryRule } = stackInfo;

  let scale = "scale-0 h-0 p-0";

  function manageStack() {
    if (scale === "scale-y-0 h-0 p-0") scale = "scale-y-100 h-96 py-5";
    else scale = "scale-y-0 h-0 p-0";
  }
</script>

<div class="m-4 items-center justify-center w-full">
  <div class="containter px-4 w-full">
    <div
      class="bg-white p-8 rounded-lg shadow-md relative hover:bg-opacity-0 hover:shadow-2xl transition duration-500"
    >
      <div class="flex flex-row">
        <div class="flex-grow">
          <h1 class="text-2xl text-gray-600 font-semibold mb-3">
            {config.stackName}
          </h1>
          <p class="text-gray-500 leading-6 tracking-normal">
            {config.stackDescription}
          </p>
        </div>
        <div class="flex-shrink">
          <button
            class="py-2 px-4 bg-blue-400 text-white rounded-md shadow-xl hover:shadow-2xl hover:bg-blue-500 transition duration-500"
            on:click={manageStack}>Manage</button
          >
        </div>
      </div>
      <div
        class="block transform transition-all duration-500 ease-in-out {scale}"
      >
        <StackInfoDisplay {stackInfo} />
      </div>
    </div>
  </div>
</div>
