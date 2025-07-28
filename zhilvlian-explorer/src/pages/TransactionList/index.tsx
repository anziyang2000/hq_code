import React, { useRef,useEffect, useState } from 'react';
import { Col, message, Row, Tooltip, Typography, Modal } from 'antd';
import dayjs from 'dayjs';
import { useLocation, useModel, useSearchParams, createSearchParams } from '@umijs/max';
import Dtable from '@/components/Dtable';
import Footer from '@/components/Footer';
import UGap from '@/components/UGap';
import SearchFilter from '@/components/SearchFilter';
import HashDetail from '@/components/HashOrBlockDetail';
import { getTransactionList, getBlockDetailList, getHomeIndexData } from '@/services';
import './index.less';
import { backScrollTop } from '@/utils/scrollTop';
import code from '@/utils/code';
import { history } from 'umi';
import { RightOutlined } from '@ant-design/icons'; // 引入RightOutlined图标
import '../HomeIndex/components/css/detail.less';

const { Paragraph } = Typography;

interface detailType {
  txhash?: string;
  validation_code?: string;
  payload_proposal_hash?: string;
  creator_msp_id?: string;
  endorser_msp_id?: string;
  chaincodename?: string;
  type?: string;
  createdt?: string;
  read_set?: string;
  write_set?: string;
}

type option = '0' | '1' | '2';

