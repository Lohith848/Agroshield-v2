import { useState, useEffect } from "react";
import { CloudSun, Droplets, Wind, Thermometer, MapPin, Search, AlertTriangle } from "lucide-react";
import { motion } from "motion/react";
import axios from "axios";
import { type WeatherData } from "@/types";

export default function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

   const fetchWeather = async (lat?: number, lon?: number) => {
     setLoading(true);
     setError(null);
     try {
       // Default to Delhi if no coordinates
       const response = await axios.get(`/api/weather`, {
         params: { lat: lat || 28.6139, lon: lon || 77.2090 },
         timeout: 10000
       });
       setWeather(response.data);
     } catch (err: any) {
       console.error("Weather fetch error:", err);
       setError(err.response?.data?.error || "Could not fetch weather. Check your connection.");
     } finally {
       setLoading(false);
     }
   };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather() // Fallback to default
      );
    } else {
      fetchWeather();
    }
  }, []);

  return (
    <div className="px-6 pt-8 pb-12">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Weather</h1>
          <p className="text-gray-500 text-sm flex items-center gap-1">
            <MapPin size={14} className="text-green-600" />
            {weather ? `${weather.name}, India` : "Detecting location..."}
          </p>
        </div>
        <button className="p-2 rounded-xl bg-white border border-gray-100 shadow-sm text-gray-400">
          <Search size={20} />
        </button>
      </div>

      {error ? (
        <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl text-center">
          <AlertTriangle className="mx-auto text-amber-500 mb-3" size={32} />
          <p className="text-amber-800 text-sm">{error}</p>
          <button 
            onClick={() => fetchWeather()}
            className="mt-4 px-4 py-2 bg-white border border-amber-200 text-amber-800 rounded-xl text-xs font-semibold"
          >
            Retry Fetching
          </button>
        </div>
      ) : loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-64 bg-gray-100 rounded-3xl" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-28 bg-gray-100 rounded-2xl" />
            <div className="h-28 bg-gray-100 rounded-2xl" />
          </div>
        </div>
      ) : weather && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Main Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/20">
            <div className="relative z-10 flex flex-col items-center">
              <img 
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`} 
                alt="weather"
                className="w-32 h-32 -mt-4 -mb-4"
              />
              <div className="text-center mt-2">
                <span className="text-7xl font-bold tracking-tighter">{Math.round(weather.main.temp)}°</span>
                <p className="text-blue-100 text-lg capitalize font-medium mt-1">{weather.weather[0].description}</p>
              </div>
            </div>
            {/* Background elements */}
            <div className="absolute top-[-10%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-[-20%] left-[-10%] w-56 h-56 bg-white/5 rounded-full blur-3xl" />
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                <Droplets size={18} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Humidity</p>
                <p className="text-lg font-bold text-gray-900">{weather.main.humidity}%</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="p-2 bg-orange-50 text-orange-500 rounded-lg">
                <Thermometer size={18} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Feels Like</p>
                <p className="text-lg font-bold text-gray-900">{Math.round(weather.main.feels_like)}°</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg">
                <Wind size={18} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Wind Speed</p>
                <p className="text-lg font-bold text-gray-900">{weather.wind.speed} m/s</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="p-2 bg-green-50 text-green-500 rounded-lg">
                <CloudSun size={18} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Condition</p>
                <p className="text-lg font-bold text-gray-900 shrink-0 capitalize">{weather.weather[0].main}</p>
              </div>
            </div>
          </div>

          {/* Farming Tip */}
          <div className="p-5 bg-white border border-gray-100 rounded-3xl">
             <h4 className="text-sm font-bold text-gray-900 mb-2">Farmer's Tip</h4>
             <p className="text-sm text-gray-500 leading-relaxed">
               {weather.main.humidity > 80 ? "High humidity may lead to fungal growth in pulse crops. Inspect leaves regularly." : "Ideal conditions for open field irrigation today."}
             </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
