import * as cdk from "@aws-cdk/core";
import { ExistingStack } from "./existing_stack";
export declare class CanaryStack extends ExistingStack {
    constructor(source: cdk.App, id: string, stackConfig: any, props?: cdk.StackProps);
}
