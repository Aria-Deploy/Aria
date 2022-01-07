## Aria-Deploy

> A tool which allows users to simplify the creation, configuration, and analysis of canary deployments.

Canary deployment is a technique that allows revisions of an application or service, referred to as the canary, to be analyzed using a subset of the real network traffic. It minimizes potential errors and risks for the majority of users by targeting a minority of the user base. Canary deployments are sophisticated, require considerable configuration, and can be time consuming to both implement and analyze.

Aria allows users to simplify the creation, configuration, and analysis of canary deployments. Aria automates much of the  infrastructure management while providing the user with the safety and data analysis benefits of canary deploys. Thus, Aria allows the user to focus on configuration which meaningfully impacts analysis of changes to production software.

### Features

- Aria shines by **self-provisioning** all the necessary resources needed to achieve advanced statistical analysis utilizing Kayenta. Furthermore, Aria deploys monitoring services Prometheus and Grafana, allowing users a clear view into the current state of the deployment.

- Aria was built with **accessibility** in mind. As opposed to other canary deployment tools that have an overwhelming amount of configuration and unclear documentation, Aria displays a simple single page UI that facilitates deployment creation and configuration. The UI focuses on meaningful configuration analysis and select targeting of a subset of the user-base per deployment.

- Aria is **open-source**. Companies that want to experiment with canary deployments may not want to invest in third-party solutions which can be quite costly or cannot be customized.

### How Aria Works

Aria-Deploy consists of a locally-run client-server which interacts with AWS. Aria-Deploy works with any existing AWS production environment where an [AWS Application Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html) routes traffic to instances of a production service.

Each Aria managed deployment is composed of three instances: canary, baseline, and monitor. A specified subset of incoming production traffic is redirected from the production infrastructure to canary infrastructure.

The canary infrastructure splits the traffic it receives equally between two EC2 instances: one running a new version of the application (the canary) and one running a copy of the existing version (the baseline). 

A monitoring EC2 instance is also created which contains tooling for both performance metrics and canary specific analysis. The monitor enables side-by-side comparison of the current version application (baseline) and the revised version (canary).

### Technologies

