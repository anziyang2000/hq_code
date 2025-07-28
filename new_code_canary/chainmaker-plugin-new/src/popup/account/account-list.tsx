import React, { forwardRef, Ref, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { Account } from '../../utils/interface';
import chainStorageUtils from '../../utils/storage';
import { useChainStore } from '../popup';
import HeaderIcon from '../../components/heaederIcon';
import { shortStr } from '../../utils/utils';

export const AccountListComponent = (props: {
  options?: (account: Account) => React.ReactNode | undefined;
  accountClick?: (account: Account) => void;
  accounts: Account[];
}) => {
  const showList = useMemo(() => {
    const list = [];
    props.accounts.forEach((account) => {
      if (account.isCurrent) {
        list.unshift(account);
      } else {
        list.push(account);
      }
    });
    return list;
  }, [props.accounts]);
  return (
    <div className="account-ls">
      {showList?.map((ac) => (
        <div key={ac.address} className="account-ls-i">
          <HeaderIcon
            style={{
              cursor: props.accountClick ? 'pointer' : 'auto',
            }}
            onClick={() => props.accountClick?.(ac)}
            color={ac.color}
            classN="account-ls-header"
            width={40}
            height={40}
          />
          <div
            style={{
              cursor: props.accountClick ? 'pointer' : 'auto',
            }}
            onClick={() => props.accountClick?.(ac)}
            className="account-ls-info"
          >
            <div className="account-ls-name">
              {ac.name}
              {ac.isCurrent && <span className="account-ls-log">当前</span>}
            </div>
            <p>
              <span className="account-ls-addr">{shortStr(ac.address)}</span>
              {/* <Copy text={ac.address} /> */}
            </p>
          </div>
          {props.options?.(ac)}
        </div>
      ))}
    </div>
  );
};

function ChainAccountListComponent(
  props: {
    options?: (account: Account) => React.ReactNode | undefined;
    accountClick?: (account: Account) => void;
  },
  ref: Ref<any>,
) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const chainSelected = useChainStore((state) => state.selectedChain);

  useImperativeHandle(ref, () => ({
    update: () => {
      if (!chainSelected) {
        return;
      }
      chainStorageUtils.getChainAccounts(chainSelected.chainId).then((res) => {
        setAccounts(res);
      });
    },
  }));
  useEffect(() => {
    if (!chainSelected) {
      return;
    }
    chainStorageUtils.getChainAccounts(chainSelected.chainId).then((res) => {
      setAccounts(res);
    });
  }, []);
  return <AccountListComponent accounts={accounts} options={props.options} accountClick={props.accountClick} />;
}
const AccountList = forwardRef(ChainAccountListComponent);
export default AccountList;
