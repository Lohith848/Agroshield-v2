import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "react-router-dom";

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans selection:bg-green-100">
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="container max-w-lg mx-auto"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <BottomNav />
    </div>
  );
}
