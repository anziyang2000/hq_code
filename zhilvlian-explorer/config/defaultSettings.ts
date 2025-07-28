import { Settings as LayoutSettings } from '@ant-design/pro-components';

/**
 * @name
 */
const Settings: LayoutSettings & {
  pwa?: boolean;
  logo?: string;
  primaryColor?: string;
} = {
  navTheme: 'light',
  primaryColor: '#1890ff',
  layout: 'top',
  contentWidth: 'Fixed',
  fixedHeader: true,
  fixSiderbar: false,
  pwa: false,
  title: '数科云链 | 智旅链浏览器',
  logo: 'https://prod.shukeyun.com/maintenance/deepfile/data/2022-09-26/upload_3ae46d26e1e5a87b731ee7ca76e06e2d.png',
  colorPrimary: '#1677FF',
  splitMenus: false,
};

export default Settings;