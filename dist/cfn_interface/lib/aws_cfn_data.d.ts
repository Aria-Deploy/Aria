import * as clientEc2 from "@aws-sdk/client-ec2";
export declare const getEnv: () => {
    account: string;
    region: string;
};
export declare function clientsInit(profileName: string): Promise<void>;
export declare function getVpcsInfo(): Promise<clientEc2.Vpc[] | undefined>;
export declare function getLoadBalancerInfo(): Promise<any[]>;
export declare function fetchAccountInfo(profileName: string): Promise<void>;
export declare function fetchProfilesInfo(): Promise<any>;
export declare function fetchStacksInfo(): Promise<{
    stackName: string | undefined;
    stackArn: string | undefined;
    stackOutputs: import("@aws-sdk/client-cloudformation/dist-types/").Output[];
    isCanary: boolean;
    listenerArn: string | undefined;
    canaryRule: undefined;
}[]>;
export declare function setAzPubPrivSubnets(vpcId: string): Promise<any>;
export declare function fetchStackTemplate(stackId: string): Promise<unknown>;
export declare function createListenerRule(newRuleConfig: any): Promise<import("@aws-sdk/client-elastic-load-balancing-v2/dist-types/").CreateRuleCommandOutput>;
export declare function deleteListenerRule(RuleArn: any): Promise<import("@aws-sdk/client-elastic-load-balancing-v2/dist-types/").DeleteRuleCommandOutput>;
