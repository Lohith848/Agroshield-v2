import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, TrendingDown, MapPin, Search, ArrowRight, Filter } from "lucide-react";
import { motion } from "motion/react";
import axios from "axios";
import { type MarketPrice } from "@/types";

export default function Market() {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [setupInfo, setSetupInfo] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      setLoading(true);
      setError(null);
      setSetupInfo(null);
      try {
        const response = await axios.get("/api/prices", { timeout: 10000 });
        setPrices(response.data.records || []);
      } catch (err: any) {
        if (err.response?.status === 401) {
          setSetupInfo(err.response.data.setupInstructions);
        } else {
          setError("Failed to load market data. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPrices();
  }, []);

  return (
    <div className="px-6 pt-8 pb-12">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Market Rates</h1>
          <p className="text-gray-500 text-sm">Real-time commodity prices from major markets.</p>
        </div>
        <button className="p-2 rounded-xl bg-white border border-gray-100 shadow-sm text-gray-400">
          <Filter size={20} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : setupInfo ? (
        <div className="p-8 text-center bg-blue-50 rounded-3xl border border-blue-100">
          <TrendingUp className="mx-auto text-blue-500 mb-4" size={48} />
          <h3 className="font-bold text-blue-900 mb-2">Setup Required</h3>
          <p className="text-blue-800 text-sm mb-4 leading-relaxed">{setupInfo}</p>
          <div className="text-[10px] text-blue-400 uppercase font-bold tracking-widest">Configuration via AI Studio Secrets</div>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-red-50 rounded-3xl border border-red-100">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prices.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm flex justify-between items-center group cursor-pointer hover:border-green-500/30 active:scale-98 transition-all"
            >
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 font-bold">
                  {item.commodity.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{item.commodity}</h4>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} /> {item.market}, {item.district}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">₹{item.modal_price}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Per Quintal</p>
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <ArrowRight className="text-green-500" size={16} />
              </div>
            </motion.div>
          ))}
          
          {prices.length === 0 && (
            <div className="text-center py-12">
              <BarChart3 className="mx-auto text-gray-200 mb-2" size={48} />
              <p className="text-gray-400 text-sm">No data available for your region yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
