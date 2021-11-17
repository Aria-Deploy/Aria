<script>
	import axios from 'axios';
	import CreateCanary from '../components/create_canary.svelte';
	import DestroyCanary from '../components/destroy_canary.svelte';
	import { userProfiles } from '../stores.js';

	async function getAccounts() {
		const response = await axios('http://localhost:5000/api/profiles');
		const responseAccs = response.data;
    console.log(responseAccs);
		userProfiles.set(responseAccs);
		return responseAccs;
	}
	const promise = getAccounts();
</script>

<svelte:head>
	<title>ARIA</title>
</svelte:head>

<h1>Aria API Test GUI</h1>

{#await promise then value}
	<CreateCanary />
  <br /><br />
	<DestroyCanary />
{/await}

<style>
	h1 {
		padding: 4px;
	}
</style>
