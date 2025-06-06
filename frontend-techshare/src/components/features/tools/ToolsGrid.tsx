import ToolCard from "@/components/home/ToolCard";
import SkeletonToolCard from "@/components/home/SkeletonToolCard";
import type { ToolsGridProps } from "@/interfaces/tools/tools";

export default function ToolsGrid({ loading, tools }: ToolsGridProps) {
  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 box-border">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 xl:gap-10 box-border">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-full">
              <SkeletonToolCard />
            </div>
          ))
        ) : tools.length > 0 ? (
          tools.map((tool, i) => (
            <div key={tool.id} className="h-full">
              <ToolCard tool={tool} index={i} />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-white/80 py-16 text-lg font-semibold">
            Aucun outil ne correspond à votre recherche.
          </div>
        )}
      </div>
    </div>
  );
}
