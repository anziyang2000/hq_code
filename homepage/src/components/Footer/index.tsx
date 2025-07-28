import { Button, Flex } from 'antd';
import classNames from 'classnames';

import subscription from '@/assets/subscription.png';
import { ThemeContext } from '@/hooks/useTheme';

import styles from './index.module.scss';

export function Footer() {
  const { theme } = useContext(ThemeContext);
  const currentYear = new Date().getFullYear();

  return (
    <>
      <Flex className={classNames(styles.main, styles[theme])} vertical justify="center" align="center">
        <div className={styles.content}>
          <div className={styles.head}>联系我们</div>
          <Flex>
            <div className={styles.left}>
              <div>我要咨询想了解更多，请使用在线咨询服务，我们将结合您的业务为您做详细介绍及服务</div>
              <Button type="primary">立即咨询</Button>
            </div>
            <Flex vertical gap={10} className={styles.center}>
              <div>售前咨询热线</div>
              <div>致电：40088-11138 或 0755-88328999</div>
              <div>邮箱：88328999@hqshuke.com</div>
            </Flex>
            <div className={styles.right}>
              <div className={styles.img}>
                <img src={subscription} alt="关注" />
              </div>
              <div className={styles.text}>关注我们，了解更多</div>
            </div>
          </Flex>
        </div>
      </Flex>
      <Flex className={classNames(styles.copyright, styles[theme])} justify="center" align="center">
        Copyright © 2001-{currentYear} 环球数科股份有限公司 提供技术支持 版权所有 | 
          <a href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank" rel="noreferrer">
          &nbsp;粤ICP备09156180号&nbsp;
          </a>
          <a href="https://bcbeian.ifcert.cn/index" target="_blank" rel="noreferrer">
            | 粤网信备44030524273626860016号
          </a>
      </Flex>
    </>
  );
}
