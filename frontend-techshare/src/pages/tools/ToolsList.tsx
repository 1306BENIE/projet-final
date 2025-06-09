import { useState, useEffect } from "react";
import type { Tool } from "@/interfaces/tools/tool";
import ToolsHeader from "@/components/features/tools/ToolsHeader";
import ToolsFilter from "@/components/features/tools/ToolsFilter";
import ToolsGrid from "@/components/features/tools/ToolsGrid";
import PageContainer from "@/components/layout/PageContainer";
import { toolService } from "@/services/toolService";
import { toast } from "react-hot-toast";

export default function ToolsList() {
  const [loading, setLoading] = useState(true);
  const [tools, setTools] = useState<Tool[]>([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(30000);
  const [status, setStatus] = useState("");

  // Charger les outils depuis l'API au premier chargement
  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true);
        const data = await toolService.getTools();
        setTools(data);
      } catch (error) {
        toast.error("Erreur lors du chargement des outils");
        setTools([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, []);

  // Filtrage des outils
  const filteredTools: Tool[] = tools.filter((tool) => {
    const matchesSearch = tool.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesLocation = location
      ? tool.address.toLowerCase().includes(location.toLowerCase())
      : true;
    const matchesPrice =
      tool.dailyPrice >= minPrice && tool.dailyPrice <= maxPrice;
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
