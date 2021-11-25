<script>
  import StackInfoDisplay from "$lib/deployments/stack_info_display.svelte";
  export let stackInfo;
  let { config } = stackInfo;

  let scale = "scale-y-0 h-0 p-0";
  let arrowsRotation = "-rotate-180";

  function manageStack() {
    if (scale === "scale-y-0 h-0 p-0") {
      scale = "scale-y-100 h-80 py-5";
      arrowsRotation = "-rotate-90";
    } else {
      scale = "scale-y-0 h-0 p-0";
      arrowsRotation = "-rotate-180";
    }
  }
</script>

<div class="m-4 items-center justify-center w-full">
  <div class="containter px-4 w-full">
    <div
      class="w-full bg-white px-10 py-4 rounded-lg shadow-md relative hover:bg-opacity-0 hover:shadow-2xl transition duration-500"
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
          <button on:click={manageStack}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 stroke-current text-gray-500 opacity-90 transform transition-all duration-500 {arrowsRotation}"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        </div>
      </div>
      <div
        class="w-full block transform transition-all duration-500 ease-in-out {scale}"
      >
        <StackInfoDisplay {stackInfo} />
      </div>
    </div>
  </div>
</div>
