import { Spin } from 'antd';
import React from 'react';

const Loading: React.FC = () => (
  <div
    style={{
      background: 'rgba(0, 0, 0, 0, 1)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
      backdropFilter: '6px',
      zIndex: '999',
    }}
  >
    <Spin tip="Loading..." />
  </div>
);

export default Loading;
