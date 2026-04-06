'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Notification from '@/components/Notification';

const packages = ['Basic', 'Standard', 'Premium'];

export default function CreateAdPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [pkg, setPkg] = useState(packages[0]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, citiesRes] = await Promise.all([
          api.get('/ads/categories'),
          api.get('/ads/cities')
        ]);
        setCategories(categoriesRes.data);
        setCities(citiesRes.data);
        if (categoriesRes.data.length > 0) setCategory(categoriesRes.data[0].name);
        if (citiesRes.data.length > 0) setCity(citiesRes.data[0].name);
      } catch (err) {
        console.error('Failed to load categories/cities:', err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await api.post('/ads', {
        title,
        description,
        category,
        city,
        package: pkg,
      });

      setSuccess('Ad created successfully.');
      setTimeout(() => router.push('/dashboard'), 1200);
    } catch (err: any) {
      const errorDetails = err.response?.data?.details || err.response?.data?.error || '';
      const errorMsg = err.response?.data?.message || 'Could not create ad';
      setError(errorDetails ? `${errorMsg}: ${errorDetails}` : errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center py-16 px-4">
      <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
        <h1 className="text-3xl font-bold mb-6">Create a New Ad</h1>
        {success && <Notification message={success} type="success" />}
        {error && <Notification message={error} type="error" />}

        {loadingData ? (
          <div className="text-center py-8">Loading categories and cities...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="e.g. Sell my mountain bike"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              className="w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="Write a clear description for your ad..."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none"
              >
                {categories.map((item) => (
                  <option key={item.id} value={item.name}>{item.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none"
              >
                {cities.map((item) => (
                  <option key={item.id} value={item.name}>{item.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Package</label>
            <select
              value={pkg}
              onChange={(e) => setPkg(e.target.value)}
              className="w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none"
            >
              {packages.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center rounded bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating Ad...' : 'Create Ad'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="inline-flex justify-center rounded border border-gray-300 bg-white px-6 py-3 text-gray-700 hover:bg-gray-50"
            >
              Back to Dashboard
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
