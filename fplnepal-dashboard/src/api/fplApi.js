// Determine the BASE_URL based on the environment
const isLocal = process.env.NODE_ENV === "development";
const BASE_URL = isLocal
  ? "http://localhost:8888/.netlify/functions/api" // Local dev with netlify dev
  : "https://fplnepaldashboard.netlify.app/.netlify/functions/api"; // Production

export const fetchFPLData = async () => {
  try {
    const response = await fetch(`${BASE_URL}/fpl-data`);
    if (!response.ok) throw new Error("Failed to fetch FPL data");
    return await response.json();
  } catch (error) {
    console.error("Error fetching FPL data:", error);
    return null;
  }
};

// Fetch Fixtures for a Specific Gameweek
export const fetchFixturesByGameweek = async (gameweek) => {
  try {
    const response = await fetch(`${BASE_URL}/fixtures?event=${gameweek}`);
    if (!response.ok) throw new Error("Failed to fetch fixtures");
    return await response.json();
  } catch (error) {
    console.error("Error fetching fixtures:", error);
    return [];
  }
};

// Fetch Team Data (for Badges)
export const fetchTeamsData = async () => {
  try {
    const response = await fetch(`${BASE_URL}/teams`);
    if (!response.ok) throw new Error("Failed to fetch teams data");
    return await response.json();
  } catch (error) {
    console.error("Error fetching teams:", error);
    return [];
  }
};

// Transfer Data
export const fetchTransfersData = async () => {
  try {
    const response = await fetch(`${BASE_URL}/bootstrap-static`); // Fetch via backend
    if (!response.ok) throw new Error("Failed to fetch transfers data");

    const data = await response.json();
    return data.elements.map(player => ({
      id: player.id,
      web_name: player.web_name,
      team: player.team,
      element_type: player.element_type,
      transfers_in_event: player.transfers_in_event || 0,
      transfers_out_event: player.transfers_out_event || 0
    }));
  } catch (error) {
    console.error("Error fetching transfers:", error);
    return [];
  }
};

// Injury News
export const fetchInjuryNews = async () => {
  try {
    const response = await fetch(`${BASE_URL}/injuries`); // Use BASE_URL
    if (!response.ok) throw new Error("Failed to fetch injuries");
    return await response.json();
  } catch (error) {
    console.error("Error fetching injury news:", error);
    return [];
  }
};

// Classic League
export const fetchClassicLeague = async (leagueId, gameweek) => {
  try {
    const response = await fetch(`${BASE_URL}/classic-league/${leagueId}/${gameweek}`);
    if (!response.ok) throw new Error("Failed to fetch Classic League standings");
    return await response.json();
  } catch (error) {
    console.error("Error fetching Classic League standings:", error.message);
    return [];
  }
};

// History
export const fetchManagerHistory = async (managerId) => {
  try {
    const response = await fetch(`${BASE_URL}/manager-history/${managerId}`);
    if (!response.ok) throw new Error("Failed to fetch manager history");
    return await response.json();
  } catch (error) {
    console.error("Error fetching manager history:", error.message);
    return null;
  }
};

// Fetch All H2H League Standings at Once
export const fetchAllHeadToHeadStandings = async () => {
  try {
    const response = await fetch(`${BASE_URL}/h2h-league-all`);
    if (!response.ok) throw new Error("Failed to fetch all H2H league standings");
    return await response.json();
  } catch (error) {
    console.error("Error fetching all H2H league standings:", error.message);
    return {};
  }
};

// Fetch Dream Team for a Specific Gameweek
export const fetchDreamTeam = async (gameweek) => {
  try {
    const response = await fetch(`${BASE_URL}/dream-team/${gameweek}`);
    if (!response.ok) throw new Error("Failed to fetch dream team");
    return await response.json();
  } catch (error) {
    console.error("Error fetching dream team:", error);
    return null;
  }
};

// Tie Analyzer
export const fetchTieAnalyzer = async (teamId1, teamId2, gameweek) => {
  try {
    const response = await fetch(
      `${BASE_URL}/tieanalyze?team_id1=${teamId1}&team_id2=${teamId2}&gameweek=${gameweek}`
    );
    if (!response.ok) throw new Error("Failed to fetch tie analyzer data");
    return await response.json();
  } catch (error) {
    console.error("Error fetching tie analyzer data:", error);
    return null;
  }
};

// Fetch the highest scorer for each H2H league for the given gameweek
export const fetchH2HTopScorer = async (gameweek) => {
  try {
    const response = await fetch(`${BASE_URL}/h2h-topscorer/${gameweek}`);
    if (!response.ok) throw new Error(`Failed to fetch H2H top scorers: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching H2H top scorers:", error.message);
    return {};
  }
};

// Fetch User History with Pagination Support
export const fetchUserHistory = async (teamId) => {
  try {
    const response = await fetch(`${BASE_URL}/user-history/${teamId}`);
    if (!response.ok) throw new Error(`Failed to fetch user history: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching user history:", error.message);
    return null;
  }
};

// Fetch Player Details
export const fetchPlayerDetails = async (playerId) => {
  try {
    const response = await fetch(`${BASE_URL}/player/${playerId}`);
    if (!response.ok) throw new Error(`Failed to fetch player details: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching player details:", error.message);
    return null;
  }
};