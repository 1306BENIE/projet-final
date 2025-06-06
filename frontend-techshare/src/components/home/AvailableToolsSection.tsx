import ToolCard from "./ToolCard";
import SkeletonToolCard from "./SkeletonToolCard";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";

export default function AvailableToolsSection() {
  const [loading, setLoading] = useState(true);
  const tools = [
    {
      id: 1,
      name: "MacBook Pro M1",
      brand: "Apple",
      model: "M1 2021",
      title: "MacBook Pro M1",
      description: "Puissant ordinateur portable pour les professionnels.",
      price: "15,000 FCFA",
      priceValue: 15000,
      location: "Abidjan",
      status: "available",
      imageUrl:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80",
      image:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80",
      images: [
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80",
      ],
      etat: "Comme neuf",
    },
    {
      id: 2,
      name: "iPad Pro",
      brand: "Apple",
      model: "Pro 2022",
      title: "iPad Pro",
      description: "Tablette polyvalente pour la créativité.",
      price: "10,000 FCFA",
      priceValue: 10000,
      location: "Abidjan",
      status: "available",
      imageUrl:
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80",
      image:
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80",
      images: [
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80",
      ],
      etat: "Excellent",
    },
    {
      id: 3,
      name: "DJI Mavic Air 2",
      brand: "DJI",
      model: "Mavic Air 2",
      title: "DJI Mavic Air 2",
      description: "Drone compact pour la photographie aérienne.",
      price: "25,000 FCFA",
      priceValue: 25000,
      location: "Abidjan",
      status: "available",
      imageUrl:
        "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&w=400&q=80",
      image:
        "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&w=400&q=80",
      images: [
        "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&w=400&q=80",
      ],
      etat: "Très bon état",
    },
    {
      id: 4,
      name: "Sony Alpha A6400",
      brand: "Sony",
      model: "A6400",
      title: "Sony Alpha A6400",
      description: "Appareil photo hybride pour la photo et la vidéo 4K.",
      price: "20,000 FCFA",
      priceValue: 20000,
      location: "Abidjan",
      status: "available",
      imageUrl:
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80",
      image:
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80",
      images: [
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80",
      ],
      etat: "Bon état",
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
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
            : tools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
        </div>
      </div>
    </section>
  );
}
