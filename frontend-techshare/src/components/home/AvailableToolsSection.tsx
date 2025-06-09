import ToolCard from "./ToolCard";
import SkeletonToolCard from "./SkeletonToolCard";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { toolService } from "@/services/toolService";
import type { Tool } from "@/interfaces/tools/tool";

export default function AvailableToolsSection() {
  const [loading, setLoading] = useState(true);
  const [tools, setTools] = useState<Tool[]>([]);

  useEffect(() => {
    const loadTools = async () => {
      try {
        const data = await toolService.getTools();
        setTools(data);
      } catch (error) {
        console.error("Erreur lors du chargement des outils:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTools();
  }, []);

  return (
    <section
      id="tools"
      className="py-24 px-2 sm:px-4 bg-gradient-to-b from-white to-[#f7fafd]"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between md:gap-0 mb-12">
          <div>
            <h2 className="text-4xl font-['Poppins'] font-bold text-primary mb-2">
              Outils disponibles
            </h2>
            <p className="text-gray-600">
              Découvrez notre sélection d'équipements tech de qualité
            </p>
          </div>
          <Link
            to="/tools"
            className="text-cyan-500 font-semibold hover:text-cyan-600 transition-colors flex items-center gap-2 group"
          >
            Voir tout
            <Search className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <SkeletonToolCard key={i} />
              ))
            : tools
                .slice(0, 4)
                .map((tool) => <ToolCard key={tool.id} tool={tool} />)}
        </div>
      </div>
    </section>
  );
}
