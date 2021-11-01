import * as cdk from "@aws-cdk/core";
export declare class StackApp extends cdk.Stack {
    private stackArtifact;
    app: cdk.App;
    get availabilityZones(): string[];
    synthesizeStack(): Promise<void>;
    deploy(): Promise<void>;
    constructor(id: string, props?: cdk.StackProps);
}
