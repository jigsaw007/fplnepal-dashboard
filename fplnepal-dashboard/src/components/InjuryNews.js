import { useEffect, useState } from "react";
import { fetchInjuryNews } from "../api/fplApi"; // Fetch injuries & suspensions API
import { 
  FaUserInjured, FaBandAid, FaPlane, FaMoneyBillWave, FaBan, 
  FaQuestionCircle, FaExclamationTriangle 
} from "react-icons/fa"; // Import relevant icons
import { TEAM_SHORT_NAMES, getTeamKit } from "../utils/teamData"; // ✅ Import team data

const InjuryNews = () => {
  const [news, setNews] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 3;

  useEffect(() => {
    const getInjuryNews = async () => {
      setLoading(true);
      const data = await fetchInjuryNews();
      if (data) {
        const shuffledNews = data.sort(() => Math.random() - 0.5); // ✅ Shuffle the data
        setNews(shuffledNews);
      }
      setLoading(false);
    };
    getInjuryNews();
  }, []);

  // ✅ Function to Determine Icon Based on News Type
  const getNewsIcon = (newsText) => {
    if (!newsText) return <FaExclamationTriangle className="text-yellow-500 text-lg" />; // Default Caution icon

    const lowerNews = newsText.toLowerCase();

    if (lowerNews.includes("injury")) return <FaUserInjured className="text-red-600 text-lg" />;
    if (lowerNews.includes("knock")) return <FaBandAid className="text-yellow-600 text-lg" />;
    if (lowerNews.includes("loan")) return <FaPlane className="text-blue-500 text-lg" />;
    if (lowerNews.includes("transfer")) return <FaMoneyBillWave className="text-green-500 text-lg" />;
    if (lowerNews.includes("suspend")) return <FaBan className="text-red-700 text-lg" />;
    if (lowerNews.includes("parent club")) return <FaBan className="text-gray-500 text-lg" />;
    if (lowerNews.includes("unknown")) return <FaQuestionCircle className="text-gray-400 text-lg" />;
    
    return <FaExclamationTriangle className="text-yellow-500 text-lg" />; // Default caution icon
  };

  // Pagination logic
  const startIndex = currentPage * itemsPerPage;
  const paginatedNews = news.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(news.length / itemsPerPage);

  return (
    <div className="bg-purple-950 p-2 shadow-md rounded-lg text-sm text-white">
      <h2 className="text-lg font-bold text-center mb-2">Injuries & Suspensions</h2>

      {loading ? (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
        </div>
      ) : (
        <>
          {/* News Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {paginatedNews.map((player) => {
              const teamShortName = TEAM_SHORT_NAMES[player.team] || "N/A"; 
              const kitUrl = getTeamKit(player.team, "MID"); 
              const newsIcon = getNewsIcon(player.news); // ✅ Get the correct icon

              return (
                <div key={player.id} className="bg-white text-black p-2 rounded-lg shadow flex flex-col items-center h-48">
                  <img src={kitUrl} alt={teamShortName} className="w-16 h-16 mb-2" />
                  <h3 className="text-sm font-bold">{player.web_name}</h3>

                  {/* ✅ Display Correct Icon Based on News Type */}
                  {newsIcon}

                  <p className="text-center text-gray-700 text-xs overflow-hidden line-clamp-2">{player.news}</p>
                </div>
              );
            })}
          </div>

          {/* Pagination Buttons */}
          <div className="flex justify-center mt-4 space-x-4">
            <button
              className="px-4 py-2 rounded bg-gray-400 text-white shadow-md disabled:opacity-50"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Previous
            </button>

            <button
              className="px-4 py-2 rounded bg-green-500 text-white shadow-md disabled:opacity-50"
              disabled={currentPage + 1 >= totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default InjuryNews;
