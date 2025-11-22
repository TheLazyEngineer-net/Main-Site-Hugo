+++
title = 'Victron MQTT Using Node-Red'
linkTitle = 'Victron'
summary = 'How to setup MQTT with Node-Red on Victron.'
+++

## Introduction

Using MQTT as the communication protocol with Victron products can be accomplished in a number of ways.  Enabling the MQTT broker on the Victron communication center (Cerbo GX or equivalent) is the simplest way forward.  While this works fine, it enables topics for every data point availabe, which can number in the thousands.  An aternative method, that is covered here, uses Node-RED to publish only the topics that are required to an existing MQTT broker.

### Positives

* Only selected MQTT topics are published
* Easy to find new data points to publish
* Can setup MQTT discovery in Home Assistant

### Negatives

* More complicated initial setup
* Requires running Node-Red

## Installation

Installing Node-RED on a Victron control device is fairly straightforward.  Just follow the current [Victron documentation](https://www.victronenergy.com/live/venus-os:large).

The general proceedure is:

1) Go to your Venus OS device (webui or display)
2) Settings -> General -> Firmware -> Online updates -> Image type
3) Change from Normal to Large and install
4) Verify the Large image was installed by going to Settings -> Integrations and seeing that Venus OS Large features are available
5) Enable the Node-RED integration

## Accessing Venus OS Node-RED

The easiest way to access Node-RED on your Victron device is to go port `1881` on the IP of your Venus OS device.  An example of this might be `http://1.2.3.4:1881` or `https://1.2.3.4:1881` depending on whether you have TLS configured.

This may also work with `http://venus.local:1881` if your mDNS setup allows it.

## System Architecture

```goat
+-----------+   +------------+   +----------------+   +----------------+
|  Victron  +-->|  Node-RED  +-->|    Node-RED    +-->|    Node-RED    +--.
|    DBUS   |   |    Node    |   |  Global State  |   |  MQTT Publish  |   |
+-----------+   +------------+   +----------------+   +----------------+   |
 .------------------------------------------------------------------------'
|   +----------------+   +----------------+   +----------------+
 '->|   MQTT Broker  +-->|    HA MQTT     +-->|   HA Device    |
    |    Republish   |   |  Subscription  |   |  State Update  |
    +----------------+   +----------------+   +----------------+
```

## Victron State in Node-RED

It makes sense to keep track of all of the state that we care about using Node-RED.  The most meaningful reason for this is that this makes it really easy to publish state updates.  It is much easier with MQTT to publish one update for all state (or a subcategory of state) instead of having a topic per state type.  This, then, means it would be nice to publish the whole state object with each update, which means the data has to be stored somewhere so it is accessible when necessary.

Node-RED has the concept of contexts for nodes, flows, and global.  These are basically key-value stores for whatever you like within a particular context.  An easy way to get global state is to create a `state` key within the global context with a map of state types and values.  We can then listen to Victron state updates to update the global state accordingly.

Here is a flow showing how to do this (a subset of an actual state flow):

{{< node-red-flow src="global-state.json" >}}

Each Victron node triggers when there are new updates to the system.  These updates are then transformed and stored into Node-RED's global state.  Each update also triggers a link out node so anyone can subscribe to these state updates.  This link out node is not connected to anything in the above flow.

## Publishing State to MQTT

State updates to MQTT are straightforward.  In this example, there are two paths: whether it is an automation state update or not.  Automation updates should always trigger a state update since that information should always be propogated immediately.  For non-automation state updates, a throttle is implemented to only allow so many updates per second.  This way every state update won't trigger a publish.

{{< node-red-flow src="mqtt-publish.json" >}}

The state update payload can be created by grabbing the required states from the global context:

```javascript
var state = {
  "alarms": global.get("alarms"),
  "automation": global.get("automation"),
  "battery": global.get("battery"),
  "door_state": global.get("door_state"),
  "inverter": global.get("inverter"),
  "output_switch": global.get("output_switch"),
  "system": global.get("system"),
};

msg.payload = state;
return msg;
```

This state message then contains the entire state of the application.  The subscriber to this topic will have to parse out the individual pieces of state.

## MQTT Discovery

