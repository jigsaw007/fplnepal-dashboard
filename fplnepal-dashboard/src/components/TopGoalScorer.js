import { useEffect, useState } from "react";
import { fetchFPLData } from "../api/fplApi";
import { TEAM_SHORT_NAMES, getTeamKit } from "../utils/teamData"; // ✅ Import team data
import { FaFutbol } from "react-icons/fa";

const TopGoalScorer = () => {
  const [topScorer, setTopScorer] = useState(null);

  useEffect(() => {
    const getTopScorer = async () => {
      const data = await fetchFPLData();
      if (data) {
        const sortedPlayers = data.elements.sort((a, b) => b.goals_scored - a.goals_scored);
        setTopScorer(sortedPlayers[0]);
      }
    };
    getTopScorer();
  }, []);

  if (!topScorer) return <p className="text-gray-600 text-center">Loading...</p>;

  const kitUrl = getTeamKit(topScorer.team, "MID"); // ✅ Use team kit
  const teamName = TEAM_SHORT_NAMES[topScorer.team] || "Unknown"; // ✅ Get team name

  return (
    <div className="bg-green-300 p-4 shadow-md rounded-lg flex flex-col items-center text-center">
      {/* Team Kit */}
      <img src={kitUrl} alt={teamName} className="w-20 h-20 mb-2" />

            {/* Player Name */}
            <h2 className="text-md font-bold">{topScorer.web_name}</h2>

      {/* Team Name */}
      <p className="text-sm font-semibold text-gray-700">{teamName}</p>



      {/* Goals Scored */}
      <div className="flex justify-center items-center text-s text-purple-950 mt-2">
        <FaFutbol className="mr-2" /> Goals
      </div>
      <p className="text-lg font-bold text-purple-950">{topScorer.goals_scored}</p>
    </div>
  );
};

export default TopGoalScorer;
