import * as cdk from "@aws-cdk/core";
import * as cxapi from "@aws-cdk/cx-api";
import { SdkProvider } from "aws-cdk/lib/api/aws-auth";
import { CloudFormationDeployments } from "aws-cdk/lib/api/cloudformation-deployments";

export class StackApp extends cdk.Stack {
  private stackArtifact: cxapi.CloudFormationStackArtifact;
  public app: cdk.App;

  get availabilityZones(): string[] {
    // TODO: Map to VPC availability zone(s)
    return ["us-east-1c"];
  }

  public async synthesizeStack() {
    this.stackArtifact = this.app.synth().getStackByName(this.stackName);
  }

  async deploy() {
    await this.synthesizeStack();
    // USER-INPUT: Optional Profile Name or Default
    const sdkProvider = await SdkProvider.withAwsCliCompatibleDefaults({
      // profile: 'your ~/.aws/config profile name here',
      profile: "default",
    });

    const cloudFormation = new CloudFormationDeployments({ sdkProvider });
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

  constructor(id: string, props?: cdk.StackProps) {
    const app = new cdk.App();
    super(app, id, props);
    this.app = app;
  }
}
