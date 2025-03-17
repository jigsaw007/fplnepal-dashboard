import React, { useState, useEffect } from "react";
import { fetchPriceChangePredictions } from "../api/fplApi";

const PriceChangePrediction = () => {
  const [risePlayers, setRisePlayers] = useState([]);
  const [dropPlayers, setDropPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [risePage, setRisePage] = useState(1);
  const [dropPage, setDropPage] = useState(1);
  const playersPerPage = 5; // Show top 5 players per page

  useEffect(() => {
    const loadPriceChangePredictions = async () => {
      setLoading(true);
      setError(null);
      try {
        const predictedPlayers = await fetchPriceChangePredictions();
        if (predictedPlayers && predictedPlayers.length > 0) {
          // Separate Rise and Drop players
          const rise = predictedPlayers.filter(player => player.predicted_change === "Rise");
          const drop = predictedPlayers.filter(player => player.predicted_change === "Fall");

          // Sort Rise players by change magnitude
          const sortedRise = rise.sort((a, b) => {
            const scoreA = a.transfers_in + (a.form * 10);
            const scoreB = b.transfers_in + (b.form * 10);
            return scoreB - scoreA; // Descending order
          });

          // Sort Drop players by change magnitude
          const sortedDrop = drop.sort((a, b) => {
            const scoreA = a.transfers_out + (5 - a.form) * 10;
            const scoreB = b.transfers_out + (5 - b.form) * 10;
            return scoreB - scoreA; // Descending order
          });

          setRisePlayers(sortedRise);
          setDropPlayers(sortedDrop);
        } else {
          setError("No price change predictions available");
        }
      } catch (err) {
        setError("Failed to load price change predictions");
        console.error("Error in PriceChangePrediction:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPriceChangePredictions();
  }, []);

  // Pagination Logic for Rise Table
  const indexOfLastRise = risePage * playersPerPage;
  const indexOfFirstRise = indexOfLastRise - playersPerPage;
  const currentRisePlayers = risePlayers.slice(indexOfFirstRise, indexOfLastRise);
  const totalRisePages = Math.ceil(risePlayers.length / playersPerPage);

  // Pagination Logic for Drop Table
  const indexOfLastDrop = dropPage * playersPerPage;
  const indexOfFirstDrop = indexOfLastDrop - playersPerPage;
  const currentDropPlayers = dropPlayers.slice(indexOfFirstDrop, indexOfLastDrop);
  const totalDropPages = Math.ceil(dropPlayers.length / playersPerPage);

  const paginateRise = (pageNumber) => setRisePage(pageNumber);
  const paginateDrop = (pageNumber) => setDropPage(pageNumber);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-2 text-center text-red-500 text-xs">{error}</div>
    );
  }

  // Render Table Function (Reusable for both Rise and Drop)
  const renderTable = (players, currentPlayers, totalPages, currentPage, paginate, title, titleColor) => (
    <div className="w-full min-h-[300px] max-h-[300px] overflow-y-auto bg-white shadow-md rounded-lg">
      <h3 className={`text-lg font-semibold ${titleColor} mb-2 text-center pt-2`}>{title}</h3>
      {players.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-xs">
              <thead className="bg-purple-950 text-white sticky top-0 z-10">
                <tr>
                  <th className="border p-1">Player</th>
                  <th className="border p-1">Team</th>
                  <th className="border p-1">Price (£)</th>
                  <th className="border p-1">Change</th>
                  <th className="border p-1">In</th>
                  <th className="border p-1">Out</th>
                  <th className="border p-1">Form</th>
                  <th className="border p-1">P/G</th>
                </tr>
              </thead>
              <tbody>
                {currentPlayers.map((player) => (
                  <tr key={player.id} className="border hover:bg-purple-50">
                    <td className="border p-1 text-center">{player.web_name}</td>
                    <td className="border p-1 text-center">{player.team}</td>
                    <td className="border p-1 text-center">{player.current_price.toFixed(1)}</td>
                    <td className="border p-1 text-center">
                      <span
                        className={
                          player.predicted_change === "Rise"
                            ? "text-green-600 font-bold"
                            : "text-red-600 font-bold"
                        }
                      >
                        {player.predicted_change}
                      </span>
                    </td>
                    <td className="border p-1 text-center">{player.transfers_in.toLocaleString()}</td>
                    <td className="border p-1 text-center">{player.transfers_out.toLocaleString()}</td>
                    <td className="border p-1 text-center">{player.form.toFixed(1)}</td>
                    <td className="border p-1 text-center">{player.points_per_game.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-2 pb-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`mx-1 px-2 py-1 text-xs rounded ${
                    currentPage === number
                      ? "bg-purple-700 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {number}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-gray-600 text-xs p-4">No players predicted for this category.</p>
      )}
    </div>
  );

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold text-gray-700 mb-2 text-center">
        Price Change Predictions
      </h2>
      <p className="text-center mb-4 text-gray-600 text-xs">
        Top players predicted to have price rises or falls based on transfers and form.
      </p>

      {/* Flexbox Container for Side-by-Side Tables */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Rise Table */}
        <div className="w-full md:w-1/2">
          {renderTable(
            risePlayers,
            currentRisePlayers,
            totalRisePages,
            risePage,
            paginateRise,
            "Predicted Price Rises",
            "text-green-600"
          )}
        </div>

        {/* Drop Table */}
        <div className="w-full md:w-1/2">
          {renderTable(
            dropPlayers,
            currentDropPlayers,
            totalDropPages,
            dropPage,
            paginateDrop,
            "Predicted Price Drops",
            "text-red-600"
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceChangePrediction;