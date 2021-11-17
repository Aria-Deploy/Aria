import * as cdk from "@aws-cdk/core";
import { ExistingStack } from "./existng_stack";
export declare class OriginalStack extends ExistingStack {
    constructor(source: cdk.App, id: string, stackConfig: any, props?: cdk.StackProps);
}
