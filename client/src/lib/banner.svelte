<script>
  import Modal from "$lib/modal.svelte"

  let showModal = false

  const handleToggleModal = () => {
    showModal = !showModal
  }

  function selectAlb(event) {
		// selectedAlb = { ...$profileResourceData[event.target.value] };
	}

	function selectListener(event) {
		// selectedListener = { ...selectedAlb.Listeners[event.target.value] };
	}

	function selectTargetGroup(event) {
		// selectedTarget = { ...selectedAlb.Targets[event.target.value] };
	}

	function selectInstance(event) {
		// selectedInstance = { ...selectedTarget.Instances[event.target.value] };
		// deployDisabled = false;
	}
  
	async function deployCanary() {
		const apiURI = `${apiRoute}/deploy-canary`;
		const securityGroupIds = selectedInstance.SecurityGroups.map((sg) => ({
			groupId: sg.GroupId
		}));
		const newRuleConfig = {
			Actions: [
				{
					Type: 'forward',
					ForwardConfig: {
						TargetGroupStickinessConfig: {
							Enabled: false
						},
						TargetGroups: [
							{
								TargetGroupArn: selectedTarget.TargetGroupArn,
								Weight: 50
							},
							{
								TargetGroupArn: 'Insert Canary Target ARN',
								Weight: 50
							}
						]
					}
				}
			],
			Conditions: [
				{
					Field: 'http-request-method',
					HttpRequestMethodConfig: {
						Values: ['GET']
					}
				}
			],
			ListenerArn: selectedListener.ListenerArn,
			Priority: 1,
			Tags: [{ Key: 'isAriaCanaryRule', Value: selectedAlb.LoadBalancerName }]
		};
		const response = await axios.put(apiURI, {
			profileName,
			vpcId: selectedInstance.VpcId,
			selectedAlbName: selectedAlb.LoadBalancerName,
			selectedListenerArn: selectedListener.ListenerArn,
			securityGroupIds,
			newRuleConfig
		});
		console.log(response.data);
	}
</script>

<div class="bg-blue-50 flex flex-row px-9 py-12 shadow">
  <div class="flex-grow">
    <div class="text-left text-2xl">
      <div class="text-regal-blue text-4xl font-bold">Canary Deployment</div>
      <div class="text-blue-500">Blahblahblah.</div>
    </div>
  </div>

  <div class="flex-shrink">
    <button on:click={() => handleToggleModal()} class="py-2 px-4 bg-blue-600 text-white rounded-md shadow-xl hover:shadow-2xl hover:bg-blue-700 transition duration-500">
      Create New
    </button>
  </div>
</div>

<Modal title="Edit your details" open={showModal} on:close={() => handleToggleModal()}>
  <svelte:fragment slot="body">
    This is content inside my modal! 👋
  </svelte:fragment>
</Modal>
