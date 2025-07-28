import React, { useState } from 'react';
import './index.less';
import { copyToClipboard } from '../../utils/utils';
export function MnemonicContainer({
  orginArr,
  copy = false,
  select = false,
  onSelect,
}: {
  orginArr: { word: string; index: number }[];
  copy?: boolean;
  select?: boolean;
  onSelect?: (row: { word: string; index: number }) => void;
}) {
  if (!orginArr.length) {
    return <></>;
  }

  return (
    <div className="mnemonic-container">
      <div className="mnemonic-list">
        {orginArr.map((item) => (
          <div
            className="mnemonic-item"
            key={item.word}
            onClick={() => {
              if (select) {
                onSelect(item);
              }
            }}
          >
            {item.word}
          </div>
        ))}
      </div>
      {copy && (
        <div className="mnemonic-operate">
          <div
            className="copy-btn"
            onClick={() => {
              const str = orginArr.map((item) => item.word).join(' ');
              copyToClipboard(str);
            }}
          >
            <img src="../../../img/icon-copy.png" alt="" />
            <span>复制</span>
          </div>
        </div>
      )}
    </div>
  );
}
