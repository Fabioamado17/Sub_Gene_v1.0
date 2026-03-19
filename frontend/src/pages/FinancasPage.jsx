import { useState, useEffect, useMemo } from 'react'
import {
  getLuzEntries, getAguaEntries, getGasEntries,
  getPrestacaoEntries, getTelevisaoEntries,
  getOrdenadoEntries, addOrdenadoEntry, deleteOrdenadoEntry, updateOrdenadoEntry,
  getComprasEntries,
} from '../services/api'
import {
  ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import styles from './FinancasPage.module.css'

const CARDS = [
  { id: 'saldo',    label: 'Saldo mensal', icon: '📊', desc: 'Visão consolidada de todas as despesas e receitas por mês.' },
  { id: 'ordenado', label: 'Ordenado',     icon: '💰', desc: 'Registo do ordenado mensal.' },
]

function groupByAdjustedMonth(entries) {
  const map = {}
  entries.forEach((e) => {
    const d = new Date(e.date + 'T12:00:00')
    if (d.getDate() >= 22) { d.setDate(1); d.setMonth(d.getMonth() + 1) }
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    map[key] = (map[key] ?? 0) + Number(e.value)
  })
  return map
}

function SaldoTab() {
  const [luz,       setLuz]       = useState([])
  const [agua,      setAgua]      = useState([])
  const [gas,       setGas]       = useState([])
  const [prestacao, setPrestacao] = useState([])
  const [televisao, setTelevisao] = useState([])
  const [ordenado,  setOrdenado]  = useState([])
  const [compras,   setCompras]   = useState([])
  const [view, setView] = useState('tabela')

  useEffect(() => {
    getLuzEntries().then(setLuz).catch(() => {})
    getAguaEntries().then(setAgua).catch(() => {})
    getGasEntries().then(setGas).catch(() => {})
    getPrestacaoEntries().then(setPrestacao).catch(() => {})
    getTelevisaoEntries().then(setTelevisao).catch(() => {})
    getOrdenadoEntries().then(setOrdenado).catch(() => {})
    getComprasEntries().then(setCompras).catch(() => {})
  }, [])

  const months = useMemo(() => {
    const luzMap       = groupByAdjustedMonth(luz)
    const aguaMap      = groupByAdjustedMonth(agua)
    const gasMap       = groupByAdjustedMonth(gas)
    const prestacaoMap = groupByAdjustedMonth(prestacao)
    const televisaoMap = groupByAdjustedMonth(televisao)
    const ordenadoMap  = groupByAdjustedMonth(ordenado)
    const comprasMap   = groupByAdjustedMonth(compras)
    const keys = [...new Set([
      ...Object.keys(luzMap), ...Object.keys(aguaMap), ...Object.keys(gasMap),
      ...Object.keys(prestacaoMap), ...Object.keys(televisaoMap),
      ...Object.keys(ordenadoMap), ...Object.keys(comprasMap),
    ])].sort()
    return keys.map((key) => {
      const l = luzMap[key] ?? 0, a = aguaMap[key] ?? 0, g = gasMap[key] ?? 0
      const p = prestacaoMap[key] ?? 0, t = televisaoMap[key] ?? 0
      const o = ordenadoMap[key] ?? 0, c = comprasMap[key] ?? 0
      return {
        key,
        label: new Date(key + '-01').toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' }),
        luz: l, agua: a, gas: g, prestacao: p, televisao: t, compras: c, ordenado: o,
        total: l + a + g + p + t + c,
      }
    })
  }, [luz, agua, gas, prestacao, televisao, ordenado, compras])

  return (
    <div className={styles.tabContent}>
      <div className={styles.segmented}>
        {[{ id: 'tabela', label: 'Tabela' }, { id: 'grafico', label: 'Gráfico' }].map((v) => (
          <button
            key={v.id}
            className={`${styles.seg} ${view === v.id ? styles.segActive : ''}`}
            onClick={() => setView(v.id)}
          >{v.label}</button>
        ))}
      </div>

      {months.length === 0 && (
        <p className={styles.empty}>Ainda não há registos em nenhuma categoria.</p>
      )}

      {view === 'tabela' && months.length > 0 && (
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Mês</th>
                <th className={styles.th}>Ordenado</th>
                <th className={styles.th}>Luz</th>
                <th className={styles.th}>Água</th>
                <th className={styles.th}>Gás</th>
                <th className={styles.th}>Prestação</th>
                <th className={styles.th}>Televisão</th>
                <th className={styles.th}>Compras</th>
                <th className={styles.th}>Saldo final</th>
              </tr>
            </thead>
            <tbody>
              {months.map((m) => (
                <tr key={m.key} className={styles.tr}>
                  <td className={styles.td} style={{ textTransform: 'capitalize' }}>{m.label}</td>
                  <td className={`${styles.td} ${styles.tdOrdenado}`}>{m.ordenado > 0 ? `${m.ordenado.toFixed(2)} €` : <span className={styles.none}>—</span>}</td>
                  <td className={styles.td}>{m.luz       > 0 ? `${m.luz.toFixed(2)} €`       : <span className={styles.none}>—</span>}</td>
                  <td className={styles.td}>{m.agua      > 0 ? `${m.agua.toFixed(2)} €`      : <span className={styles.none}>—</span>}</td>
                  <td className={styles.td}>{m.gas       > 0 ? `${m.gas.toFixed(2)} €`       : <span className={styles.none}>—</span>}</td>
                  <td className={styles.td}>{m.prestacao > 0 ? `${m.prestacao.toFixed(2)} €` : <span className={styles.none}>—</span>}</td>
                  <td className={styles.td}>{m.televisao > 0 ? `${m.televisao.toFixed(2)} €` : <span className={styles.none}>—</span>}</td>
                  <td className={styles.td}>{m.compras   > 0 ? `${m.compras.toFixed(2)} €`   : <span className={styles.none}>—</span>}</td>
                  <td className={`${styles.td} ${styles.tdSaldo}`} style={{ color: m.ordenado - m.total >= 0 ? '#22c55e' : '#ef4444' }}>
                    {(m.ordenado - m.total).toFixed(2)} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === 'grafico' && months.length > 0 && (
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={months.map((m) => ({
                name: m.key,
                saldo: Number((m.ordenado - m.total).toFixed(2)),
              }))}
              margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} unit=" €" />
              <Tooltip
                formatter={(v) => [`${v.toFixed(2)} €`, 'Saldo final']}
                contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }}
                labelStyle={{ color: 'var(--text)' }}
                itemStyle={{ color: 'var(--text)' }}
              />
              <Bar dataKey="saldo" name="Saldo final" radius={[4, 4, 0, 0]}>
                {months.map((m) => {
                  const saldo = m.ordenado - m.total
                  return <Cell key={m.key} fill={saldo >= 0 ? '#22c55e' : '#ef4444'} />
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

function OrdenadoTab() {
  const [view, setView]       = useState('form')
  const [month, setMonth]     = useState('')
  const [value, setValue]     = useState('')
  const [entries, setEntries] = useState([])
  const [error, setError]     = useState(null)
  const [editId, setEditId]   = useState(null)
  const [editMonth, setEditMonth] = useState('')
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    getOrdenadoEntries().then(setEntries).catch(() => {})
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!month || !value) { setError('Preenche o mês e o valor.'); return }
    try {
      const entry = await addOrdenadoEntry(`${month}-01`, parseFloat(value))
      setEntries((prev) => [entry, ...prev])
      setMonth(''); setValue(''); setError(null)
    } catch {
      setError('Erro ao guardar o registo.')
    }
  }

  async function handleDelete(id) {
    try {
      await deleteOrdenadoEntry(id)
      setEntries((prev) => prev.filter((e) => e.id !== id))
    } catch {}
  }

  function startEdit(entry) {
    setEditId(entry.id)
    setEditMonth(entry.date.slice(0, 7))
    setEditValue(String(entry.value))
  }

  async function handleUpdate(id) {
    try {
      const updated = await updateOrdenadoEntry(id, `${editMonth}-01`, parseFloat(editValue))
      setEntries((prev) => prev.map((e) => e.id === id ? updated : e))
      setEditId(null)
    } catch {
      setError('Erro ao guardar alterações.')
    }
  }

  const sortedAsc = useMemo(
    () => [...entries].sort((a, b) => new Date(a.date) - new Date(b.date)),
    [entries]
  )

  return (
    <div className={styles.tabContent}>
      <div className={styles.segmented}>
        {[{ id: 'form', label: 'Novo registo' }, { id: 'tabela', label: 'Tabela' }, { id: 'grafico', label: 'Gráfico' }].map((v) => (
          <button
            key={v.id}
            className={`${styles.seg} ${view === v.id ? styles.segActive : ''}`}
            onClick={() => setView(v.id)}
          >{v.label}</button>
        ))}
      </div>

      {view === 'form' && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Mês</label>
            <input
              className={styles.input}
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              onClick={(e) => e.target.showPicker?.()}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Ordenado (€)</label>
            <input
              className={styles.input}
              type="number"
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
        sortedAsc.length === 0 ? (
          <p className={styles.empty}>Nenhum registo encontrado.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Mês</th>
                <th className={styles.th}>Ordenado</th>
                <th className={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {sortedAsc.map((entry) => {
                if (editId === entry.id) {
                  return (
                    <tr key={entry.id} className={styles.tr}>
                      <td className={styles.td}>
                        <input className={styles.inlineInput} type="month" value={editMonth}
                          onChange={(e) => setEditMonth(e.target.value)}
                          onClick={(e) => e.target.showPicker?.()}
                        />
                      </td>
                      <td className={styles.td}>
                        <input className={styles.inlineInput} type="number" step="0.01"
                          value={editValue} onChange={(e) => setEditValue(e.target.value)}
                        />
                      </td>
                      <td className={`${styles.td} ${styles.tdAction}`}>
                        <button className={styles.saveBtn} onClick={() => handleUpdate(entry.id)}>Guardar</button>
                        <button className={styles.cancelBtn} onClick={() => setEditId(null)}>Cancelar</button>
                      </td>
                    </tr>
                  )
                }
                return (
                  <tr key={entry.id} className={styles.tr}>
                    <td className={styles.td}>
                      {new Date(entry.date).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}
                    </td>
                    <td className={`${styles.td} ${styles.tdValue}`}>
                      {Number(entry.value).toFixed(2)} €
                    </td>
                    <td className={`${styles.td} ${styles.tdAction}`}>
                      <button className={styles.editBtn} onClick={() => startEdit(entry)}>Editar</button>
                      <button className={styles.deleteBtn} onClick={() => handleDelete(entry.id)}>Apagar</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )
      )}

      {view === 'grafico' && (
        sortedAsc.length < 2 ? (
          <p className={styles.empty}>Adiciona pelo menos 2 registos para ver o gráfico.</p>
        ) : (
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedAsc.map((e) => ({
                  name: new Date(e.date).toLocaleDateString('pt-PT', { month: 'short', year: '2-digit' }),
                  valor: Number(e.value),
                }))}
                margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} unit=" €" />
                <Tooltip
                  formatter={(v) => [`${v.toFixed(2)} €`, 'Ordenado']}
                  contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }}
                  labelStyle={{ color: 'var(--text)' }}
                  itemStyle={{ color: '#22c55e' }}
                />
                <Bar dataKey="valor" name="Ordenado" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )
      )}
    </div>
  )
}

function FinancasPage() {
  const [section, setSection] = useState(null)

  if (section) {
    const card = CARDS.find((c) => c.id === section)
    return (
      <div className={`${styles.page} ${styles.pageWide}`}>
        <div className={styles.sectionHeader}>
          <button className={styles.backBtn} onClick={() => setSection(null)}>← Finanças</button>
          <h1 className={styles.title}>{card.icon} {card.label}</h1>
        </div>
        {section === 'saldo' ? <SaldoTab /> : <OrdenadoTab />}
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Finanças</h1>
      <div className={styles.grid}>
        {CARDS.map((card) => (
          <button key={card.id} className={styles.card} onClick={() => setSection(card.id)}>
            <span className={styles.cardIcon}>{card.icon}</span>
            <span className={styles.cardTitle}>{card.label}</span>
            <span className={styles.cardDesc}>{card.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default FinancasPage
