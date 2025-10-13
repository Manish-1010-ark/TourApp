import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";

import LandingPage from "./pages/Home.jsx";
import ItineraryCreationPage from "./pages/ItineraryPage.jsx";

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/itinerary" element={<ItineraryCreationPage />} />
      </Routes>
    </Router>
  );
}

export default App;
