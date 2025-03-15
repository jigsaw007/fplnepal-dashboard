import { useEffect, useState } from "react";
import { fetchFPLData, fetchFixturesByGameweek, fetchTeamsData } from "../api/fplApi";

const Live = () => {
  const [gameweek, setGameweek] = useState(null);
  const [fixtures, setFixtures] = useState([]);
  const [teams, setTeams] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch Latest Gameweek Up to Today
  useEffect(() => {
    const getLatestGameweek = async () => {
      setLoading(true);
      const data = await fetchFPLData();
      if (data) {
        const today = new Date();
        const latestGW = data.events
          .filter(event => new Date(event.deadline_time) <= today)
          .reduce((prev, curr) => (curr.id > prev.id ? curr : prev), { id: 1 });

        setGameweek(latestGW.id);
      }
      setLoading(false);
    };
    getLatestGameweek();
  }, []);

  // Fetch Fixtures for the Selected Gameweek
  useEffect(() => {
    if (gameweek !== null) {
      setLoading(true);
      const getGameweekData = async () => {
        const data = await fetchFixturesByGameweek(gameweek);
        setFixtures(data || []);
        setLoading(false);
      };
      getGameweekData();
    }
  }, [gameweek]);

  // Fetch Team Data
  useEffect(() => {
    setLoading(true);
    const getTeams = async () => {
      const data = await fetchTeamsData();
      if (data.length > 0) {
        const teamMap = data.reduce((acc, team) => {
          acc[team.id] = {
            name: team.name,
            badge: team.badge,
          };
          return acc;
        }, {});
        setTeams(teamMap);
      }
      setLoading(false);
    };
    getTeams();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (gameweek) {
        fetchFixturesByGameweek(gameweek).then(data => setFixtures(data || []));
      }
    }, 30000); // Refresh every 30 seconds
  
    return () => clearInterval(interval);
  }, [gameweek]);

  return (
    <div className="bg-white p-3 shadow-md rounded-lg">
      <h2 className="text-sm font-bold text-center mb-2">Live Fixtures</h2>

      {loading ? (
        <div className="flex justify-center items-center py-6">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-700"></div>
        </div>
      ) : (
        <>
          {/* Navigation Buttons */}
          <div className="flex justify-center space-x-2 mb-3">
            <button
              className="px-2 py-1 text-xs bg-purple-950 text-white rounded shadow-md hover:bg-blue-600 transition disabled:opacity-50"
              disabled={gameweek === 1}
              onClick={() => setGameweek(gameweek - 1)}
            >
              ◀ Prev
            </button>
            <span className="text-xs font-semibold bg-gray-200 px-2 py-1 rounded-md">
              GW {gameweek}
            </span>
            <button
              className="px-2 py-1 text-xs bg-purple-950 text-white rounded shadow-md hover:bg-blue-600 transition"
              onClick={() => setGameweek(gameweek + 1)}
            >
              Next ▶
            </button>
          </div>

          {/* Fixtures Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse border border-gray-300 rounded-md shadow-sm">
              <thead className="bg-purple-950 text-white text-[10px]">
                <tr>
                  <th className="border border-gray-300 px-2 py-1">Home</th>
                  <th className="border border-gray-300 px-2 py-1">Score</th>
                  <th className="border border-gray-300 px-2 py-1">Away</th>
                </tr>
              </thead>
              <tbody>
                {fixtures.map((match, index) => (
                  <tr key={index} className="border border-gray-300 odd:bg-gray-100 even:bg-gray-200 hover:bg-blue-200">
<td className="px-2 py-1 text-center flex justify-center items-center gap-2">
  <img src={teams[match.team_h]?.badge} alt="badge" className="w-4 h-4" />
  <span className="whitespace-nowrap">{teams[match.team_h]?.name || "Unknown"}</span>
</td>
<td className="px-2 py-1 text-center font-semibold">
  {match.team_h_score !== null && match.team_a_score !== null
    ? `${match.team_h_score} - ${match.team_a_score}`
    : "vs"}
</td>
<td className="px-2 py-1 flex items-center gap-2 text-center">
  {teams[match.team_a]?.name || "Unknown"}
  <img src={teams[match.team_a]?.badge} alt="badge" className="w-4 h-4" />
</td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Live;
