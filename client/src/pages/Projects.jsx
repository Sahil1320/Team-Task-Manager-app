import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { HiOutlinePlus, HiOutlineFolder, HiOutlineX } from 'react-icons/hi'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6']

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', color: '#6366f1' })
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  const fetchProjects = () => {
    api.get('/projects').then(r => setProjects(r.data.data.projects)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchProjects() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Project name is required')
    setSaving(true)
    try {
      await api.post('/projects', form)
      toast.success('Project created!')
      setShowModal(false)
      setForm({ name: '', description: '', color: '#6366f1' })
      fetchProjects()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="page-container"><div className="loading-screen" style={{minHeight:'50vh'}}><div className="spinner"/></div></div>

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Projects</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><HiOutlinePlus /> New Project</button>
      </div>

      {projects.length > 0 ? (
        <div className="projects-grid">
          {projects.map(p => (
            <div key={p._id} className="project-card" onClick={() => navigate(`/projects/${p._id}`)} style={{ '--card-color': p.color }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: p.color }} />
              <div className="project-name">{p.name}</div>
              <div className="project-desc">{p.description || 'No description'}</div>
              <div className="project-meta">
                <div className="project-members">
                  {p.members?.slice(0, 4).map((m, i) => (
                    <img key={m.user?._id || i} src={m.user?.avatar} alt={m.user?.name} title={m.user?.name} />
                  ))}
                  {p.members?.length > 4 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 4 }}>+{p.members.length - 4}</span>}
                </div>
                <div className="project-stats">
                  <span className="project-stat"><span className="dot" style={{ background: 'var(--info)' }} />{p.taskStats?.['To Do'] || 0}</span>
                  <span className="project-stat"><span className="dot" style={{ background: 'var(--warning)' }} />{p.taskStats?.['In Progress'] || 0}</span>
                  <span className="project-stat"><span className="dot" style={{ background: 'var(--success)' }} />{p.taskStats?.Done || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <HiOutlineFolder />
          <h3>No projects yet</h3>
          <p>Create your first project to get started</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><HiOutlinePlus /> Create Project</button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Project</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><HiOutlineX /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Project Name</label>
                <input className="form-input" placeholder="e.g., Website Redesign" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-input" placeholder="Brief description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Color</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {COLORS.map(c => (
                    <div key={c} onClick={() => setForm({ ...form, color: c })}
                      style={{ width: 32, height: 32, borderRadius: 8, background: c, cursor: 'pointer',
                        border: form.color === c ? '3px solid var(--text-primary)' : '3px solid transparent',
                        transition: 'var(--transition)' }} />
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
