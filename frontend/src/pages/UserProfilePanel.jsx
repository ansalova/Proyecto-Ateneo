import React, { useEffect, useState } from 'react';
import { X, UserCircle, Mail, IdCard, BookOpen, Calendar, Clock, Users, Loader2 } from 'lucide-react';
// En una aplicación real, importarías tu servicio API para obtener datos detallados del usuario:
// import api from '../services/api';

export default function UserProfilePanel({ userId, onClose, availableUsers }) {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      setLoading(true);
      setError('');
      try {
        // Aquí es donde harías una llamada a tu backend para obtener el perfil detallado:
        // const response = await api.get(`/api/users/${userId}/profile-details`);
        // setUserProfile(response.data);

        // Por ahora, simulamos la obtención de datos y añadimos detalles mock:
        const foundUser = availableUsers.find(u => u.id === userId);
        if (foundUser) {
          setUserProfile({
            ...foundUser,
            document_type: 'Cédula de Ciudadanía', // Datos mock
            document_number: '1020304050', // Datos mock
            grade: foundUser.role === 'student' ? '10° - 11°' : null, // Datos mock
            last_login: '2024-07-20T10:30:00Z', // Datos mock
            joined_date: '2023-01-15T09:00:00Z', // Datos mock
            total_messages_sent: Math.floor(Math.random() * 100) + 10, // Datos mock
          });
        } else {
          setError('Usuario no encontrado.');
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Error al cargar el perfil del usuario.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, availableUsers]);

  if (!userId) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(5px)'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#666'
        }}>
          <X size={24} />
        </button>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Loader2 className="animate-spin inline" size={32} color="#1f7a4a" />
            <p style={{ marginTop: '16px', color: '#555' }}>Cargando perfil...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
            <p>{error}</p>
          </div>
        ) : userProfile ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <UserCircle size={80} color="#ccc" style={{ margin: '0 auto 12px' }} />
              <h2 style={{ margin: '0', fontSize: '24px', color: '#1e293b' }}>{userProfile.name}</h2>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>
                <span style={{ background: '#eef2ff', padding: '4px 10px', borderRadius: '20px', color: '#0b63f6', fontWeight: '600' }}>
                  {userProfile.role === 'student' ? 'Estudiante' : userProfile.role === 'teacher' ? 'Profesor' : 'Administrador'}
                </span>
              </p>
            </div>

            <div style={{ borderTop: '1px solid #eee', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#475569' }}>
                <Mail size={20} />
                <span style={{ fontSize: '15px' }}>{userProfile.email}</span>
              </div>
              {userProfile.document_number && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#475569' }}>
                  <IdCard size={20} />
                  <span style={{ fontSize: '15px' }}>{userProfile.document_type}: {userProfile.document_number}</span>
                </div>
              )}
              {userProfile.grade && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#475569' }}>
                  <BookOpen size={20} />
                  <span style={{ fontSize: '15px' }}>Grado: {userProfile.grade}</span>
                </div>
              )}
              {userProfile.last_login && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#475569' }}>
                  <Clock size={20} />
                  <span style={{ fontSize: '15px' }}>Último acceso: {new Date(userProfile.last_login).toLocaleString()}</span>
                </div>
              )}
              {userProfile.joined_date && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#475569' }}>
                  <Calendar size={20} />
                  <span style={{ fontSize: '15px' }}>Miembro desde: {new Date(userProfile.joined_date).toLocaleDateString()}</span>
                </div>
              )}
              {userProfile.total_messages_sent !== undefined && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#475569' }}>
                  <Users size={20} />
                  <span style={{ fontSize: '15px' }}>Mensajes enviados: {userProfile.total_messages_sent}</span>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}