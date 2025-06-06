import AddTool from "@/components/features/tools/AddTool";
import { useAddTool } from "@/hooks/useAddTool";

export default function AddToolPage() {
  const { addTool, loading, error } = useAddTool();

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Ajouter un nouvel outil
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Remplissez le formulaire ci-dessous pour ajouter un nouvel outil à
            la plateforme.
          </p>
        </div>
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        <AddTool onSubmit={addTool} loading={loading} />
      </div>
    </div>
  );
}
