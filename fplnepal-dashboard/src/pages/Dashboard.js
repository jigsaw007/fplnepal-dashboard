import TopStats from "../components/TopStats";
import TopSelectedPlayers from "../components/TopSelectedPlayers";
import TopTransfersIn from "../components/TopTransfersIn";
import TopTransfersOut from "../components/TopTransfersOut";
import InjuryNews from "../components/InjuryNews";
import DreamTeam from "../components/DreamTeam";
import Suggestion from "../components/Suggestion";
import Live from "../components/Live";
import PriceChangePrediction from "../components/PriceChangePrediction";
import AdComponent from "../components/AdComponent";

const Dashboard = () => {
  return (
    <div className="p-4 w-full">
      {/* 🔹 Top Section - Stats & Most Selected Players */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TopStats />
        <TopSelectedPlayers />
        <InjuryNews />
      </div>

      {/* 🔹 Ad Unit Placement (e.g., above PriceChangePrediction) */}
      <div className="mt-4">
        <AdComponent />
      </div>

      {/* 🔹 Price Change Prediction Section */}
      <div className="mt-4">
        <PriceChangePrediction />
      </div>

      {/* 🔹 Transfers Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <TopTransfersIn />
        <TopTransfersOut />
      </div>

      {/* 🔹 Extra Components from Right Sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Live />
        <DreamTeam />
      </div>

      <Suggestion />
    </div>
  );
};

export default Dashboard;