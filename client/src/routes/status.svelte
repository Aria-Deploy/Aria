<script>
  import { fade } from "svelte/transition";
  import { existingStackInfo, resourceData } from "../stores";
  import { getStackStatus, getTargetHealth } from "$lib/api_interface";
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

    const resourcesStatusHealth = await Promise.all(
      resourcesStatus.map(async (stack) => {
        const baseline = await getTargetHealth(stack.baseline.targetArn);
        stack.baseline.targetHealth = baseline.TargetHealthDescriptions;
        const canary = await getTargetHealth(stack.canary.targetArn);
        stack.canary.targetHealth = canary.TargetHealthDescriptions;
        return stack;
      })
    );

    console.log(resourcesStatusHealth);
    return resourcesStatusHealth;
  }
  let stackResources = getResourceStatus();
  const description =
    "Review the status and event logs of Aria deployed resources";
</script>

<Banner title={"Review Canary Status"} {description} />
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
                  <span class="sr-only">Event Logs</span>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each statuses as stackStatus}
                <tr>
                  <td>
                    <div
                      class="px-6 py-3 text-sm font-medium text-gray-900"
                    >
                      {stackStatus.stackName}
                    </div>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>
                    <div
                      class="px-6 py-3 text-sm font-medium text-gray-900"
                    >
                      {stackStatus.stackStatus}
                    </div>
                  </td>
                </tr>
                {#if stackStatus.stackStatus === 'CREATE_COMPLETE'}
                {#each Object.entries(stackStatus) as [key, value]}
                  {#if key !== "stackName" && key !== "stackStatus"}
                    <tr>
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
                          {value.status.InstanceState?.Name}
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
                        {#if key == "monitor"}
                          {"N/A"}
                        {:else}
                          {value.targetHealth[0].TargetHealth.State}
                        {/if}
                      </td>
                      <td
                        class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                      >
                        <a
                          href="/"
                          class="text-indigo-600 hover:text-indigo-900"
                          >Event Logs</a
                        >
                      </td>
                    </tr>
                  {/if}
                {/each}
              {/if}
              {/each}
            </tbody>
          </table>
        </div>
      {/await}
    </div>
  </div>
</div>
