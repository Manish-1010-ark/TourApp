import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Home from "./pages/Home.jsx";
import ItineraryCreationPage from "./pages/extra/ItineraryPage.jsx";
import TestItinerary from "./pages/test/TestItinerary.jsx";
import RouteValidation from "./pages/test/RouteValidation.jsx";
import TripConfiguration from "./pages/TripConfiguration.jsx";
import ItineraryGeneration from "./pages/ItineraryGeneration.jsx";

import DestinationPage from "./pages/DestinationPage.jsx";

import TripPreparation from "./pages/TripPreparation.jsx";

function App() {
  return (
    <Router>
      <Routes>        
        <Route path="/itinerary" element={<ItineraryCreationPage />} />        
        <Route path="/destination" element={<DestinationPage />} />

        //0
        <Route path="/" element={<Home />} />{" "}
        //1
        <Route path="/trip-prep" element={<TripPreparation />} />
        //2
        <Route path="/trip-configuration" element={<TripConfiguration />} />
        //3
        <Route path="/itinerary-generation" element={<ItineraryGeneration />} />
        //test
        <Route path="/test" element={<TestItinerary />} />
        <Route path="/validate" element={<RouteValidation />} />
      </Routes>
    </Router>
  );
}

export default App;
