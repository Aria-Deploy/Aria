<script>
  import { destroyCanaryStack, getResourceData } from "$lib/api_interface";
  import { selectedAwsProfile } from "../../stores";

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
    { text: "Referee", link: outputs.refereeDNS },
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
    await getResourceData($selectedAwsProfile);
  }
</script>

<form class="w-full">
  <fieldset class="border border-solid border-aria-silver rounded-md p-3">
    <legend class="text-gray-500 text-sm italic">Deployment Implementation</legend>
    <div class="flex -mx-3 pt-1">
      {#each stackInfoFieldsRow1 as infoObj}
        <div class="flex-grow w-full px-3 mb-2">
          <label
            class="block uppercase tracking-wide text-aria-green text-xs font-bold text-opacity-70 mb-2"
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
  </fieldset>
  <fieldset class="border border-solid border-aria-silver rounded-md p-3 mt-4">
    <legend class="text-gray-500 text-sm italic">Canary Analysis & Monitoring</legend>
    <div class="p-1 gap-3 w-full flex flex-row justify-evenly">
      {#each monitoringLinks as linkObj}
        <div>
          <button
            class="text-aria-teal opacity-70 text-lg border-2 shadow border-aria-silver rounded-md font-medium px-3 py-1 hover:bg-aria-teal hover:bg-opacity-90 hover:scale-101 hover:text-aria-black mr-1 mb-1 ease-linear transition-all duration-150"
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
      class="p-2 bg-aria-orange border-2 border-aria-orange opacity-80 font-semibold text-white rounded-md shadow-xl hover:shadow-2xl hover:opacity-100 hover:border-red-700 hover:scale-101 transition duration-500"
      on:click={destroyStack}
    >
      DESTROY
    </button>
  </div>
</div>
