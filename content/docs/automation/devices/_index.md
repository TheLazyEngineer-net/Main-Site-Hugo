+++
title = 'Automation Device Documentation'
linkTitle = 'Devices'
summary = 'Home automation device documentation'
+++

## Radio

The type of radio that the home automation devices uses can be extremely important or fairly meainingless.  I've used most radio types and have few complaints about any of them.  WiFi is the most common and generally works fine.  It just takes a little more setup time since the network and password have to be entered somehow.  This is often accomplished through Bluetooth or connecting to a WiFi network broadcast by the device.

Z-Wave, Zigbee, and Thread/Matter are all fairly equivalent, with Thread/Matter being the newest and most chaotic.  The biggest downside to Zigbee/Thread is the frequency that it operates on (2.4 GHz), which is the same frequency range that older WiFi standards used.  This can lead to more congestion on these frequencies in more populated areas and more connection problems.  Z-Wave is proprietary (though has been opened up a bit), uses the less congested 900MHz network, and still fairly prevalent.  All of these radio types require a special receiver/controller for their specific type, but many devices can connect to the same controller.

Finally, many manufacterers have proprietary radios with recievers that can be added to automation software.  These usually work quite well, though are completely manufacterer dependent on their characteristics.  They always require a separate receiving device since other receivers don't know how to talk to them.

### General Heuristics

| Characteristic | Proprietary Radio | Z-Wave | Zigbee | Thread/Matter | WiFi |
|---|---|---|---|---|---|
| Radio Strength | 5 (usually) | 4 | 3 | 3 | 2 |
| Ease of Setup | 5 | 4 | 4 | 3 | 3 |
| Replaceability | 2 | 5 | 5 | 4 | 5 |
| Hackability | 1 | 3 | 5 | 3 | 5 |

## Recommended Brands

* [Aeotec](https://aeotec.com/) - Mostly Z-Wave products
* [Ecowitt](https://www.ecowitt.com) - Weather stations and environment monitoring
* [Inovelli](https://inovelli.com/) - Matter, Zigbee, and Z-Wave switches
* [LinkTap](https://www.link-tap.com/) - Irrigation valves, controllers, and gateways
* [Phillips hue](https://www.philips-hue.com) - Zigbee smart lights
* [QuinLED](https://quinled.info/) - LED dimmers and controllers using WLED
* [Raspberry Pi](https://www.raspberrypi.com/) - Micro computers and microcontroller boards
* [SMLIGHT](https://smlight.tech/) - LAN PoE Thread and Zigbee adapters
* [Victron Energy](https://www.victronenergy.com/) - Power storage and conversion systems
