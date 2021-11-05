<script>
	import { userProfiles, selectedProfileStacks, selectedAccStack } from '../stores';
	import axios from 'axios';

	const apiRoute = `http://localhost:5000/api`;

	async function getStacks(event) {
		const selectedProfile = $userProfiles[event.target.value];
		const apiURI = `http://localhost:5000/api/stacks/${selectedProfile}`;

		const response = await axios(apiURI);
		const responseStacksInfo = response.data;

		selectedAccStack.set({
			profile: selectedProfile,
			stacks: {}
		});
		selectedProfileStacks.set(responseStacksInfo);
	}

	async function selectStack(event) {
		const selectedStack = $selectedProfileStacks[event.target.value];
		const apiURI = `${apiRoute}/deploy`;
		const response = await axios.post(apiURI, {
			stackId: selectedStack.StackId
		});
    console.log(response.data)
	}
</script>

<div id="stack-selection">
	<select class="form-select" on:change={getStacks}>
		<option value="none" selected disabled hidden>Select AWS Profile</option>
		{#each $userProfiles as profile, idx}
			<option value={`${idx}`}>{profile}</option>
		{/each}
	</select>
	<select class="form-select" on:change={selectStack} disabled={!$selectedProfileStacks.length}>
		<option value="none" selected disabled hidden>Select Stack</option>
		{#each $selectedProfileStacks as stack, idx}
			<option value={`${idx}`}>{stack.StackName}</option>
		{/each}
	</select>
</div>

<style>
	#stack-selection {
		width: 50%;
		display: flex;
		padding: 10px;
		gap: 20px;
	}
</style>
