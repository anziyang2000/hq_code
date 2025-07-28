import React from 'react';
import { useNavigate } from 'react-router-dom';

const AccountAction: React.FC = () => {
  const navigate = useNavigate();

  const handleCreate = () => {
    navigate('/createAccount');
  };

  const handleImport = () => {
    navigate('/accounts');
  };

  return (
    <div style={styles.container}>
      <button style={{ ...styles.button, ...styles.primary }} onClick={handleCreate}>
        创建账户
      </button>
      <button style={{ ...styles.button, ...styles.secondary }} onClick={handleImport}>
        导入账户
      </button>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  button: {
    width: '200px',
    padding: '12px 0',
    fontSize: '16px',
    margin: '10px 0',
    borderRadius: '5px',
    cursor: 'pointer',
    border: 'none',
  },
  primary: {
    backgroundColor: '#007bff',
    color: '#fff',
  },
  secondary: {
    backgroundColor: '#6c757d',
    color: '#fff',
  },
};

export default AccountAction;
