const express = require("express");
const axios = require("axios");
const cors = require("cors");
const serverless = require("serverless-http"); // Added for Netlify Functions
require("dotenv").config();

const app = express();
// const PORT = process.env.PORT || 5000;

const corsOptions = {
    origin: [
        "https://fplnepaldashboard.netlify.app",
        "https://webapp.fplnepal.com",
        "http://localhost:3000", // local dev
      ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

const FPL_BASE_URL = "https://fantasy.premierleague.com/api";

// ✅ Middleware for Logging API Requests
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  next();
});

// ✅ Fetch General FPL Data (Bootstrap)
app.get("/fpl-data", async (req, res) => {
  try {
    const response = await axios.get(`${FPL_BASE_URL}/bootstrap-static/`, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching FPL data:", error.message);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// ✅ Fetch Fixtures for a Specific Gameweek
app.get("/fixtures", async (req, res) => {
  const { event } = req.query;
  if (!event) return res.status(400).json({ error: "Gameweek (event) is required" });

  try {
    const response = await axios.get(`${FPL_BASE_URL}/fixtures/?event=${event}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching fixtures:", error.message);
    res.status(500).json({ error: "Failed to fetch fixtures" });
  }
});

// ✅ Fetch Teams Data (with Badges)
app.get("/teams", async (req, res) => {
  try {
    const response = await axios.get(`${FPL_BASE_URL}/bootstrap-static/`, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const teams = response.data.teams.map((team) => ({
      id: team.id,
      name: team.name,
      badge: `https://resources.premierleague.com/premierleague/badges/70/t${team.code}.png`,
    }));

    res.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error.message);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
});

// ✅ Fetch Bootstrap Data (Players & Transfers)
app.get("/bootstrap-static", async (req, res) => {
  try {
    const response = await axios.get(`${FPL_BASE_URL}/bootstrap-static/`, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching bootstrap data:", error.message);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// ✅ Fetch Injury News (Players with News)
app.get("/injuries", async (req, res) => {
  try {
    const response = await axios.get(`${FPL_BASE_URL}/bootstrap-static/`, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const injuredPlayers = response.data.elements.filter((player) => player.news !== "");
    res.json(injuredPlayers);
  } catch (error) {
    console.error("Error fetching injury news:", error.message);
    res.status(500).json({ message: "Failed to fetch injury news" });
  }
});

// ✅ Fetch Classic League Standings with Gameweek Scores
app.get("/classic-league/:leagueId/:gameweek", async (req, res) => {
  const { leagueId, gameweek } = req.params;
  let allStandings = [];
  let page = 1;
  let hasNextPage = true;

  try {
    console.log(`Fetching standings for League ID: ${leagueId}, Gameweek: ${gameweek}`);

    // 🔹 Fetch all pages dynamically
    while (hasNextPage) {
      const response = await axios.get(
        `${FPL_BASE_URL}/leagues-classic/${leagueId}/standings/?page_standings=${page}`,
        { headers: { "User-Agent": "Mozilla/5.0" } }
      );

      if (!response.data || !response.data.standings) {
        console.error("Invalid response from FPL API:", response.data);
        return res.status(500).json({ error: "Invalid response from FPL API" });
      }

      console.log(`Fetched Page: ${page}, Entries: ${response.data.standings.results.length}`);
      allStandings = [...allStandings, ...response.data.standings.results];
      hasNextPage = response.data.standings.has_next;
      page++;
    }

    // ✅ Fetch Gameweek Score for Each Manager
    const updatedStandings = await Promise.all(
      allStandings.map(async (entry) => {
        try {
          const historyResponse = await axios.get(
            `${FPL_BASE_URL}/entry/${entry.entry}/history/`,
            { headers: { "User-Agent": "Mozilla/5.0" } }
          );

          const gameweekData = historyResponse.data.current.find(
            (gw) => gw.event === parseInt(gameweek)
          );

          return {
            id: entry.entry,
            manager_name: entry.player_name,
            team_name: entry.entry_name,
            total_points: entry.total,
            gameweek_score: gameweekData ? gameweekData.points : "N/A", // If not found, show N/A
          };
        } catch (error) {
          console.error(`Error fetching gameweek history for ${entry.entry}:`, error.message);
          return {
            id: entry.entry,
            manager_name: entry.player_name,
            team_name: entry.entry_name,
            total_points: entry.total,
            gameweek_score: "Error",
          };
        }
      })
    );

    res.json(updatedStandings);
  } catch (error) {
    console.error("Error fetching Classic League:", error.message);
    res.status(500).json({ error: "Failed to fetch Classic League standings" });
  }
});

app.get("/manager-history/:managerId", async (req, res) => {
  const { managerId } = req.params;
  try {
    const response = await axios.get(`${FPL_BASE_URL}/entry/${managerId}/history/`);
    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching history for Manager ${managerId}:`, error.message);
    res.status(500).json({ error: "Failed to fetch manager history" });
  }
});

app.get("/h2h-league-all", async (req, res) => {
  const HEAD_TO_HEAD_LEAGUES = {
    "Div A": 446714,
    "Div B": 446717,
    "Div C": 446720,
    "Div D": 446723,
    "Div E": 446724,
    "Div F": 446727,
  };

  try {
    let leagueStandings = {};

    for (const [division, leagueId] of Object.entries(HEAD_TO_HEAD_LEAGUES)) {
      let allStandings = [];
      let page = 1;
      let hasNextPage = true;

      while (hasNextPage) {
        const response = await axios.get(
          `${FPL_BASE_URL}/leagues-h2h/${leagueId}/standings/?page_new_entries=1&page_standings=${page}`,
          { headers: { "User-Agent": "Mozilla/5.0" } }
        );

        if (!response.data || !response.data.standings) {
          console.error(`Invalid response for ${division}:`, response.data);
          return res.status(500).json({ error: `Invalid response from FPL API for ${division}` });
        }

        allStandings = [...allStandings, ...response.data.standings.results];
        hasNextPage = response.data.standings.has_next;
        page++;
      }

      // ✅ Format Data Properly
      leagueStandings[division] = allStandings.map((entry) => ({
        rank: entry.rank,
        team_name: entry.entry_name,
        manager_name: entry.player_name,
        matches_played: entry.matches_played,
        wins: entry.matches_won,
        draws: entry.matches_drawn,
        losses: entry.matches_lost,
        total_points: entry.total, // This is the total H2H points
      }));
    }

    res.json(leagueStandings);
  } catch (error) {
    console.error("Error fetching H2H League standings:", error.message);
    res.status(500).json({ error: "Failed to fetch H2H League standings" });
  }
});

// ✅ Fetch Dream Team for a Specific Gameweek
app.get("/dream-team/:gameweek", async (req, res) => {
  const { gameweek } = req.params;

  try {
    const response = await axios.get(`${FPL_BASE_URL}/dream-team/${gameweek}/`, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching dream team for GW${gameweek}:`, error.message);
    res.status(500).json({ error: "Failed to fetch dream team data" });
  }
});

// ✅ Tie Analyzer API Endpoint
app.get("/tieanalyze", async (req, res) => {
  const { team_id1, team_id2, gameweek } = req.query;

  if (!team_id1 || !team_id2 || !gameweek) {
    return res.status(400).json({ error: "Missing team IDs or gameweek" });
  }

  try {
    const bootstrapResponse = await axios.get(`${FPL_BASE_URL}/bootstrap-static/`);
    const playersData = bootstrapResponse.data.elements;
    const teamsData = bootstrapResponse.data.teams;

    const playerInfoMap = Object.fromEntries(playersData.map((p) => [p.id, p]));
    const teamNameMap = Object.fromEntries(teamsData.map((t) => [t.id, t.name]));

    const fetchTeamStats = async (teamId) => {
      try {
        const userResponse = await axios.get(`${FPL_BASE_URL}/entry/${teamId}/`);
        const userData = userResponse.data;
        const managerName = `${userData.player_first_name} ${userData.player_last_name}`;
        const teamName = userData.name;

        const picksResponse = await axios.get(`${FPL_BASE_URL}/entry/${teamId}/event/${gameweek}/picks/`);
        if (picksResponse.status === 404) return { error: `Gameweek ${gameweek} data not available for team ${teamId}` };
        const picks = picksResponse.data.picks || [];

        const [fixturesRes, liveDataRes] = await Promise.all([
          axios.get(`${FPL_BASE_URL}/fixtures/?event=${gameweek}`),
          axios.get(`${FPL_BASE_URL}/event/${gameweek}/live/`),
        ]);

        const fixtures = fixturesRes.data;
        const liveData = liveDataRes.data.elements;

        let goalsScored = 0;
        let goalsConceded = 0;
        let playersScored = [];
        let playersConceded = [];

        // 🔹 Create a dictionary of real-world teams and how many goals they conceded
        const teamConcededGoals = {};
        fixtures.forEach((fixture) => {
          teamConcededGoals[fixture.team_h] = fixture.team_a_score; // Home team conceded away goals
          teamConcededGoals[fixture.team_a] = fixture.team_h_score; // Away team conceded home goals
        });

        // 🔹 Map players to their real-world team & assign goals conceded
        const teamPlayersConceded = {};

        picks.forEach((pick) => {
          const player = playerInfoMap[pick.element];
          const livePlayer = liveData[pick.element - 1].stats;
          const playerTeamId = player.team;
          const playerPosition = player.element_type; // Position (1=GKP, 2=DEF, 3=MID, 4=FWD)
          const minutesPlayed = livePlayer.minutes || 0;

          if (minutesPlayed > 0) {
            // ✅ Player played, apply correct stats
            if (livePlayer.goals_scored > 0) {
              goalsScored += livePlayer.goals_scored;
              playersScored.push({
                id: pick.element,
                name: player.web_name,
                team: playerTeamId,
                position: playerPosition,
                goals: livePlayer.goals_scored,
              });
            }

            // ✅ Apply team’s conceded goals to ALL players (GKP, DEF, MID, FWD)
            const concededByTeam = teamConcededGoals[playerTeamId] || 0;
            if (concededByTeam > 0) {
              // ✅ Don't include if conceded is 0
              goalsConceded += concededByTeam;
              if (!teamPlayersConceded[playerTeamId]) {
                teamPlayersConceded[playerTeamId] = [];
              }
              teamPlayersConceded[playerTeamId].push({
                id: pick.element,
                name: player.web_name,
                team: playerTeamId,
                position: playerPosition,
                conceded: concededByTeam,
              });
            }
          }
        });

        // 🔹 Assign all playing players from this team to the conceded list
        Object.values(teamPlayersConceded).forEach((players) => {
          playersConceded.push(...players);
        });

        return {
          manager_name: managerName,
          team_name: teamName,
          goals_scored: goalsScored,
          goals_conceded: goalsConceded,
          players_scored: playersScored,
          players_conceded: playersConceded,
        };
      } catch (error) {
        return { error: `Error fetching data for team ${teamId}` };
      }
    };

    const [team1Stats, team2Stats] = await Promise.all([fetchTeamStats(team_id1), fetchTeamStats(team_id2)]);

    // Winner Logic
    let winner = "Tie";
    let tieReason = "random_draw";

    if (team1Stats.goals_scored > team2Stats.goals_scored) {
      winner = team1Stats.manager_name;
      tieReason = "goals_scored";
    } else if (team2Stats.goals_scored > team1Stats.goals_scored) {
      winner = team2Stats.manager_name;
      tieReason = "goals_scored";
    } else if (team1Stats.goals_conceded < team2Stats.goals_conceded) {
      winner = team1Stats.manager_name;
      tieReason = "goals_conceded";
    } else if (team2Stats.goals_conceded < team1Stats.goals_conceded) {
      winner = team2Stats.manager_name;
      tieReason = "goals_conceded";
    }

    res.json({ team1: team1Stats, team2: team2Stats, winner, tieReason });
  } catch (error) {
    console.error("Error in tie analyzer:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Fetch Highest Scorer for Each H2H League
const HEAD_TO_HEAD_LEAGUES = {
  "Div A": 446714,
  "Div B": 446717,
  "Div C": 446720,
  "Div D": 446723,
  "Div E": 446724,
  "Div F": 446727,
};

// ✅ Fetch Highest Scorer for Each H2H League + Team Name
app.get("/h2h-topscorer/:gameweek", async (req, res) => {
  const { gameweek } = req.params;
  let leagueTopScorers = {};

  try {
    for (const [division, leagueId] of Object.entries(HEAD_TO_HEAD_LEAGUES)) {
      const response = await axios.get(
        `${FPL_BASE_URL}/leagues-h2h/${leagueId}/standings/`,
        { headers: { "User-Agent": "Mozilla/5.0" } }
      );

      if (!response.data || !response.data.standings) {
        console.error(`Invalid response for ${division}:`, response.data);
        leagueTopScorers[division] = [];
        continue;
      }

      const standings = response.data.standings.results;
      let highestScore = 0;
      let topScorers = [];

      for (const entry of standings) {
        try {
          const historyResponse = await axios.get(
            `${FPL_BASE_URL}/entry/${entry.entry}/history/`,
            { headers: { "User-Agent": "Mozilla/5.0" } }
          );

          const gameweekData = historyResponse.data.current.find((gw) => gw.event === parseInt(gameweek));
          const points = gameweekData ? gameweekData.points : 0;
          const transferCost = gameweekData ? gameweekData.event_transfers_cost : 0;
          const adjustedPoints = points - transferCost; // Deduct transfer costs


          if (gameweekData) {
            const points = gameweekData.points || 0;
            const transferCost = gameweekData.event_transfers_cost || 0;
            const adjustedPoints = points - transferCost; // Deduct transfer cost
          
            if (adjustedPoints > highestScore) {
              highestScore = adjustedPoints;
              topScorers = [
                {
                  manager_id: entry.entry,
                  manager_name: entry.player_name,
                  team_name: "",
                  gameweek_score: adjustedPoints,
                  transfer_cost: transferCost, // Store transfer cost
                },
              ];
            } else if (adjustedPoints === highestScore) {
              topScorers.push({
                manager_id: entry.entry,
                manager_name: entry.player_name,
                team_name: "",
                gameweek_score: adjustedPoints,
                transfer_cost: transferCost, // Store transfer cost
              });
            }
          }
          
        } catch (error) {
          console.error(`Error fetching history for ${entry.entry}:`, error.message);
        }
      }

      // ✅ Fetch Team Name for Each Top Scorer
      for (let scorer of topScorers) {
        try {
          const entryResponse = await axios.get(`${FPL_BASE_URL}/entry/${scorer.manager_id}/`, {
            headers: { "User-Agent": "Mozilla/5.0" },
          });
          scorer.team_name = entryResponse.data.name || "N/A";
        } catch (error) {
          console.error(`Error fetching team name for ${scorer.manager_id}:`, error.message);
          scorer.team_name = "N/A";
        }
      }

      leagueTopScorers[division] = topScorers;
    }

    res.json(leagueTopScorers);
  } catch (error) {
    console.error("Error fetching H2H League top scorers:", error.message);
    res.status(500).json({ error: "Failed to fetch H2H top scorers" });
  }
});

// ✅ API: Fetch User History & Manager Details
app.get("/user-history/:teamId", async (req, res) => {
  const { teamId } = req.params;

  try {
    // ✅ Fetch Manager Details
    const managerResponse = await axios.get(`${FPL_BASE_URL}/entry/${teamId}/`);
    const historyResponse = await axios.get(`${FPL_BASE_URL}/entry/${teamId}/history/`);
    const fplPlayersResponse = await axios.get(`${FPL_BASE_URL}/bootstrap-static/`);

    if (!managerResponse.data || !historyResponse.data || !fplPlayersResponse.data) {
      return res.status(404).json({ error: "Invalid team data" });
    }

    const managerData = managerResponse.data;
    const historyData = historyResponse.data;
    const fplPlayers = fplPlayersResponse.data.elements; // All FPL players data

    // ✅ Create a Mapping of Player IDs to Names
    const playerMap = {};
    fplPlayers.forEach((player) => {
      playerMap[player.id] = player.web_name; // Mapping Player ID → Name
    });

    let playerCounts = {};
    let captainCounts = {};
    let totalBenchPoints = 0;

    // ✅ Find Best and Worst Gameweeks
    let bestGameweek = null;
    let worstGameweek = null;

    for (const gw of historyData.current) {
      // ✅ Add up total bench points
      totalBenchPoints += gw.points_on_bench || 0;

      // ✅ Identify Best & Worst Gameweeks based on total points
      if (!bestGameweek || gw.points > bestGameweek.points) {
        bestGameweek = { event: gw.event, points: gw.points };
      }
      if (!worstGameweek || gw.points < worstGameweek.points) {
        worstGameweek = { event: gw.event, points: gw.points };
      }

      try {
        const picksResponse = await axios.get(`${FPL_BASE_URL}/entry/${teamId}/event/${gw.event}/picks/`);
        const picksData = picksResponse.data.picks;

        for (const pick of picksData) {
          const playerId = pick.element;
          const isCaptain = pick.is_captain;

          // Count Player Selections
          playerCounts[playerId] = (playerCounts[playerId] || 0) + 1;

          // Count Captain Selections
          if (isCaptain) {
            captainCounts[playerId] = (captainCounts[playerId] || 0) + 1;
          }
        }
      } catch (error) {
        console.error(`Error fetching picks for GW ${gw.event}:`, error.message);
      }
    }

    // ✅ Determine Most Selected Player & Most Selected Captain
    const favoritePlayerId = Object.keys(playerCounts).reduce(
      (a, b) => (playerCounts[a] > playerCounts[b] ? a : b),
      null
    );
    const favoriteCaptainId = Object.keys(captainCounts).reduce(
      (a, b) => (captainCounts[a] > captainCounts[b] ? a : b),
      null
    );

    // ✅ Convert IDs to Player Names
    const favoritePlayer = favoritePlayerId ? playerMap[favoritePlayerId] || "Unknown Player" : "N/A";
    const favoriteCaptain = favoriteCaptainId ? playerMap[favoriteCaptainId] || "Unknown Player" : "N/A";

    // ✅ Final Data Formatting
    const formattedData = {
      name: `${managerData.player_first_name} ${managerData.player_last_name}`,
      team_name: managerData.name,
      region_name: managerData.player_region_name,
      overall_rank: managerData.summary_overall_rank,
      leagues: managerData.leagues.classic.map((league) => league.name),
      current: historyData.current,
      chips: historyData.chips || [],
      favorite_player: favoritePlayer,
      favorite_captain: favoriteCaptain,
      best_gameweek: bestGameweek,
      worst_gameweek: worstGameweek,
      total_bench_points: totalBenchPoints, // ✅ Added Total Bench Points
    };

    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching user history:", error.message);
    res.status(500).json({ error: "Failed to fetch user history" });
  }
});

// ✅ Proxy for fetching player details from FPL API
app.get("/player/:id", async (req, res) => {
  try {
    const playerId = req.params.id;
    const response = await axios.get(`https://fantasy.premierleague.com/api/element-summary/${playerId}/`);

    if (!response.data) {
      return res.status(404).json({ error: "Player data not found" });
    }

    // ✅ Extract necessary player details from API response
    const playerStats = {
      bonus: response.data.history?.reduce((acc, game) => acc + game.bonus, 0) || 0,
      bps: response.data.history?.reduce((acc, game) => acc + game.bps, 0) || 0,
      influence: response.data.history?.reduce((acc, game) => acc + parseFloat(game.influence), 0) || 0,
      creativity: response.data.history?.reduce((acc, game) => acc + parseFloat(game.creativity), 0) || 0,
      threat: response.data.history?.reduce((acc, game) => acc + parseFloat(game.threat), 0) || 0,
      ict_index: response.data.history?.reduce((acc, game) => acc + parseFloat(game.ict_index), 0) || 0,
      minutes: response.data.history?.reduce((acc, game) => acc + game.minutes, 0) || 0,
      expected_goals: response.data.history?.reduce((acc, game) => acc + parseFloat(game.expected_goals), 0) || 0,
      expected_assists:
        response.data.history?.reduce((acc, game) => acc + parseFloat(game.expected_assists), 0) || 0,
      expected_goal_involvements:
        response.data.history?.reduce((acc, game) => acc + parseFloat(game.expected_goal_involvements), 0) || 0,
      expected_goals_conceded:
        response.data.history?.reduce((acc, game) => acc + parseFloat(game.expected_goals_conceded), 0) || 0,
    };

    res.json(playerStats);
  } catch (error) {
    console.error("Error fetching player details:", error.message);
    res.status(500).json({ error: "Failed to fetch player details" });
  }
});



// ✅ New API Route: Fetch Live Fixtures for Latest Gameweek
app.get("/live-fixtures", async (req, res) => {
  try {
    // Fetch bootstrap data to get latest gameweek
    const bootstrapRes = await axios.get(`${FPL_BASE_URL}/bootstrap-static/`);
    const today = new Date();
    const latestGameweek = bootstrapRes.data.events
      .filter(event => new Date(event.deadline_time) <= today)
      .reduce((prev, curr) => (curr.id > prev.id ? curr : prev), { id: 1 });

    // Fetch Fixtures for the latest gameweek
    const fixturesRes = await axios.get(`${FPL_BASE_URL}/fixtures/?event=${latestGameweek.id}`);
    
    res.json({
      gameweek: latestGameweek.id,
      fixtures: fixturesRes.data
    });
  } catch (error) {
    console.error("Error fetching live fixtures:", error.message);
    res.status(500).json({ error: "Failed to fetch live fixtures" });
  }
});

// ✅ Fetch Price Change Predictions
app.get("/price-change-prediction", async (req, res) => {
  try {
    // Fetch player data from bootstrap-static
    const bootstrapResponse = await axios.get(`${FPL_BASE_URL}/bootstrap-static/`, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const players = bootstrapResponse.data.elements;
    const teams = bootstrapResponse.data.teams;

    // Map team IDs to team names for display
    const teamMap = Object.fromEntries(teams.map(team => [team.id, team.name]));

    // Predict price changes for each player
    const predictedPlayers = players.map(player => {
      const transfersIn = player.transfers_in_event || 0;
      const transfersOut = player.transfers_out_event || 0;
      const form = parseFloat(player.form) || 0;
      const pointsPerGame = parseFloat(player.points_per_game) || 0;
      const currentPrice = player.now_cost / 10; // Convert from 10x pence to pounds

      // Simple prediction logic
      let predictedChange = "No Change";

      // Rising Price Prediction
      if (
        transfersIn > 10000 && // High transfers in
        form > 5 && // Good form
        pointsPerGame > 3 // Decent points per game
      ) {
        predictedChange = "Rise";
      }
      // Falling Price Prediction (Further relaxed criteria)
      else if (
        transfersOut > 2000 && // Lowered from 5000 to 2000
        form < 4 && // Relaxed from < 3 to < 4
        pointsPerGame < 3 // Relaxed from < 2 to < 3
      ) {
        predictedChange = "Fall";
      }

      // Debugging log for players not meeting criteria
      if (predictedChange === "No Change") {
        console.log(`Player ${player.web_name} (ID: ${player.id}) - Transfers In: ${transfersIn}, Transfers Out: ${transfersOut}, Form: ${form}, Points/Game: ${pointsPerGame}`);
      }

      return {
        id: player.id,
        web_name: player.web_name,
        team: teamMap[player.team] || "Unknown Team",
        current_price: currentPrice,
        predicted_change: predictedChange,
        transfers_in: transfersIn,
        transfers_out: transfersOut,
        form: form,
        points_per_game: pointsPerGame,
      };
    });

    // Filter players with predicted changes
    const filteredPlayers = predictedPlayers.filter(
      player => player.predicted_change !== "No Change"
    );

    // Sort by change magnitude
    filteredPlayers.sort((a, b) => {
      const scoreA = a.predicted_change === "Rise"
        ? a.transfers_in + (a.form * 10)
        : a.predicted_change === "Fall"
        ? -(a.transfers_out + (5 - a.form) * 10)
        : 0;
      const scoreB = b.predicted_change === "Rise"
        ? b.transfers_in + (b.form * 10)
        : b.predicted_change === "Fall"
        ? -(b.transfers_out + (5 - b.form) * 10)
        : 0;
      return scoreB - scoreA; // Descending order
    });

    res.json(filteredPlayers);
  } catch (error) {
    console.error("Error fetching price change predictions:", error.message);
    res.status(500).json({ error: "Failed to fetch price change predictions" });
  }
});


// ✅ Export the app as a Netlify Function handler instead of starting a server
module.exports.handler = serverless(app, {
  basePath: "/api", // Strip "/api" from the path
});

// Comment out the original app.listen() to avoid running as a traditional server
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });