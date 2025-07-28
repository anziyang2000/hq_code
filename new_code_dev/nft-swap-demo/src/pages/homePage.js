import React from "react";
import { useNavigate } from 'react-router-dom';

import '../App.css';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="app-container">
      <button onClick={() => navigate('/exchange')} style={{ marginRight:'50px' }}>拍卖所系统演示</button>
      <button onClick={() => navigate('/ticket')} style={{ marginRight:'50px' }}>售票系统演示</button>
      <button onClick={() => navigate('/loan')} style={{ marginRight:'50px' }}>银行贷款系统演示</button>
      <button onClick={() => navigate('/proof') } style={{ marginRight:'50px' }}>旧系统功能</button>
      <button onClick={() => navigate('/upgrade')}>智能合约升级演示</button>
      <hr style={{ margin: '30px 0', borderTop: '1px solid #ccc' }} />

       {/* ===== 说明：本地演示时请填写下方账户地址和私钥 ===== */}
       <div style={{ textAlign: 'left', marginTop: '20px' }}>
        <h3>账户信息（演示用）</h3>
        <p><strong>管理员账户地址：</strong> 0xE25583099BA105D9ec0A67f5Ae86D90e50036425</p>
        <p><strong>管理员账户私钥：</strong> 39725efee3fb28614de3bacaffe4cc4bd8c436257e2c8bb887c4b5c4be45e76d</p>
        <br />
        <p><strong>普通账户地址 1：</strong> 0x614561D2d143621E126e87831AEF287678B442b8</p>
        <p><strong>普通账户私钥 1：</strong> 53321db7c1e331d93a11a41d16f004d7ff63972ec8ec7c25db329728ceeb1710</p>
        <br />
        <p><strong>普通账户地址 2：</strong> 0xf93Ee4Cf8c6c40b329b0c0626F28333c132CF241</p>
        <p><strong>普通账户私钥 2：</strong> ab63b23eb7941c1251757e24b3d2350d2bc05c3c388d06f8fe6feafefb1e8c70</p>
      </div>
    </div>
  );
}

export default HomePage;
