import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getDoctors } from '../services/api';
import toast from 'react-hot-toast';

const DoctorCard = ({ doctor }) => {
  const treatmentColor = {
    allopathic: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    homeopathic: 'bg-green-500/20 text-green-300 border-green-500/30',
    herbal: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  };

  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 hover:border-teal-500/40 transition-all hover:-translate-y-0.5 group">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {doctor.user?.name?.charAt(0) || 'D'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-base">{doctor.user?.name}</h3>
          <p className="text-teal-400 text-sm">{doctor.specialization}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${treatmentColor[doctor.treatmentType]}`}>
              {doctor.treatmentType}
            </span>
            <span className="text-slate-400 text-xs">{doctor.experience} yrs exp</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="flex items-center gap-1 justify-end">
            <span className="text-amber-400 text-sm">★</span>
            <span className="text-white text-sm font-medium">{doctor.rating?.toFixed(1)}</span>
          </div>
          <p className="text-slate-400 text-xs mt-0.5">{doctor.totalReviews} reviews</p>
        </div>
      </div>

      {/* Diseases */}
      {doctor.diseases?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {doctor.diseases.slice(0, 4).map((d, i) => (
            <span key={i} className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-lg">
              {d}
            </span>
          ))}
          {doctor.diseases.length > 4 && (
            <span className="text-xs text-slate-500">+{doctor.diseases.length - 4} more</span>
          )}
        </div>
      )}

      {/* Clinic */}
      {doctor.clinics?.[0] && (
        <div className="mt-4 flex items-center gap-2 text-slate-400 text-xs">
          <span>📍</span>
          <span>{doctor.clinics[0].city} — Rs. {doctor.clinics[0].fee?.toLocaleString()}</span>
        </div>
      )}

      <div className="mt-5 flex gap-3">
        <Link
          to={`/doctors/${doctor._id}`}
          className="flex-1 text-center bg-slate-800 hover:bg-slate-700 text-white text-sm py-2.5 rounded-xl transition-colors border border-slate-600"
        >
          View Profile
        </Link>
        <Link
          to={`/book/${doctor._id}`}
          className="flex-1 text-center bg-teal-500 hover:bg-teal-600 text-white text-sm py-2.5 rounded-xl transition-colors font-medium"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
};

const DoctorsPage = () => {
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    treatmentType: searchParams.get('treatmentType') || '',
    disease: '',
    city: '',
    search: '',
    page: 1,
  });

  useEffect(() => {
    fetchDoctors();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.treatmentType) params.treatmentType = filters.treatmentType;
      if (filters.disease) params.disease = filters.disease;
      if (filters.city) params.city = filters.city;
      if (filters.search) params.search = filters.search;
      params.page = filters.page;
      params.limit = 9;

      const { data } = await getDoctors(params);
      setDoctors(data.doctors);
      setPagination({ totalPages: data.totalPages, currentPage: data.currentPage, total: data.total });
    } catch {
      toast.error('Failed to load doctors.');
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value, page: 1 }));

  return (
    <div className="min-h-screen bg-slate-950 text-white py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold">Find a Doctor</h1>
          <p className="text-slate-400 mt-2">Search from verified allopathic, homeopathic & herbal specialists</p>
        </div>

        {/* Filters */}
        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by name or specialization..."
              value={filters.search}
              onChange={e => updateFilter('search', e.target.value)}
              className="bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 placeholder-slate-500"
            />
            <select
              value={filters.treatmentType}
              onChange={e => updateFilter('treatmentType', e.target.value)}
              className="bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
            >
              <option value="">All Treatment Types</option>
              <option value="allopathic">Allopathic</option>
              <option value="homeopathic">Homeopathic</option>
              <option value="herbal">Herbal</option>
            </select>
            <input
              type="text"
              placeholder="Filter by disease..."
              value={filters.disease}
              onChange={e => updateFilter('disease', e.target.value)}
              className="bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 placeholder-slate-500"
            />
            <input
              type="text"
              placeholder="Filter by city..."
              value={filters.city}
              onChange={e => updateFilter('city', e.target.value)}
              className="bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 placeholder-slate-500"
            />
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-slate-400 text-sm mb-5">
            Showing {doctors.length} of {pagination.total || 0} doctors
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 animate-pulse h-56" />
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-slate-400 text-lg">No doctors found with those filters.</p>
            <button onClick={() => setFilters({ treatmentType: '', disease: '', city: '', search: '', page: 1 })}
              className="mt-4 text-teal-400 hover:text-teal-300 text-sm">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map(doc => <DoctorCard key={doc._id} doctor={doc} />)}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setFilters(prev => ({ ...prev, page: i + 1 }))}
                className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                  pagination.currentPage === i + 1
                    ? 'bg-teal-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorsPage;
