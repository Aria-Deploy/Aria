<script>
  import axios from 'axios'
	import StackSelection from '../components/stack_selection.svelte';
	import { userProfiles } from '../stores.js';

	async function getAccounts() {
		const response = await axios('http://localhost:5000/api/profiles');
		const responseAccs = response.data;
		userProfiles.set(responseAccs);
    return responseAccs
	}
	const promise = getAccounts();
</script>

<svelte:head>
	<title>ARIA</title>
</svelte:head>

<h1>Aria</h1>

{#await promise then value}
	<StackSelection />
{/await}
<style>
	h1 {
		padding: 4px;
	}
</style>
