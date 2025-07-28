import React, { useEffect, useMemo } from 'react';
import { Breadcrumb, Col, Row, Typography } from 'antd';
import { useLocation } from '@umijs/max';
import { history } from 'umi';
import { backScrollTop } from '@/utils/scrollTop';
import './index.less';
import isJson from "@/utils/tools";
import { RightOutlined } from '@ant-design/icons'; // 引入RightOutlined图标

const { Paragraph } = Typography;

interface DetailType {
  txhash?: string;
  validation_code?: string;
  payload_proposal_hash?: string;
  creator_msp_id?: string;
  endorser_msp_id?: string;
  chaincodename?: string;
  type?: string;
  createdt?: string;
  write_set?: any; // 使用 `any` 以适应多种数据结构
  showType?: ShowType; // 可以从路由中动态确定
  onClose?: () => void;
  prehash?: string;
  datahash?: string;
  blockhash?: string;
  txcount?: string;
  blocknum?: string;
}

interface ItemType {
  key: string;
  value: string;
}

interface WriteSetObject {
  chaincode: string;
  set: ItemType[];
}

type ShowType = 'transactionHash' | 'blockHash';

const HashOrBlockDetail: React.FC<DetailType> = (props) => {
  const {
    txhash,
    validation_code,
    payload_proposal_hash,
    creator_msp_id,
    endorser_msp_id,
    chaincodename,
    createdt,
    type,
    write_set,
    prehash,
    datahash,
    blockhash,
    txcount,
    blocknum,
  } = props;

  // 将 txhash 字符串按逗号分隔为数组
  const txhashArray = txhash ? txhash.split(',') : [];

  const location = useLocation();
  const query = new URLSearchParams(location.search);

  // 根据查询参数判断是交易详情还是区块详情
  const isTransactionHash = query.has('tx');
  const isBlockHash = query.has('block');

  useEffect(() => {
    backScrollTop();
    // console.log('#fromPage', fromPage );
    // console.log('#location', location );
  }, []);

    // 将 createdt 转换为中国时区时间
    const formatCreatedt = (dateString: string) => {
      const date = new Date(dateString);
      // 增加 8 小时
      date.setHours(date.getHours() + 8);
      // 转换为 ISO 字符串格式
      return date.toISOString();
    };
    const formattedCreatedt = createdt ? formatCreatedt(createdt) : '';

  const BlockList = useMemo(() => (
    <div className="detail_box">
      <Paragraph
        copyable={{
          text: blockhash,
          icon: <span className="copyable-icon" />,
        }}
      >
        <span className="detail_box_item">区块哈希:</span>
        {blockhash}
      </Paragraph>
      <Paragraph>
        <span className="detail_box_item">区块高度:</span>
        {blocknum}
      </Paragraph>
      <Paragraph>
        <span className="detail_box_item">创建时间:</span>
        {formattedCreatedt}
      </Paragraph>
      <Paragraph>
        <span className="detail_box_item">交易数量:</span>
        {txcount}
      </Paragraph>
      <Paragraph>
        <span className="detail_box_item">验证状态码:</span>
        {validation_code}
      </Paragraph>
      <Paragraph>
        <span className="detail_box_item">数据哈希:</span>
        {datahash}
      </Paragraph>
      <Paragraph>
        <span className="detail_box_item">父区块哈希:</span>
        {prehash}
      </Paragraph>
      <Paragraph>
        <span className="detail_hash_item" style={{ color: '#777C85' }}>
          交易哈希:
        </span>
        {txhashArray.length > 0 ? (
          <>
            {/* 第一个交易哈希显示在同一行 */}
            <span className='qukuai_jiaoyihash'>
              <Paragraph
                copyable={{
                  text: txhashArray[0],
                  icon: <span className="copyable-icon" />,
                }}
                style={{ display: 'inline', margin: 0 }} // display: inline 保持在同一行
              >
                {txhashArray[0]}
              </Paragraph>
            </span>
            {/* 从第二个开始，使用 Paragraph 标签使其换行显示 */}
            {txhashArray.slice(1).map((hash, index) => (
              <Paragraph
                key={index}
                copyable={{
                  text: hash,
                  icon: <span className="copyable-icon" />,
                }}
                className="hash-margin-left"
                style={{ margin: 0 }} // 自动换行
              >
                {hash}
              </Paragraph>
            ))}
          </>
        ) : (
          // 如果 txhash 为空，则显示空数组
          <span>[&nbsp;]</span>
        )}
      </Paragraph>
    </div>
  ), [txhash, blocknum, formattedCreatedt, txcount, validation_code, blockhash, datahash, prehash]);

  const DetailList = useMemo(() => {
    let formattedWriteSet;
    if (Array.isArray(write_set)) {
      formattedWriteSet = write_set.map(({ chaincode = '', set = [] }: WriteSetObject) => ({
        chaincode,
        set: set.map((item: ItemType) => {
          let obj: Partial<ItemType> = {};
          if (isJson(item.value)) {
            const cleanItemValue = item.value.replace(/\\"/g, '');
            
            // obj.value = JSON.parse(item.value);
            obj.value = JSON.parse(cleanItemValue);
          }
          return { ...item, ...obj };
        })
      }));
    } else if (typeof write_set === 'object' && write_set !== null) {
      formattedWriteSet = {
        ...(write_set as Record<string, any>),
      };
    }

    return (
      <div className="detail_box">
        <Paragraph
        copyable={{
          text: txhash,
          icon: <span className="copyable-icon" />,
        }}
        >
          <span className="detail_hash_item">交易哈希:</span>
          {txhash}
        </Paragraph>
        <Paragraph>
          <span className="detail_box_item">验证状态码:</span>
          {validation_code}
        </Paragraph>
        <Paragraph>
          <span className="detail_box_item">提案哈希:</span>
          {payload_proposal_hash}
        </Paragraph>
        <Paragraph>
          <span className="detail_box_item">创建成员:</span>
          {creator_msp_id}
        </Paragraph>
        <Paragraph>
          <span className="detail_box_item">背书成员:</span>
          {endorser_msp_id}
        </Paragraph>
        <Paragraph>
          <span className="detail_box_item">合约名称:</span>
          {chaincodename}
        </Paragraph>
        <Paragraph>
          <span className="detail_box_item">交易类型:</span>
          {type}
        </Paragraph>
        <Paragraph>
          <span className="detail_box_item">交易时间:</span>
          {formattedCreatedt}
        </Paragraph>
        <Paragraph
        copyable={{
          text: `${process.env.SCREEN_URL}tx_list?tx=${txhash}`,
          icon: <span className="copyable-icon" />,
        }}
        >
          <span className="detail_box_item">访问链接:</span>
          {`${process.env.SCREEN_URL}tx_list?tx=${txhash}`}
        </Paragraph>
        <Paragraph>
          <tr>
            <span className="detail_box_item" id='shuju_item'>数据:</span>
            <td style={{ color: 'inherit' }} className='xiangqingshuju'>
              <pre style={{ color: 'inherit', width: '100%'}}>
                {JSON.stringify(formattedWriteSet, null, 2)}
              </pre>
            </td>
          </tr>
        </Paragraph>
      </div>
    );
  }, [txhash, validation_code, payload_proposal_hash, creator_msp_id, endorser_msp_id, chaincodename, type, formattedCreatedt, write_set]);

  const showTypeName = isTransactionHash ? '交易' : isBlockHash ? '区块' : '未知';

  const handleBackClick = (event: React.MouseEvent) => {
    event.preventDefault();
    if (location.key === 'default') {
      history.push('/');
    } else {
      history.back();
    }
  };

  return (
    <Row justify="center">
      <Col>
        <Breadcrumb className="list_table">
        {/* <Breadcrumb className="list_table" separator=">"> */}
          <Breadcrumb.Item onClick={handleBackClick} className="close">
            返回
          </Breadcrumb.Item>
          <RightOutlined />
          <Breadcrumb.Item className="detail">{`${showTypeName}详情`}</Breadcrumb.Item>
        </Breadcrumb>
        {isTransactionHash
          ? DetailList
          : isBlockHash
          ? BlockList
          : null}
      </Col>
    </Row>
  );
};

export default HashOrBlockDetail;