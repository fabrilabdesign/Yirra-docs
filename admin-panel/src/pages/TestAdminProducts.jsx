import React from 'react';
import AdminProductsList from '../components/AdminProductsList';
import '../components/AdminProductsList.css';

const TestAdminProducts = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ 
        background: 'white', 
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 0'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 20px'
        }}>
          <h1 style={{ 
            margin: 0, 
            color: '#111827', 
            fontSize: '32px', 
            fontWeight: '800'
          }}>
            🧪 Test Admin Products
          </h1>
          <p style={{ 
            margin: '8px 0 0 0', 
            color: '#6b7280', 
            fontSize: '16px'
          }}>
            Testing the new admin product cards with clean implementation
          </p>
        </div>
      </div>
      
      <AdminProductsList />
    </div>
  );
};

export default TestAdminProducts;
