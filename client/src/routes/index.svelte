<script>
	import StackSelection from '../components/stack_selection.svelte';
	import { userProfiles } from '../stores.js';

	async function getAccounts() {
		const response = await fetch('http://localhost:5000/api/profiles');
		const responseAccs = await response.json();
		userProfiles.set(responseAccs);
    return responseAccs
	}
	const promise = getAccounts();
</script>

<svelte:head>
	<title>ARIA</title>
</svelte:head>

<h1>Aria</h1>

<!-- {#if $userProfiles} -->
{#await promise then value}
	<StackSelection />
<!-- {/if} -->
{/await}
<style>
	h1 {
		padding: 4px;
	}
</style>
