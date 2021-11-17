<script>
	import { profileStacks, selectedProfile } from '../stores';
	import { Button } from 'sveltestrap';
	import * as axios from 'axios';

	let selectedStack;
	const apiRoute = `http://localhost:5000/api`;

	function selectStack(event) {
		selectedStack = $profileStacks[event.target.value];
	}
	async function destroyCanary() {
		const response = await axios.put(`${apiRoute}/destroy-canary`, {
			profileName: $selectedProfile,
			stackName: selectedStack.stackName,
			stackArn: selectedStack.stackArn,
			canaryRuleArn: selectedStack.canaryRule.RuleArn
		});
		console.log(response.data);
	}
</script>

<div class="selectionA">
	<select class="form-select" on:change={selectStack} disabled={!$profileStacks.length}>
		<option value="none" selected disabled hidden>Select Canary Stack</option>
		{#if $profileStacks.length}
			{#each $profileStacks as canaryStack, idx}
				{#if canaryStack.isCanary}
					<option value={`${idx}`}>{canaryStack.stackName}</option>
				{/if}
			{/each}
		{/if}
	</select>
</div>
<div class="selectionA">
	<Button disabled={!selectedStack} on:click={destroyCanary}>Destroy</Button>
</div>

<style>
	.selectionA {
		width: 35%;
		padding: 10px;
		gap: 10px;
	}
</style>
