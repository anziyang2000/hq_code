import React, { useEffect, useState } from 'react';
import { Col, Row, Pagination, Modal } from 'antd';
import Dtable from '@/components/Dtable';
import Footer from '@/components/Footer';
import { getChannel } from '@/services';
import dayjs from 'dayjs';
import { backScrollTop } from '@/utils/scrollTop';
import { useLocation } from '@umijs/max';
import { history } from 'umi';
import { RightOutlined } from '@ant-design/icons'; // 引入RightOutlined图标
import '../HomeIndex/components/css/detail.less';

const ChannelList: React.FC = () => {
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [visibleData, setVisibleData] = useState<any[]>([]);
  const [hasMoreData, setHasMoreData] = useState(true);

  const location = useLocation();

  useEffect(() => {
    init();
    backScrollTop();

    const handleResize = () => {
      const isNowMobile = window.innerWidth < 768;
      setIsMobile(isNowMobile);

      if (isNowMobile) {
        // 当屏幕小于 768px 时，检查是否需要设置 hasMoreData 为 false
        if (visibleData.length <= pagination.pageSize) {
          setHasMoreData(false);
        } else {
          setHasMoreData(true);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [visibleData.length, pagination.pageSize]);

  const init = async () => {
    try {
      const res = await getChannel();
      const fullData = res || [];
      setPagination((prev) => ({
        ...prev,
        total: fullData.length,
      }));
      setDataSource(fullData);
      setVisibleData(fullData.slice(0, pagination.pageSize));
  
      // 如果数据量不足于一页的数量，设置 `hasMoreData` 为 false
      if (fullData.length <= pagination.pageSize) {
        setHasMoreData(false);
      }
    } catch (error) {
      // 处理错误（可选）
    }
  };

  const handleTableChange = (page: number, pageSize?: number) => {
    const updatedPageSize = pageSize || pagination.pageSize;
    const newData = dataSource.slice(0, page * updatedPageSize);

    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize: updatedPageSize,
    }));
    setVisibleData(newData);
  };

  const loadMore = () => {
    if (!hasMoreData) {
      Modal.info({
        title: '提示',
        content: <p>没有更多数据了</p>,
        onOk() {},
      });
      return;
    }

    const nextPage = pagination.current + 1;
    const updatedData = dataSource.slice(0, nextPage * pagination.pageSize);

    if (updatedData.length >= dataSource.length) {
      setHasMoreData(false);
    }

    setPagination((prev) => ({
      ...prev,
      current: nextPage,
    }));
    setVisibleData(updatedData);
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
      title: '网络编号',
      dataIndex: 'id',
      key: 'id',
      align: 'center',
      ellipsis: true,
    },
    {
      title: '网络名称',
      dataIndex: 'channelname',
      key: 'channelname',
      align: 'center',
      ellipsis: true,
    },
    {
      title: '区块数量',
      dataIndex: 'blocks',
      key: 'blocks',
      align: 'center',
      ellipsis: true,
    },
    {
      title: '交易数量',
      dataIndex: 'transactions',
      key: 'transactions',
      align: 'center',
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdat',
      key: 'createdat',
      align: 'center',
      ellipsis: true,
      render: (text: any) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  const totalChannelCount = pagination.total;

  return (
    <>
      <div className="detailBg">
        <Row justify="center" style={{ minHeight: 'calc(70vh)' }}>
          <Col>
            <div className="list_top">
              <p>
                <span className='returnButton' onClick={handleBackClick}>返回</span>
                <RightOutlined />
                {/* <span className='separator'> &gt; </span>  */}
                网络列表
              </p>
              <span>当前共有 {totalChannelCount} 个网络</span>
            </div>
            <div className="list_table">
              {isMobile ? (
                <div className="mobile-list">
                  {visibleData.map((item, index) => (
                    <div key={index} className="mobile-item">
                      <p>
                        <span className="details_key">网络编号</span> 
                        <span className="details_value">{item.id}</span>
                      </p>
                      <p>
                        <span className="details_key">网络名称</span> 
                        <span className="details_value">{item.channelname}</span>
                      </p>
                      <p>
                        <span className="details_key">区块数量</span> 
                        <span className="details_value">{item.blocks}</span>
                      </p>
                      <p>
                        <span className="details_key">交易数量</span> 
                        <span className="details_value">{item.transactions}</span>
                      </p>
                      <p>
                        <span className="details_key">创建时间</span> 
                        <span className="details_value">{dayjs(item.createdat).format('YYYY-MM-DD HH:mm:ss')}</span>
                      </p>
                    </div>
                  ))}
                  {visibleData.length > 0 ? 
                    <div className='seeMore' onClick={loadMore} style={{ cursor: 'pointer' }}>
                      查看更多
                    </div> : <div>暂无数据</div>
                  }
                </div>
              ) : (
                <Dtable
                  rowKey="id"
                  dataSource={visibleData}
                  columns={columns}
                  pagination={false}
                />
              )}
            </div>
            {!isMobile && (
              <Row justify="center" className='pagination'>
                <Pagination
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  showSizeChanger
                  onChange={handleTableChange}
                  pageSizeOptions={['10', '20', '30', '40']}
                />
              </Row>
            )}
          </Col>
        </Row>
      </div>
      <Footer />
    </>
  );
};

export default ChannelList;