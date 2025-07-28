import './App.css';

import MyRoutes from '@/router';

import useTheme, { ThemeContext } from './hooks/useTheme';

// 这个是全局的页面 还可以做一些其他的操作，如全局主题

export default function App() {
  const [theme, toggle] = useTheme();

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggle,
      }}
    >
      <div className={`${theme}-theme`}>
        <MyRoutes />
      </div>
    </ThemeContext.Provider>
  );
}
