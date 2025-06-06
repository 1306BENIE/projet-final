import { ConnectionTest } from "../components/test/ConnectionTest";

export const TestPage = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Page de test</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <ConnectionTest />
      </div>
    </div>
  );
};
