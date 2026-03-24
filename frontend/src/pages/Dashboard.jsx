import React, { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useContext(AuthContext)

  return (
    <div>
      <h1>Panel administrativo</h1>
      <p>Bienvenido, {user?.name}</p>

      <p>
        Aquí podrás gestionar productos, órdenes y usuarios (funcionalidad por
        implementar).
      </p>
    </div>
  )
}
