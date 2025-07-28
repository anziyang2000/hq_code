import React, { useImperativeHandle, useState } from 'react';
import './index.less';
function ActionSheetCoontainer({ children }: { children: React.ReactNode }, ref) {
  const [visible, setVisible] = useState(false);
  useImperativeHandle(ref, () => ({
    show: () => {
      setVisible(true);
    },
    hide: () => {
      setVisible(false);
    },
  }));
  return (
    <div className={`action-sheet-mask ${visible ? 'show' : 'hide'}`}>
      <div className={`action-sheet-container ${visible ? 'show' : 'hide'}`}>{children}</div>
    </div>
  );
}

export const ActionSheet = React.forwardRef(ActionSheetCoontainer);
