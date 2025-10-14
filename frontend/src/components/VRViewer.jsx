// src/components/VRViewer.jsx

import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer";
import { X } from "lucide-react";
import photoSrc from "../assets/taj-mahal-360.jpg"; // Import your local 360° PHOTO

const VRViewer = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="relative w-[95vw] h-[90vh] bg-black rounded-lg">
        {/* The container for the viewer must have a defined size */}
        <ReactPhotoSphereViewer
          src={photoSrc} // Use the imported photo
          height={"100%"}
          width={"100%"}
          container={""} // The component will take the size of its parent
          navbar={[
            // Customize the navigation bar
            "zoom",
            "fullscreen",
            "caption",
          ]}
        />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/40 rounded-full text-white hover:bg-black/60 transition"
          aria-label="Close VR view"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default VRViewer;
