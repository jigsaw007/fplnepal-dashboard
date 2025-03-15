import { useEffect, useState } from "react";
import { fetchFPLData, fetchFixturesByGameweek } from "../api/fplApi";
import { TEAM_SHORT_NAMES, getTeamKit } from "../utils/teamData";
import { FaSpinner } from "react-icons/fa"; // ✅ Spinner Icon for Loading
import "./suggestion.css";

const Suggestion = () => {
  const [suggestedPlayers, setSuggestedPlayers] = useState([]);
  const [currentGameweek, setCurrentGameweek] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPredictionData = async () => {
      setLoading(true);

      // ✅ Fetch Bootstrap FPL Data
      const fplData = await fetchFPLData();
      if (!fplData) return;

      const allPlayers = fplData.elements;
      const teams = fplData.teams;
      const events = fplData.events;

      // ✅ Find the current Gameweek
      const activeGW = events.find((gw) => gw.is_current)?.id || 1;
      setCurrentGameweek(activeGW);

      // ✅ Fetch Next Gameweek Fixtures
      const fixtures = await fetchFixturesByGameweek(activeGW + 1);

      // ✅ Calculate Scores & Predict Best Players
      const predictions = calculatePredictedScores(allPlayers, teams, fixtures);

      // ✅ Select Top 4 Predicted Players
      setSuggestedPlayers(predictions.slice(0, 4));

      setLoading(false);
    };

    fetchPredictionData();
  }, []);

  // ✅ Prediction Logic (Keeping the Previous Formula)
  const calculatePredictedScores = (players, teams, fixtures) => {
    return players
      .filter(player => !player.injured && player.minutes > 0) // Ignore injured players
      .map(player => {
        const team = teams.find(t => t.id === player.team);
        const nextFixture = fixtures.find(f => f.team_h === player.team || f.team_a === player.team);

        if (!nextFixture) return null; // ✅ Exclude players without fixtures

        const isHome = nextFixture.team_h === player.team; // ✅ Determine Home/Away
        const opponentTeamId = isHome ? nextFixture.team_a : nextFixture.team_h;
        const opponent = teams.find(t => t.id === opponentTeamId);
        const fixtureDifficulty = nextFixture?.difficulty || 3; // ✅ Default fixture difficulty

        // ✅ Scoring Formula (Same as Before)
        const predictedScore =
          (player.expected_goals || 0) * 1.5 +
          (player.form || 0) * 2 +
          (5 - fixtureDifficulty) * 1; // Lower difficulty is better

        return {
          id: player.id,
          name: player.web_name,
          team: team?.name || "Unknown",
          kit: getTeamKit(player.team, "MID"),
          nextOpponent: `${opponent?.name || "Unknown"} (${isHome ? "H" : "A"})`, // ✅ Show Home/Away
          predictedScore: predictedScore.toFixed(1),
        };
      })
      .filter(player => player !== null)
      .sort((a, b) => b.predictedScore - a.predictedScore); // Sort by highest predicted score
  };

  return (
    <div className="suggestion-container mt-5">
      <h2 className="title">
  {currentGameweek ? `Top Picks for GW ${currentGameweek + 1}` : "Loading..."}
</h2>


      {loading ? (
        <div className="text-center flex justify-center items-center h-32">
          <FaSpinner className="animate-spin text-purple-700 text-3xl" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {suggestedPlayers.map((player) => (
            <div key={player.id} className="bg-white p-3 rounded-lg shadow flex flex-col items-center text-center">
              <img src={player.kit} alt={player.name} className="w-16 h-16 mb-2" />
              <h3 className="text-sm font-bold">{player.name}</h3>
              <p className="text-xs text-gray-600">{player.team}</p>
              <p className="text-xs text-gray-500">vs {player.nextOpponent}</p> {/* ✅ Shows Home or Away */}
              {/* <p className="text-lg font-semibold text-green-600">{player.predictedScore} Pts</p> */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Suggestion;
