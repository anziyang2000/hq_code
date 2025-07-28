import React, { useEffect, useState } from 'react';
import { Button, message } from 'tea-component';
import { useNavigate } from 'react-router-dom';

const CreateAccount = () => {
  const navigate = useNavigate();
  const [mnemonic, setMnemonic] = useState<string[]>([]);

  // 模拟 API 返回的12个助记词
  useEffect(() => {
    const simulatedMnemonic = [
      'apple', 'banana', 'cherry', 'date', 'elderberry', 'fig',
      'grape', 'honeydew', 'kiwi', 'lemon', 'mango', 'nectarine'
    ];
    setMnemonic(simulatedMnemonic);
  }, []);

  const handleSave = () => {
    // 跳转到首页
    navigate('/');
    // 提示用户创建成功
    message.success({ content: '账户创建成功！', duration: 2 });
  };

  return (
    <div style={styles.container}>
      {/* 提示文字部分 */}
      <div style={styles.tipContainer}>
        <div style={styles.title}>请写下您的私钥助记词</div>
        <div style={styles.description}>
          请写下这个由12个单词组成的账户私钥助记词，然后将其保存到您信任并且只有您可以访问的地方。
        </div>
      </div>

      {/* 助记词展示 */}
      <div style={styles.mnemonicContainer}>
        {mnemonic.map((word, index) => (
          <div style={styles.wordItem} key={index}>
            <span style={styles.index}>{index + 1}.</span>
            <span style={styles.word}>{word}</span>
          </div>
        ))}
      </div>

      {/* 按钮部分 */}
      <Button type="primary" className="btn-lg" onClick={handleSave} style={styles.button}>
        我已保存
      </Button>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    padding: '20px',
  },
  tipContainer: {
    marginBottom: '20px',
    textAlign: 'center',
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  description: {
    fontSize: '14px',
    color: '#555',
  },
  mnemonicContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    width: '100%',
    marginBottom: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '10px',
  },
  wordItem: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '16px',
  },
  index: {
    marginRight: '8px',
    fontWeight: 'bold',
  },
  word: {
    fontSize: '16px',
  },
  button: {
    width: '200px',
    padding: '12px 0',
    fontSize: '16px',
    borderRadius: '5px',
    cursor: 'pointer',
    border: 'none',
    display: 'flex',
    alignItems: 'center', // 确保按钮内容垂直居中
    justifyContent: 'center', // 确保按钮内容水平居中
  },
};

export default CreateAccount;