import { Col, Row } from 'antd';
import { history } from 'umi';
import TweenOne from 'rc-tween-one';
import Children from 'rc-tween-one/lib/plugin/ChildrenPlugin';
import './css/newCardList.less';
import { isEmpty } from 'lodash';
import { useState, useEffect, useRef } from 'react';

TweenOne.plugins.push(Children);

const handleJump = (value: any) => {
  history.push(`/${value}`);
};

interface presentationDataType {
  block_height?: number;
  chaincode_total?: number;
  channel_total?: number;
  peer_total?: number;
  tx_total?: number;
}

const PresentationData: React.FC<presentationDataType> = (props: presentationDataType) => {
  const [isLoaded, setIsLoaded] = useState(false); // 用于懒加载的状态
  const cardListRef = useRef<HTMLDivElement>(null); // 目标元素的引用
  const isShow = isEmpty(props);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsLoaded(true);
            observer.disconnect(); // 只触发一次懒加载
          }
        });
      },
      {
        root: null, // 相对于视口
        rootMargin: '0px',
        threshold: 0.1, // 元素进入视口 10% 时触发
      }
    );

    if (cardListRef.current) {
      observer.observe(cardListRef.current);
    }

    return () => {
      if (cardListRef.current) {
        observer.unobserve(cardListRef.current);
      }
    };
  }, []);

  return (
    <Row justify="center">
      <Col>
        <Row className="cardListBox" ref={cardListRef}>
          {isLoaded && ( // 只有在进入视口后才会渲染
            <>
              <div onClick={() => handleJump('node_list')} className='node_num'>
                <div className='node_icon'></div>
                <span className='node_name'>节点数量</span>
                <div className='node_zero'>
                  {isShow ? (
                    0
                  ) : (
                    <TweenOne
                      animation={{
                        Children: {
                          value: props.peer_total,
                          floatLength: 0,
                          formatMoney: true,
                        },
                        duration: 1500,
                      }}
                      className='node_nums'
                    >
                      0
                    </TweenOne>
                  )}
                </div>
                <div className="lineCharts1"></div>
              </div>

              <div onClick={() => handleJump('contract_list')} className='contract_num'>
                <div className='contract_icon'></div>
                <span className='contract_name'>合约数量</span>
                <div className='contract_zero'>
                  {isShow ? (
                    0
                  ) : (
                    <TweenOne
                      animation={{
                        Children: {
                          value: props.chaincode_total,
                          floatLength: 0,
                          formatMoney: true,
                        },
                        duration: 1500,
                      }}
                      className='contract_nums'
                    >
                      0
                    </TweenOne>
                  )}
                </div>
                <div className="lineCharts2"></div>
              </div>

              <div onClick={() => handleJump('network_list')} className='travel_num'>
                <div className='travel_icon'></div>
                <span className='travel_name'>网络数量</span>
                <div className='travel_zero'>
                  {isShow ? (
                    0
                  ) : (
                    <TweenOne
                      animation={{
                        Children: {
                          value: props.channel_total,
                          floatLength: 0,
                          formatMoney: true,
                        },
                        duration: 1500,
                      }}
                      className='travel_nums'
                    >
                      0
                    </TweenOne>
                  )}
                </div>
                <div className="lineCharts3"></div>
              </div>
            </>
          )}
        </Row>
      </Col>
    </Row>
  );
};

export default PresentationData;