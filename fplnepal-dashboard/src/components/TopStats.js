import { FaFutbol, FaHandsHelping, FaHandPaper } from "react-icons/fa";
import TopGoalScorer from "./TopGoalScorer";
import TopAssists from "./TopAssists";
import TopGkCleanSheets from "./TopGkCleanSheets";

const TopStats = () => {
    return (
      <div className="bg-purple-950 p-2 shadow-md rounded-lg flex flex-col w-full text-sm"> {/* Reduced padding */}
        <h2 className="text-md font-bold text-center mb-2 text-white">Top Stats</h2>
        <div className="grid grid-cols-3 gap-2"> {/* More compact layout */}
          <TopGoalScorer />
          <TopAssists />
          <TopGkCleanSheets />
        </div>
      </div>
    );
};

export default TopStats;
