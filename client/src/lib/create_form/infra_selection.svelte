<script>
  import { getContext } from "svelte";
  import { resourceData, existingStackInfo } from "../../stores";

  const stackConfig = getContext("stackConfig");
  const format = getContext("format");

  const resourceDataCopy = JSON.parse(JSON.stringify($resourceData));
  const nonCanaryLoadBalancers = resourceDataCopy.filter((alb) => {
    return $existingStackInfo.every((canaryStack) => {
      if (!canaryStack.config) return true;
      if (canaryStack.config.selectedAlbArn !== alb.LoadBalancerArn)
        return true;
    });
  });

  let selectedAlb;
  function selectAlb(event) {
    selectedAlb = nonCanaryLoadBalancers[event.target.value];
    $stackConfig.selectedAlbName = selectedAlb.LoadBalancerName;
    $stackConfig.selectedAlbArn = selectedAlb.LoadBalancerArn;
  }

  let selectedListener;
  function selectListener(event) {
    selectedListener = { ...selectedAlb.Listeners[event.target.value] };
    $stackConfig.selectedListenerArn = selectedListener.ListenerArn;
    $stackConfig.selectedPort = selectedListener.Port;
  }

  let selectedTarget;
  function selectTargetGroup(event) {
    selectedTarget = { ...selectedAlb.Targets[event.target.value] };
    $stackConfig.TargetGroupArn = selectedTarget.TargetGroupArn;
  }

  let selectedInstance;
  function selectInstance(event) {
    selectedInstance = { ...selectedTarget.Instances[event.target.value] };
    $stackConfig.vpcId = selectedInstance.VpcId;
    $stackConfig.securityGroupIds = selectedInstance.SecurityGroups.map(
      (sg) => ({
        groupId: sg.GroupId,
      })
    );
  }

  let stackName;
  $: $stackConfig.stackName = stackName;

  let stackDescription;
  $: $stackConfig.stackDescription = stackDescription;

  let keyPair;
  $: $stackConfig.keyPair = keyPair;

  let subFormComplete;
  function submitSubForm() {
    subFormComplete = true;
  }
</script>
<div class={format.rowClass}>
  <div class="flex flex-col w-5/12">
    <label for="stackName" class={format.labelClass}>Canary Stack Title</label>
    <input
      id="stackName"
      class={format.fieldClass}
      bind:value={stackName}
      placeholder="Enter Title"
      required
    />
  </div>
  <div class="flex flex-col flex-grow">
    <label for="stackName" class={format.labelClass}>
      Canary Stack Description
    </label>
    <input
      id="stackName"
      class={format.fieldClass}
      bind:value={stackDescription}
      placeholder="Enter Description"
      required
    />
  </div>
</div>
<div class={format.rowClass}>
  <div class="w-1/3">
    <label class={format.labelClass} for="load-balancer"> Load Balancer </label>
    <select
      class={format.fieldClass + ' w-full'}
      id="load-balancer"
      on:change={selectAlb}
      disabled={!nonCanaryLoadBalancers.length}
      required
    >
      <option value="" selected disabled hidden>Select ALB</option>
      {#if nonCanaryLoadBalancers && nonCanaryLoadBalancers.length}
        <optgroup label="Load Balancer ID">
          {#each nonCanaryLoadBalancers as alb, idx}
            <option value={`${idx}`}>{alb.LoadBalancerName}</option>
          {/each}
        </optgroup>
      {/if}
    </select>
  </div>
  <div>
    <label class={format.labelClass + ' w-1/12'} for="listener">Port</label>
    <select
      class={format.fieldClass}
      id="listener"
      on:change={selectListener}
      disabled={!selectedAlb}
      required
    >
      <option value="none" selected disabled hidden>Select Port</option>
      {#if selectedAlb}
        {#each selectedAlb.Listeners as listener, idx}
          <option value={`${idx}`}>{listener.Port}</option>
        {/each}
      {/if}
    </select>
  </div>
</div>
<div class={format.rowClass}>
  <div class=" w-1/3">
    <label class={format.labelClass} for="target-group"> Target Group </label>
    <select
      class={format.fieldClass}
      id="target-group"
      on:change={selectTargetGroup}
      disabled={!selectedListener}
      required
    >
      <option value="none" selected disabled hidden>Select Target Group</option>
      {#if selectedListener}
        {#each selectedAlb.Targets as targetGroup, idx}
          {#if targetGroup.Port === selectedListener.Port}
            <option value={`${idx}`}>{targetGroup.TargetGroupName}</option>
          {/if}
        {/each}
      {/if}
    </select>
  </div>
  <div class="w-1/3">
    <label class={format.labelClass} for="instance">Instance</label>
    <select
      class={format.fieldClass}
      id="instance"
      on:change={selectInstance}
      disabled={!selectedTarget}
      required
    >
      <option value="none" selected disabled hidden>Select Instance</option>
      {#if selectedTarget}
        {#each selectedTarget.Instances as instance, idx}
          <option value={`${idx}`}>{instance.instanceId}</option>
        {/each}
      {/if}
    </select>
  </div>
  <div class="w-1/3">
    <label class={format.labelClass} for="instance">Instance KeyPair</label>
    <input
      class={format.fieldClass}
      bind:value={keyPair}
      disabled={!selectedInstance}
      placeholder="Provide AWS KeyPair"
      required
    />
  </div>
</div>