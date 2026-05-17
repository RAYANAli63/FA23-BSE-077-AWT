import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Bar, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js'
import { supabase } from '../../lib/supabase'
import { LoadingPage, Badge, StatCard } from '../../components/ui/index.jsx'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)
const COLORS = ['#3b82f6','#8b5cf6','#22c55e','#f59e0b','#ef4444','#06b6d4','#a78bfa','#86efac']

export default function ResultsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [election, setElection] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [stats, setStats] = useState({ totalVotes: 0, totalVoters: 0, turnout: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
    const ch = supabase.channel(`results-${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'candidates', filter: `election_id=eq.${id}` }, load)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [id])

  async function load() {
    const [{ data: el }, { data: cands }, { count: voted }] = await Promise.all([
      supabase.from('elections').select('*').eq('id', id).single(),
      supabase.from('candidates').select('*').eq('election_id', id).order('vote_count', { ascending: false }),
      supabase.from('voter_registrations').select('*', { count: 'exact', head: true }).eq('election_id', id).eq('status', 'voted')
    ])
    setElection(el)
    const list = cands || []
    setCandidates(list)
    const totalVotes = list.reduce((s, c) => s + (c.vote_count || 0), 0)
    setStats({ totalVotes, totalVoters: el?.max_voters || 1, turnout: Math.round(((voted || 0) / (el?.max_voters || 1)) * 100) })
    setLoading(false)
  }

  async function downloadPDF() {
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')
    const doc = new jsPDF()
    doc.setFontSize(18); doc.text(election.title + ' — Results', 14, 20)
    doc.setFontSize(11); doc.text(`Votes: ${stats.totalVotes} | Turnout: ${stats.turnout}% | ${new Date().toLocaleDateString()}`, 14, 30)
    autoTable(doc, {
      startY: 40,
      head: [['Rank','Candidate','Designation','Votes','%']],
      body: candidates.map((c, i) => [i+1, c.name, c.designation||'—', c.vote_count||0,
        stats.totalVotes > 0 ? Math.round(c.vote_count/stats.totalVotes*100)+'%' : '0%']),
      headStyles: { fillColor: [59,130,246] }
    })
    doc.save(`${election.title}-results.pdf`)
  }

  if (loading) return <LoadingPage />
  if (!election) return <div className="page-wrapper"><p className="text-surface-400">Not found.</p></div>

  const winner = candidates[0]
  const chartColors = candidates.map((_, i) => COLORS[i % COLORS.length])

  const barData = {
    labels: candidates.map(c => c.name),
    datasets: [{ label: 'Votes', data: candidates.map(c => c.vote_count || 0),
      backgroundColor: chartColors.map(c => c + 'bb'), borderColor: chartColors, borderWidth: 2, borderRadius: 8 }]
  }
  const donutData = {
    labels: candidates.map(c => c.name),
    datasets: [{ data: candidates.map(c => c.vote_count || 0),
      backgroundColor: chartColors.map(c => c + 'bb'), borderColor: chartColors, borderWidth: 2 }]
  }
  const opts = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#94a3b8', font: { family: 'Outfit' } } },
      tooltip: { backgroundColor: '#1e293b', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: '#334155', borderWidth: 1 }
    },
    scales: { x: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } }, y: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' }, beginAtZero: true } }
  }

  return (
    <div className="page-wrapper">
      <div className="flex justify-between items-start flex-wrap gap-4 mb-8">
        <div>
          <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm mb-3">← Back</button>
          <h1 className="section-title">Election Results</h1>
          <p className="section-subtitle">{election.title}</p>
        </div>
        <div className="flex gap-2 items-center">
          {election.status === 'active' && <Badge variant="active"><span className="live-dot mr-1" />Live</Badge>}
          {election.status === 'completed' && <Badge variant="completed">Final</Badge>}
          <button onClick={downloadPDF} className="btn btn-secondary btn-sm">📥 PDF</button>
        </div>
      </div>

      {election.status === 'completed' && winner?.vote_count > 0 && (
        <div className="card-gradient border border-brand-500/20 rounded-3xl p-10 text-center mb-8 animate-fade-in">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="font-display font-bold text-3xl mb-2">Winner: {winner.name}</h2>
          {winner.designation && <p className="text-brand-400 mb-2">{winner.designation}</p>}
          <p className="text-surface-400">{winner.vote_count} votes • {stats.totalVotes > 0 ? Math.round(winner.vote_count/stats.totalVotes*100) : 0}% of total</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="🗳️" label="Total Votes" value={stats.totalVotes} color="brand" />
        <StatCard icon="📊" label="Turnout" value={stats.turnout + '%'} color="success" />
        <StatCard icon="👥" label="Candidates" value={candidates.length} color="violet" />
        <StatCard icon="🏛️" label="Max Voters" value={stats.totalVoters} color="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card"><h3 className="font-bold mb-5">Votes by Candidate</h3><Bar data={barData} options={opts} /></div>
        <div className="card"><h3 className="font-bold mb-5">Vote Distribution</h3><Doughnut data={donutData} options={{ ...opts, scales: undefined }} /></div>
      </div>

      <div className="card">
        <h3 className="font-bold mb-4">Candidate Rankings</h3>
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr><th>Rank</th><th>Candidate</th><th>Votes</th><th>Share</th><th>Progress</th></tr></thead>
            <tbody>
              {candidates.map((c, i) => {
                const share = stats.totalVotes > 0 ? Math.round(c.vote_count / stats.totalVotes * 100) : 0
                return (
                  <tr key={c.id}>
                    <td className="font-bold text-lg">{i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}</td>
                    <td><p className="font-semibold text-surface-100">{c.name}</p>{c.designation&&<p className="text-xs text-surface-500">{c.designation}</p>}</td>
                    <td className="font-bold text-brand-400 tabular-nums">{c.vote_count||0}</td>
                    <td className="text-surface-300">{share}%</td>
                    <td className="min-w-[120px]">
                      <div className="progress-bar"><div className="progress-fill" style={{ width:`${share}%`, background: COLORS[i % COLORS.length] }} /></div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
