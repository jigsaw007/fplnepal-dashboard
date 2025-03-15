import GameweekResults from "./GameweekResults";
import DreamTeam from "./DreamTeam";

const RightSidebar = () => {
  return (
    <aside className="w-1/4 bg-gray-100 p-4 shadow-md">
      
      {/* Gameweek Results Component */}
      <GameweekResults />
      
      {/* Future Components Can Be Added Here */}
      <DreamTeam />
    </aside>
  );
};

export default RightSidebar;
