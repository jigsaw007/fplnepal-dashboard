import React, { useState } from "react";
import { fetchTieAnalyzer } from "../api/fplApi";
import { POSITIONS, TEAM_SHORT_NAMES, getTeamKit } from "../utils/teamData";

const TieAnalyzer = () => {
  const [teamId1, setTeamId1] = useState("");
  const [teamId2, setTeamId2] = useState("");
  const [gameweek, setGameweek] = useState(1);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAnalysisResult(null);

    try {
      const data = await fetchTieAnalyzer(teamId1, teamId2, gameweek);
      console.log("Received Data:", data);
      setAnalysisResult(data);
    } catch (error) {
      console.error("Error fetching tie analysis:", error);
      setAnalysisResult({ error: "Failed to analyze teams." });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Tie Analyzer</h2>

      <div className="bg-blue-100 p-4 rounded-lg mb-4">
        <h5 className="font-semibold">Tie-Break Rules:</h5>
        <ul className="list-disc ml-5 text-gray-600">
          <li>Most goals scored in the Gameweek</li>
          <li>Fewest goals conceded in the Gameweek</li>
          <li>Random Draw (if still tied)</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="number"
            className="p-2 border rounded w-full"
            placeholder="Team ID 1"
            value={teamId1}
            onChange={(e) => setTeamId1(e.target.value)}
            required
          />
          <input
            type="number"
            className="p-2 border rounded w-full"
            placeholder="Team ID 2"
            value={teamId2}
            onChange={(e) => setTeamId2(e.target.value)}
            required
          />
          <select
            className="p-2 border rounded w-full"
            value={gameweek}
            onChange={(e) => setGameweek(e.target.value)}
          >
            {Array.from({ length: 38 }, (_, i) => i + 1).map((gw) => (
              <option key={gw} value={gw}>
                Gameweek {gw}
              </option>
            ))}
          </select>
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded flex items-center justify-center" type="submit">
          {loading ? (
            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Analyze"
          )}
        </button>
      </form>

      {loading && (
        <div className="flex justify-center mt-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {analysisResult && !loading && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold">Results for Gameweek {gameweek}</h3>

          <h4 className="text-green-600 font-bold">
            🏆 Winner: {analysisResult.winner === "Tie" ? "Admin will draw a winner!" : analysisResult.winner}
          </h4>

          <p className="mt-2 text-sm text-gray-600">
            {analysisResult.tieReason === "goals_scored"
              ? "Winner determined by most goals scored."
              : analysisResult.tieReason === "goals_conceded"
              ? "Winner determined by fewest goals conceded."
              : "Tiebreaker needed (Admin will draw a winner)."}
          </p>

          <table className="table-auto w-full border border-gray-300 mt-4">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Team</th>
                <th className="border p-2">Manager</th>
                <th className="border p-2">Goals Scored</th>
                <th className="border p-2">Goals Conceded</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">{analysisResult.team1.team_name}</td>
                <td className="border p-2">{analysisResult.team1.manager_name}</td>
                <td className="border p-2">{analysisResult.team1.goals_scored}</td>
                <td className="border p-2">{analysisResult.team1.goals_conceded}</td>
              </tr>
              <tr>
                <td className="border p-2">{analysisResult.team2.team_name}</td>
                <td className="border p-2">{analysisResult.team2.manager_name}</td>
                <td className="border p-2">{analysisResult.team2.goals_scored}</td>
                <td className="border p-2">{analysisResult.team2.goals_conceded}</td>
              </tr>
            </tbody>
          </table>

          <h5 className="font-bold mt-6">Players Who Scored</h5>
          <div className="grid grid-cols-2 gap-4">
            {[analysisResult.team1, analysisResult.team2].map((team, index) => (
              <div key={index}>
                <h6 className="font-semibold">{team.team_name}</h6>
                <ul className="list-disc ml-4">
                  {team.players_scored.map((player, idx) => (
                    <li key={idx} className="flex items-center">
                      <img src={getTeamKit(player.team, POSITIONS[player.position])} alt="Kit" className="w-6 h-6 mr-2" />
                      {player.name} - {player.goals} goals
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <h5 className="font-bold mt-6">Players Who Conceded</h5>
<div className="grid grid-cols-2 gap-4">
  {[analysisResult.team1, analysisResult.team2].map((team, index) => (
    <div key={index}>
      <h6 className="font-semibold">{team.team_name}</h6>
      <ul className="list-disc ml-4">
        {team.players_conceded
          .filter(player => player.conceded > 0) // ✅ Only players with conceded goals
          .map((player, idx) => (
            <li key={idx} className="flex items-center">
              <img src={getTeamKit(player.team, POSITIONS[player.position])} alt="Kit" className="w-6 h-6 mr-2" />
              {player.name} - {player.conceded} conceded
            </li>
          ))}
      </ul>
    </div>
  ))}
</div>

        </div>
      )}
    </div>
  );
};

export default TieAnalyzer;
