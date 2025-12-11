import React from 'react'

export default function ProductCard({ product, onAdd }) {
  return (
    <div className="card">
      <img
        src={product.image}
        alt={product.name}
        style={{ width: '100%', borderRadius: 8 }}
      />

      <h3>{product.name}</h3>

      <p style={{ color: '#374151' }}>
        ${product.price.toLocaleString('es-CO')}
      </p>

      <button className="button" onClick={() => onAdd(product)}>
        Agregar
      </button>
    </div>
  )
}
