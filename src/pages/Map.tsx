import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { MapPin, Navigation, Info, Search } from "lucide-react";
import { motion } from "motion/react";

// Fix for default marker icons in Leaflet + React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13);
  }, [center]);

  return (
    <Marker position={center}>
      <Popup>
        <div className="text-xs">
          <b>Your Farm Location</b><br/>
          Precision: high
        </div>
      </Popup>
    </Marker>
  );
}

export default function MapPage() {
  const [position, setPosition] = useState<[number, number]>([20.5937, 78.9629]); // Center of India
  const [hasLocation, setHasLocation] = useState(false);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setHasLocation(true);
      });
    }
  }, []);

  return (
    <div className="h-screen flex flex-col pt-8">
      <div className="px-6 mb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Farm Map</h1>
        <p className="text-gray-500 text-sm">Visualize your fields and regional data.</p>
      </div>

      <div className="flex-1 relative">
        <MapContainer 
          center={position} 
          zoom={5} 
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {hasLocation && <LocationMarker center={position} />}
        </MapContainer>

        {/* Floating Controls */}
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
          <button className="w-10 h-10 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center text-gray-600">
            <Search size={20} />
          </button>
          <button className="w-10 h-10 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center text-green-600">
            <Navigation size={20} />
          </button>
        </div>

        {/* Bottom Info Sheet (Mock) */}
        <div className="absolute bottom-28 left-4 right-4 z-[1000]">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20 flex gap-4 items-center"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
               <Info size={20} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-gray-900">Regional Insight</h4>
              <p className="text-[10px] text-gray-500 leading-tight">Nearby water sources and market cooperatives are highlighted on the map.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