- [AWS Cloud Development Kit](https://aws.amazon.com/cdk/)
- [AWS Software Development Kit (Javascript)](https://aws.amazon.com/tools/)
- [Svelte](https://svelte.dev/)

### Further Information

[Consult the case study for more details about Aria.](https://aria-deploy.github.io/)

## Installation

### Pre-Configuration

1. Install and configure the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html), as Aria-Deploy uses your locally configured AWS profiles to find AWS resources. Aria requires the profile you select to have with an active Access key.

2. [Create an EC2 key pair](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-key-pairs.html). This is needed to SSH into  instances within the Aria canary infrastructure.

3. [Install Docker.](https://docs.docker.com/get-docker/) You will need it to download Docker images to your machine and translate them into `.tar` files.

### Installation Steps

1. Clone the Aria-Deploy repository to your local machine.

   ```bash
   git clone https://github.com/Aria-Deploy/Aria.git
   ```

2. Navigate to the directory `/Aria/server`, then install packages and compile Typescript.

   ```bash
   npm install
   npm run build
   ```
   
3. [Bootstrap](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html) the server app for the AWS account and region where canary infrastructure will be deployed. 

   Default value:

   ```bash
   cdk bootstrap
   ```

   OR specify:

   ```bash
   cdk bootstrap aws://{AWS_ACCOUNT_NUMBER}/{AWS_REGION}
   ```

4. Navigate to the directory `/Aria/client`, then install packages and build Tailwind.

   ```bash
   npm install
   npm run build
   ```

## Running Aria

1. Within the `/Aria/server` directory, start the Aria server on port 5000.

   ```bash
   npm start
   ```

2. Within the `/Aria/client` directory, start the Aria front-end on port 3000.

    ```bash
    npm run dev
    ```

3. Navigate in a browser to `localhost:3000` to access the Aria front-end.

## How to use Aria

Aria deploys canary infrastructure in your existing AWS VPC and diverts a portion of HTTP traffic from an existing Application Load Balancer to new versions of the application that you provide.

If you don't have an existing environment or application, you can test Aria using the [Aria-Demo-Production environment](https://github.com/Aria-Deploy/Aria-Demo-Production). This CDK project will set up an ALB directing traffic to a production version of an application. It also provides the necessary artifacts to deploy your Baseline and Canary applications.

### Selecting an AWS Profile

Aria uses your local AWS profiles to find existing resources.

Select an AWS profile using the selector in the lower left-hand corner of the screen. This will bring up a modal where you can select a profile. *Only select profiles configured locally with valid and active Access Keys*.

### Creating a New Deployment

To create a new canary deployment, select `Dashboard` from the sidebar, then click the `Create New` button.

Remember to consult the AWS documentation on [Application Load Balancers](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html) for more details about many available options.

It may take several minutes for canary infrastructure to be deployed. Be patient, and watch the console running the Aria server in case of errors.

#### Define Infrastructure

If there is an existing Application Load Balancer within the resources accessible to your chosen profile, you can select that ALB as well as the port which defines a listener.

#### Traffic Segmentation

##### **Analysis Traffic Weight** 

This defines the percentage of qualifying (see Conditions below) traffic which is diverted from the production version of the application and then split evenly between the baseline and canary application; e.g. the max allowable weight of 20 results in 80% of traffic being routed to the production version, 10% to the baseline instance, and 10% to the canary instance.

##### **Rule Priority**

This number reflects the priority of the new traffic routing rule created on the ALB. By default this should be `1`, so that the new rule supercedes all existing rules.

##### **Conditions**

You must declare at least one condition by which to segment traffic. Consult the AWS ALB documentation for details. 

#### Application Images

##### Healthcheck Path

Enter a path that Aria will use to see if your deployed application is running. No traffic will be diverted to either the baseline or canary until the healthcheck path is responsive.

##### **Required Files**

For both the baseline and canary you will need to provide Docker images as `.tar` archives (see [docker save](https://docs.docker.com/engine/reference/commandline/save/) for how to create these) and docker-compose files for those images. These files should then be paced within the Aria directory.

##### **Exporters**

To collect metrics, Prometheus uses [exporters](https://prometheus.io/docs/instrumenting/clientlibs/) to gather data. Aria automatically installs and configures [Node exporter](https://github.com/prometheus/node_exporter) on port `9090`. 

If your application is instrumented to expose metrics, click `Add Exporter` and enter the appropriate port. If you don't know what that means, just ignore `Add Exporter` for now.

### Dashboard

When the canary infrastructure is deployed, the Dashboard will show a card containing the title and description of the canary deployment. Click this to see more info about the deployment, as well links to the monitoring and analysis tools.

### Destroying an Existing Deployment

When you are finished with the canary infrastructure, go to the Dashboard and click `Destroy`. Note that this will also destroy any results of monitoring and analysis unless you take measures to preserve them outside the canary infrastructure.

### Monitoring/Analysis Tool Use and Configuration

For specifics about the tools provided by Aria, consult the documentation for the tools in the links provided below. A few specific matters are called out here.

- **Prometheus**
  - Labels corresponding to the baseline and canary instances will contain `/asgBaseline` and `/asgCanary` respectively.
- **Grafana**
  - You will need to add Prometheus as a [data source](https://grafana.com/docs/grafana/latest/datasources/add-a-data-source/). When doing so, replace the default URL with `http://prometheus:9090` 
  - You can [import premade dashboards](https://grafana.com/docs/grafana/v7.5/dashboards/export-import/). Try the one for [node exporter](https://grafana.com/grafana/dashboards/1860).

## Links

- [Aria Case Study](https://aria-deploy.github.io/)
- Repository: https://github.com/Aria-Deploy
- Monitoring and Analysis Tools
  - [Prometheus](https://prometheus.io/)
  - [Grafana](https://grafana.com/)
  - [Kayenta](https://github.com/spinnaker/kayenta)
  - [Referee](https://github.com/Nike-Inc/referee)

## License

MIT License

Copyright (c) 2022 Aria

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
