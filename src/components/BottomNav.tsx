import { NavLink } from "react-router-dom";
import { Home, Camera, CloudSun, BarChart3, Newspaper, Map } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Camera, label: "Scan", path: "/scan" },
  { icon: CloudSun, label: "Weather", path: "/weather" },
  { icon: BarChart3, label: "Market", path: "/market" },
  { icon: Newspaper, label: "News", path: "/news" },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-3 bg-white/80 backdrop-blur-xl border-t border-gray-100 flex justify-between items-center safe-area-bottom">
      {NAV_ITEMS.map(({ icon: Icon, label, path }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 min-w-[64px] transition-all",
              isActive ? "text-green-600 scale-110" : "text-gray-400 hover:text-gray-600"
            )
          }
        >
          <Icon className="w-6 h-6" />
          <span className="text-[10px] font-medium font-sans">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
