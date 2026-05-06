import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'
import { format, isPast } from 'date-fns'
import { HiOutlineArrowLeft, HiOutlinePlus, HiOutlineX, HiOutlineTrash, HiOutlinePencil, HiOutlineUserAdd, HiOutlineUsers } from 'react-icons/hi'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('board')
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'Medium', status: 'To Do', assignee: '', dueDate: '' })
  const [memberEmail, setMemberEmail] = useState('')
  const [saving, setSaving] = useState(false)

  const myRole = project?.members?.find(m => m.user?._id === user?._id)?.role
  const isAdmin = myRole === 'Admin'

  const fetchData = useCallback(() => {
    Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/tasks?project=${id}`)
    ]).then(([pRes, tRes]) => {
      setProject(pRes.data.data.project)
      setTasks(tRes.data.data.tasks)
    }).catch(err => {
      toast.error('Failed to load project')
      navigate('/projects')
    }).finally(() => setLoading(false))
  }, [id, navigate])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreateTask = () => {
    setEditingTask(null)
    setTaskForm({ title: '', description: '', priority: 'Medium', status: 'To Do', assignee: '', dueDate: '' })
    setShowTaskModal(true)
  }

  const openEditTask = (task) => {
    setEditingTask(task)
    setTaskForm({
      title: task.title, description: task.description || '',
      priority: task.priority, status: task.status,
      assignee: task.assignee?._id || '',
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : ''
    })
    setShowTaskModal(true)
  }

  const handleSaveTask = async (e) => {
    e.preventDefault()
    if (!taskForm.title.trim()) return toast.error('Title is required')
    setSaving(true)
    try {
      const payload = { ...taskForm, project: id }
      if (!payload.assignee) payload.assignee = null
      if (!payload.dueDate) payload.dueDate = null
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, payload)
        toast.success('Task updated')
      } else {
        await api.post('/tasks', payload)
        toast.success('Task created')
      }
      setShowTaskModal(false)
      fetchData()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return
    try {
      await api.delete(`/tasks/${taskId}`)
      toast.success('Task deleted')
      fetchData()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const handleStatusChange = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status })
      fetchData()
    } catch (err) { toast.error(err.response?.data?.message || 'Cannot update') }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    if (!memberEmail.trim()) return
    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail, role: 'Member' })
      toast.success('Member added!')
      setMemberEmail('')
      fetchData()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return
    try {
      await api.delete(`/projects/${id}/members/${userId}`)
      toast.success('Member removed')
      fetchData()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project and all its tasks?')) return
    try {
      await api.delete(`/projects/${id}`)
      toast.success('Project deleted')
      navigate('/projects')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  if (loading) return <div className="page-container"><div className="loading-screen" style={{minHeight:'50vh'}}><div className="spinner"/></div></div>
  if (!project) return null

  const grouped = { 'To Do': [], 'In Progress': [], 'Done': [] }
  tasks.forEach(t => { if (grouped[t.status]) grouped[t.status].push(t) })

  const priorityColor = { Low: 'var(--success)', Medium: 'var(--info)', High: 'var(--warning)', Urgent: 'var(--danger)' }

  return (
    <div className="page-container">
      <button className="back-btn" onClick={() => navigate('/projects')}><HiOutlineArrowLeft /> Back to Projects</button>

      <div className="page-header">
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 14, height: 14, borderRadius: 4, background: project.color, display: 'inline-block' }} />
            {project.name}
          </h2>
          {project.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>{project.description}</p>}
          <span className={`badge ${isAdmin ? 'role-admin' : 'role-member'}`} style={{ marginTop: 8 }}>{myRole}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {isAdmin && <button className="btn btn-secondary btn-sm" onClick={() => setShowMemberModal(true)}><HiOutlineUsers /> Members</button>}
          {isAdmin && <button className="btn btn-primary btn-sm" onClick={openCreateTask}><HiOutlinePlus /> Add Task</button>}
          {isAdmin && <button className="btn btn-danger btn-sm" onClick={handleDeleteProject}><HiOutlineTrash /></button>}
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'board' ? 'active' : ''}`} onClick={() => setTab('board')}>Board</button>
        <button className={`tab ${tab === 'list' ? 'active' : ''}`} onClick={() => setTab('list')}>List</button>
        <button className={`tab ${tab === 'members' ? 'active' : ''}`} onClick={() => setTab('members')}>Members ({project.members?.length})</button>
      </div>

      {tab === 'board' && (
        <div className="kanban-board">
          {['To Do', 'In Progress', 'Done'].map(status => (
            <div className="kanban-column" key={status}>
              <div className="kanban-header">
                <h3>
                  <span className="dot" style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block',
                    background: status === 'To Do' ? 'var(--info)' : status === 'In Progress' ? 'var(--warning)' : 'var(--success)' }} />
                  {status}
                </h3>
                <span className="kanban-count">{grouped[status].length}</span>
              </div>
              <div className="kanban-body">
                {grouped[status].map(task => (
                  <div className="kanban-card" key={task._id} onClick={() => isAdmin ? openEditTask(task) : null}>
                    <div className="card-title">{task.title}</div>
                    {task.description && <div className="card-desc">{task.description}</div>}
                    <div className="card-footer">
                      <div className="card-meta">
                        <span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
                        {task.dueDate && (
                          <span className={`task-due ${isPast(new Date(task.dueDate)) && task.status !== 'Done' ? 'overdue' : ''}`}>
                            {format(new Date(task.dueDate), 'MMM d')}
                          </span>
                        )}
                      </div>
                      {task.assignee && <img src={task.assignee.avatar} alt={task.assignee.name} title={task.assignee.name} style={{ width: 24, height: 24, borderRadius: '50%' }} />}
                    </div>
                    {!isAdmin && task.assignee?._id === user?._id && (
                      <div style={{ marginTop: 10 }}>
                        <select className="form-input select" style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                          value={task.status} onClick={e => e.stopPropagation()}
                          onChange={e => handleStatusChange(task._id, e.target.value)}>
                          <option>To Do</option><option>In Progress</option><option>Done</option>
                        </select>
                      </div>
                    )}
                  </div>
                ))}
                {grouped[status].length === 0 && <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)', fontSize: '0.8rem' }}>No tasks</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'list' && (
        <div className="task-list">
          {tasks.length > 0 ? tasks.map(task => (
            <div className="task-item" key={task._id} onClick={() => isAdmin ? openEditTask(task) : null}>
              <span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
              <span className="task-title">{task.title}</span>
              <span className={`badge badge-${task.status === 'To Do' ? 'todo' : task.status === 'In Progress' ? 'progress' : 'done'}`}>{task.status}</span>
              {task.assignee && <span className="task-assignee"><img src={task.assignee.avatar} alt="" />{task.assignee.name}</span>}
              {task.dueDate && <span className={`task-due ${isPast(new Date(task.dueDate)) && task.status !== 'Done' ? 'overdue' : ''}`}>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>}
              {isAdmin && <button className="btn btn-danger btn-icon btn-sm" onClick={e => { e.stopPropagation(); handleDeleteTask(task._id) }}><HiOutlineTrash /></button>}
              {!isAdmin && task.assignee?._id === user?._id && (
                <select className="form-input select" style={{ width: 'auto', padding: '4px 24px 4px 8px', fontSize: '0.78rem' }}
                  value={task.status} onClick={e => e.stopPropagation()}
                  onChange={e => handleStatusChange(task._id, e.target.value)}>
                  <option>To Do</option><option>In Progress</option><option>Done</option>
                </select>
              )}
            </div>
          )) : <div className="empty-state"><p>No tasks yet</p></div>}
        </div>
      )}

      {tab === 'members' && (
        <div>
          {isAdmin && (
            <form onSubmit={handleAddMember} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <input className="form-input" placeholder="Add member by email" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} style={{ flex: 1 }} />
              <button type="submit" className="btn btn-primary btn-sm"><HiOutlineUserAdd /> Add</button>
            </form>
          )}
          <div className="member-list">
            {project.members?.map(m => (
              <div className="member-item" key={m.user?._id}>
                <img src={m.user?.avatar} alt={m.user?.name} />
                <div className="member-info">
                  <div className="member-name">{m.user?.name} {m.user?._id === user?._id && '(You)'}</div>
                  <div className="member-email">{m.user?.email}</div>
                </div>
                <span className={`member-role ${m.role === 'Admin' ? 'role-admin' : 'role-member'}`}>{m.role}</span>
                {isAdmin && m.user?._id !== user?._id && (
                  <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleRemoveMember(m.user?._id)}><HiOutlineX /></button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingTask ? 'Edit Task' : 'Create Task'}</h3>
              <button className="modal-close" onClick={() => setShowTaskModal(false)}><HiOutlineX /></button>
            </div>
            <form onSubmit={handleSaveTask}>
              <div className="form-group">
                <label>Title</label>
                <input className="form-input" placeholder="Task title" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-input" placeholder="Optional description" value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Priority</label>
                  <select className="form-input select" value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                    <option>Low</option><option>Medium</option><option>High</option><option>Urgent</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select className="form-input select" value={taskForm.status} onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}>
                    <option>To Do</option><option>In Progress</option><option>Done</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Assign To</label>
                <select className="form-input select" value={taskForm.assignee} onChange={e => setTaskForm({ ...taskForm, assignee: e.target.value })}>
                  <option value="">Unassigned</option>
                  {project.members?.map(m => <option key={m.user?._id} value={m.user?._id}>{m.user?.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" className="form-input" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMemberModal && (
        <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Manage Members</h3>
              <button className="modal-close" onClick={() => setShowMemberModal(false)}><HiOutlineX /></button>
            </div>
            <form onSubmit={handleAddMember} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <input className="form-input" placeholder="Enter email" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} style={{ flex: 1 }} />
              <button type="submit" className="btn btn-primary btn-sm"><HiOutlineUserAdd /></button>
            </form>
            <div className="member-list">
              {project.members?.map(m => (
                <div className="member-item" key={m.user?._id}>
                  <img src={m.user?.avatar} alt={m.user?.name} />
                  <div className="member-info">
                    <div className="member-name">{m.user?.name}</div>
                    <div className="member-email">{m.user?.email}</div>
                  </div>
                  <span className={`member-role ${m.role === 'Admin' ? 'role-admin' : 'role-member'}`}>{m.role}</span>
                  {m.user?._id !== user?._id && (
                    <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleRemoveMember(m.user?._id)}><HiOutlineX /></button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
