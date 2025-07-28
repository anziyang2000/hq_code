import { Settings as LayoutSettings } from '@ant-design/pro-components';
import { RunTimeLayoutConfig, useLocation, history } from '@umijs/max';
import { getChannel, loginToken } from '@/services';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
import { setToken, getToken } from '@/shared';
import RightContent from './components/RightContent';
import loginParams from '../config/config.user';
import SearchInput from './components/SearchInput';
import { useEffect, useState } from 'react';

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  fetchChannel?: () => Promise<[]>;
  channelList?: any;
}> {
  try {
    const res = await loginToken(loginParams);
    setToken(res && res.data.token);
  } catch (error: any) {
    history.push('/500');
  }
  const fetchChannel = async () => {
    let res = await getChannel();
    return res;
  };
  const r = getToken();
  if (r) {
    const channelList = await fetchChannel();
    return {
      channelList: channelList.reverse(),
      settings: defaultSettings,
    };
  }
  return {
    settings: defaultSettings,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  const locationPathName = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // 添加resize事件监听器
    window.addEventListener('resize', handleResize);

    // 清理事件监听器
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  return {
    footerRender: false,
    layout: 'top',
    contentWidth: 'Fixed',
    fixedHeader: true,
    fixSiderbar: false,
    headerContentRender: () => (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {isMobile ? (
          <h1>
            {defaultSettings.title}
          </h1>
        ) : ''}
        {locationPathName.pathname !== '/home' ? <div className='mobile_search'>
          <SearchInput />
        </div> : null}
      </div>
    ),
    rightContentRender: () => <RightContent />,
    ...initialState?.settings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request = {
  ...errorConfig,
};