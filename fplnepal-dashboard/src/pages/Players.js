import { useEffect, useState } from "react";
import { fetchFPLData } from "../api/fplApi";
import { FaSquare, FaSquareFull } from "react-icons/fa";
import PlayerChart from "../components/PlayerChart";



// Team and Position Mappings
const TEAMS = {
  1: "Arsenal",
  2: "Aston Villa",
  3: "Bournemouth",
  4: "Brentford",
  5: "Brighton",
  6: "Chelsea",
  7: "Crystal Palace",
  8: "Everton",
  9: "Fulham",
  10: "Ipswich",
  11: "Leicester",
  12: "Liverpool",
  13: "Man City",
  14: "Man Utd",
  15: "Newcastle",
  16: "Nott'm Forest",
  17: "Southampton",
  18: "Spurs",
  19: "West Ham",
  20: "Wolves",
};

const POSITIONS = { 1: "Goalkeeper", 2: "Defender", 3: "Midfielder", 4: "Forward" };



const Players = () => {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [players, setPlayers] = useState([]);
  const [sortKey, setSortKey] = useState("total_points"); // Default sorting by total points
  const [sortOrder, setSortOrder] = useState("desc");
  const [teamFilter, setTeamFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const playersPerPage = 15;

  useEffect(() => {
    const getPlayers = async () => {
      const data = await fetchFPLData();
      if (data) {
        const sortedPlayers = [...data.elements].sort((a, b) => b.total_points - a.total_points);
        setPlayers(sortedPlayers);
      }
    };
    getPlayers();
  }, []);

  // Sorting Players
  const sortPlayers = (key) => {
    const order = sortKey === key && sortOrder === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortOrder(order);
    setPlayers((prevPlayers) =>
      [...prevPlayers].sort((a, b) => (order === "asc" ? a[key] - b[key] : b[key] - a[key]))
    );
  };

  // Filtering Players
  const filteredPlayers = players.filter(
    (player) =>
      (!teamFilter || player.team === parseInt(teamFilter)) &&
      (!positionFilter || player.element_type === parseInt(positionFilter))
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredPlayers.length / playersPerPage);
  const paginatedPlayers = filteredPlayers.slice(
    (currentPage - 1) * playersPerPage,
    currentPage * playersPerPage
  );

  return (
    <div className="p-4 md:p-6">
      {/* Filters */}
      <div className="flex flex-wrap space-x-4 mb-6">
        <select className="border p-2 rounded shadow-md" value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}>
          <option value="">All Teams</option>
          {Object.entries(TEAMS).map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>

        <select className="border p-2 rounded shadow-md" value={positionFilter} onChange={(e) => setPositionFilter(e.target.value)}>
          <option value="">All Positions</option>
          {Object.entries(POSITIONS).map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 text-sm shadow-lg rounded-lg">
          <thead className="bg-gradient-to-r from-purple-600 to-indigo-500 text-white uppercase tracking-wider">
            <tr>
              {[
                { key: "web_name", label: "Name" },
                { key: "now_cost", label: "Cost" },
                { key: "points_per_game", label: "Points/Game" },
                { key: "total_points", label: "Total Points" },
                { key: "goals_scored", label: "Goals" },
                { key: "assists", label: "Assists" },
                { key: "clean_sheets", label: "Clean Sheets" },
                { key: "selected_by_percent", label: "Selected %" },
                { key: "yellow_cards", label: "Yellow Card" }, // ✅ New Column
                { key: "red_cards", label: "Red Card" }, // ✅ New Column
              ].map(({ key, label }) => (
                <th
                  key={key}
                  className="border border-gray-300 p-3 cursor-pointer hover:bg-indigo-700 transition duration-200"
                  onClick={() => sortPlayers(key)}
                >
                  {label} {sortKey === key ? (sortOrder === "asc" ? "🔼" : "🔽") : ""}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedPlayers.map((player) => (
              <tr 
              key={player.id} 
              className="border border-gray-300 text-gray-800 hover:bg-gray-100 transition duration-200 cursor-pointer"
              onClick={() => setSelectedPlayer(player)} // ✅ Set selected player on click
            >
                <td className="p-3">{player.web_name}</td>
                <td className="p-3">£{(player.now_cost / 10).toFixed(1)}m</td>
                <td className="p-3">{player.points_per_game}</td>
                <td className="p-3">{player.total_points}</td>
                <td className="p-3">{player.goals_scored}</td>
                <td className="p-3">{player.assists}</td>
                <td className="p-3">{player.clean_sheets}</td>
                <td className="p-3">{player.selected_by_percent}%</td>
                
{/* Yellow Card Column with Filled Icon */}
<td className="p-3 text-center">
  {player.yellow_cards > 0 ? (
    <>
      <FaSquareFull className="text-yellow-500 inline-block text-lg" /> {player.yellow_cards}
    </>
  ) : (
    "0"
  )}
</td>

{/* Red Card Column with Existing Icon */}
<td className="p-3 text-center">
  {player.red_cards > 0 ? (
    <>
      <FaSquare className="text-red-600 inline-block text-lg" /> {player.red_cards}
    </>
  ) : (
    "0"
  )}
</td>

              </tr>
            ))}
          </tbody>
        </table>
        {selectedPlayer && <PlayerChart player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />}


      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6 space-x-4">
        <button className="px-4 py-2 rounded-md bg-indigo-600 text-white shadow-md hover:bg-indigo-800 transition disabled:opacity-50" disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)}>⬅ Previous</button>
        <span className="text-lg font-semibold">Page {currentPage} of {totalPages}</span>
        <button className="px-4 py-2 rounded-md bg-indigo-600 text-white shadow-md hover:bg-indigo-800 transition disabled:opacity-50" disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => prev + 1)}>Next ➡</button>
      </div>
    </div>
  );
};

export default Players;
