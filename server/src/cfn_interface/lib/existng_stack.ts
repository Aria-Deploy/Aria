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
  constructor(
    source: cdk.App,
    id: string,
    stackConfig: any,
    props?: cdk.StackProps
  ) {
    super(source, id, props);
    this.profileName = stackConfig.profileName;
    this.app = source;

    fs.writeFileSync(
      "./cdk.out/ExistingStack.template.json",
      JSON.stringify(stackConfig.template, null, 2)
    );

    const template = new cfninc.CfnInclude(this, "Template", {
      templateFile: "./cdk.out/ExistingStack.template.json",
    });
  }
}
