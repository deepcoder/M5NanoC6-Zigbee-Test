// m5nanoc6.js
// 2024-Apr-03
//
// Zigbee2MQTT custom converter for M5Stack M5NanoC6 basic on/off light
//
// https://www.zigbee2mqtt.io/advanced/support-new-devices/01_support_new_devices.html#_1-pairing-the-device-with-zigbee2mqtt

const fz = require('zigbee-herdsman-converters/converters/fromZigbee');
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const reporting = require('zigbee-herdsman-converters/lib/reporting');
const extend = require('zigbee-herdsman-converters/lib/extend');
const e = exposes.presets;
const ea = exposes.access;

const definition = {
        zigbeeModel: ['ESP32C6.Light'],
        model: 'ESP32C6.Light',
        vendor: 'Espressif',
        description: 'M5NanoC6-v01',
        extend: extend.switch(),
        configure: async (device, coordinatorEndpoint, logger) => {
            // Has Unknown power source: https://github.com/Koenkk/zigbee2mqtt/issues/5362, force it here.
            device.powerSource = 'Mains (single phase)';
            device.save();
        },
};

module.exports = definition;