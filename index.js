/**
 * This script connects to an MQTT broker, subscribes to a topic, and performs actions based on received messages.
 * It uses the 'mqtt', 'os', and 'child_process' modules.
 * The MQTT connection details are specified by the 'protocol', 'host', and 'port' variables.
 * The client ID is generated randomly using Math.random().
 * The script publishes an 'ONLINE' message to the 'STATE/{hostname}' topic upon successful connection.
 * It also subscribes to the '153/piView/{hostname}' topic.
 * When a message is received, it kills any running Chromium processes and launches a new instance of Chromium in kiosk mode with the URL specified in the message payload.
 */

import mqtt from 'mqtt'
import os from 'os'
import {exec} from 'child_process'

const protocol = 'mqtt'
const host = process.env.MQTT_IP
const port = process.env.MQTT_PORT
const hostname = os.hostname()
const clientId = `mqttHost_${Math.random().toString(16).slice(3)}_${hostname}`

const connectUrl = `${protocol}://${host}:${port}`

const stateTopic = `STATE/${hostname}`

const topic = `${process.env.ROOT}/piView/${hostname}`

// Connect to broker
const client = mqtt.connect(connectUrl, {
    clientId,
    clean: true,
    connectTimeout: 4000,
    username: process.env.MQTT_USER,
    password: process.env.MQTT_PASSWORD,
    reconnectPeriod: 1000,
    will: {
        topic: stateTopic,
        payload: 'OFFLINE',
        retain: true,
        qos: 0
    }
})

// Connect callback. Subscribe to topic
client.on('connect', () => {
    console.log('Connected')
    client.publish(stateTopic, 'ONLINE', {retain: true}, (err) => {
        if (err) {
            console.error('Failed to publish message:', err);
        } 
        
        else {
        console.log('Message published with retain flag set to true');
        }
    })
    client.subscribe([topic], () => {
        console.log(`Subscribe to topic '${topic}'`)
    })
})

client.on('message', (topic, payload) => {
    var text = ''
    var obj = {}

    // Close browser
    try {
        exec("pkill -o chromium", (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
        });
    } catch (error) {
        
    }

    console.log('Received Message:', topic, payload.toString())
    text = payload.toString()
    obj = JSON.parse(text)
    console.log(obj.url)

    // Open browser with url
    try {
        exec(`DISPLAY=:0 chromium-browser --kiosk '${obj.url}' &`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
        });
    } catch (error) {
        
    }
})
