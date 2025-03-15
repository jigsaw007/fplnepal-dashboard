import { useEffect, useState } from "react";
import { fetchFPLData } from "../api/fplApi";
import { TEAM_SHORT_NAMES, getTeamKit } from "../utils/teamData"; // ✅ Import team data
import { FaHandsHelping } from "react-icons/fa";

const TopAssists = () => {
  const [topAssist, setTopAssist] = useState(null);

  useEffect(() => {
    const getTopAssist = async () => {
      const data = await fetchFPLData();
      if (data) {
        const sortedPlayers = data.elements.sort((a, b) => b.assists - a.assists);
        setTopAssist(sortedPlayers[0]);
      }
    };
    getTopAssist();
  }, []);

  if (!topAssist) return <p className="text-gray-600 text-center">Loading...</p>;

  const kitUrl = getTeamKit(topAssist.team, "MID"); // ✅ Use team kit
  const teamName = TEAM_SHORT_NAMES[topAssist.team] || "Unknown"; // ✅ Get team name

  return (
    <div className="bg-green-300 p-4 shadow-md rounded-lg flex flex-col items-center text-center">
      {/* Team Kit */}
      <img src={kitUrl} alt={teamName} className="w-20 h-20 mb-2" />

            {/* Player Name */}
            <h2 className="text-md font-bold">{topAssist.web_name}</h2>

      {/* Team Name */}
      <p className="text-sm font-semibold text-gray-700">{teamName}</p>



      {/* Assists */}
      <div className="flex justify-center items-center text-s text-purple-950 mt-2">
        <FaHandsHelping className="mr-2" /> Assists
      </div>
      <p className="text-lg font-bold text-purple-950">{topAssist.assists}</p>
    </div>
  );
};

export default TopAssists;
