import * as cdk from "@aws-cdk/core";
import * as cxapi from "@aws-cdk/cx-api";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as cfninc from "@aws-cdk/cloudformation-include";
import * as fs from "fs";
import { SdkProvider } from "aws-cdk/lib/api/aws-auth";
import { CloudFormationDeployments } from "aws-cdk/lib/api/cloudformation-deployments";
import { VpcAttributes } from "@aws-cdk/aws-ec2";
import { CloudFormation } from "aws-sdk";

export class ExistingStack extends cdk.Stack {
  private stackArtifact: cxapi.CloudFormationStackArtifact;
  private app: cdk.App;
  private vpcConfig: VpcAttributes;
  private profileName: string;
  public vpc: ec2.IVpc;
  public importedTemplate: cfninc.CfnInclude;

  get availabilityZones(): string[] {
    return this.vpcConfig.availabilityZones;
  }

  synthesizeStack() {
    this.stackArtifact = this.app.synth().getStackByName(this.stackName);
  }

  async createNewCfnDeploy(): Promise<CloudFormationDeployments> {
    // USER-INPUT: Optional Profile Name or Default
    const sdkProvider = await SdkProvider.withAwsCliCompatibleDefaults({
      // profile: 'your ~/.aws/config profile name here',
      profile: this.profileName,
    });

    return new CloudFormationDeployments({ sdkProvider });
  }

  async deploy() {
    this.synthesizeStack();
    const cloudFormation = await this.createNewCfnDeploy();
    const deployResultPromise = await cloudFormation.deployStack({
      // TODO: Address CloudFormationStackArtifact separate definitions
      // @ts-ignore
      stack: this.stackArtifact,
      usePreviousParameters: true,
    });

    return deployResultPromise;
  }

  async destroy() {
    this.synthesizeStack();
    const cloudFormation = await this.createNewCfnDeploy();
    await cloudFormation.destroyStack({
      // @ts-ignore
      stack: this.stackArtifact,
      usePreviousParameters: true,
    });

    return {
      destroyResult: "Stack Destroyed Successfully",
    };
  }

  // TODO: define stackConfig type
  constructor(
    source: cdk.App,
    id: string,
    stackConfig: any,
    props?: cdk.StackProps
  ) {
    super(source, id, props);
    console.log('stackConfig in existing stack: ', stackConfig);
    this.app = source;
    this.profileName = stackConfig.profileName;

    if (stackConfig.template) {
      fs.writeFileSync(
        "./cdk.out/stack.template.json",
        JSON.stringify(stackConfig.template, null, 2)
      );

      this.importedTemplate = new cfninc.CfnInclude(this, "Template", {
        templateFile: "./cdk.out/stack.template.json",
      });
    }
  }
}
