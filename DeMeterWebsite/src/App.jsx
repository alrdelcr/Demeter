// DeviceHub component (src/components/DeviceHub.jsx)
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "./components/ui/card";
import "tailwindcss";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DeviceHub = () => {
  const [data, setData] = useState({ temperature: 0, pH: 0, ec: 0 });
  const [history, setHistory] = useState({ temperature: [], pH: [], ec: [] });

  useEffect(() => {
    console.log("History Data:", history);
    const fetchData = async () => {
      try {
        const response = await fetch("/sensor"); // This now points to the proxy
        const sensorData = await response.json();

        setData({
          temperature: sensorData.Temperature,
          pH: (Math.random() * 2 + 5).toFixed(2), // Placeholder for pH if not available
          ec: sensorData.EC,
        });

        setHistory((prev) => ({
          temperature: [
            ...prev.temperature,
            { day: prev.temperature.length + 1, value: sensorData.Temperature },
          ].slice(-7),
          pH: [
            ...prev.pH,
            {
              day: prev.pH.length + 1,
              value: parseFloat((Math.random() * 2 + 5).toFixed(2)),
            },
          ].slice(-7),
          ec: [
            ...prev.ec,
            { day: prev.ec.length + 1, value: sensorData.EC },
          ].slice(-7),
        }));
      } catch (error) {
        console.error("Error fetching sensor data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Fetch data every 5 seconds
    return () => clearInterval(interval); // Cleanup on component unmount
  }, [history]);

  const renderGraph = (data, color) => (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} />
      </LineChart>
    </ResponsiveContainer>
  );

  return (
    <div className="p-8 flex flex-col items-center justify-start min-h-screen bg-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <Card className="bg-blue-500 text-black shadow-lg rounded-2xl">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold">Temperature</h2>
            <p className="text-3xl font-semibold">{data.temperature} °C</p>
            {renderGraph(history.temperature, "#3B82F6")}
          </CardContent>
        </Card>

        <Card className="bg-green-500 text-black shadow-lg rounded-2xl">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold">pH Level</h2>
            <p className="text-3xl font-semibold">{data.pH}</p>
            {renderGraph(history.pH, "#22C55E")}
          </CardContent>
        </Card>

        <Card className="bg-purple-500 text-black shadow-lg rounded-2xl">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold">EC Level</h2>
            <p className="text-3xl font-semibold">{data.ec} mS/cm</p>
            {renderGraph(history.ec, "#A855F7")}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeviceHub;

// // DeviceHub component (src/components/DeviceHub.jsx)
// import React, { useState, useEffect } from "react";
// import { Card, CardContent } from "./components/ui/card";
// import "tailwindcss";

// const DeviceHub = () => {
//   const [data, setData] = useState({ temperature: 0, pH: 0, ec: 0 });

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch("/sensor"); // This now points to the proxy
//         const sensorData = await response.json();
//         setData({
//           temperature: sensorData.Temperature,
//           pH: (Math.random() * 2 + 5).toFixed(2), // Placeholder for pH if not available
//           ec: sensorData.EC,
//         });
//       } catch (error) {
//         console.error("Error fetching sensor data:", error);
//       }
//     };

//     fetchData();
//     const interval = setInterval(fetchData, 5000); // Fetch data every 5 seconds
//     return () => clearInterval(interval); // Cleanup on component unmount
//   }, []);

//   return (
//     <div className="p-8 flex flex-col items-center justify-start min-h-screen bg-gray-100">
//       {/* Removed max-w-4xl to allow full width */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
//         <Card className="bg-blue-500 text-black shadow-lg rounded-2xl">
//           <CardContent className="p-6 text-center">
//             <h2 className="text-2xl font-bold">Temperature</h2>
//             <p className="text-3xl font-semibold">{data.temperature} °C</p>
//           </CardContent>
//         </Card>
//         <Card className="bg-green-500 text-black shadow-lg rounded-2xl">
//           <CardContent className="p-6 text-center">
//             <h2 className="text-2xl font-bold">pH Level</h2>
//             <p className="text-3xl font-semibold">{data.pH}</p>
//           </CardContent>
//         </Card>
//         <Card className="bg-purple-500 text-black shadow-lg rounded-2xl">
//           <CardContent className="p-6 text-center">
//             <h2 className="text-2xl font-bold">EC Level</h2>
//             <p className="text-3xl font-semibold">{data.ec} mS/cm</p>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default DeviceHub;
