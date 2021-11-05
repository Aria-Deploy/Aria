import * as cdk from "@aws-cdk/core";
import * as cxapi from "@aws-cdk/cx-api";
import { SdkProvider } from "aws-cdk/lib/api/aws-auth";
import { CloudFormationDeployments } from "aws-cdk/lib/api/cloudformation-deployments";

export class ExistingStack extends cdk.Stack {
  private stackArtifact: cxapi.CloudFormationStackArtifact;
  private app: cdk.App;

  get availabilityZones(): string[] {
    // TODO: Map to VPC availability zone(s)
    return ["us-west-2a"];
  }

  async synthesizeStack() {
    this.stackArtifact = this.app.synth().getStackByName(this.stackName);
  }

  async createNewCfnDeploy(): Promise<CloudFormationDeployments> {
    // USER-INPUT: Optional Profile Name or Default
    const sdkProvider = await SdkProvider.withAwsCliCompatibleDefaults({
      // profile: 'your ~/.aws/config profile name here',
      profile: "default",
    });

    return new CloudFormationDeployments({ sdkProvider });
  }

  async deploy() {
    await this.synthesizeStack();
    const cloudFormation = await this.createNewCfnDeploy();
    const deployResultPromise = await cloudFormation.deployStack({
      // TODO: Address CloudFormationStackArtifact separate definitions
      // @ts-ignore
      stack: this.stackArtifact,
    });

    console.log(deployResultPromise);

    const destroyPromise = await cloudFormation.destroyStack({
      // TODO: Address CloudFormationStackArtifact separate defintions
      // @ts-ignore
      stack: this.stackArtifact,
    });
    console.log(destroyPromise);
  }

  constructor(source: cdk.App, id: string, props?: cdk.StackProps) {
    super(source, id, props);
    this.app = source;
  }
}
