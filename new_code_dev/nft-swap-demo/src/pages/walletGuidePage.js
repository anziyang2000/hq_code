import React from "react";
import "../App.css";

function WalletGuidePage() {
  return (
    <div className="app-container">
      <img src="steps/chrome-store.png" alt="Chrome Store" style={{ height: '80px' }} />
      <h1>如何获取并使用钱包插件</h1>

      <h2>第一步：下载插件并解压</h2>
      <p>请先下载插件安装包：</p>
      <ul>
        <li>
          <a href="/downloads/dist.rar" download>
            下载插件压缩包 (.rar)
          </a>
        </li>
      </ul>

      <h2>第二步：安装插件（以谷歌浏览器为例）</h2>
      <ol>
        <li>打开谷歌浏览器</li>
        <li>点击右上角扩展程序</li>
        <li>打开右上角“开发者模式”</li>
        <li>点击“加载已解压的扩展程序”</li>
        <li>选择解压后的插件文件夹</li>
      </ol>

      <div style={{ marginTop: "20px" }}>
        <h3>操作示意图：</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <img src="steps/screenshot1.png" alt="step1" width="50%" />
          <hr style={{ margin: '30px 0', borderTop: '1px solid #ccc' }} />
          <img src="steps/screenshot2.png" alt="step2" width="50%" />
          <hr style={{ margin: '30px 0', borderTop: '1px solid #ccc' }} />
          <img src="steps/screenshot3.png" alt="step3" width="50%" />
          <hr style={{ margin: '30px 0', borderTop: '1px solid #ccc' }} />
          <img src="steps/screenshot4.png" alt="step4" width="50%" />
          <hr style={{ margin: '30px 0', borderTop: '1px solid #ccc' }} />
          <img src="steps/screenshot5.png" alt="step5" width="50%" />
        </div>
      </div>
    </div>
  );
}

export default WalletGuidePage;
