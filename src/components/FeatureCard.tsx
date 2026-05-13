import { type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  color: string;
  className?: string;
}

export function FeatureCard({ title, description, icon: Icon, onClick, color, className }: FeatureCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-start p-6 text-left transition-all bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden group",
        className
      )}
    >
      <div className={cn("p-3 mb-4 rounded-xl", color)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      
      <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
        <Icon size={120} />
      </div>
    </motion.button>
  );
}
