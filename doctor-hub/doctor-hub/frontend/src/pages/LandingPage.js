import React from 'react';
import { Link } from 'react-router-dom';

const features = [
  { icon: '🔍', title: 'Find Doctors', desc: 'Search allopathic, homeopathic & herbal specialists by disease or city.' },
  { icon: '📅', title: 'Book Appointments', desc: 'Book a slot and upload payment screenshot for instant confirmation.' },
  { icon: '📋', title: 'Medical History', desc: 'Secure, permanent medical records accessible to you and your doctor.' },
  { icon: '💊', title: 'Prescriptions', desc: 'Digital prescriptions added by doctors — immutable and always accessible.' },
  { icon: '✅', title: 'Payment Verification', desc: 'Assistants verify JazzCash/EasyPaisa payments quickly and transparently.' },
  { icon: '🏥', title: 'Multi-Clinic Doctors', desc: 'Doctors list all their clinics so you can pick the most convenient one.' },
];

const treatmentTypes = [
  { type: 'allopathic', label: 'Allopathic', color: 'from-blue-500 to-cyan-500', desc: 'Modern medicine & evidence-based treatments' },
  { type: 'homeopathic', label: 'Homeopathic', color: 'from-green-500 to-teal-500', desc: 'Natural, holistic healing approach' },
  { type: 'herbal', label: 'Herbal', color: 'from-amber-500 to-orange-500', desc: 'Traditional plant-based remedies' },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-teal-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 text-teal-400 text-sm px-4 py-1.5 rounded-full mb-6">
            🏥 Pakistan's Healthcare Consultation Platform
          </span>
          <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6">
            Find the Right{' '}
            <span className="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
              Doctor
            </span>{' '}
            for You
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Search allopathic, homeopathic, and herbal doctors. Book appointments, manage your medical history, and get digital prescriptions — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/doctors"
              className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-teal-500/20"
            >
              Find a Doctor
            </Link>
            <Link
              to="/register"
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-3.5 rounded-xl border border-slate-600 transition-all"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Treatment Types */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center font-display text-3xl font-bold mb-12">
            Choose Your Treatment Type
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {treatmentTypes.map(t => (
              <Link
                key={t.type}
                to={`/doctors?treatmentType=${t.type}`}
                className="group bg-slate-900 border border-slate-700/50 rounded-2xl p-6 hover:border-teal-500/50 transition-all hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${t.color} mb-4 flex items-center justify-center`}>
                  <span className="text-white text-xl">💊</span>
                </div>
                <h3 className="font-display text-xl font-bold mb-2">{t.label}</h3>
                <p className="text-slate-400 text-sm">{t.desc}</p>
                <span className={`inline-block mt-4 text-sm font-medium bg-gradient-to-r ${t.color} bg-clip-text text-transparent`}>
                  Browse Doctors →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center font-display text-3xl font-bold mb-12">
            Everything You Need
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 hover:border-teal-500/30 transition-all"
              >
                <span className="text-3xl mb-4 block">{f.icon}</span>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <h2 className="font-display text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-slate-400 mb-8">Join thousands of patients managing their health smarter.</p>
        <Link
          to="/register"
          className="bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold px-10 py-4 rounded-xl text-lg hover:from-teal-600 hover:to-blue-700 transition-all shadow-xl shadow-teal-500/20"
        >
          Register for Free
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-4 text-center text-slate-500 text-sm">
        <p>© 2024 Doctor Hub — Healthcare Consultation Platform</p>
        <p className="mt-1">Built with React + Node.js + MongoDB</p>
      </footer>
    </div>
  );
};

export default LandingPage;
