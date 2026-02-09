import React, { createContext, useState, useEffect, useRef, useContext } from 'react'
import { AuthContext } from './AuthContext'

export const CartContext = createContext()

function cartKeyFor(user) {
  return user && user.id ? `cart_${user.id}` : 'cart_guest'
}

export function CartProvider({ children }) {
  const { user } = useContext(AuthContext)
  const [items, setItems] = useState([])
  const prevKeyRef = useRef(cartKeyFor(user))

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

  // Load cart when user changes (or on mount)
  useEffect(() => {
    const key = cartKeyFor(user)
    try {
      const raw = localStorage.getItem(key)
      setItems(raw ? JSON.parse(raw) : [])
    } catch (e) {
      setItems([])
    }
    prevKeyRef.current = key
  }, [user])

  // Persist cart to localStorage when items or user change
  useEffect(() => {
    const key = cartKeyFor(user)
    try {
      localStorage.setItem(key, JSON.stringify(items))
    } catch (e) {
      console.warn('No se pudo guardar el carrito:', e)
    }
  }, [items, user])

  return (
    <CartContext.Provider value={{ items, add, updateQty, remove, clear, total }}>
      {children}
    </CartContext.Provider>
  )
}
