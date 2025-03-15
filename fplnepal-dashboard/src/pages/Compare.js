import { useEffect, useState } from "react";
import { fetchFPLData } from "../api/fplApi";
import { FaStar, FaPlus } from "react-icons/fa"; // Import Star & Plus Icon

const Compare = () => {
  const [teams, setTeams] = useState({});
  const [players, setPlayers] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState(["", ""]);
  const [selectedPlayers, setSelectedPlayers] = useState(["", ""]);
  const [playerData, setPlayerData] = useState([null, null]);
  const [showThirdPlayer, setShowThirdPlayer] = useState(false);
  

  useEffect(() => {
    const getData = async () => {
      const data = await fetchFPLData();
      if (data) {
        // Extract teams and players
        const teamsMap = {};
        data.teams.forEach((team) => {
          teamsMap[team.id] = team.name;
        });

        setTeams(teamsMap);
        setPlayers(data.elements);
      }
    };

    getData();
  }, []);

  const handleSelectPlayer = (playerId, index) => {
    const selected = players.find((p) => p.id === parseInt(playerId));
    const updatedData = [...playerData];
    updatedData[index] = selected;
    setPlayerData(updatedData);
  };

  // Add third player slot
  const addThirdPlayer = () => {
    setShowThirdPlayer(true);
    setSelectedTeams([...selectedTeams, ""]);
    setSelectedPlayers([...selectedPlayers, ""]);
    setPlayerData([...playerData, null]);
  };

  // List of attributes to compare
  const attributes = [
    { label: "Current Price", key: "now_cost" },
    { label: "Total Points", key: "total_points" },
    { label: "Goals", key: "goals_scored" },
    { label: "Assists", key: "assists" },
    { label: "Clean Sheets", key: "clean_sheets" },
    { label: "Goals Conceded", key: "goals_conceded" },
    { label: "Own Goals", key: "own_goals" },
    { label: "Penalties Saved", key: "penalties_saved" },
    { label: "Penalties Missed", key: "penalties_missed" },
    { label: "Yellow Cards", key: "yellow_cards" },
    { label: "Red Cards", key: "red_cards" },
    { label: "Saves", key: "saves" },
    { label: "Bonus", key: "bonus" },
    { label: "Starts", key: "starts" },
    { label: "Selected by percent", key: "selected_by_percent" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Compare Players</h1>

      {/* Dropdowns for Team and Player Selection */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {selectedTeams.map((team, index) => (
          <div key={index}>
            <select
              className="w-full p-2 border rounded"
              value={selectedTeams[index]}
              onChange={(e) => {
                const updatedTeams = [...selectedTeams];
                updatedTeams[index] = e.target.value;
                setSelectedTeams(updatedTeams);
              }}
            >
              <option value="">Select Team</option>
              {Object.entries(teams).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>

            <select
              className="w-full p-2 border rounded mt-2"
              value={selectedPlayers[index]}
              onChange={(e) => {
                const updatedPlayers = [...selectedPlayers];
                updatedPlayers[index] = e.target.value;
                setSelectedPlayers(updatedPlayers);
                handleSelectPlayer(e.target.value, index);
              }}
            >
              <option value="">Select Player</option>
              {players
                .filter((p) => p.team == selectedTeams[index])
                .map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.web_name}
                  </option>
                ))}
            </select>
          </div>
        ))}

        {/* Add Third Player Button */}
        {!showThirdPlayer && (
          <button
            onClick={addThirdPlayer}
            className="flex items-center justify-center border p-3 rounded-lg text-gray-500 hover:text-black transition"
          >
            <FaPlus className="mr-2" /> Add Player
          </button>
        )}
      </div>

      {/* Player Comparison Table */}
      {playerData.some((p) => p) && (
        <div className="border rounded-lg shadow p-4">
          <table className="w-full text-center">
            <thead className="bg-purple-900 text-white">
              <tr>
                {playerData.map((player, index) =>
                  player ? (
                    <th key={index} className="p-4">
                      <img
                        src={`https://resources.premierleague.com/premierleague/photos/players/110x140/p${player.photo.replace(
                          ".jpg",
                          ".png"
                        )}`}
                        alt={player.web_name}
                        className="w-24 mx-auto"
                      />
                      <p className="font-bold">{player.web_name}</p>
                    </th>
                  ) : (
                    <th key={index} className="p-4">Select Player</th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {attributes.map(({ label, key }) => {
                // Get max value to add star
                const maxVal = Math.max(...playerData.map((p) => (p ? parseFloat(p[key]) || 0 : 0)));

                return (
                  <tr key={key}>
                    {playerData.map((player, index) => (
                      <td key={index} className="p-2 border">
                        {player ? (
                          <>
                            {player[key]}
                            {parseFloat(player[key]) === maxVal && <FaStar className="inline-block text-yellow-500 ml-1" />}
                          </>
                        ) : (
                          "-"
                        )}
                      </td>
                    ))}
                    <td className="p-2 border font-bold">{label}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Compare;
