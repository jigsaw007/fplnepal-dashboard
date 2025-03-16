import React, { useState, useEffect } from "react";
import { fetchAllHeadToHeadStandings } from "../api/fplApi";
import H2HTopScorer from "../components/h2htopscorer";

const HEAD_TO_HEAD_LEAGUES = ["Div A", "Div B", "Div C", "Div D", "Div E", "Div F"];
const STANDINGS_PER_PAGE = 12;

const HeadToHeadLeague = () => {
    const [standingsByLeague, setStandingsByLeague] = useState({});
    const [currentPages, setCurrentPages] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getStandings = async () => {
            setLoading(true);
            const data = await fetchAllHeadToHeadStandings();
            setStandingsByLeague(data);
            setLoading(false);

            let initialPages = {};
            HEAD_TO_HEAD_LEAGUES.forEach((league) => {
                initialPages[league] = 1;
            });
            setCurrentPages(initialPages);
        };

        getStandings();
    }, []);

    const handleNextPage = (league) => {
        setCurrentPages((prevPages) => ({
            ...prevPages,
            [league]: prevPages[league] + 1,
        }));
    };

    const handlePrevPage = (league) => {
        setCurrentPages((prevPages) => ({
            ...prevPages,
            [league]: Math.max(prevPages[league] - 1, 1),
        }));
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold text-purple-950 mb-4 text-center">FPL NEPAL Head-to-Head League Standings</h2>

            {loading ? (
                <div className="text-center my-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading standings...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {HEAD_TO_HEAD_LEAGUES.map((league, index) => {
                        const standings = standingsByLeague[league] || [];
                        const currentPage = currentPages[league] || 1;

                        const indexOfLastStanding = currentPage * STANDINGS_PER_PAGE;
                        const indexOfFirstStanding = indexOfLastStanding - STANDINGS_PER_PAGE;
                        const currentStandings = standings.slice(indexOfFirstStanding, indexOfLastStanding);
                        const totalPages = Math.ceil(standings.length / STANDINGS_PER_PAGE);

                        return (
                            <div key={index} className="border p-3 rounded shadow-lg bg-white">
                                <h3 className="text-lg font-semibold text-purple-950 mb-2">{league}</h3>

                                {/* ✅ Responsive Table Wrapper (Enables Horizontal Scroll) */}
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse border border-gray-300 text-xs md:text-sm">
                                        <thead className="bg-purple-950 text-white">
                                            <tr>
                                                <th className="border p-2 md:p-3">Rank</th>
                                                <th className="border p-2 md:p-3">Team</th>
                                                <th className="border p-2 md:p-3">Manager</th>
                                                <th className="border p-2 md:p-3">MP</th>
                                                <th className="border p-2 md:p-3">W</th>
                                                <th className="border p-2 md:p-3">D</th>
                                                <th className="border p-2 md:p-3">L</th>
                                                <th className="border p-2 md:p-3">Pts</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentStandings.map((team, index) => (
                                                <tr key={index} className="border hover:bg-purple-100">
                                                    <td className="border p-2 md:p-3 text-center">{team.rank}</td>
                                                    <td className="border p-2 md:p-3">{team.team_name}</td>
                                                    <td className="border p-2 md:p-3">{team.manager_name}</td>
                                                    <td className="border p-2 md:p-3 text-center">{team.matches_played}</td>
                                                    <td className="border p-2 md:p-3 text-center">{team.wins}</td>
                                                    <td className="border p-2 md:p-3 text-center">{team.draws}</td>
                                                    <td className="border p-2 md:p-3 text-center">{team.losses}</td>
                                                    <td className="border p-2 md:p-3 text-center font-bold">{team.total_points}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* ✅ Pagination (Responsive Buttons) */}
                                <div className="flex justify-between items-center mt-2">
                                    <button className={`px-2 py-1 border rounded text-xs ${
                                        currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-900 text-white"
                                    }`} 
                                        onClick={() => handlePrevPage(league)} 
                                        disabled={currentPage === 1}>
                                        Prev
                                    </button>
                                    <span className="text-xs font-semibold">
                                        {currentPage} / {totalPages}
                                    </span>
                                    <button className={`px-2 py-1 border rounded text-xs ${
                                        currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-blue-900 text-white"
                                    }`} 
                                        onClick={() => handleNextPage(league)} 
                                        disabled={currentPage === totalPages}>
                                        Next
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default HeadToHeadLeague;