const TransactionList: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const [searchParams, setSearchParams] = useSearchParams();
  const [modalVisible, setModalVisible] = useState(false);
  const [option, setOption] = useState<option>('1');
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [detailList, setDetailList] = useState<detailType>();
  const [filterObj, setFilterObj] = useState<{ from?: string; to?: string; organization?: string }>({});
  const [cachedTotalPages, setCachedTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState(false); // 新增 loading 状态
  const [txNum, setTxNum] = useState(false); // 新增 loading 状态
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isFirstLoadPagination = useRef(true);
  const isFirstLoadPageSize = useRef(true);
  const isFirstSearch = useRef(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // 判断是否为移动设备
  const [currentPage, setCurrentPage] = useState<number>(2); // 当前页数
  
  // 分页状态
  const [pagination, setPagination] = useState({
    pageSize: 10,
    current: 1,
    total: 0,
  });

  const searchParamsTxValue = searchParams.get('tx');

  useEffect(() => {
    if (searchParamsTxValue) {
      setOption('2');
      // console.log('Transaction hash:', searchParamsTxValue);
      getHashDetail(searchParamsTxValue);
    } else {
      setOption('1');
      // console.log('Initializing with no transaction hash');
      init();
    }
  }, [searchParamsTxValue]);

  const location = useLocation();

  useEffect(() => {
    setModalVisible(false);
    // console.log('#交易列表页面的', location);
  }, [location]);

  useEffect(() => {
    backScrollTop();
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);

      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (modalVisible) setModalVisible(false);
    if (searchParamsTxValue) {
      setOption('2');
      setModalVisible(true)
    } else {
      setOption('1');
    }
  }, [searchParamsTxValue]);

  // 先注释掉，交易详情页面无关联的请求太多，后续分析之前为什么加这个
  useEffect(() => {
    // console.log('111111111', option);
    if (isFirstSearch.current) {
      isFirstSearch.current = false; // 第一次加载时将其设置为 false
      return; // 阻止首次调用 queryData
    }
    init();
  }, [filterObj]);
  // }, [initialState?.channelList, filterObj, option]);

  const init = async () => {
    // console.log('2222222', option);
    if (option) {
      if (option === '0') {
        queryData();
      } else if (!searchParamsTxValue && !searchParamsTxValue) {
        queryData();
      } else if (option === '2' && searchParamsTxValue) {
        // 先注释掉 还需分析之前为什么需要在这调用查询
        // queryData();
      }
    }
    try {
      const res = await getHomeIndexData({
        channel_genesis_hash: initialState?.channelList[0].channel_genesis_hash,
      });
      if (res?.code == code.SUCCESS_CODE) {
        setTxNum(res?.data.tx_total);
      }
    } catch (error) {
      message.error('首页数据加载失败,请您稍后重试...');
    }
  };

  const queryData = async () => {
    if (loading) { // 如果请求正在进行中，则不发起新请求
      // message.warning('查询正在进行，请稍后...');
      return;
    }
    
    setLoading(true); // 设置 loading 状态为 true
    try {
      // console.log('#page', pagination.current);
      // console.log('#pageSize', pagination.pageSize);
      const params: any = {
        option,
        channel_genesis_hash: initialState?.channelList[0].channel_genesis_hash,
        page: pagination.current,
        size: pagination.pageSize,
      };
      // console.log('#option', params);

      if (option === '0') {
        params['from'] = (filterObj.from && dayjs(filterObj.from)) || '';
        params['to'] = (filterObj.to && dayjs(filterObj.to)) || ''
        params['organization'] = filterObj.organization || '';
      } else if (option === '2') {
        params['content'] = searchParamsTxValue || '';
      }

      // console.log('########',params);
      const res = await getTransactionList(params);
      if (res?.code === code.SUCCESS_CODE) {
        if (option === '0') {
          res.data.txnsData.forEach((i: any) => {
            i.channel_name = i.channelname;
          });
        }
        setDataSource(res.data.txnsData);
        if(option === '1') {
          const newTotal = res.data.noOfpages;
          // console.log('####', res.data.txnsData.length);
          
          // let updatedTotalPages = res.data.noOfpages;
          if (newTotal !== null) {
            // console.log('#1', res.data.txnsData.length);
            // updatedTotalPages = res.data.txnsData.length;
            // setCachedTotalPages(newTotal);
            setCachedTotalPages(typeof newTotal === 'number' && newTotal > 0 ? newTotal * 10 : cachedTotalPages);

            setPagination({
              ...pagination,
              total: typeof newTotal === 'number' && newTotal > 0 ? newTotal * pagination.pageSize : cachedTotalPages, // 根据实际响应数据设置总数
              // total: newTotal ?? cachedTotalPages, // 根据实际响应数据设置总数
            });
          }
          // console.log('#total', updatedTotalPages);
          // console.log('#total', pagination);
        }else {
          const newTotal = res.data.noOfpages;
          // console.log('####', res.data.txnsData.length);
          setPagination({
            ...pagination,
            // total: updatedTotalPages, // 根据实际响应数据设置总数
            total: typeof newTotal === 'number' && newTotal > 0 ? newTotal * pagination.pageSize : res.data.txnsData.length, // 根据实际响应数据设置总数
          });
          // console.log('#total', pagination);
        }
      } else {
        message.error('交易列表获取失败，请刷新重试');
      }
    } catch (error) {
      message.error('数据请求失败，请稍后再试。');
    } finally {
      setLoading(false); // 请求完成后重置 loading 状态
    }
  };

  const mapOrganization = (value: any) => {
    if (value) {
      let query = '';
      for (let i = 0; i < value.length; i++) {
        query += `&&orgs=${value[i]}`;
      }
      return query;
    }
    return '';
  };

  const handleFilterChange = (value: any) => {
    // console.log('88888888888888888888888888888');
    // console.log(value && value.organization);
    
    const r = mapOrganization(value && value.organization);
    // console.log('77777777777777777');
    
    const date = {
      from: value.datetimeRanger ? value.datetimeRanger[0] : undefined,
      to: value.datetimeRanger ? value.datetimeRanger[1] : undefined,
      organization: r,
    };

    setOption('0');
    setFilterObj(date);
    
    setDataSource([]);
  };

  const handleResetChange = (value: any) => {
    setSearchParams(createSearchParams({}));
    setOption('1');
    setFilterObj(value);
    setDataSource([]);
  };

  const getHashDetail = async (value: any) => {
    const res = await getBlockDetailList({
      channel_genesis_hash: initialState?.channelList[0].channel_genesis_hash,
      tx_hash: value,
    });
    if (res?.code === code.SUCCESS_CODE) {
      setDetailList(res?.data);
      // setModalVisible(true);
    }
  };

  const handlePageChange = (page: number, pageSize: number | undefined) => {
    // console.log('page', page);
    // console.log('pageSize', pageSize);
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize: pageSize || prev.pageSize,
    }));
    // queryData(); // 重新查询数据
  };

  useEffect(() => {
    if (isFirstLoadPagination.current) {
      isFirstLoadPagination.current = false; // 第一次加载时将其设置为 false
      return; // 阻止首次调用 queryData
    }
    if (!searchParamsTxValue) {
      queryData();
    }
  }, [pagination.current]);
  
  useEffect(() => {
    if (isFirstLoadPageSize.current) {
      isFirstLoadPageSize.current = false; // 第一次加载时将其设置为 false
      return; // 阻止首次调用 queryData
    }
    if (!searchParamsTxValue) {
      queryData();
    }
  }, [pagination.pageSize]);

  const handleDoubleClickJump = (event: any, id: string) => {
    event.preventDefault(); // 阻止默认的链接跳转行为
    history.push(`/tx_list/?tx=${id}`);
  };

  const handleClickCheckDetail = (value: any) => {
    return (
      <Tooltip title={value.txhash} placement="topLeft" color={'#4E5E9B'} key={'#4E5E9B'}>
        {/* <Paragraph onClick={() => getHashDetail(value.txhash)} className="paragraph"> */}
        {/* 这里删除掉了点击请求交易详情的 api 因为已经通过路由检测到了的 */}
        <Paragraph className="paragraph">
          <a href="/#" onClick={(e) => handleDoubleClickJump(e, value.txhash)} rel="noreferrer">
            {value.txhash}
          </a>
        </Paragraph>
      </Tooltip>
    );
  };

  const handleHashDetailClose = () => {
    setModalVisible(false);
  };

  const handleBackClick = (event: React.MouseEvent) => {
    event.preventDefault();
    if (location.key === 'default') {
      history.push('/');
    } else {
      history.back();
    }
  };

  const columns: any = [
    {
      title: '交易哈希',
      dataIndex: 'txhash',
      key: 'txhash',
      // width: 150,
      align: 'center',
      ellipsis: true,
      render: (text: string, record: any) => handleClickCheckDetail(record),
    },
    {
      title: '交易时间',
      dataIndex: 'createdt',
      key: 'createdt',
      // width: 200,
      align: 'center',
      ellipsis: true,
      render: (text: any) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '交易类型',
      dataIndex: 'type',
      key: 'type',
      // width: 200,
      align: 'center',
      ellipsis: true,
    },
    {
      title: '创建成员',
      dataIndex: 'creator_msp_id',
      key: 'creator_msp_id',
      width: 150,
      align: 'center',
      ellipsis: true,
      render: (text: string) => (text ? text : '-'),
    },
    {
      title: '合约名称',
      dataIndex: 'chaincodename',
      key: 'chaincodename',
      // width: 200,
      align: 'center',
      ellipsis: true,
      render: (text: string, record: any) => (text ? text : '-'),
    },
    {
      title: '网络名称',
      dataIndex: 'channelname',
      key: 'channelname',
      width: 150,
      align: 'center',
      ellipsis: true,
    }
  ];

  const loadMore = async () => {
    const params: any = {
      option,
      channel_genesis_hash: initialState?.channelList[0].channel_genesis_hash,
      page: currentPage,
      size: pagination.pageSize,
    };

    if (option === '0') {
      params['from'] = (filterObj.from && dayjs(filterObj.from)) || '';
      params['to'] = (filterObj.to && dayjs(filterObj.to)) || ''
      params['organization'] = filterObj.organization || '';
    } else if (option === '2') {
      params['content'] = searchParamsTxValue || '';
    }

    const res = await getTransactionList(params); // 请求当前页的数据
    const newBlocks = res.data.txnsData; // 请求当前页的数据
    if (newBlocks.length > 0) {
      setDataSource((prevBlocks) => [...prevBlocks, ...newBlocks]); // 累加新数据到现有列表中
      setCurrentPage((prevPage) => prevPage + 1); // 增加页数
    } else {
      // setHasMoreData(false); // 如果没有更多数据，更新状态
      Modal.info({
        title: '提示',
        content: <p>没有更多数据了</p>,
        onOk() {},
      });
      return;
    }
  };

  return (
    <>
      <div className="detailBg">
        {modalVisible ? (
          <>
            <HashDetail
              showType={'transactionHash'}
              {...detailList}
              onClose={handleHashDetailClose}
            />
          </>
        ) : (
          <>
            <Row justify="center">
              <Col>
                <div className="list_top">
                  <p>
                    <span className='returnButton' onClick={handleBackClick}>返回</span>
                    {/* <span className='separator'> &gt; </span>  */}
                    <RightOutlined />
                    交易列表
                  </p>
                  <span>当前共有 {txNum} 个交易</span>
                </div>
                {isMobile ? (
                  <div className='jiaoyiSearchFilter'>
                    <SearchFilter onFinish={handleFilterChange} onReset={handleResetChange} />
                    <div className="list_table">
                      <div className="mobile-list">
                        {dataSource.map((item, index) => (
                          <div key={index} className="mobile-item">
                            <p className='details'>
                              <span className="details_key">交易哈希</span> 
                              <span className="details_value_link" onClick={(e) => handleDoubleClickJump(e, item.txhash)}>{item.txhash}</span>
                            </p>
                            <p className='details'>
                              <span className="details_key">交易时间</span> 
                              <span className="details_value">{item.createdt}</span>
                            </p>
                            <p className='details'>
                              <span className="details_key">交易类型</span> 
                              <span className="details_value">{item.type}</span>
                            </p>
                            <p className='details'>
                              <span className="details_key">创建成员</span> 
                              <span className="details_value">{item.creator_msp_id}</span>
                            </p>
                            <p className='details'>
                              <span className="details_key">合约名称</span> 
                              <span className="details_value_link">{item.chaincodename}</span>
                            </p>
                            <p className='details'>
                              <span className="details_key">网络名称</span> 
                              <span className="details_value">{item.channelname}</span>
                            </p>
                          </div>
                        ))}
                        {dataSource.length > 0 ? 
                          <div className='seeMore' onClick={loadMore} style={{ cursor: 'pointer' }}>
                            查看更多
                          </div> : <div>暂无数据</div>
                        }
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="list_table">
                  <SearchFilter onFinish={handleFilterChange} onReset={handleResetChange} />
                  <Dtable
                    rowKey="id"
                    dataSource={dataSource}
                    columns={columns}
                    pagination={{
                      pageSize: pagination.pageSize,
                      current: pagination.current,
                      total: pagination.total,
                      onChange: handlePageChange,
                    }}
                  />
                </div>
                )}
                <UGap height={dataSource.length < 5 ? 600 / 1920 * windowWidth : 187 / 1920 * windowWidth} bgColor="#F6F7F9"/>
              </Col>
            </Row>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default TransactionList;