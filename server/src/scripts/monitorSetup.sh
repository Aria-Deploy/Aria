#!/bin/bash

# update
yum update -y

# install git
yum install git

# docker installation
amazon-linux-extras install docker
service docker start
systemctl enable docker
usermod -a -G docker ec2-user

# docker-compose installation
curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

# create/download prometheus config file
# this placeholder file needs its access and secret keys replaced
# it looks currently only for node_exporter

# YOU NEED TO CREATE A AWS USER AND PUT ITS ACCESS_KEY AND SECRET_KEY HERE
# GIVE THIS USER THE FOLLOWING PERMISSION: AmazonEC2ReadOnlyAccess
tee -a /home/ec2-user/prometheus.yml << END
global:
  scrape_interval: 1s
  evaluation_interval: 1s

scrape_configs:
  - job_name: 'node'
    relabel_configs:
    - source_labels: [__meta_ec2_tag_Name]
      target_label: instance
    ec2_sd_configs:
      - access_key: MY_ACCESS_KEY 
        secret_key: MY_SECRET_KEY
        port: 9100
END

# labelling examples
# scrape_configs:
#   - job_name: 'node'
#     relabel_configs:
#     - source_labels: [__meta_ec2_tag_Name]
#       target_label: instance
#     ec2_sd_configs:
#       - region: us-east-1
#         access_key: 
#         secret_key: 
#         port: 9100
#         filters:
#           - name: tag:Name
#             values:
#               - canary-instance
#               - baseline-instance


# link that describes different filters
# https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_DescribeInstances.html

# move to home directory so config files land there
cd /home/ec2-user

# THESE FILES NEED TO BE PLACED ELSEWHERE
# download docker-compose.yml for all traffic monitor/analysis apps
wget 'https://raw.githubusercontent.com/caleblayneheath/my-aria/main/configs/docker-compose.yml' -O docker-compose.yml

# download kayenta.yml for kayenta configuration
wget 'https://raw.githubusercontent.com/caleblayneheath/my-aria/main/configs/kayenta.yml' -O kayenta.yml

# change ownership of all files in home directory to ec2-user
chown -R ec2-user:ec2-user .

# bring up containers for monitoring/analysis
docker-compose up
