+++
title = 'MQTT on Node-Red'
linkTitle = 'MQTT'
summary = 'How to use the Node-Red MQTT palette.'
+++

Node-Red come preconfigured with all of the MQTT nodes one will need to interact with an existing MQTT broker.  This makes it trivial to publish or subscribe to new topics created by the Node-Red instance.

### Broker Options

Home Assistant currently has two MQTT broker available under their official addons: [Mosquitto](https://github.com/eclipse-mosquitto/mosquitto) and [EMQX](https://github.com/emqx/emqx).  Mosquitto has been around for years, runs everywhere, and uses almost no system resources, so it's a solid choice.  It is slightly harder to configure than other options since its configuration is a text file on startup.  You will have to consult the documentation carefully if you need to stray from the default configuration.  The Home Assistant addon has most of the used configuration options available, so this is not usually an issue.

EMQX is a newer product created by [EMQ](https://www.emqx.com).  Unlike Mosquitto which runs on holy C, EMQX is an Erlang project.  This means niceties like a web interface with stats and configuration through a GUI are available.  Erlang is a multi-threading juggernaut, but it is a heavier run environment than a native C program.  What this means is that while EMQX can handle a massive number of MQTT messages, it will always use more system resources than Mosquitto.

The question if which one to use is personal and ultimately doesn't matter all that much.  Neither needs to be run through the Home Assistant addon, it's just an easy entry point.  Any broker can just be run as an application on a machine in the network as well.  If you would like a nice web interface with your MQTT broker and have excess system resources, EMQX is the easy choice.  Mosquitto, on the other hand is well documented, battle tested, and impressively svelte in its resource usage.

### Connection to broker

Assuming that an MQTT broker is already running somewhere on your network, you will either need the IP address or DNS address for your broker's machine.  The default, insecure port for MQTT is 1883 and 8883 for
TLS encryption (if you have that configured).  These will not need to be configured in the broker connection unless they are non-standard.  This is all the information you should need to connect to your broker.

### Configuring Publish messages

### Configuring Command Subscription
