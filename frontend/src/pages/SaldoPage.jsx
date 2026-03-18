import { useState, useEffect, useMemo } from 'react'
import { getLuzEntries, getAguaEntries, getGasEntries } from '../services/api'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import styles from './SaldoPage.module.css'

function groupByMonth(entries) {
  const map = {}
  entries.forEach((e) => {
    const key = e.date.slice(0, 7)
    map[key] = (map[key] ?? 0) + Number(e.value)
  })
  return map
}

function SaldoPage() {
  const [luz,  setLuz]  = useState([])
  const [agua, setAgua] = useState([])
  const [gas,  setGas]  = useState([])
  const [view, setView] = useState('tabela')

  useEffect(() => {
    getLuzEntries().then(setLuz).catch(() => {})
    getAguaEntries().then(setAgua).catch(() => {})
    getGasEntries().then(setGas).catch(() => {})
  }, [])

  const months = useMemo(() => {
    const luzMap  = groupByMonth(luz)
    const aguaMap = groupByMonth(agua)
    const gasMap  = groupByMonth(gas)
    const keys = [...new Set([...Object.keys(luzMap), ...Object.keys(aguaMap), ...Object.keys(gasMap)])].sort()
    return keys.map((key) => {
      const l = luzMap[key]  ?? 0
      const a = aguaMap[key] ?? 0
      const g = gasMap[key]  ?? 0
      return { key, label: new Date(key + '-01').toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' }), luz: l, agua: a, gas: g, total: l + a + g }
    })
  }, [luz, agua, gas])

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Saldo mensal</h1>

      <div className={styles.segmented}>
        {[{ id: 'tabela', label: 'Tabela' }, { id: 'grafico', label: 'Gráfico' }].map((v) => (
          <button
            key={v.id}
            className={`${styles.seg} ${view === v.id ? styles.segActive : ''}`}
            onClick={() => setView(v.id)}
          >
            {v.label}
          </button>
        ))}
      </div>

      {months.length === 0 && (
        <p className={styles.empty}>Ainda não há registos em nenhuma categoria.</p>
      )}

      {view === 'tabela' && months.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Mês</th>
              <th className={styles.th}>Luz</th>
              <th className={styles.th}>Água</th>
              <th className={styles.th}>Gás</th>
              <th className={styles.th}>Total</th>
            </tr>
          </thead>
          <tbody>
            {months.map((m) => (
              <tr key={m.key} className={styles.tr}>
                <td className={styles.td} style={{ textTransform: 'capitalize' }}>{m.label}</td>
                <td className={styles.td}>{m.luz  > 0 ? `${m.luz.toFixed(2)} €`  : <span className={styles.none}>—</span>}</td>
                <td className={styles.td}>{m.agua > 0 ? `${m.agua.toFixed(2)} €` : <span className={styles.none}>—</span>}</td>
                <td className={styles.td}>{m.gas  > 0 ? `${m.gas.toFixed(2)} €`  : <span className={styles.none}>—</span>}</td>
                <td className={`${styles.td} ${styles.tdTotal}`}>{m.total.toFixed(2)} €</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {view === 'grafico' && months.length > 0 && (
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={months.map((m) => ({ name: m.key, luz: m.luz, agua: m.agua, gas: m.gas }))}
              margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} unit=" €" />
              <Tooltip
                formatter={(v, name) => [`${v.toFixed(2)} €`, name.charAt(0).toUpperCase() + name.slice(1)]}
                contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }}
                labelStyle={{ color: 'var(--text)' }}
              />
              <Legend wrapperStyle={{ fontSize: '0.85rem', color: 'var(--text-muted)' }} />
              <Bar dataKey="luz"  name="Luz"  stackId="a" fill="#6366f1" />
              <Bar dataKey="agua" name="Água" stackId="a" fill="#38bdf8" />
              <Bar dataKey="gas"  name="Gás"  stackId="a" fill="#fb923c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default SaldoPage
