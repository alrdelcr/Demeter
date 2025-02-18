// DeviceHub component (src/components/DeviceHub.jsx)
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "./components/ui/card";
import "tailwindcss";

const DeviceHub = () => {
  const [data, setData] = useState({ temperature: 0, pH: 0, ec: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/sensor"); // This now points to the proxy
        const sensorData = await response.json();
        setData({
          temperature: sensorData.Temperature,
          pH: (Math.random() * 2 + 5).toFixed(2), // Placeholder for pH if not available
          ec: sensorData.EC,
        });
      } catch (error) {
        console.error("Error fetching sensor data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Fetch data every 5 seconds
    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  return (
    <div className="p-8 flex flex-col items-center justify-start min-h-screen bg-gray-100">
      {/* Removed max-w-4xl to allow full width */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <Card className="bg-blue-500 text-black shadow-lg rounded-2xl">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold">Temperature</h2>
            <p className="text-3xl font-semibold">{data.temperature} °C</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500 text-black shadow-lg rounded-2xl">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold">pH Level</h2>
            <p className="text-3xl font-semibold">{data.pH}</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500 text-black shadow-lg rounded-2xl">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold">EC Level</h2>
            <p className="text-3xl font-semibold">{data.ec} mS/cm</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeviceHub;
