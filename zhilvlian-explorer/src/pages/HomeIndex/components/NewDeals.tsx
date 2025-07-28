import React, { useEffect, useState } from 'react';
import Dtable from '@/components/Dtable';
import { useModel } from '@umijs/max';
import { history } from 'umi';
import dayjs from 'dayjs';
import { getBlockAndTxList } from '@/services';
import './css/index.less';
import code from '@/utils/code';

interface DataType {
  data_list: any;
}

interface HomeType {
  dataSource?: DataType;
  pagination?: any;
  onChange?: (value: any) => void;
}

const DigitalCollectionHome: React.FC<HomeType> = (props: any) => {
  const { initialState } = useModel('@@initialState');
  const [dataSource, setDataSource] = useState([]);

  useEffect(() => {
    init();
  }, [initialState?.channelList]);

  const init = async () => {
    const res = await getBlockAndTxList({
      channel_genesis_hash: initialState?.channelList[0].channel_genesis_hash,
    });
    if (res?.code === code.SUCCESS_CODE) {
      setDataSource(res?.data);
    }
  };

  const handleRowClick = (txhash: string) => {
    // 跳转到交易哈希的详情页面
    history.push(`/tx_list?tx=${txhash}`);
  };

  const columns: any = [
    {
      title: '交易哈希',
      dataIndex: 'txhash',
      key: 'txhash',
      align: 'center',
      ellipsis: true,
      width: '25%',
      render: (text: string) => (
        <div 
          className="transaction-hash-cell" 
          title={text} // 鼠标悬浮时显示完整的哈希值
        >
          {text}
        </div>
      ),
    },
    {
      title: '时间',
      dataIndex: 'createdt',
      key: 'createdt',
      align: 'center',
      ellipsis: true,
      width: '35%',
      render: (text: any) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '创建组织',
      dataIndex: 'creator_msp_id',
      key: 'creator_msp_id',
      align: 'center',
      ellipsis: true,
      width: '20%'
    },
    {
      title: '网络名称',
      dataIndex: 'channel_name',
      key: 'channel_name',
      align: 'center',
      ellipsis: true,
      width: '20%',
      render: (text: string) => (
        <div className="network-name-cell">
          {text}
        </div>
      ),
    }
  ];

  return (
    <>
      <Dtable
        rowKey="id"
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        rowClassName={'table_hover_hand'}
        onRow={(record: any) => {
          return {
            onClick: () => handleRowClick(record.txhash), // 传递 txhash 到处理函数
          };
        }}
      />
    </>
  );
};

export default DigitalCollectionHome;
