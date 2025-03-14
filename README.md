# Demeter

## Project Objectives
DeMeter, named after the Greek goddess of agriculture and fertility (also doubling as ”The Meter”),
is an intelligent hydroponic system designed to be self-nourishing, nutrient-tracking, and user-observable
through a web-app portal where users can monitor plant growth. It is designed for ease of use, targeting
customers who may not have a green thumb. The system includes a water pumping mechanism, nutrient
sensors, and a live feed to the web portal.

The primary objective is to develop an automated hydroponic system that not only regulates pH
and nutrient levels but also provides real-time monitoring and user control via a web-based interface.
The system integrates pH, EC, and temperature sensors through the Raspberry Pi to dispense pH-up,
pH-down, and nutrient solutions as needed. Sensor data is continuously logged and visualized through
interactive graphs, allowing users to track environmental changes. Unlike static automation, our system
enables users to set and adjust ideal values for pH and EC thresholds directly through the web interface,
ensuring adaptability for different plant types and growing conditions.

## Running the System and Website

### Running the Flask API and System
To start the Flask API and the overall hydroponic system:
1. **Navigate to the Raspberry Pi folder:**
   ```bash
   cd Raspberry-Pi
   ```
2. **Run the main script:**
   ```bash
   python3 main.py
   ```

### Running the Website
To run the web interface locally:
1. **Navigate to the DeMeterWebsite folder:**
   ```bash
   cd DeMeterWebsite
   ```
2. **Install dependencies:**
   ```bash
   npm i
   ```
3. **Start the development server:**
   ```bash
   npm run dev
   ```
4. Follow the **localhost link** provided in the terminal to access the website.

### Important Notes
- Ensure all required **JavaScript packages** are installed before running the website.
- The Raspberry Pi and the web application **must be connected to the same WiFi network** to allow communication and data retrieval from the sensors.

