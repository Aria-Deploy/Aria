import * as ec2 from "@aws-cdk/aws-ec2";
import * as cdk from "@aws-cdk/core";
import * as elbv2 from "@aws-cdk/aws-elasticloadbalancingv2";
interface CanaryNestedStackProps extends cdk.NestedStackProps {
    vpc: ec2.IVpc;
    alb: elbv2.IApplicationLoadBalancer;
}
export declare class CanaryNestedStack extends cdk.NestedStack {
    readonly canaryTargetGroup: elbv2.ApplicationTargetGroup;
    constructor(scope: cdk.Construct, id: string, props: CanaryNestedStackProps);
}
export {};
