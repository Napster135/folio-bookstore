import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import CartDrawer from '../components/CartDrawer'
import Footer from '../components/Footer'
import { useToast } from '../context/ToastContext'
import { useUser } from '../context/UserContext'
import { API_URL, apiFetch } from "../config/api";
import './Admin.css'

type UserRow = {
  _id: string
  first_name: string
  last_name: string
  email: string
  role: string
  lastLoginDate?: string
}

type Product = {
  _id: string
  title: string
  author?: string
  description?: string
  category: string
  price: number
  stock: number
  thumbnail: string
  code: string
}

type TicketItem = {
  productId?: string
  title: string
  quantity: number
  unitPrice: number
  subtotal: number
  thumbnail?: string
  category?: string
}

type TicketCustomer = {
  name?: string
  email?: string
  phone?: string
  type?: 'guest' | 'registered'
  shippingAddress?: string
  billingAddress?: string
}

type Ticket = {
  _id: string
  code: string
  purchase_datetime: string
  amount: number
  subtotal?: number
  discountAmount?: number
  discountRate?: number
  paymentIntentId?: string
  guestEmail?: string
  purchaser?: { first_name?: string; last_name?: string; email?: string }
  customer?: TicketCustomer
  items?: TicketItem[]
}

type Data = {
  allUsers: UserRow[]
  allProducts: Product[]
  isAdmin: boolean
}

type Tab = 'users' | 'products' | 'orders'
type SortDir = 'asc' | 'desc'

const CATEGORIES = ['Ficcion', 'Tecnico', 'Infantil', 'Historia', 'Ciencia', 'Arte', 'Otro']

const emptyForm = (): Partial<Product> => ({
  title: '', author: '', description: '', category: 'Ficcion',
  price: 0, stock: 0, thumbnail: '', code: ''
})

