import React, { useState } from "react";
import { fetchVersusHistory } from "../api/fplApi";
import { getTeamKit } from "../utils/teamData";

// Spinner Component
const Spinner = () => (
  <div className="flex justify-center items-center mt-6">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Player Card Component
const PlayerCard = ({ player }) => (
  <div className="flex flex-col items-center bg-gray-100 p-1 rounded-lg shadow-md w-20">
    <img 
      src={getTeamKit(player.teamId, player.element_type === 1 ? "GKP" : "OUTFIELD")} 
      alt="Kit" 
      className="w-10 h-10"
    />
    <p className="text-xs font-semibold text-center">
      {player.name.length > 8 ? `${player.name.slice(0, 8)}..` : player.name} 
      {player.is_captain ? " (C)" : player.is_vice_captain ? " (VC)" : ""}
    </p>
    <p className="text-xs text-blue-700">
      {player.is_captain ? player.points * 2 : player.points} pts
    </p>
  </div>
);

// Render Squad as a List (for smaller screens)
const renderSquadAsList = (squad) => {
  if (!squad || squad.length === 0) return <p>No players available</p>;

  // Split into starting XI (positions 1-11) and bench (12-15)
  const startingXI = squad.filter(player => player.position <= 11);
  const bench = squad.filter(player => player.position > 11);

  return (
    <div className="mt-4">
      {/* Starting XI List */}
      <h5 className="text-sm font-semibold mb-2">Starting XI</h5>
      <div className="flex flex-col gap-2">
        {startingXI.map(player => (
          <div key={player.id} className="flex items-center bg-gray-100 p-2 rounded-lg shadow-md">
            <img 
              src={getTeamKit(player.teamId, player.element_type === 1 ? "GKP" : "OUTFIELD")} 
              alt="Kit" 
              className="w-8 h-8 mr-2"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold">
                {player.name} {player.is_captain ? " (C)" : player.is_vice_captain ? " (VC)" : ""}
              </p>
              <p className="text-xs text-blue-700">
                {player.is_captain ? player.points * 2 : player.points} pts
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bench List */}
      <h5 className="mt-4 text-sm font-semibold mb-2">Bench</h5>
      <div className="flex flex-col gap-2 opacity-70">
        {bench.map(player => (
          <div key={player.id} className="flex items-center bg-gray-100 p-2 rounded-lg shadow-md">
            <img 
              src={getTeamKit(player.teamId, player.element_type === 1 ? "GKP" : "OUTFIELD")} 
              alt="Kit" 
              className="w-8 h-8 mr-2"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold">
                {player.name} {player.is_captain ? " (C)" : player.is_vice_captain ? " (VC)" : ""}
              </p>
              <p className="text-xs text-blue-700">
                {player.is_captain ? player.points * 2 : player.points} pts
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Render Squad in Formation (for larger screens)
const renderSquadInFormation = (squad) => {
  if (!squad || squad.length === 0) return <p>No players available</p>;

  // Split into starting XI (positions 1-11) and bench (12-15)
  const startingXI = squad.filter(player => player.position <= 11);
  const bench = squad.filter(player => player.position > 11);

  // Group starting XI by element_type
  const gkp = startingXI.filter(p => p.element_type === 1); // Goalkeeper
 

 const def = startingXI.filter(p => p.element_type === 2); // Defenders
  const mid = startingXI.filter(p => p.element_type === 3); // Midfielders
  const fwd = startingXI.filter(p => p.element_type === 4); // Forwards

  // Determine formation
  const formation = `1-${def.length}-${mid.length}-${fwd.length}`;

  return (
    <div className="mt-4">
      {/* Formation Display */}
      <div className="formation-container bg-green-400 p-4 rounded-lg shadow-md" style={{ minHeight: "400px" }}>
        {/* <h5 className="text-sm font-semibold text-white mb-2">Formation: {formation}</h5> */}
        
        {/* Goalkeeper Row */}
        <div className="flex justify-center gap-2 mb-8">
          {gkp.map(player => <PlayerCard key={player.id} player={player} />)}
        </div>

        {/* Defenders Row */}
        <div className="flex justify-around gap-2 mb-8">
          {def.map(player => <PlayerCard key={player.id} player={player} />)}
        </div>

        {/* Midfielders Row */}
        <div className="flex justify-around gap-2 mb-8">
          {mid.map(player => <PlayerCard key={player.id} player={player} />)}
        </div>

        {/* Forwards Row */}
        <div className="flex justify-around gap-2">
          {fwd.map(player => <PlayerCard key={player.id} player={player} />)}
        </div>
      </div>

      {/* Bench Players */}
      <h5 className="mt-4 text-xs font-semibold">Bench</h5>
      <div className="flex flex-wrap justify-center gap-1 mt-2 opacity-70">
        {bench.map(player => <PlayerCard key={player.id} player={player} />)}
      </div>
    </div>
  );
};

const Versus = () => {
  const [teamId1, setTeamId1] = useState("");
  const [teamId2, setTeamId2] = useState("");
  const [gameweek, setGameweek] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const gameweeks = Array.from({ length: 38 }, (_, i) => i + 1);

  const handleCompare = async () => {
    if (!teamId1 || !teamId2) {
      setError("Please enter both team IDs.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetchVersusHistory(teamId1, teamId2, gameweek);
      setResult(response);
    } catch (err) {
      setError("Failed to fetch match result. Please check the inputs.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md text-center">
      <h2 className="text-2xl font-semibold mb-4">Head-to-Head Match</h2>

      {/* Team ID Input Fields */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <input 
          type="number" 
          placeholder="Team ID 1" 
          value={teamId1} 
          onChange={(e) => setTeamId1(e.target.value)}
          className="w-full p-2 border rounded-lg text-sm"
        />
        <input 
          type="number" 
          placeholder="Team ID 2" 
          value={teamId2} 
          onChange={(e) => setTeamId2(e.target.value)}
          className="w-full p-2 border rounded-lg text-sm"
        />
      </div>

      {/* Gameweek Selection */}
      <div className="mb-3">
        <select 
          value={gameweek} 
          onChange={(e) => setGameweek(Number(e.target.value))}
          className="w-full p-2 border rounded-lg text-sm"
        >
          {gameweeks.map((gw) => (
            <option key={gw} value={gw}>Gameweek {gw}</option>
          ))}
        </select>
      </div>

      <button 
        onClick={handleCompare} 
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        disabled={loading}
      >
        {loading ? "Comparing..." : "Find Winner"}
      </button>

      {loading && <Spinner />}

      {error && <p className="text-red-500 mt-3">{error}</p>}

      {result && (
        <div className="mt-4 bg-white p-4 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-3">Match Result</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[result.team1, result.team2].map((team, index) => (
              <div key={index} className="p-3 border rounded-lg shadow bg-gray-50 text-center">
                <h4 className={`text-md font-semibold ${index === 0 ? "text-blue-700" : "text-red-700"}`}>
                  {team.manager_name}
                </h4>
                <p className="text-lg font-bold text-yellow-600 mt-1">
                  <strong>Team:</strong> {team.team_name}
                </p>
                <p className="text-xl font-bold text-green-600 mt-2">
                  <strong>Gameweek Score:</strong> <span>{team.gameweek_score} pts</span>
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  <strong>Chips Used:</strong> {team.chips_used}
                </p>
                
                {/* Conditionally render squad based on screen size */}
                <div className="block sm:hidden">
                  {renderSquadAsList(team.squad)}
                </div>
                <div className="hidden sm:block">
                  {renderSquadInFormation(team.squad)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Versus;