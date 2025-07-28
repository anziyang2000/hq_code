import dark from '@assets/dark.svg';
import darkHover from '@assets/dark_hover.svg';
import light from '@assets/light.svg';
import lightHover from '@assets/light_hover.svg';
import icon from '@assets/shukeyun.svg';
import { Flex } from 'antd';
import classNames from 'classnames';

import { ThemeContext } from '@/hooks/useTheme';

import HeaderStyle from './index.module.scss';

export default function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { theme, toggle } = useContext(ThemeContext);

  const [isHover, setIsHover] = useState(false);

  const navData = [
    {
      key: '/',
      title: '首页',
      handleClick: () => {
        navigate('/');
      },
    },
    {
      key: 'blockChain',
      title: '区块链浏览器',
      handleClick: () => {
        window.open('https://explorer.shukechain.com/#/');
      },
    },
    {
      key: 'NFT',
      title: 'NFT 浏览器',
    },
    {
      key: 'dataRegister',
      title: '数据存证',
    },
    {
      key: 'digitalCreation',
      title: '数创平台管理',
    },
  ];

  // 切换图标
  const themeIcon = useMemo(() => {
    const lightIcon = isHover ? lightHover : light;
    const darkIcon = isHover ? darkHover : dark;

    return theme === 'dark' ? lightIcon : darkIcon;
  }, [isHover, theme]);

  return (
    <nav className={HeaderStyle.header}>
      <Flex align="center" justify="space-between">
        <Flex align="center" justify="space-between">
          <img src={icon} />
          <span className={HeaderStyle.title}>数科云链</span>
        </Flex>
        <Flex className={HeaderStyle.menu} align="center" justify="space-between">
          {navData.map(({ key, title, handleClick }) => {
            const isSelected = pathname.includes(key);
            return (
              <div key={key} className={HeaderStyle.wrap}>
                <span
                  className={classNames(HeaderStyle.item, {
                    [HeaderStyle.selected]: isSelected,
                  })}
                  onClick={handleClick}
                >
                  {title}
                </span>
              </div>
            );
          })}
        </Flex>
      </Flex>
      <img
        className={`${HeaderStyle.theme} pointer`}
        src={themeIcon}
        onClick={toggle}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      />
    </nav>
  );
}