export default function Admin() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { user, cartCount, setCartCount, refetch } = useUser()
  const [cartOpen, setCartOpen] = useState(false)
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('users')
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [sortField, setSortField] = useState('')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [formData, setFormData] = useState<Partial<Product>>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [editingStock, setEditingStock] = useState<string | null>(null)
  const [stockValue, setStockValue] = useState('')
  const stockInputRef = useRef<HTMLInputElement>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [ticketsLoading, setTicketsLoading] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  useEffect(() => {
    apiFetch(`${API_URL}/auth/adminView`, { headers: { Accept: 'application/json' } })
      .then(r => {
        if (r.status === 401 || r.status === 403 || r.redirected) { refetch(); navigate('/login', { replace: true }); return null }
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(j => { if (j) setData(j) })
      .catch(() => showToast('Error cargando el panel admin', 'error'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (tab === 'orders' && tickets.length === 0 && !ticketsLoading) {
      setTicketsLoading(true)
      apiFetch(`${API_URL}/auth/adminTickets`, { headers: { Accept: 'application/json' } })
        .then(r => r.ok ? r.json() : null)
        .then(j => { if (j?.tickets) setTickets(j.tickets) })
        .catch(() => showToast('Error cargando pedidos', 'error'))
        .finally(() => setTicketsLoading(false))
    }
  }, [tab, tickets.length, ticketsLoading, showToast])

  useEffect(() => {
    if (editingStock && stockInputRef.current) stockInputRef.current.focus()
  }, [editingStock])

  const demoBlocked = async (res: Response): Promise<boolean> => {
    if (res.status === 403) {
      const j = await res.json().catch(() => ({}))
      if (j?.status === 'demo') {
        showToast(j.message ?? '🔒 Acción deshabilitada en modo demo', 'info')
        return true
      }
    }
    return false
  }

  const handleRoleChange = async (uid: string, newRole: string) => {
    try {
      const res = await apiFetch(`${API_URL}/auth/adminView/users/` + uid, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newRole }),
      })
      if (await demoBlocked(res)) return
      if (res.ok) {
        setData(d => d ? ({ ...d, allUsers: d.allUsers.map(u => u._id === uid ? { ...u, role: newRole } : u) }) : d)
        showToast('Rol actualizado a ' + newRole, 'success')
      } else if (res.status === 401) {
        showToast('No tenés permisos para esta acción', 'error')
      } else {
        showToast('Error actualizando rol', 'error')
      }
    } catch { showToast('Error actualizando rol', 'error') }
  }

  const handleDeleteUser = async (uid: string) => {
    try {
      const res = await apiFetch(`${API_URL}/auth/adminView/users/` + uid, { method: 'DELETE' })
      if (await demoBlocked(res)) { setConfirmDelete(null); return }
      if (res.ok) {
        setData(d => d ? ({ ...d, allUsers: d.allUsers.filter(u => u._id !== uid) }) : d)
        showToast('Usuario eliminado', 'success')
      }
    } catch { showToast('Error eliminando usuario', 'error') }
    setConfirmDelete(null)
  }

  const handleCleanInactive = async () => {
    const res = await apiFetch(`${API_URL}/auth/users/inactive`, { method: 'DELETE' })
    if (await demoBlocked(res)) return
    if (res.ok) {
      showToast('Usuarios inactivos eliminados', 'success')
      apiFetch(`${API_URL}/auth/adminView`, { headers: { Accept: 'application/json' } })
        .then(r => r.json()).then(j => { if (j) setData(j) }).catch(() => {})
    }
  }

  const handleDeleteProduct = async (pid: string) => {
    try {
      const res = await apiFetch(`${API_URL}/api/products/` + pid, { method: 'DELETE' })
      if (await demoBlocked(res)) { setConfirmDelete(null); return }
      if (res.ok) {
        setData(d => d ? ({ ...d, allProducts: d.allProducts.filter(p => p._id !== pid) }) : d)
        showToast('Producto eliminado', 'success')
      } else if (res.status === 401) {
        showToast('No tenés permisos para esta acción', 'error')
      } else {
        showToast('Error eliminando producto', 'error')
      }
    } catch { showToast('Error eliminando producto', 'error') }
    setConfirmDelete(null)
  }

  const openCreate = () => { setFormData(emptyForm()); setModalMode('create'); setModalOpen(true) }
  const openEdit = (product: Product) => { setFormData({ ...product }); setModalMode('edit'); setModalOpen(true) }

  const handleSaveProduct = async () => {
    if (!formData.title || !formData.code || !formData.thumbnail) {
      showToast('Título, código y thumbnail son obligatorios', 'error'); return
    }
    setSaving(true)
    try {
      if (modalMode === 'create') {
        const res = await apiFetch(`${API_URL}/api/products`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData),
        })
        if (await demoBlocked(res)) { setSaving(false); return }
        if (res.ok) {
          const j = await res.json()
          const newProduct: Product = j.payload ?? j
          setData(d => d ? ({ ...d, allProducts: [newProduct, ...d.allProducts] }) : d)
          showToast('Producto creado', 'success'); setModalOpen(false)
        } else { showToast('Error creando producto', 'error') }
      } else {
        const res = await apiFetch(`${API_URL}/api/products/` + formData._id, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pid: formData._id, updates: formData }),
        })
        if (await demoBlocked(res)) { setSaving(false); return }
        if (res.ok) {
          setData(d => d ? ({ ...d, allProducts: d.allProducts.map(p => p._id === formData._id ? { ...p, ...formData } as Product : p) }) : d)
          showToast('Producto actualizado', 'success'); setModalOpen(false)
        } else { showToast('Error actualizando producto', 'error') }
      }
    } catch { showToast('Error de conexión', 'error') }
    finally { setSaving(false) }
  }

  const startEditStock = (pid: string, current: number) => { setEditingStock(pid); setStockValue(String(current)) }
  const commitStock = async (pid: string) => {
    const newStock = parseInt(stockValue, 10)
    if (isNaN(newStock) || newStock < 0) { setEditingStock(null); return }
    try {
      const res = await apiFetch(`${API_URL}/api/products/` + pid, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pid, updates: { stock: newStock } }),
      })
      if (await demoBlocked(res)) { setEditingStock(null); return }
      if (res.ok) {
        setData(d => d ? ({ ...d, allProducts: d.allProducts.map(p => p._id === pid ? { ...p, stock: newStock } : p) }) : d)
        showToast('Stock actualizado', 'success')
      } else if (res.status === 401) {
        showToast('No tenés permisos para esta acción', 'error')
      } else {
        showToast('Error actualizando stock', 'error')
      }
    } catch { showToast('Error actualizando stock', 'error') }
    setEditingStock(null)
  }

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const sortIcon = (field: string) => {
    if (sortField !== field) return (
      <svg width="12" height="12" fill="none" stroke="#d4d4d8" strokeWidth={2} viewBox="0 0 24 24" style={{ marginLeft: 4, flexShrink: 0, display: 'inline-block', verticalAlign: 'middle' }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    )
    return (
      <svg width="12" height="12" fill="none" stroke="#09090b" strokeWidth={2} viewBox="0 0 24 24" style={{ marginLeft: 4, flexShrink: 0, display: 'inline-block', verticalAlign: 'middle' }}>
        <path strokeLinecap="round" strokeLinejoin="round" d={sortDir === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
      </svg>
    )
  }

  function sortRows(items: Record<string, unknown>[]): Record<string, unknown>[] {
    if (!sortField) return items
    return [...items].sort((a, b) => {
      const av = String(a[sortField] ?? '')
      const bv = String(b[sortField] ?? '')
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })
  }

  const filteredUsers = sortRows(
    (data?.allUsers ?? []).filter(u =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.first_name + ' ' + u.last_name).toLowerCase().includes(search.toLowerCase())
    ) as unknown as Record<string, unknown>[]
  ) as unknown as UserRow[]

  const filteredProducts = sortRows(
    (data?.allProducts ?? []).filter(p =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      (p.author ?? '').toLowerCase().includes(search.toLowerCase())
    ) as unknown as Record<string, unknown>[]
  ) as unknown as Product[]

  const filteredTickets = sortRows(
    tickets.filter(t => {
      const q = search.toLowerCase()
      return (t.code ?? '').toLowerCase().includes(q) ||
        (t.purchaser?.email ?? '').toLowerCase().includes(q) ||
        (t.customer?.email ?? '').toLowerCase().includes(q) ||
        (t.customer?.name ?? '').toLowerCase().includes(q) ||
        (t.guestEmail ?? '').toLowerCase().includes(q)
    }) as unknown as Record<string, unknown>[]
  ) as unknown as Ticket[]

  const lowStock = data?.allProducts.filter(p => p.stock > 0 && p.stock <= 5).length ?? 0
  const outOfStock = data?.allProducts.filter(p => p.stock === 0).length ?? 0
  const premiumCount = data?.allUsers.filter(u => u.role === 'premium').length ?? 0
  const totalRevenue = tickets.reduce((acc, t) => acc + (t.amount ?? 0), 0)

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
  const fmtFull = (iso: string) =>
    new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  const ticketCustomerName = (t: Ticket) =>
    t.customer?.name || (t.purchaser?.first_name ? `${t.purchaser.first_name} ${t.purchaser.last_name ?? ''}`.trim() : '')
  const ticketCustomerEmail = (t: Ticket) =>
    t.customer?.email || t.purchaser?.email || t.guestEmail || ''
  const ticketCustomerType = (t: Ticket): 'Registered' | 'Guest' =>
    t.customer?.type === 'registered' || t.purchaser ? 'Registered' : 'Guest'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafaf8' }}>

      <Navbar cartId={user?.cartId} role={user?.role} cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartId={user?.cartId}
        onCartCountChange={setCartCount}
      />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 64px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#09090b', margin: '0 0 4px', fontFamily: "'Playfair Display', Georgia, serif" }}>
              Panel Admin
            </h1>
            <p style={{ fontSize: 13, color: '#71717a', margin: 0 }}>
              {data ? data.allUsers.length + ' usuarios · ' + data.allProducts.length + ' productos' : 'Cargando...'}
            </p>
          </div>
          <a
            href="/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 9, fontSize: 13, fontWeight: 500,
              backgroundColor: '#f4f4f5', color: '#3f3f46',
              border: '1px solid #e4e4e7', textDecoration: 'none',
              transition: 'background 0.15s',
              alignSelf: 'flex-start',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e4e4e7')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#f4f4f5')}
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            API Docs
          </a>
          {data && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { label: 'Usuarios', value: data.allUsers.length, color: '#3b82f6', bg: '#eff6ff' },
                { label: 'Premium', value: premiumCount, color: '#8b5cf6', bg: '#f5f3ff' },
                { label: 'Productos', value: data.allProducts.length, color: '#059669', bg: '#ecfdf5' },
                { label: 'Stock bajo', value: lowStock, color: '#f59e0b', bg: '#fffbeb' },
                { label: 'Sin stock', value: outOfStock, color: '#ef4444', bg: '#fef2f2' },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '8px 14px', textAlign: 'center', minWidth: 68 }}>
                  <p style={{ fontSize: 18, fontWeight: 700, color: s.color, margin: '0 0 1px' }}>{s.value}</p>
                  <p style={{ fontSize: 10, color: '#a1a1aa', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
                </div>
              ))}
              {tickets.length > 0 && (
                <div style={{ background: '#f4f4f5', borderRadius: 10, padding: '8px 14px', textAlign: 'center', minWidth: 68 }}>
                  <p style={{ fontSize: 18, fontWeight: 700, color: '#09090b', margin: '0 0 1px' }}>${totalRevenue.toFixed(0)}</p>
                  <p style={{ fontSize: 10, color: '#a1a1aa', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tabs + toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className={'tab-btn' + (tab === 'users' ? ' active' : '')} onClick={() => { setTab('users'); setSearch(''); setSortField('') }}>Usuarios</button>
            <button className={'tab-btn' + (tab === 'products' ? ' active' : '')} onClick={() => { setTab('products'); setSearch(''); setSortField('') }}>Productos</button>
            <button className={'tab-btn' + (tab === 'orders' ? ' active' : '')} onClick={() => { setTab('orders'); setSearch(''); setSortField('') }}>Pedidos</button>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div className="search-bar" style={{ width: 220 }}>
              <svg width="13" height="13" fill="none" stroke="#a1a1aa" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input placeholder={tab === 'users' ? 'Buscar usuario...' : tab === 'products' ? 'Buscar producto...' : 'Buscar pedido...'} value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {tab === 'products' && (
              <button className="new-btn" onClick={openCreate}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                Nuevo producto
              </button>
            )}
          </div>
        </div>

        {tab === 'products' && lowStock > 0 && (
          <div style={{ marginBottom: 14, padding: '10px 16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="15" height="15" fill="none" stroke="#f59e0b" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span style={{ fontSize: 13, color: '#92400e', fontWeight: 500 }}>{lowStock} producto{lowStock > 1 ? 's' : ''} con stock bajo (5 o menos) — click en el stock para editar</span>
          </div>
        )}

        {/* Table */}
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
          {loading && (
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3,4].map(i => <div key={i} className="skel" style={{ height: 40 }} />)}
            </div>
          )}

          {/* USERS */}
          {!loading && tab === 'users' && (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead><tr>
                  <th onClick={() => toggleSort('first_name')}>Nombre {sortIcon('first_name')}</th>
                  <th onClick={() => toggleSort('email')}>Email {sortIcon('email')}</th>
                  <th onClick={() => toggleSort('lastLoginDate')}>Último acceso {sortIcon('lastLoginDate')}</th>
                  <th onClick={() => toggleSort('role')}>Rol {sortIcon('role')}</th>
                  <th></th>
                </tr></thead>
                <tbody>
                  {filteredUsers.length === 0
                    ? <tr><td colSpan={5} style={{ textAlign: 'center', color: '#a1a1aa', padding: '40px 0' }}>Sin resultados</td></tr>
                    : filteredUsers.map(u => (
                      <tr key={u._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 30, height: 30, borderRadius: '50%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#71717a', flexShrink: 0 }}>
                              {(u.first_name?.[0] || u.email[0]).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 500 }}>{u.first_name} {u.last_name}</span>
                          </div>
                        </td>
                        <td style={{ color: '#71717a' }}>{u.email}</td>
                        <td style={{ color: '#a1a1aa', fontSize: 12 }}>{u.lastLoginDate ? fmt(u.lastLoginDate) : '—'}</td>
                        <td>
                          <select className="role-select" value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)}>
                            <option value="user">user</option>
                            <option value="premium">premium</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                        <td>
                          <button className="del-btn" aria-label={`Eliminar usuario ${u.email}`} onClick={() => setConfirmDelete('user:' + u._id)}>
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )}

          {/* PRODUCTS */}
          {!loading && tab === 'products' && (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead><tr>
                  <th onClick={() => toggleSort('title')}>Producto {sortIcon('title')}</th>
                  <th onClick={() => toggleSort('category')}>Categoría {sortIcon('category')}</th>
                  <th onClick={() => toggleSort('price')}>Precio {sortIcon('price')}</th>
                  <th onClick={() => toggleSort('stock')}>Stock {sortIcon('stock')}</th>
                  <th></th>
                </tr></thead>
                <tbody>
                  {filteredProducts.length === 0
                    ? <tr><td colSpan={5} style={{ textAlign: 'center', color: '#a1a1aa', padding: '40px 0' }}>Sin resultados</td></tr>
                    : filteredProducts.map(p => (
                      <tr key={p._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img src={p.thumbnail} alt={p.title} style={{ width: 34, height: 42, objectFit: 'cover', borderRadius: 5, flexShrink: 0, backgroundColor: '#f4f4f5' }} onError={e => { (e.target as HTMLImageElement).style.opacity = '0' }} />
                            <div>
                              <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{p.title}</div>
                              {p.author && <div style={{ fontSize: 11, color: '#a1a1aa', marginTop: 1 }}>{p.author}</div>}
                            </div>
                          </div>
                        </td>
                        <td><span className="badge-cat">{p.category}</span></td>
                        <td style={{ fontWeight: 600 }}>${p.price.toFixed(2)}</td>
                        <td>
                          {editingStock === p._id
                            ? <input ref={stockInputRef} className="stock-input" type="number" min={0} value={stockValue}
                                onChange={e => setStockValue(e.target.value)}
                                onBlur={() => commitStock(p._id)}
                                onKeyDown={e => { if (e.key === 'Enter') commitStock(p._id); if (e.key === 'Escape') setEditingStock(null) }} />
                            : <span className="stock-cell" title="Click para editar" onClick={() => startEditStock(p._id, p.stock)}
                                style={{ fontSize: 12, fontWeight: 600, color: p.stock === 0 ? '#dc2626' : p.stock <= 5 ? '#f59e0b' : '#16a34a' }}>
                                {p.stock === 0 ? 'Sin stock' : p.stock + ' u.'}
                              </span>
                          }
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 2 }}>
                            <button className="edit-btn" title="Editar" onClick={() => openEdit(p)}>
                              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <a href={'/products/' + p._id} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', color: '#a1a1aa', padding: 5, borderRadius: 6, textDecoration: 'none' }} title="Ver en tienda">
                              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </a>
                            <button className="del-btn" title="Eliminar" aria-label={`Eliminar producto ${p.title}`} onClick={() => setConfirmDelete('product:' + p._id)}>
                              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )}

          {/* ORDERS */}
          {tab === 'orders' && (
            <div style={{ overflowX: 'auto' }}>
              {ticketsLoading
                ? <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>{[1,2,3].map(i => <div key={i} className="skel" style={{ height: 36 }} />)}</div>
                : <table className="admin-table">
                    <thead><tr>
                      <th onClick={() => toggleSort('code')}>Código {sortIcon('code')}</th>
                      <th>Comprador</th>
                      <th>Tipo</th>
                      <th onClick={() => toggleSort('purchase_datetime')}>Fecha {sortIcon('purchase_datetime')}</th>
                      <th onClick={() => toggleSort('amount')}>Total {sortIcon('amount')}</th>
                    </tr></thead>
                    <tbody>
                      {filteredTickets.length === 0
                        ? <tr><td colSpan={5} style={{ textAlign: 'center', color: '#a1a1aa', padding: '40px 0' }}>{tickets.length === 0 ? 'Aun no hay pedidos' : 'Sin resultados'}</td></tr>
                        : filteredTickets.map(t => (
                          <tr key={t._id} onClick={() => setSelectedTicket(t)} style={{ cursor: 'pointer' }}>
                            <td><span style={{ fontFamily: 'monospace', fontSize: 12, color: '#3b82f6', fontWeight: 600 }}>{(t.code ?? '').slice(0,8).toUpperCase()}</span></td>
                            <td>
                              <div style={{ fontWeight: 500 }}>{ticketCustomerName(t) || 'Invitado'}</div>
                              <div style={{ fontSize: 11, color: '#a1a1aa' }}>{ticketCustomerEmail(t) || '—'}</div>
                            </td>
                            <td>
                              <span className="badge-cat" style={ticketCustomerType(t) === 'Guest' ? { background: '#fffbeb', color: '#b45309' } : undefined}>
                                {ticketCustomerType(t)}
                              </span>
                            </td>
                            <td style={{ color: '#71717a', fontSize: 12 }}>{t.purchase_datetime ? fmt(t.purchase_datetime) : '—'}</td>
                            <td style={{ fontWeight: 700 }}>${(t.amount ?? 0).toFixed(2)}</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
              }
            </div>
          )}
        </div>

        {!loading && tab === 'users' && (
          <div style={{ marginTop: 20, padding: '14px 18px', border: '1px solid #fee2e2', borderRadius: 12, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#dc2626', margin: '0 0 2px' }}>Eliminar usuarios inactivos</p>
              <p style={{ fontSize: 12, color: '#ef4444', margin: 0 }}>Elimina cuentas sin acceso en los últimos 30 días.</p>
            </div>
            <button onClick={handleCleanInactive} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #fca5a5', background: 'white', color: '#dc2626', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              Limpiar inactivos
            </button>
          </div>
        )}
      </main>

      <Footer />

      {/* PRODUCT MODAL */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#09090b', margin: 0, fontFamily: "'Playfair Display', Georgia, serif" }}>
                {modalMode === 'create' ? 'Nuevo producto' : 'Editar producto'}
              </h2>
              <button onClick={() => setModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#a1a1aa', padding: 4, borderRadius: 6, display: 'flex' }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="field-group">
              <label className="field-label">Título *</label>
              <input className="field-input" value={formData.title ?? ''} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} placeholder="Ej: El nombre del viento" />
            </div>
            <div className="field-row">
              <div className="field-group">
                <label className="field-label">Autor</label>
                <input className="field-input" value={formData.author ?? ''} onChange={e => setFormData(f => ({ ...f, author: e.target.value }))} placeholder="Ej: Patrick Rothfuss" />
              </div>
              <div className="field-group">
                <label className="field-label">Categoría</label>
                <select className="field-input" value={formData.category ?? 'Ficcion'} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="field-group">
              <label className="field-label">Descripción</label>
              <textarea className="field-input" rows={2} style={{ resize: 'vertical' }} value={formData.description ?? ''} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} placeholder="Breve descripción del libro..." />
            </div>
            <div className="field-row">
              <div className="field-group">
                <label className="field-label">Precio *</label>
                <input className="field-input" type="number" min={0} step={0.01} value={formData.price ?? 0} onChange={e => setFormData(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div className="field-group">
                <label className="field-label">Stock *</label>
                <input className="field-input" type="number" min={0} value={formData.stock ?? 0} onChange={e => setFormData(f => ({ ...f, stock: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>
            <div className="field-row">
              <div className="field-group">
                <label className="field-label">Código *</label>
                <input className="field-input" value={formData.code ?? ''} onChange={e => setFormData(f => ({ ...f, code: e.target.value }))} placeholder="Ej: SKU-001" />
              </div>
              <div className="field-group">
                <label className="field-label">Thumbnail URL *</label>
                <input className="field-input" value={formData.thumbnail ?? ''} onChange={e => setFormData(f => ({ ...f, thumbnail: e.target.value }))} placeholder="https://..." />
              </div>
            </div>
            {formData.thumbnail && (
              <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src={formData.thumbnail} alt="preview" style={{ width: 44, height: 56, objectFit: 'cover', borderRadius: 6, border: '1px solid #e4e4e7' }} onError={e => { (e.target as HTMLImageElement).style.opacity = '0.3' }} />
                <span style={{ fontSize: 12, color: '#a1a1aa' }}>Preview de portada</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={() => setModalOpen(false)} style={{ flex: 1, padding: '10px', border: '1px solid #e4e4e7', borderRadius: 10, background: 'white', color: '#71717a', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
              <button onClick={handleSaveProduct} disabled={saving} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 10, background: saving ? '#a1a1aa' : '#09090b', color: 'white', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                {saving ? 'Guardando...' : modalMode === 'create' ? 'Crear producto' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER DETAIL */}
      {selectedTicket && (() => {
        const t = selectedTicket
        const name = ticketCustomerName(t) || 'Invitado'
        const email = ticketCustomerEmail(t) || '—'
        const type = ticketCustomerType(t)
        const shipping = t.customer?.shippingAddress
        const billing = t.customer?.billingAddress
        const subtotal = t.subtotal ?? t.amount + (t.discountAmount ?? 0)
        return (
          <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
            <div className="modal-card modal-card-wide" onClick={e => e.stopPropagation()} style={{ maxHeight: '86vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: '#09090b', margin: '0 0 4px', fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Pedido #{(t.code ?? '').slice(0, 8).toUpperCase()}
                  </h2>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#16a34a', background: '#ecfdf5', padding: '3px 9px', borderRadius: 999 }}>
                    ● Pagado
                  </span>
                </div>
                <button onClick={() => setSelectedTicket(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#a1a1aa', padding: 4, borderRadius: 6, display: 'flex' }}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Customer */}
              <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 12, padding: 14, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Cliente</p>
                  <span className="badge-cat" style={type === 'Guest' ? { background: '#fffbeb', color: '#b45309' } : undefined}>{type}</span>
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#09090b', margin: '0 0 2px' }}>{name}</p>
                <p style={{ fontSize: 12, color: '#71717a', margin: 0 }}>{email}</p>
                {t.customer?.phone && <p style={{ fontSize: 12, color: '#71717a', margin: '2px 0 0' }}>{t.customer.phone}</p>}
                {(shipping || billing) && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {shipping && (
                      <div>
                        <p style={{ fontSize: 10, fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 2px' }}>Envío</p>
                        <p style={{ fontSize: 12, color: '#3f3f46', margin: 0, whiteSpace: 'pre-wrap' }}>{shipping}</p>
                      </div>
                    )}
                    {billing && billing !== shipping && (
                      <div>
                        <p style={{ fontSize: 10, fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 2px' }}>Facturación</p>
                        <p style={{ fontSize: 12, color: '#3f3f46', margin: 0, whiteSpace: 'pre-wrap' }}>{billing}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Meta */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 2px' }}>Fecha</p>
                  <p style={{ fontSize: 13, color: '#09090b', margin: 0 }}>{t.purchase_datetime ? fmtFull(t.purchase_datetime) : '—'}</p>
                </div>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 2px' }}>Método de pago</p>
                  <p style={{ fontSize: 13, color: '#09090b', margin: 0 }}>Tarjeta (Stripe)</p>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 2px' }}>PaymentIntent ID</p>
                  <p style={{ fontSize: 12, color: '#3f3f46', margin: 0, fontFamily: 'monospace', wordBreak: 'break-all' }}>{t.paymentIntentId || '—'}</p>
                </div>
              </div>

              {/* Items */}
              <p style={{ fontSize: 11, fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>Productos</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {(t.items ?? []).map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {item.thumbnail && (
                      <img src={item.thumbnail} alt={item.title} style={{ width: 32, height: 42, objectFit: 'cover', borderRadius: 4, flexShrink: 0, background: '#f4f4f5' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#09090b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                      <p style={{ fontSize: 11, color: '#a1a1aa', margin: '2px 0 0' }}>{item.quantity} × ${item.unitPrice.toFixed(2)}</p>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#09090b', flexShrink: 0 }}>${item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#71717a' }}>Subtotal</span>
                  <span style={{ color: '#09090b' }}>${subtotal.toFixed(2)}</span>
                </div>
                {!!t.discountAmount && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#16a34a' }}>Descuento {t.discountRate ? `(${Math.round(t.discountRate * 100)}%)` : ''}</span>
                    <span style={{ color: '#16a34a' }}>−${t.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, paddingTop: 6, borderTop: '1px solid #f4f4f5' }}>
                  <span style={{ color: '#09090b' }}>Total</span>
                  <span style={{ color: '#09090b' }}>${(t.amount ?? 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* CONFIRM DELETE */}
      {confirmDelete && (
        <div className="confirm-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="confirm-card" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>&#9888;</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#09090b', margin: '0 0 8px' }}>¿Estás seguro?</h3>
            <p style={{ fontSize: 13, color: '#71717a', margin: '0 0 22px', lineHeight: 1.5 }}>Esta acción no se puede deshacer.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: '9px', border: '1px solid #e4e4e7', borderRadius: 9, background: 'white', color: '#71717a', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
              <button onClick={() => { const [type, id] = confirmDelete.split(':'); if (type === 'user') handleDeleteUser(id); else handleDeleteProduct(id) }} style={{ flex: 1, padding: '9px', border: 'none', borderRadius: 9, background: '#dc2626', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
