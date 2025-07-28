import { message, Select } from 'antd';
import { useState } from 'react';
import type { SelectProps } from 'antd';
import { history } from 'umi';
import { getSearchInput } from '@/services';
import styles from './index.less';
import { useLocation, useModel } from '@umijs/max';
import code from '@/utils/code';

interface SearchInputType {
  onChange?: (value: any) => void;
  className?: string;
  value?: string;
}

const SearchInput: React.FC<SearchInputType> = (props) => {
  const { initialState } = useModel('@@initialState');
  const [data, setData] = useState<SelectProps['options']>([]);
  const [value, setValue] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>(''); // 新增状态
  const location = useLocation();

  let timeout: ReturnType<typeof setTimeout> | null;
  let currentValue: string;

  const fetch = (value: string, callback: Function) => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    currentValue = value;

    const fake = async () => {
      // console.log('value:', value);
      
      const res = await getSearchInput({
        content: value,
        channel_genesis_hash: initialState?.channelList[0].channel_genesis_hash
      });
      if (res.code === code.SUCCESS_CODE) {
        if (res.data.data_index === 1) {
          const data = res.data.block_data.map((item: any) => ({
            value: '区块>' + item.blockhash,
            text: '区块>' + item.blockhash,
          }));
          callback(data || []);
        } else if (res.data.data_index === 2) {
          const data = res.data.tx_data.map((item: any) => ({
            value: '交易>' + item.txhash,
            text: '交易>' + item.txhash,
          }));
          callback(data || []);
        } else {
          callback([]);
        }
      }
    };

    timeout = setTimeout(fake, 300);
  };

  const handleSearch = (newValue: string) => {
    if (newValue) {
      setInputValue(newValue); // 只有 newValue 不为空时才更新 inputValue
      setValue(newValue); // 同步更新 value
      fetch(newValue, setData);
    } else {
      setData([]);
      setValue(null); // 当输入为空时，确保清空 value 和 inputValue
      // setInputValue('');
    }
  };

  const handleChange = (newValue: string): any => {
    if (newValue) {
      setInputValue(newValue); // 只有 newValue 不为空时才更新 inputValue
      setValue(newValue); // 同步更新 value
      const temp = newValue.split('>');
      const typeName = temp[0];
      const typeValue = temp[1];
      // if (typeValue === value) return message.warn('您当前检索的内容重复!');
      const jumpBlock = `/block_list?block=${typeValue}`;
      const jumpTx = `/tx_list?tx=${typeValue}`;
      history.push(typeName === '区块' ? jumpBlock : jumpTx);
      setValue(null); // 跳转后清空输入框的 value 状态
      setInputValue(''); // 同时清空输入框的 inputValue
    }
  };

  const handleClear = () => {
    setValue(null); // 清空 value
    setInputValue(''); // 清空输入值
  };

  const handleButtonClick = () => {
    // console.log('#inputValue:', inputValue);
    
    if (!inputValue) {
      message.warn('请输入区块高度或交易hash');
      return;
    }

    // 检索输入的内容
    fetch(inputValue, (results: any[]) => {
      if (results.length === 0) {
        message.warn('没有匹配的区块或哈希');
      } else {
        // 如果存在匹配的结果，直接跳转
        handleChange(results[0].value);
      }
    });
  };

  return (
    <>
      <div
        className={
          location.pathname !== '/HomeIndex'
            ? styles.search_input_searcHeader
            : styles.search_input_searchContent
        }
        style={{ display: 'flex' }}
      >
      <Select
        showSearch
        allowClear
        value={props.value || value || undefined} // 确保 value 不会是空字符串，使用 undefined
        placeholder="请输入区块高度、交易hash"
        style={{ borderRadius: 6, backgroundColor: '#F6F6F8' }}
        className={`search_input ${props.className || ''}`}
        defaultActiveFirstOption={false}
        showArrow={false}
        filterOption={false}
        onSearch={handleSearch}
        onChange={handleChange}
        onClear={handleClear}
        notFoundContent={null}
        options={(data || []).map((d) => ({
          value: d.value,
          label: d.text,
        }))}
        optionLabelProp="label"
        />
        <button
          className='searchButton'
          onClick={handleButtonClick}
        >
          搜索
        </button>
      </div>
    </>
  );
};

export default SearchInput;