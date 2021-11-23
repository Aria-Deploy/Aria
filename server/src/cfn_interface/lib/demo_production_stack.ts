import * as autoscaling from '@aws-cdk/aws-autoscaling';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import * as cdk from '@aws-cdk/core';
import * as cxapi from "@aws-cdk/cx-api";
// import { ExistingStack } from "./existing_stack";
import { CloudFormationDeployments } from "aws-cdk/lib/api/cloudformation-deployments";
import { SdkProvider } from "aws-cdk/lib/api/aws-auth";

export class CdkDemoProductionStack extends cdk.Stack {
  constructor(
    scope: cdk.App, 
    id: string,     
    stackConfig: any,
    props?: cdk.StackProps      
  ) {
    super(scope, id, props);
    this.app = scope;
    this.profileName = stackConfig.profileName;
    // vpc
    const vpc = new ec2.Vpc(this, 'vpc', {natGateways: 1});

    // application load balancer
    const alb = new elbv2.ApplicationLoadBalancer(this, 'alb-aria-demo', {
      vpc,
      internetFacing: true,
    });

    const listener = alb.addListener('Listener', {
      port: 80,
      open: true,
    });

    // ec2 instance user data
    const demoProductionData = ec2.UserData.forLinux();

    demoProductionData.addCommands(
      'sudo su',
      'yum install -y httpd',
      'systemctl start httpd',
      'systemctl enable httpd',
      'echo "<h1>Hello World from $(hostname -f) and DEMO PRODUCTION 1</h1>" > /var/www/html/index.html',
    );

    // 👇 create security group for ec2 instances
    const webserverSG = new ec2.SecurityGroup(this, 'webserver-sg', {
      vpc,
      allowAllOutbound: true,
    });
    
    webserverSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'allow http access from anywhere',
    );
    
    webserverSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'allow SSH access from anywhere',
    );

    const instance = {
      vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO,
      ),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      userData: demoProductionData,
      minCapacity: 1,
      maxCapacity: 1,
      keyName: stackConfig.keyPair, // replace this with your security key
      securityGroup: webserverSG,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
    };

    const asgProduction = new autoscaling.AutoScalingGroup(this, 'asgProduction', instance);

    // define target groups
    const targetProduction = new elbv2.ApplicationTargetGroup(this, 'targetAsgProduction', {
      vpc,
      port: 80,
      targets: [asgProduction],
    });


    listener.addAction('default', {
      action: elbv2.ListenerAction.weightedForward([
        {
          targetGroup: targetProduction,
          weight: 1,
        },
      ]),
    });  
   
    // not sure what else we need to export
    new cdk.CfnOutput(this, 'albDNS', {
      value: alb.loadBalancerDnsName,
    });
  }
  
  //
  private stackArtifact: cxapi.CloudFormationStackArtifact;
  private app: cdk.App;
  private profileName: string;

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
//       usePreviousParameters: true,
    });

    return deployResultPromise;
  }

  async destroy() {
    this.synthesizeStack();
    const cloudFormation = await this.createNewCfnDeploy();
    await cloudFormation.destroyStack({
      // @ts-ignore
      stack: this.stackArtifact,
//       usePreviousParameters: true,
    });
  }
}
