import { Flex } from 'antd';

import styles from './index.module.scss';

export function Banner() {
  return (
    <Flex justify="center" className={styles.banner}>
      <Flex vertical className={styles.content}>
        <span className={styles.title}>让数据创造价值</span>
        <span className={styles.desc}>
          数科云链是环球数科集团基于多链技术构建的合规、开放、易用的区块链平台，企业、个人以及开发者用户均可以直接使用或调用接口的形式使用平台服务，我们竭诚为各类客户提供高质量的区块链服务
        </span>
      </Flex>
    </Flex>
  );
}
