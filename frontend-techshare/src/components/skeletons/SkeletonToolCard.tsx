export default function SkeletonToolCard() {
  return (
    <div className="animate-pulse bg-gradient-to-br from-white to-gray-100 rounded-2xl p-6 shadow-lg flex flex-col items-center border border-gray-100/60 min-h-[320px]">
      <div className="w-24 h-24 bg-gray-200 rounded-xl mb-6 shimmer" />
      <div className="w-32 h-5 bg-gray-200 rounded mb-3 shimmer" />
      <div className="w-20 h-4 bg-gray-100 rounded mb-2 shimmer" />
      <div className="w-28 h-4 bg-gray-100 rounded mb-4 shimmer" />
      <div className="w-full h-10 bg-gray-200 rounded-xl shimmer" />
    </div>
  );
}
