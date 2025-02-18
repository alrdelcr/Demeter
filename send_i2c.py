import serial
import time

# Open serial connection
ser = serial.Serial("/dev/serial0", 9600, timeout=1)
ser.flush()

def send_command(cmd):
    ser.write((cmd + "\r").encode())  # Send command with carriage return
    time.sleep(1)  # Wait for response
    response = ser.read_all().decode()
    print("Response:", response)

# Send the command to switch to I2C mode
send_command("I2C,100")

# Close serial connection
ser.close()
