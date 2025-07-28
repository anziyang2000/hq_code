import React, { useEffect, useState } from 'react';
import { useModel } from '@umijs/max';
import { history } from 'umi';
import dayjs from 'dayjs';
import Dtable from '@/components/Dtable';
import { getBlockActivity } from '@/services';
import './css/index.less';
import code from '@/utils/code';

interface DataType {
  blockchain_account: any;
}

interface HomeType {
  dataSource?: DataType;
  pagination?: any;
  onChange?: (value: any) => void;
}

const NewBlock: React.FC<HomeType> = (props: any) => {
  const { initialState } = useModel('@@initialState');
  const { pagination, onChange } = props;
  const [dataSource, setDataSource] = useState([]);

  useEffect(() => {
    init();
  }, [initialState?.channelList]);

  const init = async () => {
    // console.log('aaaaaaaaa',initialState );
    
    const res = await getBlockActivity({
      channel_genesis_hash: initialState?.channelList[0].channel_genesis_hash,
    });
    if (res?.code === code.SUCCESS_CODE) {
      setDataSource(res?.data);
      // console.log(dataSource);
    }
  };

  // const handleDoubleClickJump = (event: any) => {
  //   history.push('/block_list');
  // };

  const handleDoubleClickJump = (blockhash: string) => {
    // 跳转到交易哈希的详情页面
    history.push(`/block_list?block=${blockhash}`);
  };

  const columns: any = [
    {
      title: '高度',
      dataIndex: 'blocknum',
      key: 'blocknum',
      align: 'center',
      ellipsis: true,
      width: '18%',
    },
    {
      title: '区块哈希',
      dataIndex: 'blockhash',
      key: 'blockhash',
      align: 'center',
      ellipsis: true,
      width: '27%',
      render: (text: string) => (
        <div 
          className="blockhash-cell" 
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
      width: '40%',
      render: (text: any) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '交易量',
      dataIndex: 'txcount',
      key: 'txcount',
      align: 'center',
      width: '15%',
      ellipsis: true,
    }
  ];

  return (
    <>
      <Dtable
        rowKey="blockhash"
        dataSource={dataSource}
        columns={columns}
        // pagination={pagination}
        pagination={false}
        onChange={onChange}
        rowClassName={'table_hover_hand'}
        // onRow={(record: any) => {
        //   return {
        //     onClick: () => {
        //       handleDoubleClickJump(record);
        //     }, // 点击行
        //   };
        // }}
        onRow={(record: any) => {
          return {
            onClick: () => handleDoubleClickJump(record.blockhash), // 传递 txhash 到处理函数
          };
        }}
      />
    </>
  );
};

export default NewBlock;