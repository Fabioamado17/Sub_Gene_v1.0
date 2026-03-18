import { useState, useEffect } from 'react'
import { getCompras, addCompra, toggleCompra, deleteCompra } from '../services/api'
import styles from './ComprasPage.module.css'

function ComprasPage() {
  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    getCompras().then(setItems).catch(() => {})
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) { setError('Escreve o nome do artigo.'); return }
    try {
      const item = await addCompra(name.trim(), quantity.trim())
      setItems((prev) => [item, ...prev])
      setName('')
      setQuantity('')
      setError(null)
    } catch {
      setError('Erro ao adicionar o artigo.')
    }
  }

  async function handleToggle(id) {
    try {
      const updated = await toggleCompra(id)
      setItems((prev) => {
        const list = prev.map((i) => (i.id === id ? updated : i))
        return [...list.filter((i) => !i.done), ...list.filter((i) => i.done)]
      })
    } catch {}
  }

  async function handleDelete(id) {
    try {
      await deleteCompra(id)
      setItems((prev) => prev.filter((i) => i.id !== id))
    } catch {}
  }

  const pending = items.filter((i) => !i.done)
  const done    = items.filter((i) => i.done)

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Compras para a casa</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.nameInput}
          type="text"
          placeholder="Artigo..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className={styles.qtyInput}
          type="text"
          placeholder="Qtd."
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <button className={styles.addBtn} type="submit">Adicionar</button>
      </form>
      {error && <p className={styles.error}>{error}</p>}

      {items.length === 0 && (
        <p className={styles.empty}>A lista está vazia.</p>
      )}

      {pending.length > 0 && (
        <ul className={styles.list}>
          {pending.map((item) => (
            <li key={item.id} className={styles.item}>
              <button className={styles.check} onClick={() => handleToggle(item.id)}>
                <span className={styles.checkBox} />
              </button>
              <span className={styles.itemName}>{item.name}</span>
              {item.quantity && <span className={styles.itemQty}>{item.quantity}</span>}
              <button className={styles.deleteBtn} onClick={() => handleDelete(item.id)}>✕</button>
            </li>
          ))}
        </ul>
      )}

      {done.length > 0 && (
        <>
          <p className={styles.doneLabel}>Comprado ({done.length})</p>
          <ul className={styles.list}>
            {done.map((item) => (
              <li key={item.id} className={`${styles.item} ${styles.itemDone}`}>
                <button className={styles.check} onClick={() => handleToggle(item.id)}>
                  <span className={`${styles.checkBox} ${styles.checkBoxDone}`}>✓</span>
                </button>
                <span className={styles.itemName}>{item.name}</span>
                {item.quantity && <span className={styles.itemQty}>{item.quantity}</span>}
                <button className={styles.deleteBtn} onClick={() => handleDelete(item.id)}>✕</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export default ComprasPage
