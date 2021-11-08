import * as cdk from "@aws-cdk/core";
import * as cxapi from "@aws-cdk/cx-api";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as cfninc from "@aws-cdk/cloudformation-include";
import * as fs from "fs";
import { SdkProvider } from "aws-cdk/lib/api/aws-auth";
import { CloudFormationDeployments } from "aws-cdk/lib/api/cloudformation-deployments";
import { VpcAttributes } from "@aws-cdk/aws-ec2";

export class ExistingStack extends cdk.Stack {
  private stackArtifact: cxapi.CloudFormationStackArtifact;
  private app: cdk.App;
  private vpcConfig: VpcAttributes;
  private profileName: string;
  public vpc: ec2.IVpc;

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
    });

    return deployResultPromise;
  }

  // TODO: define stackConfig type
  constructor(id: string, stackConfig: any, props?: cdk.StackProps) {
    const app = new cdk.App();
    super(app, id, props);
    this.profileName = stackConfig.profileName;
    this.app = app;

    fs.writeFileSync(
      "./cdk.out/stack.template.json",
      JSON.stringify(stackConfig.template, null, 2)
    );

    new cfninc.CfnInclude(this, "Template", {
      templateFile: "./cdk.out/stack.template.json",
    });
  }
}
