import React from 'react';
import { DidItem } from '../../utils/storage';
import HeaderIcon from '../../components/heaederIcon';
import './did.less';
import { Account } from '../../utils/interface';
export const DidListComponent = ({
  activeDid,
  didDocList,
  setActiveDid,
  currentAccount,
}: {
  activeDid: string;
  didDocList: DidItem[];
  setActiveDid: (did: string) => void;
  currentAccount?: Account;
}) => (
  <div className="did-auth-list">
    {didDocList?.map((item) => {
      const currentIndex = item.accounts.findIndex((account) => account.address === currentAccount?.address);
      const viewAccount = item.accounts[currentIndex !== -1 ? currentIndex : 0];
      return (
        <div key={item.id} className="flex-space-between padding-2n">
          <div className="flex">
            <HeaderIcon
              style={{
                cursor: 'pointer',
              }}
              onClick={() => setActiveDid(item.id)}
              color={item.accounts[0].color}
              width={40}
              height={40}
            />
            <div
              style={{
                cursor: 'pointer',
              }}
              onClick={() => setActiveDid(item.id)}
              className="did-item-content ml-2n"
            >
              <div className="flex">
                <p className="did-item-name ">{viewAccount.name}</p>
                {currentIndex !== -1 && <span className="item-selected-tag">当前</span>}
              </div>

              <p className="did-item-id">{item.id}</p>
            </div>
          </div>
          {item.id === activeDid && <img className="item-selected-icon" src="/img/select40.png" />}
        </div>
      );
    })}
  </div>
);

export default DidListComponent;
