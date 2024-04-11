# M5NanoC6-Zigbee-Test
Testing M5NanoC6 Zigbee device created with Arduino IDE for Zigbee2MQTT and Home Assistant


Steps to create a simple Zigbee on/off light using M5Stack M5NanoC6 and the Arduino IDE.
https://shop.m5stack.com/products/m5stack-nanoc6-dev-kit

1) Install Arduino IDE. I used version 2.3.2 on MacOS Sonoma 14.4.1.

2) Install needed board manager and libraries for M5Stack NanoC6 as per:

https://docs.m5stack.com/en/core/M5NanoC6
https://docs.m5stack.com/en/arduino/m5nanoc6/program

3) Make sure that you can successfully compile and run the basic examples for the NanoC6, see the kludge I had to do below in step 4:

```
// Upload the code to see the blue led light on the M5NanoC6 device
#define LED_PIN    7
void setup() {
  pinMode(LED_PIN , OUTPUT);
  digitalWrite(LED_PIN, HIGH); 
}
void loop() {

}

```

4) At some point of this testing, the Arduino IDE would not compile for the ESP32-C6. It threw the error below:

```
cp: /Users/dproffer/Library/Arduino15/packages/esp32/hardware/esp32/3.0.0-alpha3/tools/ide-debug/esp32c6.json: No such file or directory
```

In my short internet searching, I was not able to find this file nor any useful tips on how to resolve. So, my 'hack' solution was to copy the esp32c3.json file to esp32c6.json and then edit any references to the c3 chip to instead reference the c6 chip. It allows the compile to complete successfully, it probably messes up the debugging function in the Arduino IDE, however I have yet to explore this.

```
cp /Users/dproffer/Library/Arduino15/packages/esp32/hardware/esp32/3.0.0-alpha3/tools/ide-debug/esp32c3.json \
  /Users/dproffer/Library/Arduino15/packages/esp32/hardware/esp32/3.0.0-alpha3/tools/ide-debug/esp32c6.json
```

5) Follow the steps to configure the Arduino IDE for a Zigbee project at this URL:

https://github.com/espressif/arduino-esp32/tree/master/libraries/ESP32/examples/Zigbee/Zigbee_Light_Bulb

However, instead of using the example code from this respository, use the modified example here in this repository :

https://github.com/deepcoder/M5NanoC6-Zigbee-Test/blob/main/M5NanoC6_Zigbee_v03.ino

This code is modified to use the correct pins for the M5NanoC6 and NeoPixel library. Also, it is modified to set the necessary Zigbee properties to allow the device to be paired into the Zigbee2MQTT system.

The code also does simple Arduino Serial.Print 's for basic status info in the Arduino IDE Console window.

Other than these changes, the code is just the stock example from the Expressif repository.

6) You should be able to compile and upload this example to your M5NanoC6 device. I found that using a USB hub that has a power switch to turn on and off each of the individual ports makes the 'reset/upload' cycle easier. You do not have to plug and unplug the module as you press the G9 button to get it into programming mode. And you need to power cycle the device after you finish the uploading cycle to get the device to run the code.

https://www.amazon.com/gp/product/B0BRTPJ8FK

7) In your Zigbee2MQTT configuration.yaml file, you will need to add the reference to the custom converter file as shown below. Also, you will need to copy this file 'm5nanoc6.js' to the zigbee2mqtt-data directory. You will need to restart Zigbee2MQTT after these changes :

```
external_converters:
  - m5nanoc6.js
```

8) With all the above done, after power cycling your M5NanoC6, you should be able to put Zigbee2MQTT into 'pairing' mode and the device should successfully add to your Zigbee2MQTT system.  Make sure to have the device powered and then remove the device from Zigbee2MQTT each time you modify the code and 'repair' the device with Zigbee2MQTT. See pictures below.

<img width="1004" alt="image" src="https://github.com/deepcoder/M5NanoC6-Zigbee-Test/assets/1409547/61633500-ee19-499b-98c2-311fa26b4067">

