import React from 'react';

export default function AdCard({ title, description, id, category, city, author }: 
  { title: string, description: string, id: string, category: string, city: string, author: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-xl text-gray-900 line-clamp-1">{title}</h3>
        <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-800 rounded">{category}</span>
      </div>
      <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3">{description}</p>
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
        <div className="text-xs text-gray-500">
          <p>By: {author || 'Unknown'}</p>
          <p>{city}</p>
        </div>
        <a href={`/explore/${id}`} className="inline-block text-blue-600 font-medium hover:underline text-sm">View &rarr;</a>
      </div>
    </div>
  );
}
