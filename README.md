## .env file structure 
```
MQTT_USER=*****
MQTT_PASSWORD=*****
MQTT_IP=*****
MQTT_PORT=*****
ROOT=*****
```

## piView.service
To create the service: 
```
cd /lib/systemd/system
sudo touch piView.service
sudo nano piView.service
```

Paste this into piView.service:
```
[Unit]
Description=Starts piView 
After=network.target

[Service]
Environment=NODE_PORT=3001
Type=simple
User=admin
ExecStart=/usr/bin/node /home/admin/Documents/piView/index.js
Restart=on-failure
EnvironmentFile=/home/admin/Documents/piView/.env

[Install]
WantedBy=multi-user.target
```

Setup the service to autostart:
```
sudo systemctl daemon-reload
sudo systemctl enable piView.service
sudo systemctl start piView.service
```

Other service options:
```
sudo systemctl [status,start,stop,restart,enable,disable] piView.service
sudo systemctl list-unit-files | grep enabled
```
