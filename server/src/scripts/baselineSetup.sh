#!/bin/bash

# system update
yum update -y

# install git
yum install git

# docker installation
amazon-linux-extras install docker
service docker start
systemctl enable docker
usermod -a -G docker $USER

# docker-compose installation
curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

# download node_exporter
useradd -m -s /bin/bash prometheus

curl -L -O https://github.com/prometheus/node_exporter/releases/download/v1.2.2/node_exporter-1.2.2.linux-amd64.tar.gz

tar -xzvf node_exporter-1.2.2.linux-amd64.tar.gz
mv node_exporter-1.2.2.linux-amd64 /home/prometheus/node_exporter
rm node_exporter-1.2.2.linux-amd64.tar.gz
chown -R prometheus:prometheus /home/prometheus/node_exporter

# Add node_exporter as systemd service
tee -a /etc/systemd/system/node_exporter.service << END
[Unit]
Description=Node Exporter
Wants=network-online.target
After=network-online.target
[Service]
User=prometheus
ExecStart=/home/prometheus/node_exporter/node_exporter
[Install]
WantedBy=default.target
END

systemctl daemon-reload
systemctl start node_exporter
systemctl enable node_exporter

# setup demo app
# yum install -y httpd
# systemctl start httpd
# systemctl enable httpd
# echo "<style> body {background-color: lightblue;} </style>" > /var/www/html/index.html
# echo "<h1>Hello World from $(hostname -f) BASELINE instance 1</h1>" >> /var/www/html/index.html



# yum update -y
# sudo su
# 
# amazon-linux-extras install -y nginx1
# systemctl start nginx
# systemctl enable nginx
# 
# chmod 2775 /usr/share/nginx/html
# find /usr/share/nginx/html -type d -exec chmod 2775 {} \;
# find /usr/share/nginx/html -type f -exec chmod 0664 {} \;
# 
# echo "<h1>Baseline</h1>" > /usr/share/nginx/html/index.html


# create a docker image from the tarball
docker load -i /home/ec2-user/webserver.tar

# run the docker image
docker run -d -p 80:80 webserver