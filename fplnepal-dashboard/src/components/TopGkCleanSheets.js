import { useEffect, useState } from "react";
import { fetchFPLData } from "../api/fplApi";
import { TEAM_SHORT_NAMES, getTeamKit } from "../utils/teamData"; // ✅ Import team data
import { FaHandPaper } from "react-icons/fa";

const TopGkCleanSheets = () => {
  const [topGK, setTopGK] = useState(null);

  useEffect(() => {
    const getTopGK = async () => {
      const data = await fetchFPLData();
      if (data) {
        const goalkeepers = data.elements.filter((player) => player.element_type === 1);
        const sortedGKs = goalkeepers.sort((a, b) => b.clean_sheets - a.clean_sheets);
        setTopGK(sortedGKs[0]);
      }
    };
    getTopGK();
  }, []);

  if (!topGK) return <p className="text-gray-600 text-center">Loading...</p>;

  const kitUrl = getTeamKit(topGK.team, "GK"); // ✅ Use team kit
  const teamName = TEAM_SHORT_NAMES[topGK.team] || "Unknown"; // ✅ Get team name

  return (
    <div className="bg-green-300 p-4 shadow-md rounded-lg flex flex-col items-center text-center">
      {/* Team Kit */}
      <img src={kitUrl} alt={teamName} className="w-20 h-20 mb-2" />

            {/* Player Name */}
            <h2 className="text-md font-bold">{topGK.web_name}</h2>

      {/* Team Name */}
      <p className="text-sm font-semibold text-gray-700">{teamName}</p>



      {/* Clean Sheets */}
      <div className="flex justify-center items-center text-s text-purple-950 mt-2">
        <FaHandPaper className="mr-2" /> CS
      </div>
      <p className="text-lg font-bold text-purple-950">{topGK.clean_sheets}</p>
    </div>
  );
};

export default TopGkCleanSheets;
