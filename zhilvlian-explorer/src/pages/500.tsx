import { history } from '@umijs/max';
import { Button, Result, Image } from 'antd';
import React from 'react';
import NoFound from '@/assets/images/NoFound.png';

const NoFoundPage: React.FC = () => (
  <Result
    style={{ width: '100%' }}
    icon={<Image height={400} preview={false} src={NoFound} />}
    title={<span style={{ color: '#000' }}>500</span>}
    subTitle={<span style={{ color: '#000' }}>服务器繁忙，请稍后重试~</span>}
    extra={
      <Button
        type="primary"
        onClick={() => {
          history.push('/');
          location.reload();
        }}
      >
        刷新重试
      </Button>
    }
  />
);

export default NoFoundPage;
