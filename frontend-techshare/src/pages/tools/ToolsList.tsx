import { useState, useEffect } from "react";
import type { Tool } from "@/interfaces/tools/tool";
import ToolsHeader from "@/components/features/tools/ToolsHeader";
import ToolsFilter from "@/components/features/tools/ToolsFilter";
import ToolsGrid from "@/components/features/tools/ToolsGrid";
import PageContainer from "@/components/layout/PageContainer";
import { mockTools } from "@/pages/tools/mockTools";

export default function ToolsList() {
  const [loading, setLoading] = useState(true);
  const [tools, setTools] = useState<Tool[]>([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(30000);
  const [status, setStatus] = useState("");

  // Initialisation du localStorage avec les mock au premier chargement
  useEffect(() => {
    const stored = localStorage.getItem("tools");
    if (!stored) {
      localStorage.setItem("tools", JSON.stringify(mockTools));
      setTools(mockTools);
    } else {
      setTools(JSON.parse(stored));
    }
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Filtrage des outils
  const filteredTools: Tool[] = tools.filter((tool) => {
    const matchesSearch = tool.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesLocation = location
      ? tool.location.toLowerCase().includes(location.toLowerCase())
      : true;
    const matchesPrice =
      tool.priceValue! >= minPrice && tool.priceValue! <= maxPrice;
    const matchesStatus = status ? tool.status === status : true;
    return matchesSearch && matchesLocation && matchesPrice && matchesStatus;
  });

  const resetFilters = () => {
    setSearch("");
    setLocation("");
    setMinPrice(0);
    setMaxPrice(30000);
    setStatus("");
  };

  return (
    <PageContainer>
      <ToolsHeader />
      <ToolsFilter
        search={search}
        setSearch={setSearch}
        location={location}
        setLocation={setLocation}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        status={status}
        setStatus={setStatus}
        resetFilters={resetFilters}
        resultsCount={filteredTools.length}
      />
      <ToolsGrid loading={loading} tools={filteredTools} />
    </PageContainer>
  );
}
