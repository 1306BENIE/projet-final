import { motion } from "framer-motion";
import { Star, MapPin, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import type { Tool } from "@/interfaces/tools/tool";

interface ToolCardProps {
  tool: Tool;
  index?: number;
}

export default function ToolCard({ tool, index = 0 }: ToolCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        type: "spring",
        bounce: 0.2,
      }}
    >
      <Link
        to={`/tools/${tool.id}`}
        className="block h-full bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-white/60 group"
      >
        <div className="relative">
          <img
            src={
              tool.images && tool.images.length > 0
                ? tool.images[0]
                : "/placeholder.png"
            }
            alt={tool.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-cyan-600 transition-colors">
              {tool.name}
            </h3>
            {typeof tool.rating === "number" && (
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-4 h-4 fill-yellow-400" />
                <span className="text-sm font-medium">
                  {tool.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
          <p className="mt-1 text-gray-600 text-sm line-clamp-2">
            {tool.description}
          </p>
          <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {tool.address}
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {tool.dailyPrice}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {tool.owner
                ? `${tool.owner.firstName} ${tool.owner.lastName}`
                : ""}
            </span>
            {tool.isInsured && (
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                Assuré
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
