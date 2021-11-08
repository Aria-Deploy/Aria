import { CloudFormationClient } from "@aws-sdk/client-cloudformation";
export declare const getCfnClient: () => CloudFormationClient;
export declare function clientsInit(profileName: string): Promise<void>;
export declare function fetchAwsProfilesInfo(): Promise<any>;
export declare function fetchStacksInfo(): Promise<{
    stackName: string | undefined;
    stackId: string | undefined;
    isCanary: boolean;
}[]>;
export declare function fetchStackVpcConfig(stackId: string): Promise<{
    vpcId: string;
    availabilityZones: string[];
    publicSubnetIds: string[];
    privateSubnetIds: string[];
}>;
export declare function setConfigVpcId(stackId: string): Promise<void>;
export declare function setAzPubPrivSubnets(): Promise<void>;
export declare function fetchStackTemplate(stackId: string): Promise<unknown>;
export declare function fetchStackMetaData(stackId: string): Promise<import("@aws-sdk/client-cloudformation/dist-types/").StackInstance | undefined>;
