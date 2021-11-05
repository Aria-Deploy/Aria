import * as cdk from "@aws-cdk/core";
import { StackApp } from "./xxx__stackApp";
export declare class ExistingStack extends StackApp {
    static importExistingStack(): void;
    constructor(source: cdk.App, id: string, props?: cdk.StackProps);
}
