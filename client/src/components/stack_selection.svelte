<script>
	import { userProfiles, selectedAccStack, profileResourceData } from '../stores';
	import { Button } from 'sveltestrap';
	import axios from 'axios';

	const apiRoute = `http://localhost:5000/api`;
	let profileName, selectedAlb, selectedListener, selectedTarget, selectedInstance;
	let rollbackDisabled = true,
		deployDisabled = true,
		resourcesDisabled = true;

	async function getResourcesData(event) {
		const selectedProfile = $userProfiles[event.target.value];

		const apiURI = `${apiRoute}/resources-data/${selectedProfile}`;
		const response = await axios(apiURI);
		const profileResourceDataRes = response.data;

		profileResourceData.set(profileResourceDataRes);
		console.log(profileResourceDataRes);
	}

	function selectAlb(event) {
		selectedAlb = { ...$profileResourceData[event.target.value] };
	}

	function selectListener(event) {
		selectedListener = { ...selectedAlb.Listeners[event.target.value] };
	}

	function selectTargetGroup(event) {
		selectedTarget = { ...selectedAlb.Targets[event.target.value] };
	}

	function selectInstance(event) {
		selectedInstance = { ...selectedTarget.Instances[event.target.value] };
		deployDisabled = false;
	}

	// function setDeployRollback() {
	// 	if (selectedVpc && selectedAlb) {
	// 		deployDisabled = selectedStack.isCanary;
	// 		rollbackDisabled = !deployDisabled;
	// 	}
	// }

	// function setVpc(event) {
	// 	selectedVpc = event.target.value;
	// 	setDeployRollback();
	// }

	// function setAlb(event) {
	// 	selectedAlb = event.target.value;
	// 	setDeployRollback();
	// }

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
								TargetGroupArn: "Insert Canary Target ARN",
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
			Tags: [{ Key: 'isAriaCanaryRule' }]
		};

		const response = await axios.put(apiURI, {
			profileName,
			vpcId: selectedInstance.VpcId,
			selectedAlbName: selectedAlb.LoadBalancerName,
			securityGroupIds,
      newRuleConfig
		});
		console.log(response.data);
	}

	async function rollbackCanary() {
		const apiURI = `${apiRoute}/rollback-canary`;
		const response = await axios.put(apiURI, {
			profileName: $selectedAccStack.profile,
			stackName: selectedStack.stackName,
			stackId: selectedStack.stackId
		});
		console.log(response.data);
	}
</script>

<div class="selectionA">
	<select class="form-select" on:change={getResourcesData}>
		<option value="none" selected disabled hidden>Select AWS Profile</option>
		{#each $userProfiles as profile, idx}
			<option value={`${idx}`}>{profile}</option>
		{/each}
	</select>
	<select class="form-select" on:change={selectAlb} disabled={!$profileResourceData.length}>
		<option value="none" selected disabled hidden>Select ALB</option>
		{#each $profileResourceData as alb, idx}
			<option value={`${idx}`}>{alb.LoadBalancerName}</option>
		{/each}
	</select>
</div>
<div class="selectionB">
	<select class="form-select" on:change={selectListener} disabled={!selectedAlb}>
		<option value="none" selected disabled hidden>Select Port</option>
		{#if selectedAlb}
			{#each selectedAlb.Listeners as listener, idx}
				<option value={`${idx}`}>{listener.Port}</option>
			{/each}
		{/if}
	</select>
	<select class="form-select" on:change={selectTargetGroup} disabled={!selectedListener}>
		<option value="none" selected disabled hidden>Select Target Group</option>
		{#if selectedListener}
			{#each selectedAlb.Targets as targetGroup, idx}
				{#if targetGroup.Port === selectedListener.Port}
					<option value={`${idx}`}>{targetGroup.TargetGroupName}</option>
				{/if}
			{/each}
		{/if}
	</select>
	<select class="form-select" on:change={selectInstance} disabled={!selectedTarget}>
		<option value="none" selected disabled hidden>Select Target Group</option>
		{#if selectedTarget}
			{#each selectedTarget.Instances as instance, idx}
				<option value={`${idx}`}>{instance.instanceId}</option>
			{/each}
		{/if}
	</select>
</div>
<div class="selectionA">
	<Button color="primary" disabled={deployDisabled} on:click={deployCanary}>Deploy</Button>
	<Button class="bg-primary" disabled={rollbackDisabled} on:click={rollbackCanary}>Rollback</Button>
</div>

<style>
	.selectionA {
		width: 50%;
		display: flex;
		padding: 10px;
		gap: 20px;
	}

	.selectionB {
		width: 75%;
		display: flex;
		padding: 10px;
		gap: 20px;
	}
</style>
