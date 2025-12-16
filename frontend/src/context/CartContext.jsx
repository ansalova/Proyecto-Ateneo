import React, { createContext, useState } from 'react'

export const CartContext = createContext()

export function CartProvider({ children }) {
  const [items, setItems] = useState([])

  const add = product => {
    setItems(prev => {
      const found = prev.find(p => p.id === product.id)

      if (found) {
        return prev.map(p =>
          p.id === product.id ? { ...p, qty: p.qty + 1 } : p
        )
      }

      return [...prev, { ...product, qty: 1 }]
    })
  }

  const updateQty = (id, newQty) => {
    if (newQty < 1) return
    setItems(prev => prev.map(p => (p.id === id ? { ...p, qty: newQty } : p)))
  }

  const remove = id => {
    setItems(prev => prev.filter(p => p.id !== id))
  }

  const clear = () => {
    setItems([])
  }

  const total = () => {
    return items.reduce((sum, p) => sum + p.price * p.qty, 0)
  }

  return (
    <CartContext.Provider value={{ items, add, updateQty, remove, clear, total }}>
      {children}
    </CartContext.Provider>
  )
}
