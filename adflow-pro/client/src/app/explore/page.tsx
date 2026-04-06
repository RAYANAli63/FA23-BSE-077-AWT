'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import AdCard from '@/components/AdCard';

export default function ExploreAds() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const { data } = await api.get('/ads');
        setAds(data);
      } catch (err) {
        console.error('Error fetching ads', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  return (
    <div className="container mx-auto px-4 py-10 min-h-[80vh]">
      <h1 className="text-3xl font-bold mb-8">Explore Submitted Ads</h1>
      {loading ? (
        <p>Loading ads...</p>
      ) : ads.length === 0 ? (
        <p className="text-gray-500">No published ads found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad: any) => (
            <AdCard 
              key={ad._id} 
              id={ad._id} 
              title={ad.title} 
              description={ad.description} 
              category={ad.category}
              city={ad.city}
              author={ad.user?.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}
