import React, { useState } from "react";
import { fetchUserHistory, fetchPlayerDetails } from "../api/fplApi";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// Define BASE_URL consistently with your API file
const BASE_URL = process.env.NODE_ENV === "development"
  ? "http://localhost:8888/.netlify/functions/api"
  : "https://webapp.fplnepal.com/.netlify/functions/api";

const SquadCompare = () => {
  const [teamId1, setTeamId1] = useState("");
  const [teamId2, setTeamId2] = useState("");
  const [comparisonData, setComparisonData] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCompare = async () => {
    if (!teamId1 || !teamId2) {
      setError("Please enter both team IDs.");
      return;
    }

    setLoading(true);
    setError(null);
    setComparisonData(null);
    setPlayerStats(null);

    try {
      // Fetch team data for both team IDs
      const [team1Data, team2Data] = await Promise.all([
        fetchUserHistory(teamId1),
        fetchUserHistory(teamId2), // Fixed: Use teamId2 instead of teamId1
      ]);

      if (!team1Data || !team2Data) {
        throw new Error("Failed to fetch team data.");
      }

      setComparisonData({
        team1: team1Data,
        team2: team2Data,
      });
      setPlayerStats(null); // No need for playerStats since we're using pick counts from comparisonData
    } catch (error) {
      setError("Failed to fetch data. Please check the team IDs.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Function to analyze chip usage effectiveness
  const analyzeChipUsage = (teamData) => {
    const chipEvents = teamData.chips.map(chip => chip.event);
    const chipScores = teamData.current
      .filter(gw => chipEvents.includes(gw.event))
      .map(gw => ({ event: gw.event, points: gw.points, chip: teamData.chips.find(c => c.event === gw.event)?.name }));
    const nonChipScores = teamData.current.filter(gw => !chipEvents.includes(gw.event)).map(gw => gw.points);
    const avgNonChipScore = nonChipScores.length ? (nonChipScores.reduce((a, b) => a + b, 0) / nonChipScores.length) : 0;

    return {
      chipDetails: chipScores,
      avgNonChipScore: avgNonChipScore.toFixed(2),
    };
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-3xl font-semibold text-center mb-6">Squad Comparison</h2>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="number"
          placeholder="Enter Team ID 1"
          value={teamId1}
          onChange={(e) => setTeamId1(e.target.value)}
          className="w-full p-3 border rounded-lg"
        />
        <input
          type="number"
          placeholder="Enter Team ID 2"
          value={teamId2}
          onChange={(e) => setTeamId2(e.target.value)}
          className="w-full p-3 border rounded-lg"
        />
      </div>

      <button
        onClick={handleCompare}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
        disabled={loading}
      >
        {loading ? "Comparing..." : "Compare Teams"}
      </button>

      {error && <p className="text-red-500 mt-3">{error}</p>}

      {loading && (
        <div className="flex justify-center mt-6">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}

      {comparisonData && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-center mb-4">Comparison Results</h3>

          {/* Team Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-4 border rounded-lg shadow bg-gray-50">
              <h4 className="text-lg font-semibold text-blue-700">{comparisonData.team1.team_name}</h4>
              <p><strong>Manager:</strong> {comparisonData.team1.name}</p>
              <p><strong>Best GW:</strong> {comparisonData.team1.best_gameweek.points} pts (GW {comparisonData.team1.best_gameweek.event})</p>
              <p><strong>Worst GW:</strong> {comparisonData.team1.worst_gameweek.points} pts (GW {comparisonData.team1.worst_gameweek.event})</p>
              <p><strong>Total Bench Points:</strong> {comparisonData.team1.total_bench_points}</p>
              <p><strong>Total Transfers:</strong> {comparisonData.team1.current.reduce((acc, gw) => acc + gw.event_transfers, 0)}</p>
              <p><strong>Chips Used:</strong> {comparisonData.team1.chips.map(chip => chip.name).join(", ") || "None"}</p>
            </div>

            <div className="p-4 border rounded-lg shadow bg-gray-50">
              <h4 className="text-lg font-semibold text-blue-700">{comparisonData.team2.team_name}</h4>
              <p><strong>Manager:</strong> {comparisonData.team2.name}</p>
              <p><strong>Best GW:</strong> {comparisonData.team2.best_gameweek.points} pts (GW {comparisonData.team2.best_gameweek.event})</p>
              <p><strong>Worst GW:</strong> {comparisonData.team2.worst_gameweek.points} pts (GW {comparisonData.team2.worst_gameweek.event})</p>
              <p><strong>Total Bench Points:</strong> {comparisonData.team2.total_bench_points}</p>
              <p><strong>Total Transfers:</strong> {comparisonData.team2.current.reduce((acc, gw) => acc + gw.event_transfers, 0)}</p>
              <p><strong>Chips Used:</strong> {comparisonData.team2.chips.map(chip => chip.name).join(", ") || "None"}</p>
            </div>
          </div>

          {/* Player Performance Comparison */}
          {comparisonData && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-center mb-4">Player Performance Comparison</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-4 border rounded-lg shadow bg-gray-50">
                  <h5 className="text-md font-semibold text-blue-700">{comparisonData.team1.team_name}</h5>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Favorite Player: {comparisonData.team1.favorite_player}</p>
                    <p className="text-sm">Times Picked: {comparisonData.team1.favorite_player_picks || 0}</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Favorite Captain: {comparisonData.team1.favorite_captain}</p>
                    <p className="text-sm">Times Picked as Captain: {comparisonData.team1.favorite_captain_picks || 0}</p>
                  </div>
                </div>
                <div className="p-4 border rounded-lg shadow bg-gray-50">
                  <h5 className="text-md font-semibold text-blue-700">{comparisonData.team2.team_name}</h5>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Favorite Player: {comparisonData.team2.favorite_player}</p>
                    <p className="text-sm">Times Picked: {comparisonData.team2.favorite_player_picks || 0}</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Favorite Captain: {comparisonData.team2.favorite_captain}</p>
                    <p className="text-sm">Times Picked as Captain: {comparisonData.team2.favorite_captain_picks || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chip Usage Analysis Section */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-center mb-4">Chip Usage Effectiveness</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-4 border rounded-lg shadow bg-gray-50">
                <h5 className="text-md font-semibold text-blue-700">{comparisonData.team1.team_name}</h5>
                {analyzeChipUsage(comparisonData.team1).chipDetails.length > 0 ? (
                  analyzeChipUsage(comparisonData.team1).chipDetails.map((chip, index) => (
                    <p key={index} className="text-sm">
                      <strong>{chip.chip} (GW {chip.event}):</strong> {chip.points} pts
                    </p>
                  ))
                ) : (
                  <p className="text-sm">No chips used.</p>
                )}
                <p className="text-sm mt-2">
                  <strong>Avg Score (No Chips):</strong> {analyzeChipUsage(comparisonData.team1).avgNonChipScore} pts
                </p>
              </div>
              <div className="p-4 border rounded-lg shadow bg-gray-50">
                <h5 className="text-md font-semibold text-blue-700">{comparisonData.team2.team_name}</h5>
                {analyzeChipUsage(comparisonData.team2).chipDetails.length > 0 ? (
                  analyzeChipUsage(comparisonData.team2).chipDetails.map((chip, index) => (
                    <p key={index} className="text-sm">
                      <strong>{chip.chip} (GW {chip.event}):</strong> {chip.points} pts
                    </p>
                  ))
                ) : (
                  <p className="text-sm">No chips used.</p>
                )}
                <p className="text-sm mt-2">
                  <strong>Avg Score (No Chips):</strong> {analyzeChipUsage(comparisonData.team2).avgNonChipScore} pts
                </p>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-center mb-4">Gameweek Score Comparison</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData.team1.current.map((gw, index) => ({
                gameweek: gw.event,
                team1: gw.points,
                team2: comparisonData.team2.current[index]?.points || 0
              }))}>
                <XAxis dataKey="gameweek" label={{ value: "Gameweek", position: "insideBottom", dy: 10 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="team1" fill="#4F46E5" name={comparisonData.team1.team_name} />
                <Bar dataKey="team2" fill="#E11D48" name={comparisonData.team2.team_name} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default SquadCompare;