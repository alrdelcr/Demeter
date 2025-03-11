import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const AllTimeGraph = ({ title, dataKey, strokeColor }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all-time sensor data from the backend
  useEffect(() => {
    fetch("/api/history/all")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => {
        // Format the timestamp for display (optional)
        const formattedData = data.map((item) => ({
          ...item,
          timestamp: new Date(item.timestamp).toLocaleString(),
        }));
        setData(formattedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching all-time data:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading all‑time data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="bg-white p-4 shadow-lg rounded-xl w-full max-w-4xl">
      <h2 className="text-lg font-bold text-center mb-3">{title}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" minTickGap={50} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={strokeColor || "#8884d8"}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AllTimeGraph;
