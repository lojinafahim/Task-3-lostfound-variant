import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

// This page is already routed at /items/new (report) and /items/:id (edit),
// and both routes are wrapped in <ProtectedRoute>.

const CATEGORIES = ['electronics', 'clothing', 'documents', 'accessories', 'other']
const STATUSES = ['lost', 'found', 'claimed']

const defaults = { title: '', description: '', category: 'other', status: 'lost', location: '' }

export default function ItemForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  // Edit mode: when there is an `id`, load the item and fill the form with it.
  useEffect(() => {
    if (!id) return
    api.get('/items/' + id)
      .then(res => {
        const it = res.data.item
        setForm({
          title: it.title || '',
          description: it.description || '',
          category: it.category || 'other',
          status: it.status || 'lost',
          location: it.location || ''
        })
      })
      .catch(err => setError(err?.response?.data?.message || 'Could not load item'))
  }, [id])

  // Update `form` when any input changes, keyed by its `name` attribute.
  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  // POST a new item, or PATCH the existing one when editing, then go back to
  // /items. Show the server's error message on failure.
  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const payload = {
        title: form.title,
        status: form.status,
        category: form.category,
        location: form.location,
        description: form.description
      }
      if (id) {
        await api.patch('/items/' + id, payload)
      } else {
        await api.post('/items', payload)
      }
      nav('/items')
    } catch (err) {
      setError(err?.response?.data?.message || 'Save failed')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'Report'} Item</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="input"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={onChange}
        />
        <select className="input" name="status" value={form.status} onChange={onChange}>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input" name="category" value={form.category} onChange={onChange}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input
          className="input"
          name="location"
          placeholder="Location (optional)"
          value={form.location}
          onChange={onChange}
        />
        <textarea
          className="input"
          name="description"
          placeholder="Description (optional)"
          rows={4}
          value={form.description}
          onChange={onChange}
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
