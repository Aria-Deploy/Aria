<script>
	import { userProfiles, selectedProfileStacks, selectedAccStack } from '../stores';
	import { Button } from 'sveltestrap';
	import axios from 'axios';

	const apiRoute = `http://localhost:5000/api`;
	let selectedStack;
	let rollbackDisabled = true,
		deployDisabled = true;

	async function getStacks(event) {
		const selectedProfile = $userProfiles[event.target.value];
		const apiURI = `http://localhost:5000/api/stacks/${selectedProfile}`;

		const response = await axios(apiURI);
		const responseStacksInfo = response.data;

		selectedAccStack.set({
			profile: selectedProfile,
			stacks: []
		});
		selectedProfileStacks.set(responseStacksInfo);
	}

	async function selectStack(event) {
		selectedStack = $selectedProfileStacks[event.target.value];
		deployDisabled = selectedStack.isCanary;
		rollbackDisabled = !deployDisabled;
	}

	async function deployCanary() {
		const apiURI = `${apiRoute}/deploy-canary`;
		const response = await axios.put(apiURI, {
			profileName: $selectedAccStack.profile,
			stackName: selectedStack.stackName,
			stackId: selectedStack.stackId
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

<div class="stack-selection">
	<select class="form-select" on:change={getStacks}>
		<option value="none" selected disabled hidden>Select AWS Profile</option>
		{#each $userProfiles as profile, idx}
			<option value={`${idx}`}>{profile}</option>
		{/each}
	</select>
	<select class="form-select" on:change={selectStack} disabled={!$selectedProfileStacks.length}>
		<option value="none" selected disabled hidden>Select Stack</option>
		{#each $selectedProfileStacks as stack, idx}
			{#if stack.stackName !== 'CDKToolkit'}
				<option value={`${idx}`}>{stack.stackName}</option>
			{/if}
		{/each}
	</select>
</div>
<div class="stack-selection">
	<Button color="primary" disabled={deployDisabled} on:click={deployCanary}>Deploy</Button>
	<Button class="bg-primary" disabled={rollbackDisabled} on:click={rollbackCanary}>Rollback</Button>
</div>

<style>
	.stack-selection {
		width: 50%;
		display: flex;
		padding: 10px;
		gap: 20px;
	}
</style>
