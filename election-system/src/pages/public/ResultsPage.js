import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

export default function ResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [voterCount, setVoterCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: el }, { data: cands }, { count: vc }] = await Promise.all([
        supabase.from('elections').select('*').eq('id', id).single(),
        supabase.from('candidates').select('*').eq('election_id', id).order('vote_count', { ascending: false }),
        supabase.from('voter_registrations').select('*', { count:'exact', head:true })
          .eq('election_id', id).eq('status', 'voted')
      ]);
      setElection(el);
      setCandidates(cands || []);
      setVoterCount(vc || 0);
      setTotalVotes((cands || []).reduce((s, c) => s + (c.vote_count || 0), 0));
      setLoading(false);
    }
    load();

    // Live subscription for active elections
    const channel = supabase.channel(`results-${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'candidates', filter: `election_id=eq.${id}` },
        payload => {
          setCandidates(prev => prev.map(c => c.id === payload.new.id ? { ...c, vote_count: payload.new.vote_count } : c)
            .sort((a, b) => b.vote_count - a.vote_count));
          setTotalVotes(prev => prev); // recalculate
        })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [id]);

  if (loading) return <LoadingSpinner fullPage />;
  if (!election) return <div className="container page"><div className="alert alert-danger">Election not found.</div></div>;

  const winner = candidates[0];
  const turnout = election.max_voters > 0 ? Math.round((totalVotes / election.max_voters) * 100) : 0;

  const colors = ['#6c63ff','#00d4ff','#00c896','#ffb300','#ff4757','#a55eea','#26de81','#fd9644'];

  const barData = {
    labels: candidates.map(c => c.name),
    datasets: [{
      label: 'Votes',
      data: candidates.map(c => c.vote_count || 0),
      backgroundColor: candidates.map((_, i) => colors[i % colors.length] + 'cc'),
      borderColor: candidates.map((_, i) => colors[i % colors.length]),
      borderWidth: 2, borderRadius: 6,
    }]
  };

  const doughnutData = {
    labels: candidates.map(c => c.name),
    datasets: [{
      data: candidates.map(c => c.vote_count || 0),
      backgroundColor: candidates.map((_, i) => colors[i % colors.length] + 'cc'),
      borderColor: candidates.map((_, i) => colors[i % colors.length]),
      borderWidth: 2,
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#e8e8f0', font: { family: 'DM Sans' } } },
      tooltip: { backgroundColor: '#1a1a24', titleColor: '#e8e8f0', bodyColor: '#9090aa', borderColor: '#2a2a3a', borderWidth: 1 }
    },
    scales: {
      x: { ticks: { color: '#9090aa' }, grid: { color: '#2a2a3a' } },
      y: { ticks: { color: '#9090aa' }, grid: { color: '#2a2a3a' }, beginAtZero: true }
    }
  };

  return (
    <div className="container page">
      <div style={{ display:'flex', gap:'8px', marginBottom:'24px' }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm">← Back</button>
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'32px', flexWrap:'wrap', gap:'16px' }}>
        <div>
          <h1 style={{ fontSize:'28px', fontWeight:700 }}>Election Results</h1>
          <p style={{ color:'var(--text2)', marginTop:'4px' }}>{election.title}</p>
        </div>
        <span className={`badge badge-${election.status === 'active' ? 'active' : 'completed'}`} style={{ fontSize:'14px', padding:'6px 16px' }}>
          {election.status === 'active' ? '🔴 Live Results' : '✅ Final Results'}
        </span>
      </div>

      {/* Winner Banner */}
      {election.status === 'completed' && winner && winner.vote_count > 0 && (
        <div className="card" style={{ background:'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(0,212,255,0.1))', borderColor:'rgba(108,99,255,0.4)', marginBottom:'24px', textAlign:'center', padding:'32px' }}>
          <div style={{ fontSize:'40px', marginBottom:'8px' }}>🏆</div>
          <h2 style={{ fontSize:'24px', marginBottom:'4px' }}>Winner: {winner.name}</h2>
          {winner.designation && <p style={{ color:'var(--accent)', marginBottom:'8px' }}>{winner.designation}</p>}
          <p style={{ color:'var(--text2)' }}>{winner.vote_count} votes ({totalVotes > 0 ? Math.round((winner.vote_count / totalVotes) * 100) : 0}% of total votes)</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom:'32px' }}>
        <div className="stat-card">
          <div className="stat-value">{totalVotes}</div>
          <div className="stat-label">Total Votes Cast</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color:'var(--success)' }}>{turnout}%</div>
          <div className="stat-label">Voter Turnout</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color:'var(--accent2)' }}>{candidates.length}</div>
          <div className="stat-label">Total Candidates</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color:'var(--warning)' }}>{voterCount}</div>
          <div className="stat-label">Finalized Voters</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom:'32px' }}>
        <div className="card">
          <h3 style={{ marginBottom:'20px' }}>Votes by Candidate</h3>
          <Bar data={barData} options={chartOptions} />
        </div>
        <div className="card">
          <h3 style={{ marginBottom:'20px' }}>Vote Distribution</h3>
          <Doughnut data={doughnutData} options={{ ...chartOptions, scales: undefined }} />
        </div>
      </div>

      {/* Detailed table */}
      <div className="card">
        <h3 style={{ marginBottom:'16px' }}>Candidate Rankings</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Candidate</th>
                <th>Votes</th>
                <th>% Share</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c, i) => {
                const share = totalVotes > 0 ? Math.round((c.vote_count / totalVotes) * 100) : 0;
                return (
                  <tr key={c.id}>
                    <td style={{ fontWeight:700, color: i === 0 ? 'var(--warning)' : 'var(--text2)' }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </td>
                    <td>
                      <div style={{ fontWeight:500 }}>{c.name}</div>
                      {c.designation && <div style={{ fontSize:'12px', color:'var(--text2)' }}>{c.designation}</div>}
                    </td>
                    <td style={{ fontWeight:700, color:'var(--accent)' }}>{c.vote_count || 0}</td>
                    <td>{share}%</td>
                    <td style={{ minWidth:'120px' }}>
                      <div className="progress">
                        <div className="progress-bar" style={{ width:`${share}%`, background: colors[i % colors.length] }} />
                      </div>
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
