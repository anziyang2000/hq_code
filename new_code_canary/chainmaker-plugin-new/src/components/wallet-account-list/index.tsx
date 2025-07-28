import React, { useMemo } from 'react';
import { Copy, List } from 'tea-component';
import { ListContainer } from '../../utils/common';
import { Account } from '../../utils/interface';
import './index.less';
export function WalletAccountList({
  accounts,
  mode,
  onDelete,
  onDetail,
}: {
  accounts: Account[];
  mode: 'permissionedWithCert' | 'public';
  onDelete?: (Account) => void;
  onDetail?: (Account) => void;
}) {
  const styles = useMemo(() => {
    if (mode === 'permissionedWithCert') {
      return {
        class: 'avatar-certificate',
        tag: 'C',
      };
    }
    if (mode === 'public') {
      return {
        class: 'avatar-public-key',
        tag: 'P',
      };
    }
    return {
      class: '',
      tag: '',
    };
  }, [mode]);
  return (
    <ListContainer items={accounts} notFound={'暂无账户'}>
      <List className="wallet-account-list ">
        {accounts.map((item) => (
          <List.Item
            key={item.address}
            className={`wallet-account-item ${onDelete ? 'support-delete' : ''}`}
            onClick={() => {
              onDetail?.(item);
            }}
          >
            <div className="wallet-account-content">
              <div className={'wallet-account-content-name'}>
                <span className={`wallet-account-tag ${styles.class}`}>{styles.tag}</span>
                <div className="wallet-account-name">{item.name}</div>
              </div>
              {item.address && (
                <div className="wallet-account-content-address">
                  <span className="tea-mr-1n">{item.address}</span>
                  <span onClick={(e) => e.stopPropagation()}>
                    <Copy text={item.address} />
                  </span>
                </div>
              )}
            </div>
            {onDelete && (
              <div className="wallet-account-delete-icon">
                <img
                  src={'/img/icon-delete.png'}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(item);
                  }}
                  title={'删除'}
                />
              </div>
            )}
          </List.Item>
        ))}
      </List>
    </ListContainer>
  );
}
