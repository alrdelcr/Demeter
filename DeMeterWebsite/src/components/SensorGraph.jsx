import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

const SensorGraph = ({ title, type, sensorData }) => {
  // Define colors and labels based on the selected type
  const graphSettings = {
    temp: { color: "#ff7300", label: "Temperature (°C)" },
    pH: { color: "#387908", label: "pH Level" },
    ec: { color: "#8884d8", label: "EC (mS/cm)" },
  };

  return (
    <div className="bg-white p-6 shadow-xl rounded-2xl w-full max-w-4xl mx-auto my-4">
      <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
        {title}
      </h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart
          data={sensorData}
          margin={{ top: -10, right: 5, left: -20, bottom: -10 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            // domain={["dataMin - 10", "dataMax + 10"]}
            padding={{ top: 10, bottom: 10 }}
          />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 12, paddingBottom: 10 }} />

          {/* Display only the selected type */}
          <Line
            type="monotone"
            dataKey={type}
            stroke={graphSettings[type].color}
            name={graphSettings[type].label}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SensorGraph;

// import React from "react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   ResponsiveContainer,
//   Legend,
// } from "recharts";

// const SensorGraph = ({ title, type, sensorData }) => {
//   // Define colors and labels based on the selected type
//   const graphSettings = {
//     temp: { color: "#ff7300", label: "Temperature (°C)" },
//     pH: { color: "#387908", label: "pH Level" },
//     ec: { color: "#8884d8", label: "EC (mS/cm)" },
//   };

//   return (
//     <div className="bg-white p-4 shadow-lg rounded-xl w-full max-w-4xl">
//       <h2 className="text-lg font-bold text-center mb-3">{title}</h2>
//       <ResponsiveContainer width="100%" height={250}>
//         <LineChart
//           data={sensorData}
//           margin={{ top: -10, right: 5, left: -20, bottom: -10 }}
//         >
//           <CartesianGrid strokeDasharray="3 3" vertical={false} />
//           <XAxis dataKey="day" tick={{ fontSize: 12 }} />
//           <YAxis
//             tick={{ fontSize: 12 }}
//             // domain={["dataMin - 10", "dataMax + 10"]}
//             padding={{ top: 10, bottom: 10 }}
//           />
//           <Tooltip />
//           <Legend wrapperStyle={{ fontSize: 12, paddingBottom: 10 }} />

//           {/* Display only the selected type */}
//           <Line
//             type="monotone"
//             dataKey={type}
//             stroke={graphSettings[type].color}
//             name={graphSettings[type].label}
//             strokeWidth={2}
//             dot={{ r: 3 }}
//             activeDot={{ r: 6 }}
//           />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default SensorGraph;
