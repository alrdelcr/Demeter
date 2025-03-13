import serial
import time

# UART Configuration
ser = serial.Serial(
    port='/dev/ttyS0',  # Use '/dev/ttyAMA0' for Pi 3B+ or older models
    baudrate=9600,
    parity=serial.PARITY_NONE,
    stopbits=serial.STOPBITS_ONE,
    bytesize=serial.EIGHTBITS,
    timeout=1
)

def read_conductivity():
    try:
        # Send "R" command to request a reading (followed by carriage return)
        ser.write(b'R\r')
        
        # Wait for the sensor to process (600ms per datasheet)
        time.sleep(0.6)
        
        # Read the response (ends with \r)
        response = ser.readline().decode('utf-8').strip()
        
        # Parse the response (format: "value,unit")
        if ',' in response:
            value, unit = response.split(',', 1)
            return f"Conductivity: {value} {unit}"
        elif response == '':
            return f"empty"
        else:
            return f"Error: '{response}'"

    except Exception as e:
        return f"UART Error: {e}"

# Main loop
try:
    while True:
        print(read_conductivity())
        time.sleep(1)  # Total interval ≈ 1 second (600ms delay + 400ms sleep)
except KeyboardInterrupt:
    ser.close()
    print("Program stopped")
