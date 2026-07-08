import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ChatWidget from './components/ChatWidget';
import Home from "./pages/Home.jsx";
import ItineraryCreationPage from "./pages/extra/ItineraryPage.jsx";
import TestItinerary from "./pages/test/TestItinerary.jsx";
import RouteValidation from "./pages/test/RouteValidation.jsx";
import TripConfiguration from "./pages/TripConfiguration.jsx";
import ItineraryGeneration from "./pages/ItineraryGeneration.jsx";

import DestinationPage from "./pages/DestinationPage.jsx";

import TripPreparation from "./pages/TripPreparation.jsx";
import DeveloperDashboard from "./pages/DeveloperDashboard.jsx";
import DeveloperRoute from "./components/dashboard/DeveloperRoute.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/itinerary" element={<ItineraryCreationPage />} /> */}
        <Route path="/destination" element={<DestinationPage />} />
        //0
        <Route path="/" element={<Home />} /> //1
        <Route path="/trip-prep" element={<TripPreparation />} />
        //1b
        <Route path="/user-dashboard" element={<UserDashboard />} />
        //2
        <Route path="/trip-configuration" element={<TripConfiguration />} />
        //3
        <Route path="/itinerary-generation" element={<ItineraryGeneration />} />
        //4 - developer-only route, protected so typing the URL doesn't bypass
        it
        <Route
          path="/developer-dashboard"
          element={
            <DeveloperRoute>
              <DeveloperDashboard />
            </DeveloperRoute>
          }
        />
        //test
        <Route path="/test" element={<TestItinerary />} />
        <Route path="/validate" element={<RouteValidation />} />
      </Routes>

      <ChatWidget />
    </Router>
  );
}

export default App;
