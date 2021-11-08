import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import { CloudFormationDeployments } from "aws-cdk/lib/api/cloudformation-deployments";
export declare class ExistingStack extends cdk.Stack {
    private stackArtifact;
    private app;
    private vpcConfig;
    private profileName;
    vpc: ec2.IVpc;
    get availabilityZones(): string[];
    synthesizeStack(): void;
    createNewCfnDeploy(): Promise<CloudFormationDeployments>;
    deploy(): Promise<import("aws-cdk/lib/api/deploy-stack").DeployStackResult>;
    constructor(id: string, stackConfig: any, props?: cdk.StackProps);
}
