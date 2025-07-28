import { Col, Flex, Row } from 'antd';
import classNames from 'classnames';

import babyRoom from '@/assets/babyRoom.svg';
import blockChain from '@/assets/blockChain.svg';
import cloudNeighborhood from '@/assets/cloudNeighborhood.svg';
import commandSystem from '@/assets/commandSystem.svg';
import dataFox from '@/assets/dataFox.svg';
import eco from '@/assets/eco.svg';
import hly from '@/assets/hly.svg';
import parkSystem from '@/assets/parkSystem.svg';
import payPal from '@/assets/payPal.webp';
import ticketPlatform from '@/assets/ticketPlatform.svg';
import warningPlatform from '@/assets/warningPlatform.webp';
import wisdomTourism from '@/assets/wisdomTourism.webp';

import styles from './index.module.scss';

export function Partner() {
  const data = [
    {
      key: 'dataFox',
      icon: dataFox,
      text: 'DataFox 灵狐',
      url: 'https://datafox.shukeyun.com/',
    },
    {
      key: 'payPal',
      icon: payPal,
      text: '云联网络',
      url: 'https://www.upaypal.com/',
    },
    {
      key: 'hly',
      icon: hly,
      text: '慧旅云',
      url: 'https://hly.net/',
    },
    {
      key: 'eco',
      icon: eco,
      text: '生态云',
      url: 'https://prod.shukeyun.com/eco/web/#/index',
    },

    {
      key: 'blockChain',
      icon: blockChain,
      text: '智旅链',
    },
    {
      key: 'parkSystem',
      icon: parkSystem,
      text: '车无忌',
      url: 'https://prod.shukeyun.com/parking/management/#/index',
    },
    {
      key: 'cloudNeighborhood',
      icon: cloudNeighborhood,
      text: '数科云邻',
      url: 'https://www.shukeyunlin.com',
    },
    {
      key: 'wisdomTourism',
      icon: wisdomTourism,
      text: '智慧旅游监管平台',
    },

    {
      key: 'babyRoom',
      icon: babyRoom,
      text: '智慧母婴室',
    },
    {
      key: 'ticketPlatform',
      icon: ticketPlatform,
      text: '检票平台',
    },
    {
      key: 'warningPlatform',
      icon: warningPlatform,
      text: '生态监测与灾害预警管理平台',
    },
    {
      key: 'commandSystem',
      icon: commandSystem,
      text: '森林防火监测预警和指挥系统',
    },
  ];
  return (
    <Flex className={styles.main} vertical justify="center" align="center">
      <div className={styles.content}>
        <div className={styles.head}>合作伙伴</div>
        <Row gutter={[12, 28]}>
          {data.map(({ key, icon, text, url }) => {
            return (
              <Col key={key} span={4}>
                <Flex
                  vertical
                  justify="center"
                  align="center"
                  className={classNames('translate-hover', styles.item)}
                  onClick={() => {
                    url && window.open(url);
                  }}
                >
                  <div className={styles.icon}>
                    <img width={82} height={82} src={icon} alt={text} />
                  </div>
                  <div className={styles.text}>{text}</div>
                </Flex>
              </Col>
            );
          })}
        </Row>
      </div>
    </Flex>
  );
}
