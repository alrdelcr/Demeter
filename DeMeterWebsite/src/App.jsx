import React, { useState, useEffect } from "react";
import SensorGraph from "./components/SensorGraph";
import AllTimeGraph from "./components/AllTimeGraph";
import { Card, CardContent } from "./components/ui/Card";
import "tailwindcss";

const getPhColorClass = (pH) => {
  const numericPh = parseFloat(pH);
  if (isNaN(numericPh)) return "bg-gray-400"; // Default gray if invalid
  if (numericPh <= 4.5) return "bg-red-500"; // Very acidic
  if (numericPh <= 5.5) return "bg-orange-500"; // Acidic
  if (numericPh <= 6.5) return "bg-yellow-500"; // Moderately acidic
  if (numericPh <= 7.5) return "bg-green-500"; // Neutral
  return "bg-blue-500"; // Alkaline
};

const getTempColorClass = (temp) => {
  const numericTemp = parseFloat(temp);
  if (isNaN(numericTemp)) return "bg-gray-400";
  if (numericTemp < 25.5 && numericTemp > 17.5) return "bg-green-400"; // Ideal range
  if (numericTemp <= 17.5) return "bg-blue-400"; // Too cold
  if (numericTemp >= 25.5) return "bg-red-400"; // Too hot
  return "bg-blue-500";
};

