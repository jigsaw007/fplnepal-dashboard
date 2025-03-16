import DreamTeam from "./DreamTeam";
import Live from "./Live";

const RightSidebar = () => {
  return (
    <aside className="w-full md:w-1/4 bg-gray-100 p-4 shadow-md mt-4 md:mt-0">
      <Live />
      <DreamTeam />
    </aside>
  );
};

export default RightSidebar;
