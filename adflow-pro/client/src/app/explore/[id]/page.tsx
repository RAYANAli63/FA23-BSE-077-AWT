export default function AdDetail({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">Ad Campaign Details: {params.id}</h1>
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        <p className="text-gray-600 text-lg mb-6">Detailed information about the ad will be displayed here, fetched from the backend API.</p>
        <div className="flex gap-4">
          <button className="bg-green-600 text-white px-4 py-2 rounded font-medium">Approve</button>
          <button className="bg-red-600 text-white px-4 py-2 rounded font-medium">Reject</button>
        </div>
      </div>
    </div>
  );
}
