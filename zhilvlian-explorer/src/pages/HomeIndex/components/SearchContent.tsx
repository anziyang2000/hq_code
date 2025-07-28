import { Col, Row } from 'antd';
import RcResizeObserver from 'rc-resize-observer';
import { useState, useEffect, useRef } from 'react';
import SearchInput from '@/components/SearchInput';
import TweenOne from 'rc-tween-one';
import Children from 'rc-tween-one/lib/plugin/ChildrenPlugin';
import UGap from '@/components/UGap';
import { isEmpty } from 'lodash';
import { history } from 'umi';
import './css/searchContent.less';

TweenOne.plugins.push(Children);

interface SearchContentType {
  block_height?: number;
  chaincode_total?: number;
  channel_total?: number;
  peer_total?: number;
  tx_total?: number;
}

const SearchContent: React.FC<SearchContentType> = (props) => {
  const [responsive, setResponsive] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false); // 用于控制懒加载
  const rowRef = useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const isShow = isEmpty(props);


  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleRowClick = (record: any) => {
    history.push('/block_list', { blockData: record });
  };

  const handleSeeMoreClick = () => {
    // 假设传递空对象，或者你可以传递特定的数据
    handleRowClick({});
  };

  // Format numbers to avoid commas and cap at 99999999 if over 6 digits
  const formatNumber = (num?: number) => {
    if (num === undefined) return 0;
    if (num > 9999999 && windowWidth > 678) return 9999999;
    if (windowWidth < 678 && num > 9999) return 9999
    return num;
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsLoaded(true);
            observer.disconnect(); // 只触发一次
          }
        });
      },
      {
        root: null, // 相对视口
        rootMargin: '0px',
        threshold: 0.1, // 当 10% 的内容进入视口时触发
      }
    );

    if (rowRef.current) {
      observer.observe(rowRef.current);
    }

    return () => {
      if (rowRef.current) {
        observer.unobserve(rowRef.current);
      }
    };
  }, []);

  return (
    <RcResizeObserver
      key="resize-observer"
      onResize={(offset) => {
        setResponsive(offset.width < 596);
      }}
    >
      <Row className='homeIndexPhoto' ref={rowRef}>
        {isLoaded && ( // 当元素进入视口时渲染内容
            <Row className="searchContentBox">
              <Col className="searchContentBox_left" xs={24} sm={24} md={24} lg={10} xl={10} xxl={10}>
                <div className="searchTop">Blockchain</div>
                <SearchInput />
                <div className="searchContentBox_left_detail">
                  <div className='qukuaiIndexCard' onClick={handleSeeMoreClick}>
                    <div className='qukuaiIndexCard_icon'></div>
                    <div className='qukuaiIndexCard_num'>
                      {isShow ? (
                        0
                      ) : (
                        <TweenOne
                          animation={{
                            Children: {
                              value: formatNumber(props.block_height),
                              floatLength: 0,
                            },
                            duration: 1500,
                          }}
                          className='qukuaiIndexCard_nums'
                        >
                          0
                        </TweenOne>
                      )}
                      +
                    </div>
                    <span className='qukuaiIndexCard_name'>区块高度</span>
                  </div>
                  <div className='jiaoyiIndexCard' onClick={() => history.push('/tx_list')}>
                    <div className='jiaoyiIndexCard_icon'></div>
                    <div className='jiaoyiIndexCard_num'>
                      {isShow ? (
                        0
                      ) : (
                        <TweenOne
                          animation={{
                            Children: {
                              value: formatNumber(props.tx_total),
                              floatLength: 0,
                            },
                            duration: 1500,
                          }}
                          className='jiaoyiIndexCard_nums'
                        >
                          0
                        </TweenOne>
                      )}
                      +
                    </div>
                    <span className='jiaoyiIndexCard_name'>交易总数</span>
                  </div>
                </div>
                <UGap height={192} />
              </Col>
              <Col
                className="searchContentBox_right"
                xs={24}
                sm={24}
                md={24}
                lg={14}
                xl={14}
                xxl={14}
              >
              </Col>
            </Row>
        )}
      </Row>
    </RcResizeObserver>
  );
};
export default SearchContent;