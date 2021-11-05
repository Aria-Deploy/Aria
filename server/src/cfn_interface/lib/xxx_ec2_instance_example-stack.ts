import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import * as ec2 from "@aws-cdk/aws-ec2";
import { StackApp } from "./xxx__stackApp";
import { readFileSync } from "fs";

export class Ec2InstanceExampleStack extends StackApp {
  constructor(source: cdk.App, id: string, props?: cdk.StackProps) {
    super(source, id, props);

    // USER-INPUT Required VPC Input
    const vpc = new ec2.Vpc(this, "my-cdk-vpc", {
      cidr: "10.0.0.0/16", //what is this?
      natGateways: 0,
      subnetConfiguration: [
        { name: "public", cidrMask: 24, subnetType: ec2.SubnetType.PUBLIC },
      ],
    });

    // // // USER-INPUT Optional Security Group Input
    // const webserverSG = new ec2.SecurityGroup(this, "webserver-sg", {
    //   vpc,
    //   allowAllOutbound: true,
    // });

    // webserverSG.addIngressRule(
    //   ec2.Peer.anyIpv4(),
    //   ec2.Port.tcp(22),
    //   "allow SSH access from anywhere"
    // );

    // webserverSG.addIngressRule(
    //   ec2.Peer.anyIpv4(),
    //   ec2.Port.tcp(80),
    //   "allow HTTP traffic from anywhere"
    // );

    // webserverSG.addIngressRule(
    //   ec2.Peer.anyIpv4(),
    //   ec2.Port.tcp(80),
    //   "allow HTTP traffic from anywhere"
    // );

    // webserverSG.addIngressRule(
    //   ec2.Peer.anyIpv4(),
    //   ec2.Port.tcp(443),
    //   "allow HTTP traffic from anywhere"
    // );

    // const webserverRole = new iam.Role(this, "webserver-role", {
    //   assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
    //   managedPolicies: [
    //     iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3ReadOnlyAccess"),
    //   ],
    // });

    // const ec2Instance = new ec2.Instance(this, "ec2-instance", {
    //   vpc,
    //   vpcSubnets: {
    //     subnetType: ec2.SubnetType.PUBLIC,
    //   },
    //   role: webserverRole,
    //   securityGroup: webserverSG,
    //   instanceType: ec2.InstanceType.of(
    //     ec2.InstanceClass.T2,
    //     ec2.InstanceSize.MICRO
    //   ),
    //   machineImage: new ec2.AmazonLinuxImage({
    //     generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
    //   }),
    //   keyName: "ec2-key-pair2",
    // });

    // // 👇 load contents of script
    // const userDataScript = readFileSync("./lib/user-data.sh", "utf8");
    // // 👇 add the User Data script to the Instance
    // ec2Instance.addUserData(userDataScript);
  }
}
