import React, { useState } from "react";
import { fetchUserHistory } from "../api/fplApi";
import { getTeamKit } from "../utils/teamData";
import HistoryChart from "../components/HistoryChart";


const History = () => {
  const [teamId, setTeamId] = useState("");
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const gameweeksPerPage = 10;

  const fetchHistory = async () => {
    if (!teamId) return;
    setLoading(true);

    try {
      const data = await fetchUserHistory(teamId);
      setHistory(data);
      setCurrentPage(1); // Reset to first page on new fetch
    } catch (error) {
      console.error("Error fetching user history:", error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination Logic
  const indexOfLastGW = currentPage * gameweeksPerPage;
  const indexOfFirstGW = indexOfLastGW - gameweeksPerPage;
  const currentGameweeks = history?.current.slice(indexOfFirstGW, indexOfLastGW) || [];
  const totalPages = history ? Math.ceil(history.current.length / gameweeksPerPage) : 1;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-purple-950 mb-4">FPL Team History</h2>

      <div className="mb-4 flex items-center gap-4">
        <input
          type="text"
          placeholder="Enter Team ID"
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          className="border p-2 rounded w-64"
        />
        <button onClick={fetchHistory} className="bg-purple-600 text-white px-4 py-2 rounded shadow">
          Fetch History
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-6">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-700"></div>
        </div>
      )}

      {history && (
        <div className="mb-6 p-6 bg-white rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-purple-950 mb-3">Manager Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <p><strong>Manager:</strong> {history.name}</p>
            <p><strong>Team:</strong> {history.team_name}</p>
            <p><strong>Region:</strong> {history.region_name}</p>
            <p><strong>Overall Rank:</strong> {history.overall_rank}</p>
          </div>
          <div className="mt-4">
            <p className="font-semibold text-purple-950">Leagues Joined:</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {history.leagues?.length > 0 ? (
                history.leagues.map((league, index) => (
                  <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs shadow">
                    {league}
                  </span>
                ))
              ) : (
                <span className="text-gray-600">No leagues found</span>
              )}
            </div>
          </div>
        </div>
      )}

      {history && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <h4 className="text-md font-bold text-purple-950">Favorite Player</h4>
            <p>{history.favorite_player || "N/A"}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <h4 className="text-md font-bold text-purple-950">Favorite Captain</h4>
            <p>{history.favorite_captain || "N/A"}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <h4 className="text-md font-bold text-purple-950">Best Gameweek</h4>
            <p>{history.best_gameweek ? `GW ${history.best_gameweek.event} - ${history.best_gameweek.points} points` : "N/A"}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <h4 className="text-md font-bold text-purple-950">Worst Gameweek</h4>
            <p>{history.worst_gameweek ? `GW ${history.worst_gameweek.event} - ${history.worst_gameweek.points} points` : "N/A"}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <h4 className="text-md font-bold text-purple-950">Total Points on Bench</h4>
            <p>{history.total_bench_points || "N/A"} points</p>
          </div>
        </div>
      )}

      {history && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 shadow-lg text-xs">
            <thead className="bg-purple-950 text-white">
              <tr>
                <th className="border p-1">GW</th>
                <th className="border p-1">Points</th>
                <th className="border p-1">Rank</th>
                <th className="border p-1">Chips Used</th>
              </tr>
            </thead>
            <tbody>
              {currentGameweeks.map((gw, index) => (
                <tr key={index} className="border hover:bg-purple-100">
                  <td className="border p-1 text-center">{gw.event}</td>
                  <td className="border p-1 text-center">{gw.points}</td>
                  <td className="border p-1 text-center">{gw.overall_rank}</td>
                  <td className="border p-1 text-center">
                    {history.chips.find(chip => chip.event === gw.event)?.name || "None"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

{history && <HistoryChart teamId={teamId} />}
      {/* ✅ Pagination Controls */}
      {history && totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded shadow ${currentPage === 1 ? "bg-gray-300" : "bg-purple-600 text-white"}`}
          >
            Previous
          </button>
          <span className="text-purple-950 font-semibold">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded shadow ${currentPage === totalPages ? "bg-gray-300" : "bg-purple-600 text-white"}`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default History;
