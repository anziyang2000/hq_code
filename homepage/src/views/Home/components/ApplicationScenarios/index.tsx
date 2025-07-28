import code from '@assets/qr_code.webp';
import { Button, Flex } from 'antd';
import classNames from 'classnames';

import dataRegister from '@/assets/dataRegister.webp';
import digitalProduct from '@/assets/digitalProduct.webp';
import { ThemeContext } from '@/hooks/useTheme';

import styles from './index.module.scss';

export function ApplicationScenarios() {
  const { theme } = useContext(ThemeContext);
  const [visible, setVisible] = useState(false);

  const data = [
    {
      key: 'data-register',
      title: '数据存证',
      desc: '共识节点与数据维护节点功能独立运行，在扩展性、可维护性、安全性、业务隔离方面具有更大的优势。',
      handleClick: () => {},
      img: dataRegister,
    },
    {
      key: 'digital-product',
      title: '数字藏品',
      desc: '支持 NFT (非同质化通证) 生成、流转等行为的区块链服务协议，具有合规、易用、低成本的特点。',
      handleClick: () => setVisible(true),
      img: digitalProduct,
      extra: (
        <div className={styles.qr}>
          <div className="hey">Hey~</div>
          <div className="nft">扫码体验数科云链 NFT！</div>
          <img src={code} height={142} width={142} alt="二维码" />
        </div>
      ),
    },
  ];

  return data.map(({ key, title, desc, handleClick, img, extra }) => (
    <Flex key={key} vertical align="center" className={classNames(styles.main, styles[key], styles[theme])}>
      <div className={styles.content}>
        {key === 'data-register' && <div className={styles.head}>应用场景</div>}
        <Flex gap={56} className={styles.wrap}>
          <Flex vertical align="left">
            <div className="title">{title}</div>
            <div className="desc">{desc}</div>
            <Button type="primary" className={styles.button} onClick={handleClick}>
              点击了解
            </Button>
            {visible && extra}
          </Flex>
          <div>
            <img src={img} alt={key} height={522} width={806} className={styles.img} />
          </div>
        </Flex>
      </div>
    </Flex>
  ));
}
