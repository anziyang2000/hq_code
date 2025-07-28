import React, { useRef,useEffect, useState } from 'react';
import { Col, message, Row, Tooltip, Typography, Modal } from 'antd';
import dayjs from 'dayjs';
import { useModel, useSearchParams, createSearchParams } from '@umijs/max';
import Dtable from '@/components/Dtable';
import Footer from '@/components/Footer';
import UGap from '@/components/UGap';
import SearchFilter from '@/components/SearchFilter';
import { getBlockDetailList, getBlockList } from '@/services';
import HashDetail from '@/components/HashOrBlockDetail';
import { backScrollTop } from '@/utils/scrollTop';
import code from '@/utils/code';
import './index.less';
import { history } from 'umi';
import { useLocation } from '@umijs/max';
import '../HomeIndex/components/css/detail.less';
import { getSearchInput, getHomeIndexData } from '@/services';
import { RightOutlined } from '@ant-design/icons'; // 引入RightOutlined图标

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
  txcount?: string;
  blocknum?: string;
  blockhash?: string;
  datahash?: string;
  prehash?: string;
}

type showType = 'transactionHash' | 'blockHash';

type option = '0' | '1' | '2'; // 0 筛选条件 |  1 无参 | 2 有参

const BlockList: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const [searchParams, setSearchParams] = useSearchParams();
  const [modalVisible, setModalVisible] = useState(false);
  const [showDetailType, setShowDetailType] = useState<showType>();
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [option, setOption] = useState<option>('1');
  const [detailList, setDetailList] = useState<detailType>();
  const [filterObj, setFilterObj] = useState<{ from?: string; to?: string; organization?: string }>({});
  const [cachedTotalPages, setCachedTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState(false); // 新增 loading 状态
  const [blockNum, setBlockNum] = useState(false); // 新增 总区块数量 状态
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

  const location = useLocation();

  const searchParamsBlockValue = searchParams.get('block');

  useEffect(() => {
    if (modalVisible) setModalVisible(false);
    if (searchParamsBlockValue) {
      setModalVisible(true);
      const isBlockHash = searchParamsBlockValue.length === 64; 
      const type: showType = isBlockHash ? 'blockHash' : 'transactionHash';
      setOption('2');
      getHashDetail(searchParamsBlockValue, type);
    } else {
      setOption('1');
      init();
    }
  }, [searchParamsBlockValue]);

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

  // 先注释掉，这个区块详情的获取的无关联的 api 的请求，后续分析之前为什么加在这
  useEffect(() => {
    if (isFirstSearch.current) {
      isFirstSearch.current = false; // 第一次加载时将其设置为 false
      return; // 阻止首次调用 queryData
    }
    init();
  }, [filterObj]);
  // }, [initialState?.channelList, filterObj, option]);

  useEffect(() => {    
    if (searchParamsBlockValue) {
      setOption('2');
    } else {
      setOption('1');
    }
  }, [searchParamsBlockValue]);

  const init = async () => {
    if (option) {
      if (option === '0' && filterObj.from && filterObj.to) {
        queryData();
      } else if (option === '1' && !searchParamsBlockValue) {
        queryData();
        setModalVisible(false);
      } else if (option === '2' && searchParamsBlockValue) {
        // queryData();
      }
    }
    try {
      const res = await getHomeIndexData({
        channel_genesis_hash: initialState?.channelList[0].channel_genesis_hash,
      });
      if (res?.code == code.SUCCESS_CODE) {
        setBlockNum(res?.data.block_height);
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
      let params = {
        '0': {
          option: option,
          channel_genesis_hash: initialState?.channelList[0].channel_genesis_hash,
          from: (filterObj.from && dayjs(filterObj.from)) || '',
          to: (filterObj.to && dayjs(filterObj.to)) || '',
          organization: filterObj.organization || '',
          page: pagination.current,
          size: pagination.pageSize,
        },
        '1': {
          option: option,
          channel_genesis_hash: initialState?.channelList[0].channel_genesis_hash,          
          page: pagination.current,
          size: pagination.pageSize,
        },
        '2': {
          option: option,
          channel_genesis_hash: initialState?.channelList[0].channel_genesis_hash,
          content: searchParamsBlockValue,
        },
      };

      // console.log('########params',params);
      // console.log('########page',pagination.current);
      // console.log('########size',pagination.pageSize);
      const res = await getBlockList(params[option]);
      if (res?.code === code.SUCCESS_CODE) {
        // console.log('##setDataSource设置的数据', res.data.blocksData);
        setDataSource(res.data.blocksData);
        const newTotal = res.data.noOfpages;

        if (newTotal !== null) {
          // setCachedTotalPages(newTotal);
          setCachedTotalPages(typeof newTotal === 'number' && newTotal > 0 ? newTotal * 10 : cachedTotalPages);

          setPagination({
            ...pagination,
            total: typeof newTotal === 'number' && newTotal > 0 ? newTotal * pagination.pageSize : cachedTotalPages, // 确保newTotal是有效的数字
            // total: newTotal ?? cachedTotalPages, // 根据实际响应数据设置总数
          });
        }
        // console.log('#######newTotal', newTotal);
        // console.log('#######cachedTotalPages', cachedTotalPages);
        // console.log('#######...pagination', pagination);

        // console.log('#######...pagination', pagination);
        // if(option === '1') {
        //   const newTotal = res.data.noOfpages;
        //   if (newTotal !== null) {
        //   setCachedTotalPages(newTotal);
        //   }
        //   setPagination({
        //   ...pagination,
        //   total: newTotal ?? cachedTotalPages, // 根据实际响应数据设置总数
        //   });
        // }else {
        //   const newTotal = res.data.noOfpages;
        //   setPagination({
        //   ...pagination,
        //   total: newTotal ?? res.data.blocksData.length, // 根据实际响应数据设置总数
        //   });
        // }
      } else {
        message.error('区块列表获取失败，请刷新浏览器重试！');
      }
    } catch (error) {
      message.error('数据请求失败，请稍后再试。');
    }finally {
      setLoading(false); // 请求完成后重置 loading 状态
    }
  };

  const queryData2 = async () => {
    if (loading) { // 如果请求正在进行中，则不发起新请求
      // message.warning('查询正在进行，请稍后...');
      return;
    }
    setLoading(true); // 设置 loading 状态为 true
    try {
      let params = {
        '0': {
          option: option,
          channel_genesis_hash: initialState?.channelList[0].channel_genesis_hash,
          from: '',
          to: '',
          organization: filterObj.organization || '',
          // page: pagination.current,
          // size: pagination.pageSize,
        },
        '1': {
          option: option,
          channel_genesis_hash: initialState?.channelList[0].channel_genesis_hash,          
          page: pagination.current,
          size: pagination.pageSize,
        },
        '2': {
          option: option,
          channel_genesis_hash: initialState?.channelList[0].channel_genesis_hash,
          content: searchParamsBlockValue,
        },
      };

      const res = await getBlockList(params[1]);
      if (res?.code === code.SUCCESS_CODE) {
        setDataSource(res.data.blocksData);
        const newTotal = res.data.noOfpages;
        if (newTotal !== null) {
        // setCachedTotalPages(newTotal);
        setCachedTotalPages(typeof newTotal === 'number' && newTotal > 0 ? newTotal * 10 : cachedTotalPages);
        } 
        setPagination({
          ...pagination,
          // total: newTotal ?? cachedTotalPages, // 根据实际响应数据设置总数
          total: typeof newTotal === 'number' && newTotal > 0 ? newTotal * 10 : cachedTotalPages, // 确保newTotal是有效的数字
        });
      } else {
        message.error('区块列表获取失败，请刷新浏览器重试！');
      }
    } catch (error) {
      message.error('数据请求失败，请稍后再试。');
    }finally {
      setLoading(false); // 请求完成后重置 loading 状态
    }
  };

  const handlePageChange = (page: number, pageSize: number | undefined) => {
    // console.log('page',page);
    // console.log('pageSize',pageSize);
    // 点击新的页码数的时候，直接点第一个会查询所有的数据，所以需要判断下
    if(page !== 1) {
      setOption('1');
    }else {
      setOption('0');
    }
    // console.log('被点击了！！！');
    
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize: pageSize || prev.pageSize,
    }));
    // console.log('在这里打印下pagination', pagination);
    
    // queryData(); // 重新查询数据
  };

  useEffect(() => {
    if (isFirstLoadPagination.current) {
      isFirstLoadPagination.current = false; // 第一次加载时将其设置为 false
      return; // 阻止首次调用 queryData
    }
    if (!searchParamsBlockValue) {
      queryData();
    }
  }, [pagination.current]);

  useEffect(() => {
    if (isFirstLoadPageSize.current) {
      isFirstLoadPageSize.current = false; // 第一次加载时将其设置为 false
      return; // 阻止首次调用 queryData
    }
    if (!searchParamsBlockValue) {
      queryData();
    }
  }, [pagination.pageSize]);

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
    setOption('0');
    // console.log('###handleFilterChange--------value', value);
    // console.log('handleFilterChange被调用了');
    // console.log('value.datetimeRanger', value.datetimeRanger);
    const date = ({
      from: value.datetimeRanger ? value.datetimeRanger[0] : undefined,
      to: value.datetimeRanger ? value.datetimeRanger[1] : undefined,
      organization: mapOrganization(value && value.organization),
    });
    setFilterObj(date);
    setDataSource([]);

    // 区块列表 没有选择时间去查询的时候也可以生效
    if (value.datetimeRanger[0] === null && value.datetimeRanger[1] === null) {
      queryData2();
    }
  };

  const handleResetChange = (value: any) => {
    setSearchParams(createSearchParams({}));
    setOption('1');
    // console.log('handleResetChange被调用了 hahahahahahahahahah');
    
    setFilterObj(value);
    setDataSource([]);
  };


  const getHashDetail = async (value: any, type: any) => {
    setShowDetailType(type);
    if (type === 'blockHash') {
      const res = await getSearchInput({
        content: value,
        channel_genesis_hash: initialState?.channelList[0].channel_genesis_hash,
      });

      if (res?.code === code.SUCCESS_CODE) {
        // 从 res.data.tx_data 中提取所有的 txhash，并将它们拼接成一个字符串
        const concatenatedTxhash = res.data.tx_data.data.map((tx: { txhash: string }) => tx.txhash).join(',');

        // 将拼接后的字符串添加到 res.data.block_data[0] 对象中，属性名为 txhash
        const updatedBlockData = {
          ...res.data.block_data[0], // 保留原有的 block_data 对象
          txhash: concatenatedTxhash, // 添加拼接后的 txhash 字符串
        };

        // 更新 state 并显示模态框
        setDetailList(updatedBlockData);
      }
      return;
    }
    try {
      const res = await getBlockDetailList({
        channel_genesis_hash: initialState?.channelList[0].channel_genesis_hash,
        tx_hash: value,
      });
      if (res?.code === code.SUCCESS_CODE) {
        setDetailList(res?.data);
        setModalVisible(true);
      }
    } catch (error) {
      message.error('区块详情查询请求错误,请稍后重新尝试...');
    }
  };

  const toolTipName = (value: string) =>
    value ? (
      <Tooltip title={value} placement="topLeft" color={'#4E5E9B'} key={'#4E5E9B'}>
        <span>{value}</span>
      </Tooltip>
    ) : (
      ' - '
    );

  const handleDoubleClickJump = (event: any, id: string, type: 'block' | 'transaction') => {
    event.preventDefault(); // 阻止默认的链接跳转行为
    if (type === 'block') {
      history.push(`/block_list/?block=${id}`);
    } else if (type === 'transaction') {
      history.push(`/tx_list/?tx=${id}`); // 根据需要设置来源
    }
  };

  const handleClickCheckDetail = (value: any, type: any) => {
    const hash = type === 'blockHash' ? value.blockhash : value.txhash[0] || value.txhash;
    const hashType = type === 'blockHash' ? 'block' : 'transaction';
    return (
      <Tooltip title={hash} placement="topLeft" color={'#4E5E9B'} key={'#4E5E9B'}>
        <Paragraph
          // 现在是通过路由的方式去检测是否调用交易详情的 api 了，不需要重复调用两次了
          onClick={() => getHashDetail(type === 'blockHash' ? hash : hash, type)}
          className="paragraph"
        >
          <a href="/#" onClick={(e) => handleDoubleClickJump(e, hash, hashType)} rel="noreferrer">
            {hash}
          </a>
        </Paragraph>
      </Tooltip>
    );
  };

  const columns: any = [
    {
      title: '区块高度',
      dataIndex: 'blocknum',
      key: 'blocknum',
      align: 'center',
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdt',
      key: 'createdt',
      align: 'center',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'), // 格式化创建时间
    },
    {
      title: '区块哈希',
      dataIndex: 'blockhash',
      key: 'blockhash',
      align: 'center',
      render: (text: string, record: any) => handleClickCheckDetail(record, 'blockHash'),
    },
    {
      title: '父区块哈希',
      dataIndex: 'prehash',
      key: 'prehash',
      align: 'center',
      ellipsis: true,
      render: (text: string) => toolTipName(text),
    },
    // {
    //   title: '交易哈希',
    //   dataIndex: 'txhash',
    //   key: 'txhash',
    //   align: 'center',
    //   render: (text: string, record: any) => handleClickCheckDetail(record, 'transactionHash'),
    // },
    {
      title: '数据哈希',
      dataIndex: 'datahash',
      key: 'datahash',
      align: 'center',
      ellipsis: true,
      render: (text: string) => toolTipName(text),
    },
    {
      title: '交易数量',
      dataIndex: 'txcount',
      key: 'txcount',
      width: 100,
      align: 'center',
      ellipsis: true,
    },
    {
      title: '区块大小',
      dataIndex: 'blksize',
      key: 'blksize',
      width: 150,
      align: 'center',
      topTip: true,
      ellipsis: true,
      render: (text: string) => toolTipName(text),
    },
    {
      title: '网络名称',
      dataIndex: 'channelname',
      key: 'channelname',
      width: 130,
      align: 'center',
      ellipsis: true,
    },
  ];

  const handleHashDetailClose = () => {
      setModalVisible(false);
  };

  const handleBackClick = (event: React.MouseEvent) => {
      event.preventDefault();
      // history.back();
      if (location.key === 'default') {
        history.push('/');
      } else {
        history.back();
      }
  };

  const loadMore = async () => {
    let params = {
      '0': {
        option: option,
        channel_genesis_hash: initialState?.channelList[0].channel_genesis_hash,
        from: (filterObj.from && dayjs(filterObj.from)) || '',
        to: (filterObj.to && dayjs(filterObj.to)) || '',
        organization: filterObj.organization || '',
        page: currentPage,
        size: pagination.pageSize,
      },
      '1': {
        option: option,
        channel_genesis_hash: initialState?.channelList[0].channel_genesis_hash,          
        page: currentPage,
        size: pagination.pageSize,
      },
      '2': {
        option: option,
        channel_genesis_hash: initialState?.channelList[0].channel_genesis_hash,
        content: searchParamsBlockValue,
      },
    };

    const res = await getBlockList(params[option]); // 请求当前页的数据
    const newBlocks = res.data.blocksData;
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
              showType={showDetailType!}
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
                    区块列表 
                  </p>
                  <span>当前共有 {blockNum} 个区块</span>
                </div>
                {isMobile ? (
                  <div className='qukuaiSearchFilter'>
                    <SearchFilter onFinish={handleFilterChange} onReset={handleResetChange} />
                    <div className="list_table">
                      <div className="mobile-list">
                        {dataSource.map((item, index) => (
                          <div key={index} className="mobile-item">
                            <p  className='details'>
                              <span className="details_key">区块高度</span> 
                              <span className="details_value">{item.blocknum}</span>
                            </p>
                            <p  className='details'>
                              <span className="details_key">创建时间</span> 
                              <span className="details_value">{item.createdt}</span>
                            </p>
                            <p  className='details'>
                              <span className="details_key">区块哈希</span> 
                              <span className="details_value_link" onClick={(e) => handleDoubleClickJump(e, item.blockhash, 'block')}>{item.blockhash}</span>
                            </p>
                            <p  className='details'>
                              <span className="details_key_space">父区块哈希</span> 
                              <span className="details_value">{item.prehash}</span>
                            </p>
                            <p  className='details'>
                              <span className="details_key">交易哈希</span> 
                              <span className="details_value_link" onClick={(e) => handleDoubleClickJump(e, item.txhash, 'transaction')}>{item.txhash}</span>
                            </p>
                            <p  className='details'>
                              <span className="details_key">数据哈希</span> 
                              <span className="details_value">{item.datahash}</span>
                            </p>
                            <p  className='details'>
                              <span className="details_key">交易数量</span> 
                              <span className="details_value">{item.txcount}</span>
                            </p>
                            <p  className='details'>
                              <span className="details_key">区块大小</span> 
                              <span className="details_value">{item.blksize}</span>
                            </p>
                            <p  className='details'>
                              <span className="details_key">区块高度</span> 
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
                    rowKey="blocknum"
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
                <UGap height={dataSource.length < 5 ? 600 / 1920 * windowWidth : 187 / 1920 * windowWidth} bgColor="#F6F7F9" />
              </Col>
            </Row>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default BlockList; 