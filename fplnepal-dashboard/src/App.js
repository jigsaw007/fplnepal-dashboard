import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import usePageTracking from "./pages/usePageTracking"; //
import Sidebar from "./components/Sidebar";  // Left sidebar
import Navbar from "./components/Navbar";    // Top navbar
import RightSidebar from "./components/RightSidebar"; // Global Right Sidebar
import Dashboard from "./pages/Dashboard";
import Players from "./pages/Players";
import Compare from "./pages/Compare";
import ClassicLeague from "./pages/ClassicLeague";
import HeadToHeadLeague from "./pages/HeadToHeadLeague";
import DreamTeam from "./components/DreamTeam";
import Suggestion from "./components/Suggestion";
import Footer from "./components/Footer";
import TieAnalyzer from "./components/TieAnalyzer";
import H2HTopScorer from "./components/h2htopscorer";
import History from "./components/History";
import Live from "./components/Live";



const App = () => {
  return (
    <Router>
      <PageTrackingWrapper />
      <div className="flex">
        <Sidebar /> {/* Left Sidebar */}

        <div className="flex-1 flex flex-col">
          <Navbar /> {/* Top Navbar */}

          <div className="flex">
            {/* Main Page Content */}
            <div className="flex-1 p-6">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/players" element={<Players />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/classic-league" element={<ClassicLeague />} />
                <Route path="/headtohead-league" element={<HeadToHeadLeague />} />
                <Route path="/dream-team" element={<DreamTeam />} />
                <Route path="/suggestion" element={<Suggestion />} />
                <Route path="/tieanalyzer" element={<TieAnalyzer />} />
                <Route path="/h2htopscorer" element={<H2HTopScorer />} />
                <Route path="/history" element={<History />} />
                <Route path="/live" element={<Live />} />


              </Routes>
            </div>
            {/* Global Right Sidebar - Now It Appears on All Pages */}
            
          </div>
        </div>
      </div>
      <Footer />
    </Router>
  );
};

// ✅ Wrapper Component to Ensure <Router> Exists Before usePageTracking()
const PageTrackingWrapper = () => {
  usePageTracking();
  return null;
};

export default App;
