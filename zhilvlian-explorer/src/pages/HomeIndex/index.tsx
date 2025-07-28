import React, { useEffect, useState } from 'react';
import { Row, message } from 'antd';
import type { PaginationProps } from 'antd';
import Footer from '@/components/Footer';
import NewCardList from './components/NewCardList';
import SearchContent from './components/SearchContent';
import Charts from './components/Charts';
import NewBlock from './components/NewBlock';
import NewDeals from './components/NewDeals';
import styles from './index.less';
import { useModel } from '@umijs/max';
import { history } from 'umi';
// import { getHomeIndexData, getTxForChart, getTravelEcharts} from '@/services';
import { getHomeIndexData, getTxForChart } from '@/services';
import dayjs from 'dayjs';
import { backScrollTop } from '@/utils/scrollTop';
import code from '@/utils/code';

const paginationData = {
  total: 0,
  current: 1,
  defaultCurrent: 1,
  pageSize: 10,
};


const HomeIndex: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  // const [dataCharts, setDataCharts] = useState([]);
  const [dataCharts, setDataCharts] = useState<{ datetime: string; count: number }[]>([]);
  const [pagination, setPagination] = useState<PaginationProps>(paginationData); // table pagination
  const [chartsFetched, setChartsFetched] = useState(false); // 标记图表数据是否已经加载
  const [homeDetail, setHomeDetail] = useState<{
    block_height?: number;
    tx_total?: number;
    peer_total?: number;
    chaincode_total?: number;
    channel_total?: number;
  }>({});

  useEffect(() => {
    backScrollTop();
  }, []);

  useEffect(() => {
    queryData();
    initCharts();
  }, [initialState?.channelList]);

  // const initCharts = async () => {
  //   if (chartsFetched) return;
  //   try {

  //     const res = await getTxForChart({
  //       channel_genesis_hash: initialState?.channelList[0].channel_genesis_hash,
  //       days: 60,
  //       day_length: 1
  //     });

  //     setChartsFetched(true); // 标记图表数据已加载
  //     if (res?.code == code.SUCCESS_CODE) {
  //       res.data.forEach((i: any) => {
  //         i.datetime = dayjs(i.datetime).format('YYYY-MM-DD');
  //         i.count = +i.count;
  //       });
  //       console.log('#111111111res.data:',res.data);
  //       setDataCharts(res.data);
  //     }
  //   } catch (error) {
  //     message.error('首页视图数据加载失败,请您稍后重试...');
  //   }
  // };

  const initCharts = async () => {
    if (chartsFetched) return;
  
    try {
      const res = await getTxForChart({
        channel_genesis_hash: initialState?.channelList[0].channel_genesis_hash,
        days: 60,
        day_length: 1
      });
  
      setChartsFetched(true); // 标记图表数据已加载
  
      if (res?.code === code.SUCCESS_CODE) {
        const today = dayjs();
        const last30Days = [];
        const dataMap = new Map();
        
        // 生成过去30天的日期
        for (let i = 0; i < 30; i++) {
          const date = today.subtract(i, 'day').format('YYYY-MM-DD');
          last30Days.push(date);
        }
  
        // 处理 API 返回的数据，将日期格式化并存储到 map 中
        res.data.forEach((i: any) => {
          const formattedDate = dayjs(i.transaction_date).format('YYYY-MM-DD');
          i.count = +i.count; // 确保 count 为数字类型
          dataMap.set(formattedDate, i); // 存储日期和对应的数据
        });
  
        // 构建最终数据
        const finalData: { datetime: string; count: number }[] = last30Days.map(date => {
          if (dataMap.has(date)) {
            const data = dataMap.get(date);
            return { datetime: date, count: data.count }; // 数据已存在，直接使用
          } else {
            return { datetime: date, count: 0 }; // 数据不存在，设置为 0
          }
        });
  
        // 按照日期（datetime）从小到大排序
        finalData.sort((a, b) => {
          return dayjs(a.datetime).isBefore(dayjs(b.datetime)) ? -1 : 1;
        });
  
        // console.log('# Chart Data:', finalData);
        setDataCharts(finalData); // 更新图表数据
      }
    } catch (error) {
      message.error('首页视图数据加载失败,请您稍后重试...');
    }
  };
  
  const queryData = async () => {
    try {
      const res = await getHomeIndexData({
        channel_genesis_hash: initialState?.channelList[0].channel_genesis_hash,
      });
      if (res?.code == code.SUCCESS_CODE) {
        setHomeDetail(res?.data);
      }
    } catch (error) {
      message.error('首页数据加载失败,请您稍后重试...');
    }
  };

  const handleTableChange = (value: any) => {
    setPagination({      
      ...value,
    });
  };

  const handleRowClick = (record: any) => {
    history.push('/block_list', { blockData: record });
  };

  const handleSeeMoreClick = () => {
    // 假设传递空对象，或者你可以传递特定的数据
    handleRowClick({});
  };

  const newBlockOrDealsProps = {
    pagination,
    onChange: handleTableChange,
    onRowClick: handleRowClick, // 将点击事件传递给 NewBlock
  };

  return (
    <>
      <div className="homeIndexBg">
        <SearchContent {...homeDetail} />
        <NewCardList {...homeDetail} />
          <Charts dataCharts={dataCharts} />
        <Row gutter={24} justify="center" >
          <div className='new_'>
            <div className={styles.section} id='new_block'>
              <div className='new_block_top'>
                <h2 className={styles.sectionTitle}>
                  <div className='new_block_icon'></div>
                  <span>最新区块</span>
                </h2>
                <a onClick={handleSeeMoreClick}>查看更多</a>
              </div>
              <div className={styles.home_card}>
                <NewBlock {...newBlockOrDealsProps} />
              </div>
            </div>
            <div className={styles.section} id='new_trasction'>
              <div className='new_transtion_top'> 
                <h2 className={styles.sectionTitle}>
                  <div className='new_transtion_icon'></div>
                  <span>最新交易</span>
                </h2>
                <a onClick={() => history.push('/tx_list')}>查看更多</a>
              </div>
              <div className={styles.home_card}>
                <NewDeals {...newBlockOrDealsProps} />
              </div>
            </div>
          </div>
        </Row>
      </div>
      <div className='homeIndexFooter'>
        <Footer />
      </div>
    </>
  );
};

export default HomeIndex;