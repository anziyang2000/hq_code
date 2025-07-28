import { Button, Result } from 'antd';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <Result
      status="404"
      title="404"
      subTitle="该页面不存在"
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
          返回
        </Button>
      }
    />
  );
}
