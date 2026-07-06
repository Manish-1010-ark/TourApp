import { useParams } from "react-router-dom";
import { indianStatesData } from "../data/indianStates";

export default function DestinationPage() {
  const { slug } = useParams();

  const state = indianStatesData[slug];

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center text-3xl">
        State not found
      </div>
    );
  }

  return (
    <div>

      {/* Hero Section */}

      <div
        className="h-[60vh] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: `url(${state.heroImage})`,
        }}
      >
        <h1 className="text-6xl font-bold text-white">
          {state.title}
        </h1>
      </div>

      {/* Description */}

      <div className="max-w-6xl mx-auto py-16 px-6">

        <h2 className="text-4xl font-bold mb-6">
          Explore {state.title}
        </h2>

        <p className="text-lg text-gray-600">
          {state.description}
        </p>

      </div>

    </div>
  );
}