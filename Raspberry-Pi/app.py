from flask import Flask, render_template, jsonify
import smbus2
import time

app = Flask(__name__)

# Setup I2C Communication
bus = smbus2.SMBus(1)
EZO_EC_ADDRESS = 0x64  # Change if different
EZO_PUMP_ADDRESS = 0x67  # Change if different

def send_command(address, command):
    """Send command to an EZO device over I2C."""
    command += "\x00"  # Null terminator
    bus.write_i2c_block_data(address, ord(command[0]), [ord(c) for c in command[1:]])
    time.sleep(1)

def read_response(address):
    """Read response from an EZO device over I2C."""
    try:
        response = bus.read_i2c_block_data(address, 0, 32)
        response_str = "".join(chr(c) for c in response if c != 0)
        return response_str.strip()
    except Exception as e:
        return f"Error: {str(e)}"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_data')
def get_data():
    """Fetch sensor data"""
    send_command(EZO_EC_ADDRESS, "R")  # Request reading from EZO EC
    time.sleep(1)
    ec_value = read_response(EZO_EC_ADDRESS)

    return jsonify({
        "conductivity": ec_value,
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
