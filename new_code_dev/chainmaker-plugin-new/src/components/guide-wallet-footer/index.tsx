import React from 'react';
import { Button } from 'tea-component';
import './index.less';
export default function GuideeWalletFooter({ onCreate, onImport }: { onCreate: () => void; onImport: () => void }) {
  return (
    <footer className={'guide-footer-btn-group'}>
      <Button type={'weak'} onClick={onCreate}>
        创建钱包
      </Button>
      <Button type={'primary'} onClick={onImport}>
        导入钱包
      </Button>
    </footer>
  );
}
