import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext.jsx'
import { HiOutlineClipboardList, HiOutlineCheckCircle, HiOutlineClock, HiOutlineExclamation, HiOutlineFolder, HiOutlineChartBar, HiOutlineUsers } from 'react-icons/hi'
import { format } from 'date-fns'

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page-container"><div className="loading-screen" style={{minHeight:'50vh'}}><div className="spinner"/></div></div>

  const d = data || {}

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple"><HiOutlineFolder /></div>
          <div className="stat-value">{d.totalProjects || 0}</div>
          <div className="stat-label">Projects</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><HiOutlineClipboardList /></div>
          <div className="stat-value">{d.totalTasks || 0}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><HiOutlineCheckCircle /></div>
          <div className="stat-value">{d.tasksByStatus?.['Done'] || 0}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow"><HiOutlineClock /></div>
          <div className="stat-value">{d.tasksByStatus?.['In Progress'] || 0}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><HiOutlineExclamation /></div>
          <div className="stat-value">{d.overdueTasks || 0}</div>
          <div className="stat-label">Overdue</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <h3 className="section-title"><HiOutlineChartBar /> Tasks by Status</h3>
          {d.totalTasks > 0 ? (
            <div>
              {['To Do', 'In Progress', 'Done'].map(s => {
                const count = d.tasksByStatus?.[s] || 0
                const pct = d.totalTasks ? Math.round((count / d.totalTasks) * 100) : 0
                const colors = { 'To Do': 'var(--info)', 'In Progress': 'var(--warning)', 'Done': 'var(--success)' }
                return (
                  <div key={s} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.85rem' }}>
                      <span>{s}</span><span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: colors[s] }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : <div className="empty-state"><p>No tasks yet</p></div>}
        </div>

        <div className="dashboard-section">
          <h3 className="section-title"><HiOutlineClipboardList /> My Tasks</h3>
          {d.myTasks?.total > 0 ? (
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 4 }}>{d.myTasks.total}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>tasks assigned to you</div>
              {['To Do', 'In Progress', 'Done'].map(s => (
                <div key={s} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                  <span>{s}</span>
                  <span className={`badge badge-${s === 'To Do' ? 'todo' : s === 'In Progress' ? 'progress' : 'done'}`}>{d.myTasks.byStatus?.[s] || 0}</span>
                </div>
              ))}
            </div>
          ) : <div className="empty-state"><p>No tasks assigned to you</p></div>}
        </div>

        <div className="dashboard-section">
          <h3 className="section-title"><HiOutlineUsers /> Team Workload</h3>
          {d.tasksPerUser?.length > 0 ? (
            <div className="member-list">
              {d.tasksPerUser.map(u => (
                <div className="member-item" key={u.user._id}>
                  <img src={u.user.avatar} alt={u.user.name} />
                  <div className="member-info">
                    <div className="member-name">{u.user.name}</div>
                    <div className="member-email">{u.total} tasks · {u.completed} done</div>
                  </div>
                  <div className="progress-bar" style={{ width: 60 }}>
                    <div className="progress-fill" style={{ width: u.total ? `${(u.completed / u.total) * 100}%` : '0%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="empty-state"><p>No team data</p></div>}
        </div>

        <div className="dashboard-section">
          <h3 className="section-title"><HiOutlineExclamation /> Overdue Tasks</h3>
          {d.overdueTasksList?.length > 0 ? (
            <div className="task-list">
              {d.overdueTasksList.map(t => (
                <div className="task-item" key={t._id}>
                  <span className={`badge badge-${t.priority.toLowerCase()}`}>{t.priority}</span>
                  <span className="task-title">{t.title}</span>
                  <span className="task-due overdue">{t.dueDate ? format(new Date(t.dueDate), 'MMM d') : ''}</span>
                </div>
              ))}
            </div>
          ) : <div className="empty-state"><p>No overdue tasks 🎉</p></div>}
        </div>
      </div>
    </div>
  )
}
