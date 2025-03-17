import React, { useState, useEffect } from "react";
import { fetchH2HTopScorer } from "../api/fplApi";

const HEAD_TO_HEAD_LEAGUES = {
  "Div A": 446714,
  "Div B": 446717,
  "Div C": 446720,
  "Div D": 446723,
  "Div E": 446724,
  "Div F": 446727,
};

const H2HTopScorer = () => {
  const [gameweek, setGameweek] = useState(() => {
    try {
      return localStorage.getItem("selectedGameweek") ? Number(localStorage.getItem("selectedGameweek")) : 1;
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      return 1;
    }
  });
  const [topScorers, setTopScorers] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("selectedGameweek", gameweek);
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }

    const fetchTopScorers = async () => {
      setLoading(true);
      const data = await fetchH2HTopScorer(gameweek);

      if (data) {
        setTopScorers(data);
      } else {
        setTopScorers({});
      }

      setLoading(false);
    };

    fetchTopScorers();
  }, [gameweek]);

  const openManagerSquad = (managerId) => {
    const url = `https://fantasy.premierleague.com/entry/${managerId}/event/${gameweek}`;
    window.open(url, "_blank");
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-purple-950 mb-4">Top Scorers - Head-to-Head Leagues</h2>

      <div className="mb-4">
        <label className="mr-2 font-semibold">Select Gameweek:</label>
        <select
          className="border p-2 rounded"
          value={gameweek}
          onChange={(e) => setGameweek(Number(e.target.value))}
        >
          {[...Array(38).keys()].map((gw) => (
            <option key={gw + 1} value={gw + 1}>
              Gameweek {gw + 1}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="w-10 h-10 border-4 border-purple-500 border-dotted rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(HEAD_TO_HEAD_LEAGUES).map(([leagueName]) => (
            <div key={leagueName} className="border p-3 rounded shadow-lg bg-white">
              <h3 className="text-lg font-semibold text-purple-950 mb-2">{leagueName}</h3>
              {topScorers[leagueName]?.length > 0 ? (
topScorers[leagueName].map((winner, index) => (
  <p key={index} className="text-sm cursor-pointer text-purple-950 hover:underline"
     onClick={() => openManagerSquad(winner.manager_id)}>
    <strong>Manager:</strong> {winner.manager_name} | 
    <strong>GW Score:</strong> {winner.gameweek_score + winner.transfer_cost} | 
    <span className="text-red-500">(-{winner.transfer_cost})</span> = 
    <strong className="text-green-600"> {winner.gameweek_score}</strong> |  
    <strong>Team:</strong> {winner.team_name}
  </p>
))

              ) : (
                <p className="text-sm">No data available</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default H2HTopScorer;
