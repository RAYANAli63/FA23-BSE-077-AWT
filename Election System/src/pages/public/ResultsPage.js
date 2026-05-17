import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const COLORS = ['#4f8ef7', '#7c3aed', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a78bfa', '#86efac'];

export default function ResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState({ totalVotes: 0, totalVoters: 0, turnout: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
    const ch = supabase.channel(`results-${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'candidates', filter: `election_id=eq.${id}` }, loadResults)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [id]);

  async function loadResults() {
    const [{ data: el }, { data: cands }, { count: voted }] = await Promise.all([
      supabase.from('elections').select('*').eq('id', id).single(),
      supabase.from('candidates').select('*').eq('election_id', id).order('vote_count', { ascending: false }),
      supabase.from('voter_registrations').select('*', { count: 'exact', head: true }).eq('election_id', id).eq('status', 'voted')
    ]);
    setElection(el);
    const cList = cands || [];
    setCandidates(cList);
    const totalVotes = cList.reduce((s, c) => s + (c.vote_count || 0), 0);
    const totalVoters = el?.max_voters || 1;
    setStats({ totalVotes, totalVoters, turnout: Math.round((voted || 0) / totalVoters * 100) });
    setLoading(false);
  }

  async function downloadPDF() {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(election.title + ' - Election Results', 14, 20);
    doc.setFontSize(11);
    doc.text(`Total Votes: ${stats.totalVotes} | Turnout: ${stats.turnout}% | Date: ${new Date().toLocaleDateString()}`, 14, 30);
    autoTable(doc, {
      startY: 40,
      head: [['Rank', 'Candidate', 'Designation', 'Votes', '% Share']],
      body: candidates.map((c, i) => [
        i + 1, c.name, c.designation || '—', c.vote_count || 0,
        stats.totalVotes > 0 ? Math.round((c.vote_count / stats.totalVotes) * 100) + '%' : '0%'
      ]),
      styles: { fontSize: 11 },
      headStyles: { fillColor: [79, 142, 247] }
    });
    doc.save(`${election.title}-results.pdf`);
  }

  if (loading) return <LoadingSpinner fullPage />;
  if (!election) return <div className="container page"><div className="alert alert-danger">Not found.</div></div>;

  const winner = candidates[0];

  const barData = {
    labels: candidates.map(c => c.name),
    datasets: [{
      label: 'Votes', data: candidates.map(c => c.vote_count || 0),
      backgroundColor: candidates.map((_, i) => COLORS[i % COLORS.length] + 'cc'),
      borderColor: candidates.map((_, i) => COLORS[i % COLORS.length]),
      borderWidth: 2, borderRadius: 6,
    }]
  };
  const doughnutData = {
    labels: candidates.map(c => c.name),
    datasets: [{ data: candidates.map(c => c.vote_count || 0), backgroundColor: candidates.map((_, i) => COLORS[i % COLORS.length] + 'cc'), borderColor: candidates.map((_, i) => COLORS[i % COLORS.length]), borderWidth: 2 }]
  };
  const chartOpts = {
    responsive: true,
    plugins: {
      legend: { labels: { color: 'var(--text)', font: { family: 'Inter' } } },
      tooltip: { backgroundColor: 'var(--bg2)', titleColor: 'var(--text)', bodyColor: 'var(--text2)', borderColor: 'var(--border)', borderWidth: 1 }
    },
    scales: {
      x: { ticks: { color: 'var(--text2)' }, grid: { color: 'var(--border)' } },
      y: { ticks: { color: 'var(--text2)' }, grid: { color: 'var(--border)' }, beginAtZero: true }
    }
  };

  return (
    <div className="container page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm" style={{ marginBottom: '8px' }}>← Back</button>
          <h1 style={{ fontSize: '26px', fontWeight: 700 }}>Election Results</h1>
          <p style={{ color: 'var(--text2)', marginTop: '4px' }}>{election.title}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {election.status === 'active' && <span className="badge badge-active"><span className="live-dot" style={{ marginRight: '4px' }} />Live Results</span>}
          {election.status === 'completed' && <span className="badge badge-completed">Final Results</span>}
          <button onClick={downloadPDF} className="btn btn-outline btn-sm">📥 Download PDF</button>
        </div>
      </div>

      {/* Winner Banner */}
      {election.status === 'completed' && winner && winner.vote_count > 0 && (
        <div className="card fade-in" style={{ background: 'linear-gradient(135deg,rgba(79,142,247,0.1),rgba(124,58,237,0.1))', borderColor: 'rgba(79,142,247,0.3)', marginBottom: '24px', textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏆</div>
          <h2 style={{ fontSize: '26px', marginBottom: '6px' }}>Winner: {winner.name}</h2>
          {winner.designation && <p style={{ color: 'var(--accent)', marginBottom: '8px' }}>{winner.designation}</p>}
          <p style={{ color: 'var(--text2)' }}>{winner.vote_count} votes • {stats.totalVotes > 0 ? Math.round(winner.vote_count / stats.totalVotes * 100) : 0}% of total</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        {[
          { label: 'Total Votes', value: stats.totalVotes, color: 'var(--accent)' },
          { label: 'Voter Turnout', value: stats.turnout + '%', color: 'var(--success)' },
          { label: 'Candidates', value: candidates.length, color: 'var(--accent2)' },
          { label: 'Max Voters', value: stats.totalVoters, color: 'var(--warning)' }
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom: '32px' }}>
        <div className="card"><h3 style={{ marginBottom: '20px' }}>Votes by Candidate</h3><Bar data={barData} options={chartOpts} /></div>
        <div className="card"><h3 style={{ marginBottom: '20px' }}>Vote Distribution</h3><Doughnut data={doughnutData} options={{ ...chartOpts, scales: undefined }} /></div>
      </div>

      {/* Ranking Table */}
      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>Candidate Rankings</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Rank</th><th>Candidate</th><th>Votes</th><th>% Share</th><th>Progress</th></tr></thead>
            <tbody>
              {candidates.map((c, i) => {
                const share = stats.totalVotes > 0 ? Math.round(c.vote_count / stats.totalVotes * 100) : 0;
                return (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 700, color: i === 0 ? 'var(--warning)' : 'var(--text2)' }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{c.name}</div>
                      {c.designation && <div style={{ fontSize: '12px', color: 'var(--text2)' }}>{c.designation}</div>}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{c.vote_count || 0}</td>
                    <td>{share}%</td>
                    <td style={{ minWidth: '120px' }}>
                      <div className="progress"><div className="progress-bar" style={{ width: `${share}%`, background: COLORS[i % COLORS.length] }} /></div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
