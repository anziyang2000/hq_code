// Dtable.tsx
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';
import styles from './index.less';

interface DataType {
  key: React.Key;
  name?: string;
  img_url?: string;
  issuer?: string;
  tx_id: string;
  blockchain_account: string;
  minted_at: string;
}

interface DtableType {
  columns: ColumnsType<DataType>;
  dataSource: DataType[];
  rowKey: string;
  onChange?: (pagination: any, filters: any, sorter: any) => void;
  onRow?: any;
  rowClassName?: string;
  pagination?: {
    pageSize: number;
    current: number;
    total: number;
    onChange: (page: number, pageSize?: number) => void;
  } | false; // 允许 pagination 为 false
}


// interface DtableType {
//   columns: ColumnsType<DataType>;
//   dataSource: DataType[];
//   rowKey: string;
//   onChange?: (pagination: any, filters: any, sorter: any) => void;
//   onRow?: any;
//   rowClassName?: string;
//   pagination?: {
//     pageSize: number;
//     current: number;
//     total: number;
//     onChange: (page: number, pageSize?: number) => void;
//   };
// }

const Dtable: React.FC<DtableType> = (props) => {
  return (
    <div className={styles.tableBox}>
      <Table
        rowKey={props.rowKey}
        rowClassName={`${styles.rowClassHover} ${props.rowClassName || ''}`}
        columns={props.columns}
        dataSource={props.dataSource}
        onChange={props.onChange}
        onRow={props.onRow}
        scroll={{ x: 1200 }}
        pagination={props.pagination} // 支持分页
      />
    </div>
  );
};


export default Dtable;
