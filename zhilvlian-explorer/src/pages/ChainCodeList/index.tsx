

import React, { useEffect, useState } from 'react';
import { Col, Row, Pagination, Modal } from 'antd';
import Dtable from '@/components/Dtable';
import Footer from '@/components/Footer';
import { getChainCodeList } from '@/services';
import { useModel } from '@umijs/max';
import { backScrollTop } from '@/utils/scrollTop';
import code from '@/utils/code';
import { history } from 'umi';
import { useLocation } from '@umijs/max';
import { RightOutlined } from '@ant-design/icons'; // 引入RightOutlined图标
import '../HomeIndex/components/css/detail.less';

const ChainCodeList: React.FC = () => {
  const { initialState } = useModel('@@initialState');
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
    backScrollTop();
    init();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if(window.innerWidth < 768) {
        setHasMoreData(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [initialState?.channelList]);

  const init = async () => {
    try {
      const res = await getChainCodeList({
        channel_genesis_hash: initialState?.channelList[0].channel_genesis_hash,
      });
      if (res?.code === code.SUCCESS_CODE) {
        setDataSource(res.data);
        setPagination((prev) => ({
          ...prev,
          total: res.data.length,
        }));
        setVisibleData(res.data.slice(0, pagination.pageSize));
      }
    } catch (error) {
      // 错误处理（可选）
    }
  };

  // 这段点击分页逻辑中。每次点击页数时，并没有从 pagination.current 页开始重新获取对应的数据，而是直接从 dataSource 中根据当前页数和 pageSize 追加数据。
  // const handleTableChange = (page: number, pageSize?: number) => {
  //   const updatedPageSize = pageSize || pagination.pageSize;
  //   const newData = dataSource.slice(0, page * updatedPageSize);

  //   setPagination((prev) => ({
  //     ...prev,
  //     current: page,
  //     pageSize: updatedPageSize,
  //   }));

  //   setVisibleData(newData);
  // };

  const handleTableChange = (page: number, pageSize?: number) => {
    const updatedPageSize = pageSize || pagination.pageSize;
  
    // 重新设置当前页数，并根据页数和页面大小获取对应的数据
    const startIndex = (page - 1) * updatedPageSize;
    const endIndex = page * updatedPageSize;
  
    const newData = dataSource.slice(startIndex, endIndex);
  
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

    // 更新可见数据
    setVisibleData(updatedData);

    // console.log('##updatedData', updatedData);
  };

  const columns: any = [
    {
      title: '合约名称',
      dataIndex: 'chaincodename',
      key: 'chaincodename',
      align: 'center',
      ellipsis: true,
    },
    {
      title: '交易数量',
      dataIndex: 'txCount',
      key: 'txCount',
      align: 'center',
      ellipsis: true,
    },
    {
      title: '合约版本',
      dataIndex: 'version',
      key: 'version',
      align: 'center',
      ellipsis: true,
    },
    {
      title: '网络名称',
      dataIndex: 'channelName',
      key: 'channelName',
      align: 'center',
      ellipsis: true,
    },
  ];

  const nodeCount = dataSource.length;

  const handleBackClick = (event: React.MouseEvent) => {
    event.preventDefault();
    if (location.key === 'default') {
      history.push('/');
    } else {
      history.back();
    }
  };

  return (
    <>
      <div className="detailBg">
        <Row justify="center" style={{ minHeight: 'calc(70vh)' }}>
          <Col>
            <div className="list_top">
              <p>
                <span className='returnButton' onClick={handleBackClick}>返回</span>
                {/* <span className='separator'> */}
                  <RightOutlined />
                {/* </span>  */}
                合约列表
              </p>
              <span>当前共有 {nodeCount} 个合约</span>
            </div>
            <div className="list_table">
              {isMobile ? (
                <div className="mobile-list">
                  {visibleData.map((item, index) => (
                    <div key={index} className="mobile-item">
                      <p>
                        <span className="details_key">节点名称</span> 
                        <span className="details_value">{item.server_hostname}</span>
                      </p>
                      <p>
                        <span className="details_key">节点地址</span> 
                        <span className="details_value">{item.requests}</span>
                      </p>
                      <p>
                        <span className="details_key">节点类型</span> 
                        <span className="details_value">{item.peer_type}</span>
                      </p>
                      <p>
                        <span className="details_key">组织编号</span> 
                        <span className="details_value">{item.mspid}</span>
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
                  rowKey="requests"
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

export default ChainCodeList;

// import React, { useEffect, useState } from 'react';
// import { Col, Row, Pagination, Modal } from 'antd';
// import Dtable from '@/components/Dtable';
// import Footer from '@/components/Footer';
// import { getChainCodeList } from '@/services';
// import { useModel } from '@umijs/max';
// import { useLocation } from '@umijs/max';
// import { history } from 'umi';
// import { backScrollTop } from '@/utils/scrollTop';
// import code from '@/utils/code';
// import { RightOutlined } from '@ant-design/icons'; // 引入RightOutlined图标
// import '../HomeIndex/components/css/detail.less';

// const ChainCodeList: React.FC = () => {
//   const { initialState } = useModel('@@initialState');
//   const [dataSource, setDataSource] = useState<any[]>([]);
//   const [pagination, setPagination] = useState({
//     current: 1,
//     pageSize: 10,
//     total: 0,
//   });
//   const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
//   const [visibleData, setVisibleData] = useState<any[]>([]);
//   const [hasMoreData, setHasMoreData] = useState(true);

//   const location = useLocation();

//   useEffect(() => {
//     backScrollTop();
//     init();

//     const handleResize = () => {
//       setIsMobile(window.innerWidth < 768);
//       if (window.innerWidth < 768) {
//         setHasMoreData(true);
//       }
//     };

//     window.addEventListener('resize', handleResize);
//     return () => {
//       window.removeEventListener('resize', handleResize);
//     };
//   }, [initialState?.channelList]);

//   const init = async () => {
//     try {
//       const res = await getChainCodeList({
//         channel_genesis_hash: initialState?.channelList[0].channel_genesis_hash,
//       });
//       if (res?.code === code.SUCCESS_CODE) {
//         setDataSource(res.data);
//         setPagination((prev) => ({
//           ...prev,
//           total: res.data.length,
//         }));
//         setVisibleData(res.data.slice(0, pagination.pageSize));
//       }
//     } catch (error) {
//       // 错误处理（可选）
//     }
//   };
  

//   const handleTableChange = (page: number, pageSize?: number) => {
//     const updatedPageSize = pageSize || pagination.pageSize;
//     const startIndex = (page - 1) * updatedPageSize;
//     const endIndex = page * updatedPageSize;
  
//     const newData = dataSource.slice(startIndex, endIndex);
  
//     setPagination((prev) => ({
//       ...prev,
//       current: page,
//       pageSize: updatedPageSize,
//     }));
  
//     setVisibleData(newData);
//   };  

//   const loadMore = () => {
//     if (!hasMoreData) {
//       Modal.info({
//         title: '提示',
//         content: <p>没有更多数据了</p>,
//         onOk() {},
//       });
//       return;
//     }

//     const nextPage = pagination.current + 1;
//     const updatedData = dataSource.slice(0, nextPage * pagination.pageSize);

//     if (updatedData.length >= dataSource.length) {
//       setHasMoreData(false);
//     }

//     setPagination((prev) => ({
//       ...prev,
//       current: nextPage,
//     }));

//     setVisibleData(updatedData);
//   };

//   const handleBackClick = (event: React.MouseEvent) => {
//     event.preventDefault();
//     if (location.key === 'default') {
//       history.push('/');
//     } else {
//       history.back();
//     }
//   };

//   const columns: any = [
//     {
//       title: '合约名称',
//       dataIndex: 'chaincodename',
//       key: 'chaincodename',
//       align: 'center',
//       ellipsis: true,
//     },
//     {
//       title: '交易数量',
//       dataIndex: 'txCount',
//       key: 'txCount',
//       align: 'center',
//       ellipsis: true,
//     },
//     {
//       title: '合约版本',
//       dataIndex: 'version',
//       key: 'version',
//       align: 'center',
//       ellipsis: true,
//     },
//     {
//       title: '网络名称',
//       dataIndex: 'channelName',
//       key: 'channelName',
//       align: 'center',
//       ellipsis: true,
//     },
//   ];

//   return (
//     <>
//       <div className="detailBg">
//         <Row justify="center" style={{ minHeight: 'calc(70vh)' }}>
//           <Col>
//             <div className="list_top">
//               <p>
//                 <span className='returnButton' onClick={handleBackClick}>返回</span>
//                 <RightOutlined />
//                 {/* <span className='separator'> &gt; </span>  */}
//                 合约列表
//               </p>
//               <span>当前共有 {pagination.total} 个合约</span>
//             </div>
//             <div className="list_table">
//               {isMobile ? (
//                 <div className="mobile-list">
//                   {visibleData.map((item, index) => (
//                     <div key={index} className="mobile-item">
//                       <p>
//                         <span className="details_key">合约名称</span> 
//                         <span className="details_value">{item.chaincodename}</span>
//                       </p>
//                       <p>
//                         <span className="details_key">交易数量</span> 
//                         <span className="details_value">{item.txCount}</span>
//                       </p>
//                       <p>
//                         <span className="details_key">合约版本</span> 
//                         <span className="details_value">{item.version}</span>
//                       </p>
//                       <p>
//                         <span className="details_key">网络名称</span> 
//                         <span className="details_value">{item.channelName}</span>
//                       </p>
//                     </div>
//                   ))}
//                   {visibleData.length > 0 ? 
//                     <div className='seeMore' onClick={loadMore} style={{ cursor: 'pointer' }}>
//                       查看更多
//                     </div> : <div>暂无数据</div>
//                   }
//                 </div>
//               ) : (
//                 <Dtable
//                   rowKey="chaincodename"
//                   dataSource={visibleData}
//                   columns={columns}
//                   pagination={false}
//                 />
//               )}
//             </div>
//             {!isMobile && (
//               <Row justify="center" className='pagination'>
//                 <Pagination
//                   current={pagination.current}
//                   pageSize={pagination.pageSize}
//                   total={pagination.total}
//                   showSizeChanger
//                   onChange={handleTableChange}
//                   pageSizeOptions={['10', '20', '30', '40']}
//                 />
//               </Row>
//             )}
//           </Col>
//         </Row>
//       </div>
//       <Footer />
//     </>
//   );
// };

// export default ChainCodeList;