// import { GlobalOutlined } from '@ant-design/icons';
import { MenuOutlined } from '@ant-design/icons'; // 导入三条横杠图标
import { useModel } from '@umijs/max';
import { Select } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.less';

export type SiderTheme = 'light' | 'dark';

const GlobalHeaderRight: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const [options, setOptions] = useState<
    { label: string; value: string; channel_genesis_hash: string }[]
  >([]);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    init();
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // 检测屏幕宽度是否小于768px
    };
    handleResize(); // 初始化判断
    window.addEventListener('resize', handleResize); // 监听窗口变化
    return () => window.removeEventListener('resize', handleResize); // 清除监听器
  }, []);

  if (!initialState || !initialState.settings) {
    return null;
  }

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setOptions([...initialState?.channelList]);
  };

  // const handleJumpDataScreen = () => {
  //   console.log(process.env.SCREEN_URL, '带跳转数据大屏');
  //   // window.open(process.env.SCREEN_URL,'_blank')
  // };

  const handleChangeSelect = async (value: {
    channel_genesis_hash: string;
    channelname: string;
  }) => {
    await setInitialState((s: any) => ({
      ...s,
      channelList: [value],
    }));
  };

  // 点击横杠图标时，打开 Select 下拉框
  const handleIconClick = () => {
    setDropdownOpen(true);
  };

  return (
    <>
      <div className={styles.header_right}>
        {options.length > 0 ? (
          <Select
            onChange={(val, record) => handleChangeSelect(record as any)}
            defaultValue={options[0]?.value}
            style={{ width: 120 }}
            options={options}
            popupClassName={styles.popupClassName}
            dropdownStyle={{ backgroundColor: '#fff' }}
            open={dropdownOpen} // 控制下拉菜单的显示
            onDropdownVisibleChange={(open) => setDropdownOpen(open)} // 监听下拉框状态变化
          />
        ) : (
          ''
        )}
        {isMobile ? (
        <MenuOutlined
          className='header_right_line'
          onClick={handleIconClick} // 点击时打开 Select 下拉菜单
        />) : ''}
        {/* <GlobalOutlined
          onClick={handleJumpDataScreen}
          style={{
            color: '#64B5F6',
            width: 50,
            fontSize: 20,
            cursor: 'pointer',
            verticalAlign: 'middle',
          }}
          twoToneColor="#64B5F6"
        /> */}
      </div>
    </>
  );
};
export default GlobalHeaderRight;