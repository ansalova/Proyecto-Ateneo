import React, { createContext, useContext, useState, useMemo } from 'react'

const CartUIContext = createContext({
  isOpen: false,
  openCart: () => {},
  closeCart: () => {},
  toggleCart: () => {},
})

export function CartUIProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)

  const value = useMemo(() => ({
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    toggleCart: () => setIsOpen(v => !v),
  }), [isOpen])

  return (
    <CartUIContext.Provider value={value}>
      {children}
    </CartUIContext.Provider>
  )
}

export function useCartUI() {
  return useContext(CartUIContext)
}
