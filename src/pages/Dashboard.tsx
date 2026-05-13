import { useState, useEffect } from "react";
import { FeatureCard } from "@/components/FeatureCard";
import { Camera, CloudSun, BarChart3, Newspaper, Map as MapIcon, User, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { motion } from "motion/react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Farmer");
  const today = format(new Date(), "EEEE, MMMM do");

  return (
    <div className="px-6 pt-8 pb-12">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <p className="text-sm font-medium text-green-600 mb-1">{today}</p>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            Namaste, {userName}
          </h1>
        </div>
        <button 
          onClick={() => navigate("/profile")}
          className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm hover:bg-gray-50 transition-colors"
        >
          <User className="w-5 h-5 text-gray-600" />
        </button>
      </header>

      {/* Quick Search */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search for crops, markets, or diseases..."
          className="w-full h-14 pl-12 pr-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm"
        />
      </div>

      {/* Primary Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <FeatureCard 
          title="Plant Scanner"
          description="Detect diseases and pests using AI camera technology"
          icon={Camera}
          color="bg-green-600"
          onClick={() => navigate("/scan")}
          className="sm:col-span-2 h-44"
        />
        <FeatureCard 
          title="Weather"
          description="Local forecast and warnings"
          icon={CloudSun}
          color="bg-blue-500"
          onClick={() => navigate("/weather")}
        />
        <FeatureCard 
          title="Market"
          description="Daily commodity prices"
          icon={BarChart3}
          color="bg-amber-500"
          onClick={() => navigate("/market")}
        />
        <FeatureCard 
          title="Field Map"
          description="Map your farm and resources"
          icon={MapIcon}
          color="bg-indigo-500"
          onClick={() => navigate("/map")}
        />
        <FeatureCard 
          title="Agri News"
          description="Latest updates from agriculture"
          icon={Newspaper}
          color="bg-rose-500"
          onClick={() => navigate("/news")}
        />
      </div>

      {/* Stats/Updates Section */}
      <section className="bg-green-50 border border-green-100 rounded-2xl p-5">
        <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Market Insight
        </h4>
        <p className="text-sm text-green-700 leading-relaxed">
          Tomato prices in your local market surged by 15% today. Consider harvesting soon for maximum profit.
        </p>
      </section>
    </div>
  );
}
