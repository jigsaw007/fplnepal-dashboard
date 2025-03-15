import { useEffect, useState } from "react";
import { fetchFPLData } from "../api/fplApi";
import { TEAM_SHORT_NAMES, getTeamKit } from "../utils/teamData"; // ✅ Import team data

const TopSelectedPlayers = () => {
  const [topPlayers, setTopPlayers] = useState([]);

  useEffect(() => {
    const getTopPlayers = async () => {
      const data = await fetchFPLData();
      if (data) {
        const sortedPlayers = data.elements.sort(
          (a, b) => parseFloat(b.selected_by_percent) - parseFloat(a.selected_by_percent)
        );
        setTopPlayers(sortedPlayers.slice(0, 3)); // ✅ Get top 3 most selected players
      }
    };
    getTopPlayers();
  }, []);

  if (topPlayers.length === 0) return <p className="text-gray-600 text-center">Loading...</p>;

  return (
    <div className="bg-purple-950 p-2 shadow-md rounded-lg text-sm">
      <h2 className="text-md font-bold text-center mb-2 text-white" >Most Selected Players</h2>
      <div className="flex flex-col items-center w-full gap-6"> {/* ✅ Added small gap */}
  {topPlayers.map((player) => {
    const teamShortName = TEAM_SHORT_NAMES[player.team] || "N/A"; // ✅ Get team short name
    const kitUrl = getTeamKit(player.team, "MID"); // ✅ Use team kit

    return (
      <div key={player.id} className="bg-green-300 p-2 rounded-lg shadow flex items-center justify-between w-full h-15"> {/* ✅ Keeps same height */}
        <img src={kitUrl} alt={teamShortName} className="w-10 h-10" /> {/* ✅ Kit */}
        <h3 className="text-xs font-semibold w-16 text-center">{player.web_name}</h3> {/* ✅ Name */}
        <p className="text-xs text-purple-950 w-10 text-right">{player.selected_by_percent}%</p> {/* ✅ % Selected */}
      </div>
    );
  })}
</div>


    </div>
  );
};

export default TopSelectedPlayers;
