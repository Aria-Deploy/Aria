<script>
  import { destroyCanaryStack } from "$lib/api_interface";
  export let stackInfo;
  let { config, canaryRule, outputs } = stackInfo;

  const ruleConfig = canaryRule.Actions[0].ForwardConfig;
  const canaryWeight = ruleConfig.TargetGroups.reduce((acc, { Weight }) => {
    return Weight < acc ? Weight : acc;
  }, 100);

  const stackInfoFieldsRow1 = [
    { title: "VPC ID", text: config.vpcId },
    { title: "LOAD BALANCER", text: config.selectedAlbName },
    { title: "PORT", text: config.selectedPort },
    { title: "CANARY % TRAFFIC", text: canaryWeight },
  ];

  const monitoringLinks = [
    { text: "Grafana", link: outputs.grafanaDNS },
    { text: "Refree", link: outputs.refereeDNS },
    { text: "Prometheus", link: outputs.prometheusDNS },
    { text: "Kayenta API", link: outputs.kayentaDNS },
  ];

  async function destroyStack() {
    const destroyCanaryRes = await destroyCanaryStack({
      profileName: config.profileName,
      stackName: config.awsStackName,
      stackArn: config.stackArn,
      canaryRuleArn: canaryRule.RuleArn,
    });
    console.log(destroyCanaryRes);
  }
</script>

<form class="w-full mt-3">
  <div class="flex -mx-3">
    {#each stackInfoFieldsRow1 as infoObj}
      <div class="flex-grow w-full px-3 mb-3">
        <label
          class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
          for="grid-first-name"
        >
          {infoObj.title}
        </label>
        <input
          disabled
          class="appearance-none block w-full bg-gray-100 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
          id="grid-first-name"
          type="text"
          placeholder={infoObj.text}
        />
      </div>
    {/each}
  </div>
  <fieldset class="border border-solid border-gray-200 rounded-md p-3 mt-4">
    <legend class="text-gray-500">Deployment Analysis</legend>
    <div class="p-1 gap-3 w-full flex flex-row justify-evenly">
      {#each monitoringLinks as linkObj}
        <div>
          <button
            class="text-blue-600 opacity-70 text-lg border-2 shadow border-gray-200 rounded-md font-medium px-3 py-1 hover:bg-blue-200 hover:scale-101 hover:border-blue-300 hover:text-blue-900 mr-1 mb-1 ease-linear transition-all duration-150"
            type="button"
          >
            <a
              href={linkObj.link}
              target="_blank"
              rel="noreferrer noopener"
              class="link">{linkObj.text}</a
            >
          </button>
        </div>
      {/each}
    </div>
  </fieldset>
</form>
<div class="flex flex-row-reverse mt-8">
  <div class="flex-shrink">
    <button
      class="py-2 px-4 bg-red-400 font-bold text-white rounded-md shadow-xl hover:shadow-2xl hover:bg-red-600 hover:scale-101 transition duration-500"
      on:click={destroyStack}
    >
      DESTROY
    </button>
  </div>
</div>
