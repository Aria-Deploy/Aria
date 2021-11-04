import * as cdk from "@aws-cdk/core";
import { CloudFormationDeployments } from "aws-cdk/lib/api/cloudformation-deployments";
export declare class StackApp extends cdk.Stack {
    private stackArtifact;
    private app;
    get availabilityZones(): string[];
    synthesizeStack(): Promise<void>;
    createNewCfnDeploy(): Promise<CloudFormationDeployments>;
    deploy(): Promise<void>;
    constructor(source: cdk.App, id: string, props?: cdk.StackProps);
}
