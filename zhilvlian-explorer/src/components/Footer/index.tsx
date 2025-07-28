import { Col, Row, Image } from 'antd';
import './index.less';
// import { useState } from 'react';
import React, { useState, useRef, useEffect } from 'react';
import useIntersectionObserver from '@/utils/lazyLoadBackground';

/**
 * 每个单独的卡片，为了复用样式抽成了组件
 * @param param0
 * @returns
 */
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null); // 创建 ref

  // 使用自定义 Hook 观察 imageContainerRef
  const isVisible = useIntersectionObserver(imageContainerRef, {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
  });

  // 当元素进入视口时设置 imageSrc
  useEffect(() => {
    if (isVisible && !imageSrc) {
      setImageSrc('https://prod.shukeyun.com/maintenance/deepfile/data/2022-09-28/upload_6ae85d683fc4044c814539482ec14fb7.png');
      // console.log('图片已进入视口，开始加载。');
    }
  }, [isVisible, imageSrc]);

  return (
    <div className="footer_box">
      <Row justify="center" style={{ backgroundColor: '#FFFFFF' }}>
        {/* <Col xs={20} sm={20} md={20} lg={18} xl={18}> */}
        <Col>
          <p className='foot_title'>联系我们</p>
          <div className='foot_content' style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className='foot_left'>
              <p>我要咨询想了解更多，请使用在线咨询服务，我们将结合您的业务为您做详细介绍及服务</p>
              <button className='foot_button'>立即咨询</button>
            </div>
            <div className='foot_right'>
              <div className='foot_right_left'>
                <p>售前咨询热线</p>
                <p>致电：40088-11138或0755-88328999</p>
                <p>邮箱：88328999@hqshuke.com</p>
              </div>
              <div className='foot_right_right'>
                {/* <Image
                  // height={126}
                  // width={126}
                  preview={false}
                  src="https://prod.shukeyun.com/maintenance/deepfile/data/2022-09-28/upload_6ae85d683fc4044c814539482ec14fb7.png"
                /> */}
                 {/* 将 ref 绑定到一个始终存在的容器 div */}
                 <div ref={imageContainerRef} className='total_img'>
                  {imageSrc ? (
                    <Image
                      className="lazy-load-img"
                      preview={false}
                      src={imageSrc}
                      alt="关注我们"
                    />
                  ) : (
                    // 占位符，确保容器有高度，方便观察器检测
                    <div className='footer_placeholder'>加载中...</div>
                  )}
                </div>
                <p>关注我们，了解更多</p>
              </div>
            </div>
          </div>
        </Col>
      </Row>
      <div className='foot_bottom_content'>
        {/* {'Copyright © 2001-2022 Global Digital Technology Co.,Ltd. All Rights Reserved  粤ICP备09156180号'} */}
        {/* {`Copyright © 2001-${currentYear} Global Digital Technology Co.,Ltd. All Rights Reserved  `} */}
        {`Copyright © 2001-${currentYear} 环球数科股份有限公司 提供技术支持 版权所有 | `}
        {/* <a href="http://www.hqshuke.com/" target="_blank" rel="noreferrer">
          环球数科集团有限公司
        </a>
        {` 提供技术支持 版权所有 | `} */}
        <a href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank" rel="noreferrer">
          粤ICP备09156180号&nbsp;
        </a>
        <a href="https://bcbeian.ifcert.cn/index" target="_blank" rel="noreferrer">
          | 粤网信备44030524273626860016号
        </a>
        {/* <a
          style={{ marginLeft: 35, color: '#fff' }}
          href="https://www.hqshuke.com"
          target="_blank"
          rel="noreferrer"
        >
          联系我们
        </a> */}
      </div>
    </div>
  );
};

export default Footer;