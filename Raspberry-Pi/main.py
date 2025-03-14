from flask import Flask, jsonify, request
import time
import json
import os
from datetime import datetime, timedelta
from AtlasI2C import AtlasI2C

app = Flask(__name__)

DATA_FILE = "sensor_data.json"
TARGET_VALUES_FILE = "target_values.json"  # New file to store target values
MAX_RECORDS = 7 * 24  # 7 days * 24 hours

PUMP_ADDRESSES = {
    "Pump_pH_low": 103,
    "Pump_pH_high": 104,
    "Pump_nutr1": 105,
    "Pump_nutr2": 106
}

# --- Target Values Functions ---

def load_target_values():
    """Load target values from file or return default values if file is missing, empty, or invalid."""
    try:
        if os.path.exists(TARGET_VALUES_FILE):
            with open(TARGET_VALUES_FILE, "r") as f:
                data = f.read().strip()
                if data:  # Check if the file is not empty
                    target_values = json.loads(data)
                    # Validate that necessary fields are present
                    if "low_pH" in target_values and "high_pH" in target_values and "low_EC" in target_values:
                        return target_values
        # Return default target values if no valid data found
        return {"low_pH": 5.5, "high_pH": 6.4, "low_EC": 1000.0}
    except Exception as e:
        print(f"Error loading target values: {e}")
        return {"low_pH": 5.5, "high_pH": 6.4, "low_EC": 1000.0}

def save_target_values(target_values):
    """Save target values to a JSON file."""
    with open(TARGET_VALUES_FILE, "w") as f:
        json.dump(target_values, f, indent=4)

# --- Sensor and Pump Functions (unchanged) ---

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
            if sensor_name == "99":
                sensor_name = "pH"
            elif sensor_name == "102":
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

def is_valid_reading(sensor_name, value):
    """Validate sensor readings based on sensor type."""
    if value is None:
        return False
    # Common error code for bad readings
    if value <= 300.0 and sensor_name == "EC":
        return False
    if value == 255.0 and sensor_name != "EC":
        return False
    # Define acceptable ranges for some sensors (adjust as needed)
    if sensor_name == "Temperature":
        return 0 <= value <= 50    # Celsius
    if sensor_name == "pH":
        return 0 <= value <= 14    # pH should be between 0 and 14
    return True

def read_sensor_values():
    """Read sensor values from EZO devices and return a dictionary with validated data."""
    device_list = get_devices()
    data = {"timestamp": datetime.utcnow().isoformat()}
    device = AtlasI2C()
    time.sleep(5)
    for dev in device_list:
        device.set_i2c_address(dev["address"])
        device.write("R")

    time.sleep(1)

    for dev in device_list:
        device.set_i2c_address(dev["address"])
        raw_response = device.read()
        clean_response = raw_response.replace("\x00", "").strip()
        sensor_value_str = clean_response.split(":")[-1].strip()
        sensor_value = float(sensor_value_str) if sensor_value_str.replace('.', '', 1).isdigit() else None

        # Validate sensor value. If it's invalid, set to None.
        if not is_valid_reading(dev["name"], sensor_value):
            sensor_value = None

        data[dev["name"]] = sensor_value

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
    data_log = data_log[-MAX_RECORDS:]

    with open(DATA_FILE, "w") as f:
        json.dump(data_log, f, indent=4)

def run_pumps():
    """Activate each pump based on sensor readings and target values."""
    device = AtlasI2C()
    time.sleep(5)
    while True:
        # Reload target values on each iteration so updates are applied
        current_values = load_target_values()
        sensor_data = read_sensor_values()
        pH = sensor_data.get("pH")
        ec = sensor_data.get("EC")
        print(pH)
        print(ec)
        if pH is not None:
            if pH < current_values["low_pH"]:
                print("(pH) 106, dispensing 2")
                device.set_i2c_address(106)
                device.write("d,2")  # Dispense 2 mL of pH up solution
                time.sleep(5)
            elif pH > current_values["high_pH"]:
                print("(pH) 104, dispensing 2")
                device.set_i2c_address(104)
                device.write("d,2")  # Dispense 2 mL of pH down solution
                time.sleep(5)
        if ec is not None:
            if ec < current_values["low_EC"] and ec > 1000:
                print("(EC) 103, dispensing 1")
                print("(EC) 105, dispensing 1")
                device.set_i2c_address(103)
                device.write("d,1")  # Dispense 1 mL of nutrient solution A
                time.sleep(5)
                device.set_i2c_address(105)
                device.write("d,1")  # Dispense 1 mL of nutrient solution A
                time.sleep(5)
        time.sleep(1800)  # Wait for 30 minutes before running again

# --- API Endpoints ---

@app.route('/api/sensor')
def get_sensor_data():
    """Returns the latest sensor readings."""
    return jsonify(read_sensor_values())

@app.route('/api/history/24h')
def get_last_24h():
    """Returns the last 24 hours of sensor data."""
    if not os.path.exists(DATA_FILE):
        return jsonify({"error": "No data available"}), 404

    with open(DATA_FILE, "r") as f:
        data_log = json.load(f)

    now = datetime.utcnow()
    last_24h_data = [entry for entry in data_log if datetime.fromisoformat(entry["timestamp"]) >= now - timedelta(hours=24)]
    return jsonify(last_24h_data)

@app.route('/api/history/all')
def get_all_data():
    """Returns all sensor data recorded in the JSON file."""
    if not os.path.exists(DATA_FILE):
        return jsonify({"error": "No data available"}), 404

    with open(DATA_FILE, "r") as f:
        data_log = json.load(f)
    return jsonify(data_log)

@app.route('/api/history/7d_avg')
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
        if entry_date >= now.date() - timedelta(days=6):
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

@app.route('/api/set-target-values', methods=['POST'])
def set_target_values():
    """Accepts POST requests to set target values and saves them to a JSON file."""
    try:
        data = request.get_json()
        low_pH = float(data.get("low_pH"))
        high_pH = float(data.get("high_pH"))
        low_EC = float(data.get("low_EC"))
        new_values = {"low_pH": low_pH, "high_pH": high_pH, "low_EC": low_EC}
        save_target_values(new_values)
        print(new_values)
        return jsonify({"message": "Target values updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# --- Main Execution ---

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
