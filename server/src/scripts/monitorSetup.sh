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

# move to home directory so config files land there
cd /home/ec2-user

# change ownership of all files in home directory to ec2-user
chown -R ec2-user:ec2-user .

# bring up containers for monitoring/analysis
docker-compose up
