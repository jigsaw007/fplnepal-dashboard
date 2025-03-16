import { useState } from "react";
import { FaBars } from "react-icons/fa"; // Import hamburger icon

const Navbar = ({ toggleSidebar }) => {
  return (
    <header className="bg-purple-950 text-white shadow-md p-4 flex justify-between items-center">
      <button onClick={toggleSidebar} className="text-white text-xl md:hidden">
        <FaBars />
      </button>
      <h1 className="text-lg font-bold text-center flex-grow">FPL Nepal Webapp</h1>
    </header>
  );
};

export default Navbar;
