import { useEffect, useState } from "react";
import { fetchDreamTeam, fetchFPLData } from "../api/fplApi";
import { POSITIONS, TEAM_SHORT_NAMES, getTeamKit } from "../utils/teamData"; // ✅ Import from new file
import "./dreamteam.css";  // ✅ Import Styles

const DreamTeam = () => {
  const [gameweek, setGameweek] = useState(28);
  const [dreamTeam, setDreamTeam] = useState([]);
  const [playersData, setPlayersData] = useState([]);
  const [teamsData, setTeamsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentGameweek, setCurrentGameweek] = useState(28); // ✅ Track the latest active GW

  useEffect(() => {
    const getFPLData = async () => {
      setLoading(true);
      const fplData = await fetchFPLData();
      if (fplData) {
        setPlayersData(fplData.elements);
        setTeamsData(fplData.teams);
        setCurrentGameweek(fplData.events.find(e => e.is_current)?.id || 28); // ✅ Get the current GW dynamically
      }
      setLoading(false);
    };
    getFPLData();
  }, []);

  useEffect(() => {
    fetchDreamTeamData(gameweek);
  }, [gameweek]);

  // ✅ Fetch Dream Team Data
  const fetchDreamTeamData = async (gw) => {
    setLoading(true);
    const data = await fetchDreamTeam(gw);
    if (data && data.team && data.team.length > 0) {
      setDreamTeam(data.team);
    } else {
      setDreamTeam([]); // ✅ No data means empty dream team
    }
    setLoading(false);
  };

  // ✅ Change Gameweek with Prev/Next Buttons
  const changeGameweek = (direction) => {
    setGameweek((prev) => {
      let newGW = prev + direction;
      if (newGW < 1) newGW = 1;
      if (newGW > 38) newGW = 38;
      return newGW;
    });
  };

  // ✅ Get Player Details
  const getPlayerDetails = (playerId) => {
    return playersData.find((player) => player.id === playerId) || {};
  };

  // ✅ Get Correct Team ID
  const getTeamId = (teamIndex) => {
    const team = teamsData.find((t) => t.id === teamIndex);
    return team ? team.id : null;
  };

  return (
    <div className="dreamteam-container mt-1">
      <h2 className="title">Team of the Week</h2>

      {/* ✅ Prev & Next Gameweek Buttons */}
      <div className="gameweek-nav">
        <button onClick={() => changeGameweek(-1)} disabled={gameweek === 1} className="gw-btn">
          ◀ Prev
        </button>
        <span className="gameweek-label">GW {gameweek}</span>
        <button onClick={() => changeGameweek(1)} disabled={gameweek === 38} className="gw-btn">
          Next ▶
        </button>
      </div>

      {/* ✅ Show Spinner While Loading */}
      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : (
<table className="dreamteam-table">
  <thead>
    <tr>
      <th>Pos</th>
      <th></th> {/* Hide Kit Title */}
      <th>Player</th>
      <th>Club</th>
      <th>Pts</th>
    </tr>
  </thead>
  <tbody>
    {dreamTeam.length > 0 || gameweek <= currentGameweek
      ? dreamTeam.map((player) => renderPlayerRow(player, getPlayerDetails, getTeamId))
      : <tr><td colSpan="5" className="text-center">N/A</td></tr>}
  </tbody>
</table>

      )}
    </div>
  );
};

// ✅ Render Each Player as a Table Row
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
