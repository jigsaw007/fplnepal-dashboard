import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FaTimes } from "react-icons/fa";
import { fetchPlayerDetails } from "../api/fplApi"; // ✅ Import API call

const PlayerChart = ({ player, onClose }) => {
  const [playerDetails, setPlayerDetails] = useState(null);

  useEffect(() => {
    if (!player) return;

    const getPlayerDetails = async () => {
      const data = await fetchPlayerDetails(player.id); // ✅ Fetch extra player data
      setPlayerDetails(data);
    };

    getPlayerDetails();
  }, [player]);

  if (!player) return null;

  if (!playerDetails) {
    return (
      <div className="fixed top-10 right-10 bg-white p-8 shadow-lg rounded-lg border border-gray-200 z-50 w-[500px] h-[1000px]">
        <h2 className="text-lg font-bold text-purple-950 mb-2">Loading {player.web_name}'s stats...</h2>
      </div>
    );
  }

  // ✅ Ensure correct image URL from API
  const playerImageUrl = `https://resources.premierleague.com/premierleague/photos/players/110x140/p${player.photo.replace("jpg", "png")}`;

  // ✅ Format values properly (avoid '0-' or NaN issues)
  const formatValue = (val) => (isNaN(val) ? "N/A" : val);

  // ✅ Correct Data Formatting
  const data = [
    { stat: "Goals", value: formatValue(player.goals_scored) },
    { stat: "Assists", value: formatValue(player.assists) },
    { stat: "Clean Sheets", value: formatValue(player.clean_sheets) },
    { stat: "Yellow Cards", value: formatValue(player.yellow_cards) },
    { stat: "Red Cards", value: formatValue(player.red_cards) },
    { stat: "Bonus Points", value: formatValue(playerDetails.bonus) },
    { stat: "Minutes Played", value: formatValue(playerDetails.minutes) },
    { stat: "Expected Goals (xG)", value: formatValue(parseFloat(playerDetails.expected_goals).toFixed(2)) },
    { stat: "Expected Assists (xA)", value: formatValue(parseFloat(playerDetails.expected_assists).toFixed(2)) },
    { stat: "Expected Goal Involvements", value: formatValue(parseFloat(playerDetails.expected_goal_involvements).toFixed(2)) },
    { stat: "Expected Goals Conceded", value: formatValue(parseFloat(playerDetails.expected_goals_conceded).toFixed(2)) },
    { stat: "BPS", value: formatValue(playerDetails.bps) },
    { stat: "Influence", value: formatValue(parseFloat(playerDetails.influence).toFixed(1)) },
    { stat: "Creativity", value: formatValue(parseFloat(playerDetails.creativity).toFixed(1)) },
    { stat: "Threat", value: formatValue(parseFloat(playerDetails.threat).toFixed(1)) },
    { stat: "ICT Index", value: formatValue(parseFloat(playerDetails.ict_index).toFixed(1)) },
  ];

  return (
    <div className="fixed top-10 right-10 bg-white p-8 shadow-lg rounded-lg border border-gray-200 z-50 w-[500px] h-[600px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-purple-950">{player.web_name}'s Stats</h2>
        <button onClick={onClose} className="text-red-500 hover:text-red-700">
          <FaTimes size={24} />
        </button>
      </div>
      <div className="flex flex-col items-center mb-6">
        <img src={playerImageUrl} alt={player.web_name} className="w-32 h-40 object-cover rounded-md" />
      </div>
      <ResponsiveContainer width="100%" height={500} className="overflow-visible">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tick={{ fill: "#333", fontSize: 14 }} />
          <YAxis type="category" dataKey="stat" tick={{ fill: "#333", fontSize: 14 }} width={180} />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PlayerChart;
