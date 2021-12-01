<script>
  import { fade, slide, fly } from "svelte/transition";
  import { existingStackInfo, resourceData } from "../stores";
  import { getStackStatus } from "$lib/api_interface";
  import Banner from "$lib/banner.svelte";

  async function getResourceStatus() {
    if (!$existingStackInfo.length) return;
    const canaryStacks = $existingStackInfo.filter(
      (stack) => stack.outputs?.ariacanary
    );

    const resources = canaryStacks.map((stack) => {
      const reviewData = {
        stackName: stack.config?.stackName,
        stackStatus: stack.config.stackStatus,
        baseline: {
          targetArn: stack.outputs?.BaselineTargetGroupArn,
        },
        canary: {
          targetArn: stack.outputs?.CanaryTargetGroupArn,
        },
        monitor: {
          instanceId: stack.outputs?.monitorId,
        },
      };

      $resourceData.forEach((alb) => {
        if (alb.LoadBalancerArn !== stack.config?.selectedAlbArn) return;
        alb.Targets.forEach((target) => {
          if (target.TargetGroupArn === reviewData.baseline.targetArn)
            reviewData.baseline.instanceId = target.Instances[0]?.instanceId;
          if (target.TargetGroupArn === reviewData.canary.targetArn)
            reviewData.canary.instanceId = target.Instances[0]?.instanceId;
        });
      });
      return reviewData;
    });

    const resourcesStatus = await Promise.all(
      resources.map(async (stack) => {
        const response = await getStackStatus([
          stack.baseline.instanceId,
          stack.canary.instanceId,
          stack.monitor.instanceId,
        ]);
        stack.baseline.status = response.InstanceStatuses[0];
        stack.canary.status = response.InstanceStatuses[1];
        stack.monitor.status = response.InstanceStatuses[2];
        return stack;
      })
    );
    console.log(resourcesStatus);
    return resourcesStatus;
  }
  let stackResources = getResourceStatus();
</script>

<Banner title={"Review Canary Status"} />
<div class="flex flex-col p-4">
  <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
    <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
      {#await stackResources then statuses}
        <div
          class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg"
          transition:fade|local={{ duration: 200 }}
        >
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Canary Name
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  EC2 Instance
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  STATE
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  STATUS
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Target Health
                </th>
                <th scope="col" class="relative px-6 py-3">
                  <span class="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each statuses as stackStatus}
                {#each Object.entries(stackStatus) as [key, value]}
                  {#if key !== "stackName" && key !== "stackStatus"}
                    <tr>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                          <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">
                              {stackStatus.stackName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">
                          {key[0].toUpperCase() + key.substring(1)}
                        </div>
                        <div class="text-sm text-gray-500">
                          {value.instanceId}
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span
                          class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"
                        >
                          {value.status.InstanceState.Name}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span
                          class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"
                        >
                          {value.status.InstanceStatus.Status}
                        </span>
                      </td>
                      <td
                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {value.status.InstanceStatus.Status}
                      </td>
                      <td
                        class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                      >
                        <a
                          href="/"
                          class="text-indigo-600 hover:text-indigo-900"
                          >View Logs</a
                        >
                      </td>
                    </tr>
                  {/if}
                {/each}
              {/each}
              <!-- More people... -->
            </tbody>
          </table>
        </div>
      {/await}
    </div>
  </div>
</div>
