from flask import Flask, jsonify
import time
from AtlasI2C import AtlasI2C

app = Flask(__name__)

def get_devices():
    """Scan for EZO devices and return a list of detected sensors."""
    device = AtlasI2C()
    device_address_list = device.list_i2c_devices()
    device_list = []

    for i in device_address_list:
        device.set_i2c_address(i)

        # Get module type and sensor name, ensuring they are cleaned
        response = device.query("I")
        try:
            moduletype = response.split(",")[1].strip()
            
            # ✅ Get full device name (E.g., "RTD,102")
            sensor_info = device.get_device_info().replace("\x00", "").strip()

            # ✅ Extract the full name correctly
            sensor_parts = sensor_info.split(",")  # ["RTD", "102"]
            sensor_name = " ".join(sensor_parts)  # Convert to "RTD 102"
            if sensor_name == "102":
                sensor_name = "Temperature"
            elif sensor_name == "100":
                sensor_name = "EC"

        except IndexError:
            print(f">> WARNING: Device at I2C address {i} is not an EZO device and will not be queried.")
            continue

        device_list.append({
            "address": i,
            "moduletype": moduletype,
            "name": sensor_name  # ✅ Now correctly formatted
        })

    return device_list  # Return list of properly formatted device names

@app.route('/sensor')
def get_sensor_data():
    """Read sensor values from EZO devices and return as JSON."""
    device_list = get_devices()
    data = {}

    # Initialize AtlasI2C device separately
    device = AtlasI2C()

    for dev in device_list:
        device.set_i2c_address(dev["address"])
        device.write("R")  # Request reading

    time.sleep(1)  # Delay to allow measurement

    for dev in device_list:
        device.set_i2c_address(dev["address"])
        raw_response = device.read()

        # ✅ Clean the response: remove null bytes and whitespace
        clean_response = raw_response.replace("\x00", "").strip()

        # ✅ Extract only the numerical reading (e.g., "25.043")
        sensor_value = clean_response.split(":")[-1].strip()

        # ✅ Store properly formatted name and value
        data[dev["name"]] = sensor_value

    return jsonify(data)  # Send JSON response

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
