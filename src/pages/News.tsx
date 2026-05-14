import { useState, useEffect } from "react";
import { Newspaper, ExternalLink, Calendar, Share2, Bookmark, AlertTriangle } from "lucide-react";
import { motion } from "motion/react";
import axios from "axios";
import { type NewsArticle } from "@/types";
import { format } from "date-fns";

export default function News() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [setupInfo, setSetupInfo] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      setSetupInfo(null);
      try {
        const response = await axios.get("/api/news", { timeout: 10000 });
        setNews(response.data.articles || []);
      } catch (err: any) {
        console.error("News fetch error:", err);
        if (err.response?.status === 401) {
          setSetupInfo(err.response.data.setupInstructions);
        } else {
          setError(err.response?.data?.error || "Failed to load news. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="px-6 pt-8 pb-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Agri News</h1>
        <p className="text-gray-500 text-sm">Stay updated with the latest in farming and policy.</p>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-3">
              <div className="h-48 bg-gray-100 rounded-3xl animate-pulse" />
              <div className="h-6 bg-gray-100 rounded-lg w-3/4" />
              <div className="h-4 bg-gray-100 rounded-lg w-1/2" />
            </div>
          ))}
        </div>
       ) : setupInfo ? (
         <div className="p-8 text-center bg-gray-50 rounded-3xl border border-gray-100 border-dashed">
           <Newspaper className="mx-auto text-gray-300 mb-4" size={48} />
           <h3 className="font-bold text-gray-900 mb-2">Setup News</h3>
           <p className="text-gray-500 text-sm mb-4 leading-relaxed">{setupInfo}</p>
         </div>
       ) : error ? (
         <div className="p-6 bg-red-50 border border-red-100 rounded-3xl text-center">
           <AlertTriangle className="mx-auto text-red-500 mb-3" size={32} />
           <p className="text-red-800 text-sm">{error}</p>
           <button
             onClick={() => window.location.reload()}
             className="mt-4 px-4 py-2 bg-white border border-red-200 text-red-800 rounded-xl text-xs font-semibold"
           >
             Retry
           </button>
         </div>
       ) : (
        <div className="space-y-8">
          {news.map((item, idx) => (
            <motion.article 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group"
            >
              <div className="relative aspect-[16/9] rounded-3xl overflow-hidden mb-4 bg-gray-100">
                <img 
                  src={item.urlToImage || "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=800"} 
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-wider text-green-600 shadow-sm">
                  {item.source.name}
                </div>
              </div>
              
              <div className="flex justify-between items-start gap-4 mb-2">
                <h3 className="font-bold text-gray-900 leading-snug text-lg group-hover:text-green-600 transition-colors">
                  {item.title}
                </h3>
              </div>
              
              <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                {item.description}
              </p>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Calendar size={12} />
                  {format(new Date(item.publishedAt), "MMM dd, yyyy")}
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                    <Bookmark size={18} />
                  </button>
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm font-bold text-green-600"
                  >
                    Read Full <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
          
          {news.length === 0 && (
            <div className="text-center py-12">
              <Newspaper className="mx-auto text-gray-200 mb-2" size={48} />
              <p className="text-gray-400 text-sm">No recent news found. Check back later.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
