import { Grid } from 'antd';
const { useBreakpoint } = Grid;

//判断字符串是否为数字和字母组合
export const useBreakpointGrid = () => {
  const screens = useBreakpoint();
  return Object.entries(screens)
    .filter((screen) => !!screen[1])
    .map((screen) => {
      return screen[0];
    });
};
