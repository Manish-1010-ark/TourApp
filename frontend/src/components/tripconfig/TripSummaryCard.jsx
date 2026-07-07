export default function TripSummaryCard({
  source,
  destination,
  distance,
  mode,
  days,
}) {
  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8 mb-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-800">
          ✨ Plan Your Journey
        </h1>

        <p className="text-slate-500 mt-2">
          Review your trip before AI creates the perfect itinerary.
        </p>
      </div>

      <div className="flex flex-col items-center">
        <div className="text-center">
          <div className="text-sm text-gray-500">Source</div>

          <h2 className="text-3xl font-bold">📍 {source}</h2>
        </div>

        <div className="my-6 text-center">
          <div className="text-5xl">↓</div>

          <div className="text-xl mt-2">
            {mode === "train" && "🚆"}
            {mode === "flight" && "✈️"}
            {mode === "car" && "🚗"}
            {mode === "bus" && "🚌"}
          </div>

          <div className="font-semibold capitalize">{mode}</div>
        </div>

        <div className="text-center">
          <div className="text-sm text-gray-500">Destination</div>

          <h2 className="text-3xl font-bold">🏝 {destination}</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 mt-10">
        <div className="bg-blue-50 rounded-xl p-5 text-center">
          <div className="text-3xl">📅</div>

          <div className="text-xl font-bold mt-2">{days} Days</div>
        </div>

        <div className="bg-green-50 rounded-xl p-5 text-center">
          <div className="text-3xl">📏</div>

          <div className="text-xl font-bold mt-2">{distance} km</div>
        </div>
      </div>
    </div>
  );
}
