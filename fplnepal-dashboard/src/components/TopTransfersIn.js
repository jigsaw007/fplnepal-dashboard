import { useEffect, useState } from "react";
import { fetchTransfersData } from "../api/fplApi";
import { POSITIONS, TEAM_SHORT_NAMES, getTeamKit } from "../utils/teamData"; // ✅ Import team data

const TopTransfersIn = () => {
  const [topTransfers, setTopTransfers] = useState([]);

  useEffect(() => {
    const getTransfers = async () => {
      const data = await fetchTransfersData();
      if (data) {
        const sortedPlayers = data
          .sort((a, b) => b.transfers_in_event - a.transfers_in_event)
          .slice(0, 5);
        setTopTransfers(sortedPlayers);
      }
    };
    getTransfers();
  }, []);

  return (
    <div className="bg-purple-950 text-white p-2 shadow-md rounded-lg text-xs">
      <h2 className="text-sm font-bold text-center mb-1">Top Transfers In ↑</h2>
      <div className="space-y-1">
        {topTransfers.map((player) => {
          const teamShortName = TEAM_SHORT_NAMES[player.team] || "N/A"; 
          const kitUrl = getTeamKit(player.team, POSITIONS[player.element_type]);

          return (
            <div key={player.id} className="flex justify-between items-center bg-white text-black p-1 rounded-md shadow-sm">
              <div className="flex items-center space-x-1">
                <img src={kitUrl} alt={teamShortName} className="w-5 h-5" /> {/* ✅ Smaller Kit */}
                <span className="font-medium text-xs">
                  {player.web_name} ({POSITIONS[player.element_type] || "N/A"})
                </span>
              </div>
              <span className="bg-green-600 text-white px-1 py-0.5 rounded-md text-xs font-semibold">
                {player.transfers_in_event.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopTransfersIn;