<img width="1149" alt="image" src="https://github.com/deepcoder/M5NanoC6-Zigbee-Test/assets/1409547/d42fd30a-11a7-48e4-abdf-c657007cf1ec">



9) In the Arduino IDE console window, you should see status messages from the device, example below: 

```
08:39:29.276 -> M5Stack M5NanoC6 Zigbee bulb startup!
08:39:29.276 -> ZDO signal : ZDO Config Ready
08:39:29.276 -> Zigbee stack initialized
08:39:29.276 -> Start network steering
08:39:40.169 -> ESP_FAIL
08:39:52.212 -> Joined network successfully
08:39:52.212 -> Channel : 24
08:40:19.146 -> Received message : 
08:40:19.146 -> 10
08:40:19.146 -> 6
08:40:19.146 -> 0
08:40:19.146 -> 1
08:40:19.146 -> Light Toggle : 1
08:40:24.079 -> Received message : 
08:40:24.079 -> 10
08:40:24.079 -> 6
08:40:24.079 -> 0
08:40:24.079 -> 1
08:40:24.079 -> Light Toggle : 0

```

10) The YAML code below can be added to your MQTT Switch configuration section of your Home Assistant configuration.yaml to create a control for the device :

```
switch:

  - name: "M5NanoC6"
    unique_id: "0x404ccafffe5b2c2c-m5nanoc6"
    state_topic: "test_zigbee2mqtt/0x404ccafffe5b2c2c"
    value_template: "{{ value_json.state }}"
    state_on: "ON"
    state_off: "OFF"
    command_topic: "test_zigbee2mqtt/0x404ccafffe5b2c2c/set"
    payload_on: '{"state":"ON"}'
    payload_off: '{"state":"OFF"}'
```

11) The BASH script shown below will simply toggle the device light on and off every 5 seconds :

```
#!/bin/bash

echo "Toggle M5NanoC6"
zdelay=5.0
echo $zdelay
while :
do

    cmd="{\"state\": \"ON\"}"
    echo $cmd
    mosquitto_pub -h 192.168.1.100 -t 'zigbee2mqtt/0x404ccafffe5b2c2c/set' -m "$cmd"
    sleep $zdelay

    cmd="{\"state\": \"OFF\"}"
    echo $cmd
    mosquitto_pub -h 192.168.1.100 -t 'zigbee2mqtt/0x404ccafffe5b2c2c/set' -m "$cmd"
    sleep $zdelay

done
```

12) Below are links to some helpful folks and tips that I used to get to this point. Good hunting!

Helpful resources:
```
https://github.com/espressif/arduino-esp32/tree/master/libraries/ESP32/examples/Zigbee/Zigbee_Light_Bulb


https://github.com/m5stack/M5NanoC6/tree/main/examples/Basic

https://github.com/espressif/arduino-esp32

https://community.hubitat.com/t/zigbee-supporting-esp32-module-with-arduino/131429/49
https://community.hubitat.com/t/zigbee-supporting-esp32-module-with-arduino/131429/48

https://docs.espressif.com/projects/esp-zigbee-sdk/en/latest/esp32/

https://community.openhab.org/t/esp32-c6-with-oh/149269/6

https://github.com/espressif/esp-idf/issues/10662

https://github.com/allexoK/Esp32-C6-Bug-Arduino-Examples/blob/main/examples/esp32c6bugzigbeemqttbridge/Zigbee_Light_Bulb/Zigbee_Light_Bulb.ino
https://github.com/allexoK/Esp32-C6-Bug-Arduino-Examples

https://www.zigbee2mqtt.io/advanced/support-new-devices/01_support_new_devices.html#_1-pairing-the-device-with-zigbee2mqtt

https://github.com/m5stack/M5NanoC6/blob/main/examples/Basic/rgb_led/rgb_led.ino
https://github.com/m5stack/M5NanoC6/blob/main/src/M5NanoC6.h

https://github.com/espressif/arduino-esp32/blob/master/libraries/ESP32/examples/Zigbee/Zigbee_Light_Bulb/Zigbee_Light_Bulb.ino
```
