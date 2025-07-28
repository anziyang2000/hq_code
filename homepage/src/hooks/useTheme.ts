import { createContext, useState } from 'react';

import { isDaytime } from '@/utils/tool';

// 全局主题类型定义
type themeType = 'dark' | 'light';
interface ThemeContextType {
  theme: themeType;
  toggle: () => void;
}

// 创建主题上下文
export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggle: () => {},
});

// 根据时间获取主题风格 用户点击过后进行持久化 优先级更高
function getTheme() {
  const savedTheme = sessionStorage.getItem('theme') as themeType;
  return savedTheme || (isDaytime() ? 'light' : 'dark');
}

/** 自定义 Hook 处理主题逻辑 */
export default function useTheme(): [themeType, () => void] {
  const [theme, setTheme] = useState<themeType>(getTheme());

  const toggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    sessionStorage.setItem('theme', newTheme);
  };

  return [theme, toggle];
}
