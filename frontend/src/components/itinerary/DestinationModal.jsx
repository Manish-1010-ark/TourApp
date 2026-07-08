export default function DestinationModal({ destination, onClose }) {
  if (!destination) return null;

  const {
    name,
    description,
    coordinates,
    photos = [],
    mapillary_url,
  } = destination;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-3xl font-bold">{name}</h2>

          <button onClick={onClose} className="text-3xl hover:text-red-500">
            ×
          </button>
        </div>

        {/* Photos */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-6">
            {photos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={name}
                className="rounded-xl object-cover h-48 w-full"
              />
            ))}
          </div>
        )}

        {/* Description */}
        <div className="px-6">
          <h3 className="font-bold text-xl mb-2">About this destination</h3>

          <p className="text-gray-700 leading-7">{description}</p>
        </div>

        {/* Coordinates */}
        {coordinates && (
          <div className="px-6 mt-6">
            <h3 className="font-bold mb-2">Coordinates</h3>

            <p>Latitude : {coordinates.latitude}</p>

            <p>Longitude : {coordinates.longitude}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4 p-6">
          {mapillary_url && (
            <a
              href={mapillary_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-5 py-3 rounded-lg"
            >
              🌍 Open 360° View
            </a>
          )}

          {coordinates && (
            <a
              href={`https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 text-white px-5 py-3 rounded-lg"
            >
              📍 Open in Google Maps
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
