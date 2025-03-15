import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from "recharts";
import { fetchUserHistory } from "../api/fplApi";

const HistoryChart = ({ teamId }) => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!teamId) return;
      setLoading(true);
      try {
        const data = await fetchUserHistory(teamId);
        if (data && data.current) {
          const formattedData = data.current.map((gw) => ({
            gameweek: gw.event, // Numeric GW values
            points: gw.points,
            chip: data.chips.find((chip) => chip.event === gw.event)?.name || null, // Add chip if used
          }));
          setHistoryData(formattedData);
        }
      } catch (error) {
        console.error("Error fetching history data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [teamId]);

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg border border-gray-200">
      <h2 className="text-xl font-bold text-purple-950 mb-4">Gameweek Points History</h2>
      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : historyData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={historyData} margin={{ top: 20, right: 20, left: 10, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="gameweek" label={{ value: "Gameweek", position: "insideBottom", offset: -5 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="points" stroke="#8884d8" activeDot={{ r: 8 }}>
              <LabelList dataKey="chip" position="top" style={{ fontSize: 12, fill: "red" }} />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-center text-gray-600">No data available</p>
      )}
    </div>
  );
};

export default HistoryChart;