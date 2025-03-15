import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="w-1/7 bg-red-400 text-white h-screen p-6">
      <h2 className="text-xl font-bold mb-6">FPL Nepal Dashboard</h2>
      <nav className="space-y-4">
        <Link to="/" className="block hover:bg-gray-700 p-2 rounded">🏠 Dashboard</Link>
        <Link to="/players" className="block hover:bg-gray-700 p-2 rounded">⚽ Players</Link>
        <Link to="/compare" className="block hover:bg-gray-700 p-2 rounded">⚽ Compare</Link>
        <Link to="/history" className="block hover:bg-gray-700 p-2 rounded">⚽ History</Link>




        {/* ✅ Add Title Before Classic League */}
        <h3 className="text-lg font-semibold mt-4">FPL NEPAL</h3>

        <Link to="/classic-league" className="block hover:bg-gray-700 p-2 rounded">📊 Classic League</Link>
        <Link to="/headtohead-league" className="block hover:bg-gray-700 p-2 rounded">📊 H2H League</Link>
        <Link to="/tieanalyzer" className="block hover:bg-gray-700 p-2 rounded">🔍 Tie Analyzer</Link>
        <Link to="/h2htopscorer" className="block hover:bg-gray-700 p-2 rounded">🔍 H2HTopScorer</Link>

      </nav>
    </aside>
  );
};

export default Sidebar;
