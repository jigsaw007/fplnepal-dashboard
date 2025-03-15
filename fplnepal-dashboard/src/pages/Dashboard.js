import TopStats from "../components/TopStats";
import TopSelectedPlayers from "../components/TopSelectedPlayers";
import TopTransfersIn from "../components/TopTransfersIn";
import TopTransfersOut from "../components/TopTransfersOut";
import InjuryNews from "../components/InjuryNews";
import DreamTeam from "../components/DreamTeam";
import Suggestion from "../components/Suggestion"
import RightSidebar from "../components/RightSidebar";

const Dashboard = () => {
  return (
    <div className="flex">
      
      {/* Main Dashboard Content */}
      <div className="flex-1 p-4">
        {/* 🔹 Compact Top Stats & Most Selected Players */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TopStats />
          <TopSelectedPlayers />
          <InjuryNews />
        </div>
        

        {/* 🔹 Transfers Section - More Compact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <TopTransfersIn />
          <TopTransfersOut />
        </div>
      <Suggestion />

      </div>
      <RightSidebar />
    </div>
  );
};

export default Dashboard;
