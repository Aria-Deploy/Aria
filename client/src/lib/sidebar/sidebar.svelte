<script>
  import { getStores } from "$app/stores";
  import MenuItem from "./menu-item.svelte";
  import { selectedAwsProfile } from "../../stores";

  let { page } = getStores();
  let highlight = (a, b) => (a === b ? "bg-aria-teal bg-opacity-20" : "");
</script>

<div
  class="fixed flex flex-col bg-aria-green items-center h-full w-48 text-aria-grey"
>
  <div class="h-fit w-full -mt-6 overflow-hidden">
    <img class="scale-[1.3]" src="aria_graphic_color.png" alt="" />
  </div>
  <div class="absolute font-aria-montserrat w-full text-lg mt-36 space-y-3">
    <div class={highlight("/", $page.path)}>
      <MenuItem title={"Deployments"} route={"/"}>
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
        />
      </MenuItem>
    </div>
    <div class={highlight("/status", $page.path)}>
      <MenuItem title={"Status"} route={"/status"}>
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      </MenuItem>
    </div>
    <div class={highlight("/about", $page.path)}>
      <MenuItem title={"About"} route={"/about"}>
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </MenuItem>
    </div>
  </div>
  <div class="text-blue-100 mt-auto mb-2">
    <button on:click={() => selectedAwsProfile.set("")}
      ><span class="font-semibold">Profile</span>: {$selectedAwsProfile}</button
    >
  </div>
</div>
