from flask import Flask, jsonify
import time
import json
import os
from datetime import datetime, timedelta
from AtlasI2C import AtlasI2C

app = Flask(__name__)

DATA_FILE = "sensor_data.json"
MAX_RECORDS = 7 * 24  # 7 days * 24 hours

PUMP_ADDRESSES = {
    "Pump_pH_low": 103,
    "Pump_pH_high": 104,
    "Pump_nutr1": 105,
    "Pump_nutr2": 106
}

def get_devices():
    """Scan for EZO devices and return a list of detected sensors."""
    device = AtlasI2C()
    device_address_list = device.list_i2c_devices()
    device_list = []

    for i in device_address_list:
        device.set_i2c_address(i)

        response = device.query("I")
        try:
            moduletype = response.split(",")[1].strip()
            sensor_info = device.get_device_info().replace("\x00", "").strip()
            sensor_parts = sensor_info.split(",")
            sensor_name = " ".join(sensor_parts)
            if sensor_name == "102":
                sensor_name = "Temperature"
            elif sensor_name == "100":
                sensor_name = "EC"
            elif sensor_name == "103":
                sensor_name = "Pump_pH_low"
            elif sensor_name == "104":
                sensor_name = "Pump_pH_high"
            elif sensor_name == "105":
                sensor_name = "Pump_nutr1"
            elif sensor_name == "106":
                sensor_name = "Pump_nutr2"
            
        except IndexError:
            continue

        device_list.append({
            "address": i,
            "moduletype": moduletype,
            "name": sensor_name
        })

    return device_list

def read_sensor_values():
    """Read sensor values from EZO devices and return a dictionary."""
    device_list = get_devices()
    data = {"timestamp": datetime.utcnow().isoformat()}
    device = AtlasI2C()

    for dev in device_list:
        device.set_i2c_address(dev["address"])
        device.write("R")

    time.sleep(1)

    for dev in device_list:
        device.set_i2c_address(dev["address"])
        raw_response = device.read()
        clean_response = raw_response.replace("\x00", "").strip()
        sensor_value = clean_response.split(":")[-1].strip()
        data[dev["name"]] = float(sensor_value) if sensor_value.replace('.', '', 1).isdigit() else None

    return data

def save_sensor_data():
    """Save sensor data to a JSON file, keeping only the latest 7 days of data."""
    new_data = read_sensor_values()
    
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r") as f:
            try:
                data_log = json.load(f)
            except json.JSONDecodeError:
                data_log = []
    else:
        data_log = []

    data_log.append(new_data)

    # Keep only the latest 7 days of data
    data_log = data_log[-MAX_RECORDS:]

    with open(DATA_FILE, "w") as f:
        json.dump(data_log, f, indent=4)

def run_pumps():
    """Activate each pump to dispense 1 mL every 10 seconds."""
    device = AtlasI2C()
    while True:
        for pump_name, address in PUMP_ADDRESSES.items():
            device.set_i2c_address(address)
            device.write("d,1")  # Activate pump
            time.sleep(5)
        time.sleep(60)  # Wait for a minute before running again


@app.route('/sensor')

@app.route('/sensor')
def get_sensor_data():
    """Returns the latest sensor readings."""
    return jsonify(read_sensor_values())

@app.route('/history/24h')
def get_last_24h():
    """Returns the last 24 hours of sensor data."""
    if not os.path.exists(DATA_FILE):
        return jsonify({"error": "No data available"}), 404

    with open(DATA_FILE, "r") as f:
        data_log = json.load(f)

    now = datetime.utcnow()
    last_24h_data = [entry for entry in data_log if datetime.fromisoformat(entry["timestamp"]) >= now - timedelta(hours=24)]
    
    return jsonify(last_24h_data)

@app.route('/history/7d_avg')
def get_7d_average():
    """Returns the daily average of sensor values for the last 7 days."""
    if not os.path.exists(DATA_FILE):
        return jsonify({"error": "No data available"}), 404

    with open(DATA_FILE, "r") as f:
        data_log = json.load(f)

    now = datetime.utcnow()
    daily_data = {}

    for entry in data_log:
        entry_date = datetime.fromisoformat(entry["timestamp"]).date()
        if entry_date >= now.date() - timedelta(days=6):  # Last 7 days
            if entry_date not in daily_data:
                daily_data[entry_date] = {"count": 0, "sums": {}}
            
            for key, value in entry.items():
                if key != "timestamp" and value is not None:
                    daily_data[entry_date]["sums"][key] = daily_data[entry_date]["sums"].get(key, 0) + value
            daily_data[entry_date]["count"] += 1

    averages = []
    for date, values in daily_data.items():
        avg_values = {key: round(val / values["count"], 2) for key, val in values["sums"].items()}
        averages.append({"date": date.isoformat(), **avg_values})

    return jsonify(averages)

if __name__ == '__main__':
    # Schedule data collection every hour
    import threading

    def data_collector():
        while True:
            save_sensor_data()
            time.sleep(3600)  # Wait for an hour
    threading.Thread(target=run_pumps, daemon=True).start()
    threading.Thread(target=data_collector, daemon=True).start()
    app.run(host='0.0.0.0', port=5000)

# from flask import Flask, jsonify
# import time
# from AtlasI2C import AtlasI2C

# app = Flask(__name__)

# def get_devices():
#     """Scan for EZO devices and return a list of detected sensors."""
#     device = AtlasI2C()
#     device_address_list = device.list_i2c_devices()
#     device_list = []

#     for i in device_address_list:
#         device.set_i2c_address(i)

#         # Get module type and sensor name, ensuring they are cleaned
#         response = device.query("I")
#         try:
#             moduletype = response.split(",")[1].strip()
            
#             # ✅ Get full device name (E.g., "RTD,102")
#             sensor_info = device.get_device_info().replace("\x00", "").strip()

#             # ✅ Extract the full name correctly
#             sensor_parts = sensor_info.split(",")  # ["RTD", "102"]
#             sensor_name = " ".join(sensor_parts)  # Convert to "RTD 102"
#             if sensor_name == "102":
#                 sensor_name = "Temperature"
#             elif sensor_name == "100":
#                 sensor_name = "EC"
#             elif sensor_name == "99":
#                 sensor_name = "pH"

#         except IndexError:
#             print(f">> WARNING: Device at I2C address {i} is not an EZO device and will not be queried.")
#             continue

#         device_list.append({
#             "address": i,
#             "moduletype": moduletype,
#             "name": sensor_name  # ✅ Now correctly formatted
#         })

#     return device_list  # Return list of properly formatted device names

# @app.route('/sensor')
# def get_sensor_data():
#     """Read sensor values from EZO devices and return as JSON."""
#     device_list = get_devices()
#     data = {}

#     # Initialize AtlasI2C device separately
#     device = AtlasI2C()

#     for dev in device_list:
#         device.set_i2c_address(dev["address"])
#         device.write("R")  # Request reading

#     time.sleep(1)  # Delay to allow measurement

#     for dev in device_list:
#         device.set_i2c_address(dev["address"])
#         raw_response = device.read()

#         # ✅ Clean the response: remove null bytes and whitespace
#         clean_response = raw_response.replace("\x00", "").strip()

#         # ✅ Extract only the numerical reading (e.g., "25.043")
#         sensor_value = clean_response.split(":")[-1].strip()

#         # ✅ Store properly formatted name and value
#         data[dev["name"]] = sensor_value

#     return jsonify(data)  # Send JSON response

# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5000)
