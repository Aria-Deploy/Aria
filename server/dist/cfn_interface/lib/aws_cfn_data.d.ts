import { CloudFormationClient } from "@aws-sdk/client-cloudformation";
export declare const getCfnClient: () => CloudFormationClient;
export declare function clientsInit(profileName: string): Promise<void>;
export declare function fetchAwsProfilesInfo(): Promise<any>;
export declare function fetchAwsStackInfo(): Promise<import("@aws-sdk/client-cloudformation/dist-types/").StackSummary[] | undefined>;
export declare function fetchStackVpcConfig(stackId: string): Promise<{
    vpcId: string;
    availabilityZones: string[];
    publicSubnetIds: string[];
    privateSubnetIds: string[];
}>;
export declare function setConfigVpcId(stackId: string): Promise<void>;
export declare function setAzPubPrivSubnets(): Promise<void>;
export declare function fetchStackTemplate(stackId: string): Promise<unknown>;
