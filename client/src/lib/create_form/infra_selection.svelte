<script>
  import { resourceData } from "../../stores";
  export let format, setStackConfig;

  let selectedAlb;
  function selectAlb(event) {
    selectedAlb = JSON.parse(JSON.stringify($resourceData[event.target.value]));
    setStackConfig("selectedAlbName", selectedAlb.LoadBalancerName);
    setStackConfig("selectedAlbArn", selectedAlb.LoadBalancerArn);
  }

  let selectedListener;
  function selectListener(event) {
    selectedListener = { ...selectedAlb.Listeners[event.target.value] };
    setStackConfig("selectedListenerArn", selectedListener.ListenerArn);
    setStackConfig("selectedPort", selectedListener.Port);
  }

  let selectedTarget;
  function selectTargetGroup(event) {
    selectedTarget = { ...selectedAlb.Targets[event.target.value] };
    setStackConfig('TargetGroupArn', selectedTarget.TargetGroupArn)
  }

  let selectedInstance;
  function selectInstance(event) {
    selectedInstance = { ...selectedTarget.Instances[event.target.value] };
    setStackConfig("vpcId", selectedInstance.VpcId);
    setStackConfig(
      "securityGroupIds",
      selectedInstance.SecurityGroups.map((sg) => ({
        groupId: sg.GroupId,
      }))
    );
  }

  let keyPair;
  $: setStackConfig("keyPair", keyPair);
</script>

<div class={format.rowClass}>
  <div>
    <label class={format.labelClass} for="load-balancer"> Load Balancer </label>
    <select
      class={format.fieldClass}
      id="load-balancer"
      on:change={selectAlb}
      disabled={!$resourceData.length}
      required
    >
      <option value="" selected disabled hidden>Select ALB</option>
      {#if $resourceData && $resourceData.length}
        <optgroup label="Load Balancer ID">
          {#each $resourceData as alb, idx}
            <option value={`${idx}`}>{alb.LoadBalancerName}</option>
          {/each}
        </optgroup>
      {/if}
    </select>
  </div>
  <div>
    <label class={format.labelClass} for="listener"> Listener </label>
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
  <div>
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
  <div>
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
  <div>
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