One of the most powerful features of using Node-RED for MQTT publishing is the ability to configure your own discovery of MQTT devices in Home Assistant.  This means that the topics configured in Node-RED will show up as devices with the correct name/type/units/precision/etc.  It makes much more sense to configure the devices in the device rather than in Home Assistant.

The flow for MQTT discovery looks something like this:

{{< node-red-flow src="auto-config.json" >}}

MQTT discovery is just a message published to a specific MQTT topic in Home Assistant.  In this case, the topic is: `homeassistant/device/7239bc0a334a45bdd2d0a4f85f5421c3/config`.  By publishing a config to this topic, a device with id `7239bc0a334a45bdd2d0a4f85f5421c3` is created in Home Assistant with the configuration provided.  A snipped of this configuration is:

```json
{
  "dev": {
    "ids": "7239bc0a334a45bdd2d0a4f85f5421c3",
    "name": "Battery Backup Sump Pump",
    "mf": "Jared Suess",
    "mdl": "DIY",
    "sw": "1.0",
    "sn": "da2be04f18525c907d3f641bd03a0192",
    "hw": "1.0"
  },
  "o": {
    "name":"Node-RED Cerbo GX",
  },
  "cmps": {
    // Control Entities
    "inverter_mode": {
      "name": "Inverter Mode",
      "p": "select",
      "ops": [ "Charger Only", "Inverter Only", "On", "Off" ],
      "val_tpl": "{{ value_json.inverter.mode }}",
      "cmd_tpl": '{"inverter": {"mode": "{{ value }}" } }',
      "uniq_id": "e2321568f330f90b96222ee28ae3497b"
    },
    "automate_mqtt_publish": {
      "name": "MQTT State Publish",
      "p": "switch",
      "pl_on": true,
      "pl_off": false,
      "val_tpl": "{{ value_json.automation.mqtt_publish }}",
      "cmd_tpl": "{{ { 'automation': { 'mqtt_publish': value | bool } } | to_json }}",
      "uniq_id": "81a52632856455cfd86d60ed1b12de84"
    },

    // Sensor Entities
    "inverter_state": {
      "name": "Inverter State",
      "p": "sensor",
      "val_tpl": "{{ value_json.inverter.state }}",
      "uniq_id": "859840bc21bbe44ddd489586360273a5",
      "qos": 1
    },
    "ac_consumption": {
      "name": "AC Consumption",
      "p": "sensor",
      "dev_cla": "power",
      "stat_cla": "measurement",
      "unit_of_meas": "W",
      "sug_dsp_prc": 0,
      "val_tpl": "{{ value_json.system.ac.consumption }}",
      "uniq_id": "dd2452daab854ac126414ef33ffd59ef",
      "qos": 1
    },
    "system_battery_voltage": {
      "name": "Battery Voltage",
      "p": "sensor",
      "dev_cla":"voltage",
      "stat_cla": "measurement",
      "unit_of_meas":"V",
      "sug_dsp_prc": 2,
      "val_tpl":"{{ value_json.system.battery.voltage }}",
      "uniq_id":"cb4865301b6f3b6ddb95f24779a3ef71",
      "qos": 1
    },

    // Alarms
    "inverter_grid_lost_alarm": {
      "name": "Grid Lost Alarm",
      "p": "sensor",
      "icon": "mdi:alarm-light",
      "val_tpl": "{{ value_json.alarms.inverter.grid_lost }}",
      "ent_cat": "diagnostic",
      "uniq_id": "30ef751cb2145133323f57bf82737858",
    },
    "battery_cell_imbalance_alarm": {
      "name": "BMS Cell Imbalance Alarm",
      "p": "sensor",
      "icon": "mdi:alarm-light",
      "val_tpl": "{{ value_json.alarms.battery.cell_imbalance }}",
      "ent_cat": "diagnostic",
      "uniq_id": "9a171a12cb7586fd55ad03254caf3bab",
    },
  },
  "stat_t":"battery_backup/sump_pump/state",
  "cmd_t": "battery_backup/sump_pump/command",
  "qos": 2
}
```
The discovery configuration is fairly well documented in the [Home Assistant documentation](https://www.home-assistant.io/integrations/mqtt#mqtt-discovery).  The IDs for earch Home Assistant entity and the device were randomly generated UUIDs.  The topics used in this configuration are completely up to the user.  The MQTT discovery configuration merely defines which topics to use for state updates and commands.