const DeviceHub = () => {
  const [currentData, setCurrentData] = useState({ temp: 0, pH: 0, ec: 0 });
  const [isConnected, setIsConnected] = useState(true);
  const [sevenDayData, setSevenDayData] = useState([]);

  // Convert sensor data from the API into the format expected by the UI
  const transformSensorData = (data) => ({
    temp: data.Temperature,
    ec: data["EC"],
    // Use Pump_pH_high if available and nonzero; otherwise fallback to Pump_pH_low
    pH: data["pH"] !== undefined && data["pH"] !== 0 ? data["pH"] : data["99"],
  });

  // Fetch current sensor data every 10 seconds
  useEffect(() => {
    const fetchCurrentData = () => {
      fetch("/api/sensor")
        .then((res) => res.json())
        .then((data) => {
          setCurrentData(transformSensorData(data));
          setIsConnected(true);
        })
        .catch((error) => {
          console.error("Error fetching sensor data:", error);
          setIsConnected(false);
        });
    };

    fetchCurrentData();
    const interval = setInterval(fetchCurrentData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch 7-day average data once when the component mounts
  useEffect(() => {
    const fetchHistoryData = () => {
      fetch("/api/history/7d_avg")
        .then((res) => res.json())
        .then((data) => {
          const transformedData = data.map((item) => ({
            day: item.date, // using the date as a label for the graph
            temp: item.Temperature,
            ec: item.EC,
            pH:
              item["pH"] !== undefined && item["pH"] !== 0
                ? item["pH"]
                : item["99"],
          }));
          setSevenDayData(transformedData);
        })
        .catch((error) => console.error("Error fetching history data:", error));
    };

    fetchHistoryData();
  }, []);

  return (
    <div className="p-8 flex flex-col items-center min-h-screen bg-gray-100 space-y-8">
      {/* Connection Status */}
      <div
        className={`px-6 py-3 rounded-lg text-lg font-semibold shadow-md ${
          isConnected
            ? "bg-green-200 text-green-800"
            : "bg-red-200 text-red-800"
        }`}
      >
        {isConnected ? "Connected to Demeter ✅" : "Disconnected ❌"}
      </div>

      {/* Sensor Data Cards */}
      <Card className="w-full max-w-5xl bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-center mb-4 text-black">
          Current Sensor Values
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl">
          <Card
            className={`text-white shadow-lg rounded-2xl transition-all duration-500 ${getTempColorClass(
              currentData.temp
            )}`}
          >
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold">Temperature</h2>
              <p className="text-3xl font-bold">{currentData.temp} °C</p>
            </CardContent>
          </Card>

          <Card
            className={`text-white shadow-lg rounded-2xl transition-all duration-500 ${getPhColorClass(
              currentData.pH
            )}`}
          >
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold">pH Level</h2>
              <p className="text-3xl font-bold">{currentData.pH} pH</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-500 text-white shadow-lg rounded-2xl">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold">EC Level</h2>
              <p className="text-3xl font-bold">{currentData.ec} mS/cm</p>
            </CardContent>
          </Card>
        </div>
      </Card>

      {/* Graphs Section */}
      <Card className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-5xl">
        <h2 className="text-2xl font-bold text-center mb-4 text-black">
          Sensor Trends this Week
        </h2>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SensorGraph
            title="Temperature Trend"
            type="temp"
            sensorData={sevenDayData}
          />
          <SensorGraph
            title="pH Level Trend"
            type="pH"
            sensorData={sevenDayData}
          />
          <SensorGraph
            title="EC Level Trend"
            type="ec"
            sensorData={sevenDayData}
          />
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-5xl">
        <h2 className="text-2xl font-bold text-center mb-4 text-black">
          Historical Sensor Data
        </h2>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AllTimeGraph
            title="All-Time Temperature Data"
            dataKey="Temperature"
            strokeColor="#FF5733"
          />
          <AllTimeGraph
            title="All-Time pH Data"
            dataKey="pH"
            strokeColor="#33C1FF"
          />
          <AllTimeGraph
            title="All-Time EC Data"
            dataKey="EC"
            strokeColor="#33FF57"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default DeviceHub;

// import React, { useState, useEffect } from "react";
// import { Card, CardContent } from "./components/ui/card";
// import "tailwindcss";
// import SensorGraph from "./components/SensorGraph";

// const DeviceHub = () => {
//   const [data, setData] = useState({ temperature: 0, pH: 0, ec: 0 });
//   const [isConnected, setIsConnected] = useState(true);
//   const [history24h, setHistory24h] = useState([]);
//   const [history7d, setHistory7d] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch real-time sensor data
//         const sensorResponse = await fetch("/sensor");
//         if (!sensorResponse.ok) throw new Error("Failed to fetch sensor data");
//         const sensorData = await sensorResponse.json();

//         setData({
//           temperature: sensorData.Temperature,
//           pH: sensorData.pH,
//           ec: sensorData.EC,
//         });
//         setIsConnected(true);

//         // Fetch 24-hour historical data
//         const history24hResponse = await fetch("/history/24h");
//         if (!history24hResponse.ok)
//           throw new Error("Failed to fetch 24h history");
//         const history24hData = await history24hResponse.json();
//         setHistory24h(history24hData);

//         // Fetch 7-day average data
//         const history7dResponse = await fetch("/history/7d_avg");
//         if (!history7dResponse.ok)
//           throw new Error("Failed to fetch 7d average history");
//         const history7dData = await history7dResponse.json();
//         setHistory7d(history7dData);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         setIsConnected(false);
//       }
//     };

//     fetchData();
//     const interval = setInterval(fetchData, 60000); // Refresh every minute
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="p-8 flex flex-col items-center justify-start min-h-screen bg-gray-100">
//       {/* Connection Status */}
//       <div
//         className={`mb-6 px-4 py-2 rounded-lg text-lg font-semibold ${
//           isConnected
//             ? "bg-green-200 text-green-800"
//             : "bg-red-200 text-red-800"
//         }`}
//       >
//         {isConnected ? "Connected to Demeter ✅" : "Disconnected ❌"}
//       </div>

//       {/* Sensor Data Cards */}
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
//             <p className="text-3xl font-semibold">{data.pH} pH</p>
//           </CardContent>
//         </Card>
//         <Card className="bg-purple-500 text-black shadow-lg rounded-2xl">
//           <CardContent className="p-6 text-center">
//             <h2 className="text-2xl font-bold">EC Level</h2>
//             <p className="text-3xl font-semibold">{data.ec} mS/cm</p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Graphs */}
//       <div className="p-8 flex flex-col items-center bg-gray-100 min-h-screen space-y-8">
//         <SensorGraph
//           title="Last 24 Hours Sensor Data"
//           unit="°C / pH / mS/cm"
//           data={history24h}
//         />
//         <SensorGraph
//           title="7-Day Average Sensor Data"
//           unit="°C / pH / mS/cm"
//           data={history7d}
//         />
//       </div>
//     </div>
//   );
// };

// export default DeviceHub;

// // import React, { useState, useEffect } from "react";
// // import { Card, CardContent } from "./components/ui/card";
// // import "tailwindcss";
// // import SensorGraph from "./components/SensorGraph";

// // const DeviceHub = () => {
// //   const [data, setData] = useState({ temperature: 0, pH: 0, ec: 0 });
// //   const [isConnected, setIsConnected] = useState(true);

// //   useEffect(() => {
// //     const fetchData = async () => {
// //       try {
// //         const response = await fetch("/sensor"); // Proxy to Pi
// //         if (!response.ok) throw new Error("Network response was not ok");
// //         const sensorData = await response.json();
// //         setData({
// //           temperature: sensorData.Temperature,
// //           pH: (Math.random() * 2 + 5).toFixed(2), // Placeholder
// //           ec: sensorData.EC,
// //         });
// //         setIsConnected(true); // Connection successful
// //       } catch (error) {
// //         console.error("Error fetching sensor data:", error);
// //         setIsConnected(false); // Connection failed
// //       }
// //     };

// //     fetchData();
// //     const interval = setInterval(fetchData, 5000);
// //     return () => clearInterval(interval);
// //   }, []);

// //   return (
// //     <div className="p-8 flex flex-col items-center justify-start min-h-screen bg-gray-100">
// //       {/* Connection Status */}
// //       <div
// //         className={`mb-6 px-4 py-2 rounded-lg text-lg font-semibold ${
// //           isConnected
// //             ? "bg-green-200 text-green-800"
// //             : "bg-red-200 text-red-800"
// //         }`}
// //       >
// //         {isConnected ? "Connected to Demeter ✅" : "Disconnected ❌"}
// //       </div>

// //       {/* Sensor Data */}
// //       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
// //         <Card className="bg-blue-500 text-black shadow-lg rounded-2xl">
// //           <CardContent className="p-6 text-center">
// //             <h2 className="text-2xl font-bold">Temperature</h2>
// //             <p className="text-3xl font-semibold">{data.temperature} °C</p>
// //           </CardContent>
// //         </Card>
// //         <Card className="bg-green-500 text-black shadow-lg rounded-2xl">
// //           <CardContent className="p-6 text-center">
// //             <h2 className="text-2xl font-bold">pH Level</h2>
// //             <p className="text-3xl font-semibold">{data.pH}</p>
// //           </CardContent>
// //         </Card>
// //         <Card className="bg-purple-500 text-black shadow-lg rounded-2xl">
// //           <CardContent className="p-6 text-center">
// //             <h2 className="text-2xl font-bold">EC Level</h2>
// //             <p className="text-3xl font-semibold">{data.ec} mS/cm</p>
// //           </CardContent>
// //         </Card>
// //       </div>
// //       <div className="p-8 flex flex-col items-center bg-gray-100 min-h-screen space-y-8">
// //         <SensorGraph
// //           endpoint="/history/24h"
// //           title="Last 24 Hours Sensor Data"
// //           unit="°C / pH / mS/cm"
// //         />
// //         <SensorGraph
// //           endpoint="/history/7d_avg"
// //           title="7-Day Average Sensor Data"
// //           unit="°C / pH / mS/cm"
// //         />
// //       </div>
// //     </div>
// //   );
// // };

// // export default DeviceHub;
