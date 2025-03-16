import TopStats from "../components/TopStats";
import TopSelectedPlayers from "../components/TopSelectedPlayers";
import TopTransfersIn from "../components/TopTransfersIn";
import TopTransfersOut from "../components/TopTransfersOut";
import InjuryNews from "../components/InjuryNews";
import DreamTeam from "../components/DreamTeam";
import Suggestion from "../components/Suggestion";
import Live from "../components/Live";

const Dashboard = () => {
  return (
    <div className="p-4 w-full"> {/* Takes full width now */}
      
      {/* 🔹 Top Section - Stats & Most Selected Players */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TopStats />
        <TopSelectedPlayers />
        <InjuryNews />
      </div>

      {/* 🔹 Transfers Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <TopTransfersIn />
        <TopTransfersOut />
      </div>

      {/* 🔹 Extra Components from Right Sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Live /> {/* Live updates moved here */}
        <DreamTeam /> {/* DreamTeam moved here */}
      </div>

      <Suggestion />
    </div>
  );
};

export default Dashboard;
