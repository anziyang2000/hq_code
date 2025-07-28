import { Footer } from '@/components/Footer';
import Header from '@/components/Header';

import { ApplicationScenarios } from './components/ApplicationScenarios';
import { Banner } from './components/Banner';
import { Partner } from './components/Partner';
import Statistics from './components/Statistics';
import styles from './index.module.scss';

function Home() {
  return (
    <div className={styles.home}>
      {/* 头 */}
      <Header />
      <main className={styles.main}>
        {/* banner */}
        <Banner />
        {/* 统计数据 */}
        <Statistics />
        {/* 应用场景 */}
        <ApplicationScenarios />
        {/* 合作伙伴 */}
        <Partner />
        {/* 尾 */}
        <Footer />
      </main>
    </div>
  );
}

export default Home;
