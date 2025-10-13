import { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  Instagram,
  Twitter,
  Facebook,
  Mail,
  CheckCircle,
  Menu,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const destinations = [
    {
      name: "Goa",
      image:
        "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80",
      description: "Beaches, nightlife, and Portuguese heritage",
      days: "4-6 days",
      state: "Goa",
    },
    {
      name: "Jaipur",
      image:
        "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80",
      description: "Pink city with majestic forts and palaces",
      days: "3-4 days",
      state: "Rajasthan",
    },
    {
      name: "Kerala Backwaters",
      image:
        "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80",
      description: "Serene houseboats and lush green landscapes",
      days: "5-7 days",
      state: "Kerala",
    },
    {
      name: "Ladakh",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
      description: "Himalayan paradise with stunning monasteries",
      days: "7-10 days",
      state: "Ladakh",
    },
    {
      name: "Udaipur",
      image:
        "https://images.unsplash.com/photo-1585297595903-0c5b3d268819?w=800&q=80",
      description: "City of lakes with romantic palaces",
      days: "3-4 days",
      state: "Rajasthan",
    },
    {
      name: "Manali",
      image:
        "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80",
      description: "Snow-capped peaks and adventure sports",
      days: "5-6 days",
      state: "Himachal Pradesh",
    },
    {
      name: "Varanasi",
      image:
        "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&q=80",
      description: "Spiritual capital with ancient ghats",
      days: "2-3 days",
      state: "Uttar Pradesh",
    },
    {
      name: "Andaman Islands",
      image:
        "https://images.unsplash.com/photo-1589197331516-6c0d95ff75b7?w=800&q=80",
      description: "Pristine beaches and coral reefs",
      days: "6-8 days",
      state: "Andaman & Nicobar",
    },
  ];

  const steps = [
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Choose Your Destination",
      description:
        "Select from hundreds of handpicked Indian destinations or explore offbeat locations across the country",
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Plan Your Dates",
      description:
        "Pick your travel dates and our AI will create the perfect itinerary based on weather and local events",
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Get Your Itinerary",
      description:
        "Receive a detailed day-by-day plan with places to visit, local cuisine, and insider travel tips",
    },
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      location: "Mumbai, Maharashtra",
      text: "Planning our Rajasthan trip was so easy with this platform. The itinerary included hidden gems in Jaipur and Jodhpur that we would have never discovered on our own!",
      rating: 5,
    },
    {
      name: "Arjun Patel",
      location: "Ahmedabad, Gujarat",
      text: "The Kerala backwaters trip was perfectly planned. Every restaurant recommendation was spot-on, and the houseboat experience was unforgettable. Highly recommend!",
      rating: 5,
    },
    {
      name: "Sneha Reddy",
      location: "Hyderabad, Telangana",
      text: "As someone who loves offbeat travel, this tool helped me discover amazing places in Himachal Pradesh. The detailed itinerary with timings made our trip stress-free.",
      rating: 5,
    },
  ];

  const handleSubscribe = () => {
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail("");
        setSubscribed(false);
      }, 3000);
    }
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center space-x-3 group"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 rounded-lg transform group-hover:scale-110 transition-transform"></div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
                Wanderly India
              </span>
            </button>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection("destinations")}
                className="text-slate-700 hover:text-orange-600 transition font-medium"
              >
                Destinations
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-slate-700 hover:text-orange-600 transition font-medium"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection("testimonials")}
                className="text-slate-700 hover:text-orange-600 transition font-medium"
              >
                Reviews
              </button>
              <button
                onClick={() => scrollToSection("itinerary-section")}
                className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-full hover:shadow-lg hover:scale-105 transition-all font-medium"
              >
                Create Itinerary
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200">
              <div className="flex flex-col space-y-4">
                <button
                  onClick={() => scrollToSection("destinations")}
                  className="text-slate-700 hover:text-orange-600 transition font-medium text-left"
                >
                  Destinations
                </button>
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="text-slate-700 hover:text-orange-600 transition font-medium text-left"
                >
                  How It Works
                </button>
                <button
                  onClick={() => scrollToSection("testimonials")}
                  className="text-slate-700 hover:text-orange-600 transition font-medium text-left"
                >
                  Reviews
                </button>
                <button
                  onClick={() => scrollToSection("itinerary-section")}
                  className="w-full px-6 py-2.5 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-full hover:shadow-lg transition font-medium"
                >
                  Create Itinerary
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 overflow-hidden min-h-screen flex items-center">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50"></div>

        {/* Hero Image Placeholder - Add your image here */}
        <div className="absolute inset-0 opacity-0">
          {/* Replace opacity-0 with your desired opacity and add image */}
          {/* <img src="YOUR_IMAGE_URL" alt="Hero background" className="w-full h-full object-cover" /> */}
        </div>

        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-block mb-4">
                <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                  🇮🇳 Explore Incredible India
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
                Plan Your Perfect
                <span className="block bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mt-2">
                  Indian Adventure
                </span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Discover hidden gems across India with AI-powered itineraries.
                From Himalayan peaks to tropical beaches, from ancient temples
                to modern cities - plan it all effortlessly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => navigate("/itinerary")}
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition flex items-center justify-center space-x-2"
                >
                  <span>Start Planning Your Trip</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => scrollToSection("destinations")}
                  className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-full text-lg font-semibold hover:border-orange-300 transition"
                >
                  Explore Destinations
                </motion.button>
              </div>

              <div className="mt-12 flex flex-wrap items-center gap-6">
                <div>
                  <div className="text-3xl font-bold text-slate-900">500+</div>
                  <div className="text-sm text-slate-600">Destinations</div>
                </div>
                <div className="h-12 w-px bg-slate-300"></div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">50K+</div>
                  <div className="text-sm text-slate-600">Happy Travelers</div>
                </div>
                <div className="h-12 w-px bg-slate-300"></div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">4.9★</div>
                  <div className="text-sm text-slate-600">Average Rating</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              {/* Hero Image Placeholder */}
              <div className="relative aspect-[4/5] rounded-3xl shadow-2xl overflow-hidden bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100">
                {/* Add your hero image here */}
                <img
                  src="https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.istockphoto.com%2Fphotos%2Ftaj-mahal-night&psig=AOvVaw0xrUrhjmamDD4YSlVcCTGr&ust=1760452176676000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCJC0isuxoZADFQAAAAAdAAAAABAE"
                  alt="Travel India"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-8">
                    <MapPin className="w-20 h-20 mx-auto mb-4 text-orange-400 opacity-30" />
                    <p className="text-slate-400 text-lg font-medium">
                      Your Hero Image Here
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating cards */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -left-4 bg-white p-4 rounded-2xl shadow-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center text-white text-xl">
                    🕌
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">
                      Taj Mahal
                    </div>
                    <div className="text-xs text-slate-500">Agra, UP</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-4 -right-4 bg-white p-4 rounded-2xl shadow-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center text-white text-xl">
                    🏖️
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">
                      Goa Beaches
                    </div>
                    <div className="text-xs text-slate-500">Goa</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section id="destinations" className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Popular Indian Destinations
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Explore India's most beloved travel destinations, from serene hill
              stations to vibrant coastal towns
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((dest, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl shadow-lg bg-white">
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="text-xs font-semibold text-orange-300 mb-1">
                      {dest.state}
                    </div>
                    <h3 className="text-xl font-bold mb-1">{dest.name}</h3>
                    <p className="text-sm text-white/90 mb-3">
                      {dest.description}
                    </p>
                    <span className="inline-block px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                      {dest.days}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToSection("itinerary-section")}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition"
            >
              Explore All Destinations
            </motion.button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Create your perfect Indian itinerary in three simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connection lines for desktop */}
            <div className="hidden md:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-200 via-pink-200 to-purple-200 -z-10"></div>

            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center relative"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 text-white rounded-2xl mb-6 shadow-lg relative z-10">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-16">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToSection("itinerary-section")}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition inline-flex items-center space-x-2"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Loved by Indian Travelers
            </h2>
            <p className="text-lg text-slate-600">
              See what our community has to say about their journeys
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 hover:shadow-xl transition shadow-md"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-orange-400 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-700 mb-6 leading-relaxed">
                  {testimonial.text}
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {testimonial.location}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section
        id="itinerary-section"
        className="py-20 px-4 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Plan Your Indian Adventure?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Get weekly travel inspiration, destination guides, and exclusive
              Indian travel deals delivered to your inbox
            </p>

            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-8">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-full text-slate-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                onClick={handleSubscribe}
                className="px-8 py-4 bg-white text-pink-600 rounded-full font-semibold hover:bg-slate-100 transition flex items-center justify-center space-x-2 shadow-lg whitespace-nowrap"
              >
                {subscribed ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Subscribed!</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    <span>Subscribe</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-white/80 text-sm mb-6">
              Or start creating your personalized itinerary right now
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 bg-white text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-purple-600 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition border-2 border-white"
            >
              Create My Itinerary Now
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="flex items-center space-x-3 mb-4 group"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 rounded-lg"></div>
                <span className="text-xl font-bold">Wanderly India</span>
              </button>
              <p className="text-slate-400 leading-relaxed">
                Making Indian travel planning effortless and memorable for every
                explorer.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <button className="hover:text-white transition">
                    About Us
                  </button>
                </li>
                <li>
                  <button className="hover:text-white transition">
                    Careers
                  </button>
                </li>
                <li>
                  <button className="hover:text-white transition">
                    Travel Blog
                  </button>
                </li>
                <li>
                  <button className="hover:text-white transition">Press</button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <button className="hover:text-white transition">
                    Contact Us
                  </button>
                </li>
                <li>
                  <button className="hover:text-white transition">
                    Help Center
                  </button>
                </li>
                <li>
                  <button className="hover:text-white transition">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button className="hover:text-white transition">
                    Privacy Policy
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Follow Us</h4>
              <div className="flex space-x-4">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8">
            <p className="text-center text-slate-400">
              © {new Date().getFullYear()} Wanderly India. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
