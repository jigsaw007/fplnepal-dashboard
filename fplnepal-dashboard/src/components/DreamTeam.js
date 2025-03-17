import { useEffect, useState } from "react";
import { fetchDreamTeam, fetchFPLData } from "../api/fplApi";
import { POSITIONS, TEAM_SHORT_NAMES, getTeamKit } from "../utils/teamData";
import "./dreamteam.css";

const DreamTeam = () => {
  const [gameweek, setGameweek] = useState(null);
  const [dreamTeam, setDreamTeam] = useState([]);
  const [playersData, setPlayersData] = useState([]);
  const [teamsData, setTeamsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentGameweek, setCurrentGameweek] = useState(null);

  useEffect(() => {
    const getFPLData = async () => {
      setLoading(true);
      const fplData = await fetchFPLData();
      if (fplData) {
        setPlayersData(fplData.elements);
        setTeamsData(fplData.teams);
        const latestGW = fplData.events.find(e => e.is_current)?.id || 28;
        setCurrentGameweek(latestGW);
        if (gameweek === null) setGameweek(latestGW); // ✅ Set gameweek only once
      }
      setLoading(false);
    };
    getFPLData();
  }, []);

  useEffect(() => {
    if (gameweek !== null) {
      fetchDreamTeamData(gameweek);
    }
  }, [gameweek]);

  const fetchDreamTeamData = async (gw) => {
    if (gw === null) return; // ✅ Prevent invalid API calls
    setLoading(true);
    try {
      const data = await fetchDreamTeam(gw);
      setDreamTeam(data?.team?.length > 0 ? data.team : []);
    } catch (error) {
      console.error(`Error fetching dream team for GW${gw}:`, error.message);
    }
    setLoading(false);
  };

  const changeGameweek = (direction) => {
    setGameweek((prev) => {
      if (prev === null) return prev; // ✅ Prevent invalid changes before GW is set
      let newGW = prev + direction;
      if (newGW < 1) newGW = 1;
      if (newGW > currentGameweek) newGW = currentGameweek; // ✅ Prevent going beyond latest GW
      return newGW;
    });
  };

  const getPlayerDetails = (playerId) => {
    return playersData.find((player) => player.id === playerId) || {};
  };

  const getTeamId = (teamIndex) => {
    const team = teamsData.find((t) => t.id === teamIndex);
    return team ? team.id : null;
  };

  if (gameweek === null) {
    return (
      <div className="loading-container">
        <p>Loading Gameweek Data...</p>
      </div>
    );
  }

  return (
    <div className="dreamteam-container mt-1">
      <h2 className="title">Team of the Week</h2>

      <div className="gameweek-nav">
        <button onClick={() => changeGameweek(-1)} disabled={gameweek === 1} className="gw-btn">
          ◀ Prev
        </button>
        <span className="gameweek-label">GW {gameweek}</span>
        <button onClick={() => changeGameweek(1)} disabled={gameweek === currentGameweek} className="gw-btn">
          Next ▶
        </button>
      </div>

      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <table className="dreamteam-table">
          <thead>
            <tr>
              <th>Pos</th>
              <th></th>
              <th>Player</th>
              <th>Club</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {dreamTeam.length > 0
              ? dreamTeam.map((player) => renderPlayerRow(player, getPlayerDetails, getTeamId))
              : <tr><td colSpan="5" className="text-center">N/A</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
};

const renderPlayerRow = (player, getPlayerDetails, getTeamId) => {
  const playerDetails = getPlayerDetails(player.element);
  const teamId = getTeamId(playerDetails.team);
  const position = POSITIONS[playerDetails.element_type] || "Unknown";
  const clubShortName = TEAM_SHORT_NAMES[teamId] || "N/A";

  return (
    <tr key={player.element}>
      <td>{position}</td>
      <td>
        <img src={getTeamKit(teamId, position)} alt={`${playerDetails.web_name} Kit`} className="team-kit" />
      </td>
      <td>{playerDetails.web_name || "Unknown"}</td>
      <td>{clubShortName}</td>
      <td>{player.points} Pts</td>
    </tr>
  );
};

export default DreamTeam;
