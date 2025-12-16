import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";

import LandingPage from "./pages/Home.jsx";
import ItineraryCreationPage from "./pages/ItineraryPage.jsx";
import TestItinerary from "./pages/TestItinerary.jsx";
import RouteValidation from "./pages/RouteValidation.jsx";
import TravelMode from "./pages/TravelMode.jsx";
import TripConfiguration from "./pages/TripConfiguration.jsx";
import ItineraryGeneration from "./pages/ItineraryGeneration.jsx";

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/itinerary" element={<ItineraryCreationPage />} />
        <Route path="/test" element={<TestItinerary />} /> 
        <Route path="/validate" element={<RouteValidation />} />
        <Route path="/travel-mode" element={<TravelMode />} />
        <Route path="/trip-configuration" element={<TripConfiguration />} />
        <Route path="/itinerary-generation" element={<ItineraryGeneration />} />
      </Routes>
    </Router>
  );
}

export default App;
