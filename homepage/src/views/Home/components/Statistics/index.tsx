import { Col, Flex, Row } from 'antd';
import classNames from 'classnames';
import { Fragment } from 'react/jsx-runtime';

import consensus from '@/assets/consensus.svg';
import privacy from '@/assets/privacy.svg';
import segregation from '@/assets/segregation.svg';
import strategy from '@/assets/strategy.svg';
import { ThemeContext } from '@/hooks/useTheme';

import styles from './index.module.scss';

export default function Statistics() {
  const { theme } = useContext(ThemeContext);
  const statisticsData = [
    {
      key: 'coChain',
      title: '上链数量统计',
      amount: 1000,
      subTitle: '已上链数据交易数',
    },
    {
      key: 'address',
      title: '地址数量统计',
      amount: 99,
      subTitle: '链上地址总数',
    },
    {
      key: 'blockHeight',
      title: '区块高度统计',
      amount: 1000,
      subTitle: '链上最新区块高度',
    },
    {
      key: 'transactionSpeed',
      title: '交易速度统计',
      amount: 1000,
      subTitle: '每秒处理交易数',
    },
  ];

  const advantageData = [
    {
      key: 'consensus',
      icon: consensus,
      title: '独立共识',
      subTitle: '共识节点与数据维护节点功能独立运行，在扩展性、可维护性、安全性、业务隔离方面具有更大的优势',
    },
    {
      key: 'strategy',
      icon: strategy,
      title: '访问策略',
      subTitle:
        '可灵活自定义策略实现链上资源的严格权限访问，源头上杜绝对非法访问资源行为，进一步增强系统的灵活性和适应性',
    },
    {
      key: 'segregation',
      icon: segregation,
      title: '数据隔离',
      subTitle:
        '基于多网络结构特点，可以实现链级别业务数据隔离，区块链节点可自由加入不同的区块链网络而数据互不干扰，实现最大化有效利用硬件资源',
    },
    {
      key: 'privacy',
      icon: privacy,
      title: '隐私保护',
      subTitle:
        '基于多网络结构以及 idemix 加密等技术，可以实现链级别、合约业务级别以及更细颗粒度的数据隐私保护，提供更为灵活的业务适应性 (数据隔离，隐私保护，准入限制等)',
    },
  ];

  return (
    <Flex className={styles.main} vertical justify="center" align="center">
      <Flex className={styles.wrap} justify="center" align="center">
        {statisticsData.map(({ key, amount, subTitle, title }, index, arr) => {
          return (
            <Fragment key={key}>
              <div className={styles.static}>
                <Flex vertical gap={20}>
                  <span className={styles.title}>{title}</span>
                  <span className={styles.amount}>{`${amount}+`}</span>
                  <span className={styles['sub-title']}>{subTitle}</span>
                </Flex>
              </div>
              {index < arr.length - 1 && <span className={classNames(styles.divider, styles[theme])} />}
            </Fragment>
          );
        })}
      </Flex>
      <div className={styles.advantage}>我们的优势</div>
      <Row gutter={[24, 24]} className={styles.row}>
        {advantageData.map(({ icon, key, subTitle, title }) => {
          return (
            <Col key={key} span={12}>
              <Flex className={classNames(styles.item, 'translate-hover')}>
                <img width={124} height={125} src={icon} alt="图片" />
                <div className="wrap">
                  <div className={styles.text}>{title}</div>
                  <div className={styles.sub}>{subTitle}</div>
                </div>
              </Flex>
            </Col>
          );
        })}
      </Row>
    </Flex>
  );
}
