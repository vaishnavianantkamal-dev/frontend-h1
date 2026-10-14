export default function ProfileSkeleton() {
  return (
    <div className="space-y-4 pb-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full" />
              <div className="space-y-2">
                <div className="h-4 w-40 bg-gray-200 rounded" />
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-4 w-20 bg-gray-200 rounded-full" />
                  <div className="h-4 w-24 bg-gray-200 rounded-full" />
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
            <div className="h-9 w-20 bg-gray-200 rounded-md" />
          </div>
        </div>
        <div className="bg-[#3d8bff] rounded-lg shadow-sm p-5 text-white flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 bg-white/30 rounded" />
            <div className="h-5 w-5 bg-white/30 rounded-full" />
          </div>
          <div className="mt-2">
            <div className="h-7 w-24 bg-white/50 rounded" />
          </div>
          <div className="mt-2 h-3 w-40 bg-white/20 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
          <div className="space-y-3">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-48 bg-gray-200 rounded" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-40 bg-gray-200 rounded" />
              </div>
              <div>
                <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-40 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-6 w-16 bg-gray-200 rounded" />
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-6 w-16 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div className="h-4 w-40 bg-gray-200 rounded mb-4" />
        <div className="space-y-4">
          <div>
            <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
            <div className="flex flex-wrap gap-2">
              <div className="h-6 w-24 bg-gray-200 rounded-full" />
              <div className="h-6 w-20 bg-gray-200 rounded-full" />
              <div className="h-6 w-16 bg-gray-200 rounded-full" />
              <div className="h-6 w-24 bg-gray-200 rounded-full" />
            </div>
          </div>
          <div>
            <div className="h-3 w-36 bg-gray-200 rounded mb-2" />
            <div className="flex flex-wrap gap-2">
              <div className="h-6 w-20 bg-gray-200 rounded-full" />
              <div className="h-6 w-28 bg-gray-200 rounded-full" />
              <div className="h-6 w-16 bg-gray-200 rounded-full" />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div className="h-4 w-28 bg-gray-200 rounded mb-4" />
        <div className="space-y-4">
          <div>
            <div className="h-3 w-28 bg-gray-200 rounded mb-2" />
            <div className="flex flex-wrap gap-2">
              <div className="h-6 w-28 bg-gray-200 rounded-lg" />
              <div className="h-6 w-24 bg-gray-200 rounded-lg" />
              <div className="h-6 w-20 bg-gray-200 rounded-lg" />
            </div>
          </div>
          <div>
            <div className="h-3 w-40 bg-gray-200 rounded mb-2" />
            <div className="grid grid-cols-7 gap-1">
              {[...Array(35)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-48 bg-gray-200 rounded" />
            <div className="flex gap-2">
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-3 w-40 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-48 bg-gray-200 rounded" />
            <div className="flex gap-2">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
