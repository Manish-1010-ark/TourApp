"use client";

import { useState } from "react";
// UI FIX: Imported useNavigate to make the back button functional.
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Calendar,
  Camera,
  Utensils,
  Sunrise,
  Sunset,
  Moon,
  ChevronRight,
  ChevronLeft,
  Check,
  RotateCcw,
  Download,
  Share2,
} from "lucide-react";

// ICONS: Replaced some unused icons with ones relevant to the new itinerary
import { Building2, Castle } from "lucide-react";

const ItineraryCreationPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [interests, setInterests] = useState([]);
  const [pace, setPace] = useState("moderate");
  const [generatedItinerary, setGeneratedItinerary] = useState(null);
  // UI FIX: Added navigate hook instance.
  const navigate = useNavigate();

  const interestOptions = [
    { id: "culture", label: "Culture & History", icon: "🏛️" },
    { id: "food", label: "Food & Dining", icon: "🍜" },
    { id: "adventure", label: "Adventure", icon: "🏔️" },
    { id: "nature", label: "Nature & Wildlife", icon: "🌿" },
    { id: "relaxation", label: "Relaxation", icon: "🧘" },
    { id: "nightlife", label: "Nightlife", icon: "🎉" },
    { id: "shopping", label: "Shopping", icon: "🛍️" },
    { id: "photography", label: "Photography", icon: "📸" },
  ];

  // --- CONTENT CHANGE: Replaced Bali itinerary with a 3-day Golden Triangle trip. ---
  const exampleItinerary = {
    destination: "Golden Triangle, India",
    duration: "3 Days",
    days: [
      {
        day: 1,
        title: "The Pink City of Jaipur",
        activities: [
          {
            time: "09:00 AM",
            title: "Amber Fort (Amer Fort)",
            description:
              "Begin your journey at this magnificent honey-hued fort. Explore its sprawling complex of palaces, halls, and gardens with breathtaking views.",
            duration: "3 hours",
            image:
              "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400&q=80",
            icon: <Castle className="w-5 h-5" />,
          },
          {
            time: "01:00 PM",
            title: "Lunch at a Traditional Haveli",
            description:
              "Savor an authentic Rajasthani thali, featuring a variety of local vegetarian dishes like Dal Baati Churma in a heritage setting.",
            duration: "1.5 hours",
            image:
              "https://images.unsplash.com/photo-1626781423101-e403816a1b83?w=400&q=80",
            icon: <Utensils className="w-5 h-5" />,
          },
          {
            time: "03:00 PM",
            title: "City Palace & Hawa Mahal",
            description:
              "Explore the residence of the Jaipur royal family at the City Palace, then capture photos of the iconic 'Palace of Winds' (Hawa Mahal).",
            duration: "2.5 hours",
            image:
              "https://images.unsplash.com/photo-1617592344351-a51d95b57f20?w=400&q=80",
            icon: <Camera className="w-5 h-5" />,
          },
          {
            time: "07:30 PM",
            title: "Dinner at Chokhi Dhani",
            description:
              "Experience a cultural evening at this ethnic village resort, with folk dances, music, and a traditional Rajasthani dinner.",
            duration: "3 hours",
            image:
              "https://images.unsplash.com/photo-1601050690594-7069196b8633?w=400&q=80",
            icon: <Moon className="w-5 h-5" />,
          },
        ],
      },
      {
        day: 2,
        title: "Jaipur to Agra via Fatehpur Sikri",
        activities: [
          {
            time: "08:30 AM",
            title: "Journey to Agra",
            description:
              "Enjoy a scenic drive towards Agra. En route, stop at the ghost city of Fatehpur Sikri, a UNESCO World Heritage site.",
            duration: "5 hours",
            image:
              "https://images.unsplash.com/photo-1603598583921-828b1b0a8f8d?w=400&q=80",
            icon: <Building2 className="w-5 h-5" />,
          },
          {
            time: "02:00 PM",
            title: "Lunch in Agra",
            description:
              "After checking into your hotel, enjoy a hearty Mughlai lunch, famous for its rich and aromatic curries.",
            duration: "1.5 hours",
            image:
              "https://images.unsplash.com/photo-1567188041724-4455f75a3a5f?w=400&q=80",
            icon: <Utensils className="w-5 h-5" />,
          },
          {
            time: "05:00 PM",
            title: "Sunset View from Mehtab Bagh",
            description:
              "Witness a breathtaking sunset with the Taj Mahal in the background from across the Yamuna River at Mehtab Bagh (Moonlight Garden).",
            duration: "1.5 hours",
            image:
              "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&q=80",
            icon: <Sunset className="w-5 h-5" />,
          },
        ],
      },
      {
        day: 3,
        title: "The Iconic Taj Mahal",
        activities: [
          {
            time: "06:00 AM",
            title: "Sunrise at the Taj Mahal",
            description:
              "Experience the magical moment of sunrise at the world's most beautiful monument. See the white marble change colors with the rising sun.",
            duration: "3 hours",
            image:
              "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&q=80",
            icon: <Sunrise className="w-5 h-5" />,
          },
          {
            time: "10:00 AM",
            title: "Explore Agra Fort",
            description:
              "Visit this historical red sandstone fort, which served as the main residence of the Mughal Emperors. Another UNESCO World Heritage site.",
            duration: "2 hours",
            image:
              "https://images.unsplash.com/photo-1627895439839-86ce378c18c1?w=400&q=80",
            icon: <Castle className="w-5 h-5" />,
          },
          {
            time: "01:00 PM",
            title: "Farewell Lunch & Departure",
            description:
              "Enjoy one last taste of Mughlai cuisine before heading for your journey back home, filled with unforgettable memories.",
            duration: "1.5 hours",
            image:
              "https://images.unsplash.com/photo-1606491048802-8342506d84b2?w=400&q=80",
            icon: <Utensils className="w-5 h-5" />,
          },
        ],
      },
    ],
  };

  const toggleInterest = (interestId) => {
    setInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
  };

  const generateItinerary = () => {
    // In a real app, you would send the form data to an AI service here.
    // For this demo, we'll just use the example itinerary.
    setGeneratedItinerary(exampleItinerary);
    setCurrentStep(3);
  };

  const resetForm = () => {
    setCurrentStep(1);
    setDestination("");
    setStartDate("");
    setEndDate("");
    setInterests([]);
    setPace("moderate");
    setGeneratedItinerary(null);
  };

  const steps = ["Destination", "Preferences", "Itinerary"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate("/")}
              className="flex items-center space-x-2 group"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg transform group-hover:scale-110 transition-transform"></div>
              <span className="text-xl font-semibold text-slate-800">
                Wanderly
              </span>
            </button>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/")}
                className="text-slate-600 hover:text-slate-900 transition font-medium"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Create Your Perfect Itinerary
            </h1>
            <p className="text-lg text-slate-600">
              Tell us about your dream trip and we'll craft a personalized
              journey
            </p>
          </motion.div>

          {/* UI FIX: Replaced simple progress bar with a visual step indicator */}
          {currentStep < 3 && (
            <div className="mb-12">
              <div className="flex items-center justify-between max-w-md mx-auto">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                        currentStep > index
                          ? "bg-blue-600 text-white"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {currentStep > index ? <Check /> : index + 1}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-auto border-t-4 transition-all duration-300 ${
                          currentStep > index + 1
                            ? "border-blue-600"
                            : "border-slate-200"
                        }`}
                        style={{ width: "120px" }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-lg p-8 md:p-12"
              >
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Where would you like to go?
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Destination
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="e.g., Jaipur, Goa, Kerala"
                        className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Start Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          // UI FIX: Added classes to ensure date text is visible over icon
                          className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition relative z-10 bg-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        End Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          // UI FIX: Added classes to ensure date text is visible over icon
                          className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition relative z-10 bg-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentStep(2)}
                    disabled={!destination || !startDate || !endDate}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <span>Next: Preferences</span>
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-lg p-8 md:p-12"
              >
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  What are your interests?
                </h2>
                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-4">
                      Select all that apply
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {interestOptions.map((interest) => (
                        <motion.button
                          key={interest.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleInterest(interest.id)}
                          className={`p-4 rounded-xl border-2 transition text-center ${
                            interests.includes(interest.id)
                              ? "border-blue-500 bg-blue-50"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="text-3xl mb-2">{interest.icon}</div>
                          <div className="text-sm font-medium text-slate-700">
                            {interest.label}
                          </div>
                          {interests.includes(interest.id) && (
                            <Check className="w-5 h-5 text-blue-500 mx-auto mt-2" />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-4">
                      Travel Pace
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {["relaxed", "moderate", "packed"].map((paceOption) => (
                        <motion.button
                          key={paceOption}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setPace(paceOption)}
                          className={`p-6 rounded-xl border-2 transition text-center ${
                            pace === paceOption
                              ? "border-blue-500 bg-blue-50"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="font-semibold text-slate-900 capitalize mb-2">
                            {paceOption}
                          </div>
                          <div className="text-sm text-slate-600">
                            {paceOption === "relaxed" &&
                              "2-3 activities per day"}
                            {paceOption === "moderate" &&
                              "4-5 activities per day"}
                            {paceOption === "packed" && "6+ activities per day"}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentStep(1)}
                    className="px-8 py-4 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition flex items-center space-x-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    <span>Back</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={generateItinerary}
                    disabled={interests.length === 0}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <span>Generate Itinerary</span>
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && generatedItinerary && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 md:p-12 text-white mb-8">
                  <h2 className="text-3xl font-bold mb-2">
                    Your Itinerary: {generatedItinerary.destination}
                  </h2>
                  <p className="text-lg opacity-90">
                    A {generatedItinerary.duration} Adventure
                  </p>
                  <div className="mt-6 flex flex-wrap gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:shadow-lg transition flex items-center space-x-2"
                    >
                      <Download className="w-5 h-5" />
                      <span>Save Itinerary</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={resetForm}
                      className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition flex items-center space-x-2"
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span>Start Over</span>
                    </motion.button>
                  </div>
                </div>

                <div className="space-y-8">
                  {generatedItinerary.days.map((day, dayIndex) => (
                    <motion.div
                      key={dayIndex}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: dayIndex * 0.1 }}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-slate-100 to-slate-50 px-8 py-6 border-b border-slate-200">
                        <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                          Day {day.day}
                        </h3>
                        <p className="text-2xl font-bold text-slate-900 mt-1">
                          {day.title}
                        </p>
                      </div>

                      {/* UI FIX: Added a container for the timeline effect */}
                      <div className="p-4 md:p-8">
                        <div className="relative">
                          {/* The timeline line */}
                          <div className="absolute left-8 top-4 bottom-4 w-0.5 bg-slate-200"></div>

                          {day.activities.map((activity, actIndex) => (
                            <motion.div
                              key={actIndex}
                              className="relative pl-16 py-4"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                duration: 0.3,
                                delay: actIndex * 0.05,
                              }}
                            >
                              {/* Timeline circle icon */}
                              <div className="absolute left-8 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center ring-8 ring-white">
                                {activity.icon}
                              </div>

                              {/* UI FIX: Improved responsive layout for activities */}
                              <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                  <div className="text-sm font-semibold text-slate-500">
                                    {activity.time} ({activity.duration})
                                  </div>
                                  <h4 className="text-lg font-bold text-slate-900 mb-2">
                                    {activity.title}
                                  </h4>
                                  <p className="text-slate-600 leading-relaxed">
                                    {activity.description}
                                  </p>
                                </div>
                                <div className="flex-shrink-0 w-full md:w-40 h-32 md:h-28">
                                  <img
                                    src={activity.image}
                                    alt={activity.title}
                                    className="w-full h-full object-cover rounded-xl shadow-md"
                                  />
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ItineraryCreationPage;
