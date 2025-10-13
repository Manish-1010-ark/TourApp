"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Calendar,
  Heart,
  Camera,
  Utensils,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  ChevronRight,
  ChevronLeft,
  Check,
  RotateCcw,
  Download,
  Share2,
} from "lucide-react";

const ItineraryCreationPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [interests, setInterests] = useState([]);
  const [pace, setPace] = useState("moderate");
  const [generatedItinerary, setGeneratedItinerary] = useState(null);

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

  const exampleItinerary = {
    destination: "Bali, Indonesia",
    duration: "3 Days",
    days: [
      {
        day: 1,
        title: "Arrival & Ubud Exploration",
        activities: [
          {
            time: "09:00 AM",
            title: "Tegallalang Rice Terraces",
            description:
              "Start your Bali adventure with the iconic emerald rice terraces. Perfect for photography and experiencing traditional Balinese agriculture.",
            duration: "2 hours",
            image:
              "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80",
            icon: <Camera className="w-5 h-5" />,
          },
          {
            time: "12:30 PM",
            title: "Lunch at Sari Organik",
            description:
              "Organic farm-to-table dining overlooking the rice fields. Try the nasi campur and fresh coconut water.",
            duration: "1.5 hours",
            image:
              "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80",
            icon: <Utensils className="w-5 h-5" />,
          },
          {
            time: "03:00 PM",
            title: "Sacred Monkey Forest",
            description:
              "Explore the lush sanctuary home to over 700 Balinese long-tailed monkeys and ancient temple ruins.",
            duration: "2 hours",
            image:
              "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
            icon: <Heart className="w-5 h-5" />,
          },
          {
            time: "07:00 PM",
            title: "Traditional Balinese Dinner",
            description:
              "Experience authentic Balinese cuisine at Locavore, featuring modern interpretations of local ingredients.",
            duration: "2 hours",
            image:
              "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
            icon: <Moon className="w-5 h-5" />,
          },
        ],
      },
      {
        day: 2,
        title: "Temples & Beach Sunset",
        activities: [
          {
            time: "06:00 AM",
            title: "Sunrise at Mount Batur",
            description:
              "Early morning trek to witness a spectacular sunrise above the clouds. Includes breakfast at the summit.",
            duration: "5 hours",
            image:
              "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
            icon: <Sunrise className="w-5 h-5" />,
          },
          {
            time: "01:00 PM",
            title: "Tirta Empul Temple",
            description:
              "Participate in the sacred water purification ritual at this ancient Hindu temple with natural spring water.",
            duration: "2 hours",
            image:
              "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&q=80",
            icon: <MapPin className="w-5 h-5" />,
          },
          {
            time: "05:00 PM",
            title: "Tanah Lot Sunset",
            description:
              "Visit the iconic sea temple perched on a rock formation. Arrive early for the best sunset views.",
            duration: "2 hours",
            image:
              "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&q=80",
            icon: <Sunset className="w-5 h-5" />,
          },
        ],
      },
      {
        day: 3,
        title: "Beach Day & Departure",
        activities: [
          {
            time: "09:00 AM",
            title: "Seminyak Beach Relaxation",
            description:
              "Enjoy your final morning on the pristine beaches of Seminyak. Perfect for swimming and sunbathing.",
            duration: "3 hours",
            image:
              "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&q=80",
            icon: <Sun className="w-5 h-5" />,
          },
          {
            time: "12:30 PM",
            title: "Beachfront Lunch at Motel Mexicola",
            description:
              "Colorful Mexican restaurant with vibrant decor and delicious tacos. A perfect goodbye to Bali.",
            duration: "1.5 hours",
            image:
              "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80",
            icon: <Utensils className="w-5 h-5" />,
          },
          {
            time: "03:00 PM",
            title: "Last Minute Shopping",
            description:
              "Browse local boutiques and art galleries in Seminyak for unique souvenirs and handcrafted items.",
            duration: "2 hours",
            image:
              "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80",
            icon: <Camera className="w-5 h-5" />,
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

  const progress = (currentStep / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
              <span className="text-xl font-semibold text-slate-800">
                Wanderly
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-slate-600 hover:text-slate-900 transition">
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
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

          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">
                Step {currentStep} of 3
              </span>
              <span className="text-sm font-medium text-slate-700">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Step Content */}
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
                        placeholder="e.g., Bali, Tokyo, Paris, New York"
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
                          className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition"
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
                          className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition"
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
                          className={`p-4 rounded-xl border-2 transition ${
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
                          className={`p-6 rounded-xl border-2 transition ${
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
                {/* Itinerary Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 md:p-12 text-white mb-8">
                  <h2 className="text-3xl font-bold mb-2">
                    {generatedItinerary.destination}
                  </h2>
                  <p className="text-lg opacity-90">
                    {generatedItinerary.duration} Adventure
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
                      className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition flex items-center space-x-2"
                    >
                      <Share2 className="w-5 h-5" />
                      <span>Share</span>
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

                {/* Daily Itineraries */}
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
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                              Day {day.day}
                            </span>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">
                              {day.title}
                            </h3>
                          </div>
                        </div>
                      </div>

                      <div className="p-8">
                        <div className="space-y-6">
                          {day.activities.map((activity, actIndex) => (
                            <motion.div
                              key={actIndex}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                duration: 0.3,
                                delay: actIndex * 0.05,
                              }}
                              className="flex gap-6"
                            >
                              <div className="flex-shrink-0">
                                <div className="w-24 text-center">
                                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full mb-2">
                                    {activity.icon}
                                  </div>
                                  <div className="text-sm font-semibold text-slate-700">
                                    {activity.time}
                                  </div>
                                  <div className="text-xs text-slate-500 mt-1">
                                    {activity.duration}
                                  </div>
                                </div>
                              </div>

                              <div className="flex-1">
                                <div className="flex gap-4">
                                  <div className="flex-1">
                                    <h4 className="text-lg font-bold text-slate-900 mb-2">
                                      {activity.title}
                                    </h4>
                                    <p className="text-slate-600 leading-relaxed">
                                      {activity.description}
                                    </p>
                                  </div>
                                  <div className="flex-shrink-0 w-32 h-32">
                                    <img
                                      src={activity.image}
                                      alt={activity.title}
                                      className="w-full h-full object-cover rounded-xl shadow-md"
                                    />
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Bottom Actions */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-12 bg-slate-50 rounded-2xl p-8 text-center"
                >
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    Love this itinerary?
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Save it to your account and access it anytime during your
                    trip
                  </p>
                  <div className="flex justify-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
                    >
                      Save to My Trips
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={resetForm}
                      className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:border-slate-300 transition"
                    >
                      Create Another
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ItineraryCreationPage;
