import { useState, useEffect, useMemo } from 'react'
import { getLuzEntries, addLuzEntry, deleteLuzEntry } from '../services/api'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import styles from './CasaPage.module.css'

const TABS = [
  { id: 'luz', label: 'Luz' },
]

const LUZ_VIEWS = [
  { id: 'form',    label: 'Nova fatura' },
  { id: 'tabela',  label: 'Tabela' },
  { id: 'grafico', label: 'Gráfico' },
]

function Filters({ years, filters, onChange }) {
  return (
    <div className={styles.filters}>
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Ano</label>
        <select
          className={styles.filterSelect}
          value={filters.year}
          onChange={(e) => onChange({ ...filters, year: e.target.value })}
        >
          <option value="">Todos</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>De</label>
        <input
          className={styles.filterInput}
          type="date"
          value={filters.from}
          onChange={(e) => onChange({ ...filters, from: e.target.value })}
        />
      </div>
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Até</label>
        <input
          className={styles.filterInput}
          type="date"
          value={filters.to}
          onChange={(e) => onChange({ ...filters, to: e.target.value })}
        />
      </div>
      {(filters.year || filters.from || filters.to) && (
        <button
          className={styles.filterClear}
          onClick={() => onChange({ year: '', from: '', to: '' })}
        >
          Limpar
        </button>
      )}
    </div>
  )
}

function LuzTab() {
  const [view, setView] = useState('form')
  const [date, setDate] = useState('')
  const [value, setValue] = useState('')
  const [entries, setEntries] = useState([])
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({ year: '', from: '', to: '' })

  useEffect(() => {
    getLuzEntries().then(setEntries).catch(() => {})
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!date || !value) { setError('Preenche a data e o valor.'); return }
    try {
      const entry = await addLuzEntry(date, parseFloat(value))
      setEntries((prev) => [entry, ...prev])
      setDate('')
      setValue('')
      setError(null)
    } catch {
      setError('Erro ao guardar o registo.')
    }
  }

  async function handleDelete(id) {
    try {
      await deleteLuzEntry(id)
      setEntries((prev) => prev.filter((e) => e.id !== id))
    } catch {
      setError('Erro ao apagar o registo.')
    }
  }

  const sortedAsc = useMemo(
    () => [...entries].sort((a, b) => new Date(a.date) - new Date(b.date)),
    [entries]
  )

  const years = useMemo(
    () => [...new Set(sortedAsc.map((e) => new Date(e.date).getFullYear()))],
    [sortedAsc]
  )

  const filtered = useMemo(() => {
    return sortedAsc.filter((e) => {
      const d = new Date(e.date)
      if (filters.year && d.getFullYear() !== Number(filters.year)) return false
      if (filters.from && e.date < filters.from) return false
      if (filters.to   && e.date > filters.to)   return false
      return true
    })
  }, [sortedAsc, filters])

  return (
    <div className={styles.luzContent}>
      <div className={styles.segmented}>
        {LUZ_VIEWS.map((v) => (
          <button
            key={v.id}
            className={`${styles.seg} ${view === v.id ? styles.segActive : ''}`}
            onClick={() => setView(v.id)}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view === 'form' && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Data</label>
            <input
              className={styles.input}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Valor pago (€)</label>
            <input
              className={styles.input}
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.submitBtn} type="submit">Adicionar</button>
        </form>
      )}

      {view === 'tabela' && (
        <>
          <Filters years={years} filters={filters} onChange={setFilters} />
          {filtered.length === 0 ? (
            <p className={styles.empty}>Nenhum registo encontrado.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Data</th>
                  <th className={styles.th}>Valor pago</th>
                  <th className={styles.th}>Diferença</th>
                  <th className={styles.th}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry, i) => {
                  const prev = filtered[i - 1]
                  const diff = prev ? Number(entry.value) - Number(prev.value) : null
                  return (
                    <tr key={entry.id} className={styles.tr}>
                      <td className={styles.td}>
                        {new Date(entry.date).toLocaleDateString('pt-PT', {
                          day: '2-digit', month: 'long', year: 'numeric',
                        })}
                      </td>
                      <td className={`${styles.td} ${styles.tdValue}`}>
                        {Number(entry.value).toFixed(2)} €
                      </td>
                      <td className={styles.td}>
                        {diff === null ? (
                          <span className={styles.diffNone}>—</span>
                        ) : (
                          <span className={diff > 0 ? styles.diffUp : diff < 0 ? styles.diffDown : styles.diffNone}>
                            {diff > 0 ? '+' : ''}{diff.toFixed(2)} €
                          </span>
                        )}
                      </td>
                      <td className={`${styles.td} ${styles.tdAction}`}>
                        <button className={styles.deleteBtn} onClick={() => handleDelete(entry.id)}>
                          Apagar
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </>
      )}

      {view === 'grafico' && (
        <>
          <Filters years={years} filters={filters} onChange={setFilters} />
          {filtered.length < 2 ? (
            <p className={styles.empty}>Adiciona pelo menos 2 registos para ver o gráfico.</p>
          ) : (
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={filtered.map((e) => ({
                    data: new Date(e.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }),
                    valor: Number(e.value),
                  }))}
                  margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="data" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} unit=" €" />
                  <Tooltip
                    formatter={(v) => [`${v.toFixed(2)} €`, 'Valor']}
                    contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }}
                    labelStyle={{ color: 'var(--text)' }}
                    itemStyle={{ color: 'var(--accent)' }}
                  />
                  <Bar dataKey="valor" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function CasaPage() {
  const [tab, setTab] = useState('luz')

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Casa</h1>

      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`${styles.tab} ${tab === t.id ? styles.active : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'luz' && <LuzTab />}
    </div>
  )
}

export default CasaPage
