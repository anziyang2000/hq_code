import React, { CSSProperties, memo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChainStore } from '../popup';
import chainStorageUtils, { DidItem, VcItem } from '../../utils/storage';
import { Copy, List, Status } from 'tea-component';
import '../../iconsvg/index';
import { FixedSizeList } from 'react-window';
import { getAccountDid, getDidVcList } from '../../services/did';
import { HeaderCard } from '../../components/header-card';
import SvgIcon from '../../components/svg-icon';

interface RowProps {
  index: number;
  style: CSSProperties;
  data: VcItem[];
}

// ✅ 使用 memo 包装 row 组件
const Row: React.FC<RowProps> = memo(({ index, style, data }) => {
  const vc = data[index];
  const navigate = useNavigate();

  return (
    <div key={index} style={style}>
      <List.Item
        className="flex-space-between did-list-item"
        onClick={() => {
          navigate(`/did/vc-detail`, {
            state: { vcData: vc },
          });
        }}
      >
        <HeaderCard
          borderNone
          icon={<SvgIcon width={40} height={40} name="identityCert" />}
          content={
            <p className="overflow-ellipsis font-16 font-bold">
              {vc.credentialSubject.certificateName}
            </p>
          }
        />
      </List.Item>
    </div>
  );
});

export function DidInfo({ ...props }) {
  const navigate = useNavigate();

  const [vcList, setVcList] = useState<VcItem[]>([]);
  const [did, setDid] = useState('');
  const [didDocument, setDidDocument] = useState<DidItem>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { selectedChain, currentAccount } = useChainStore();
  const accountId = currentAccount?.address;
  const chainId = selectedChain?.chainId;

  useEffect(() => {
    if (!chainId || !accountId) return setIsLoading(false);
    (async () => {
      const doc = await chainStorageUtils.getDidDocument({ chainId, accountAddress: accountId });
      let storeVcList = [];
      const currentDid = doc?.id;

      if (currentDid) {
        storeVcList = await chainStorageUtils.getDidVCList({ chainId, did: doc.id });
        setDid(currentDid);
        setDidDocument(doc);
        setVcList(storeVcList);
        setIsLoading(false);
      }

      const chainDidDoc = await getAccountDid({ account: currentAccount, chainId });

      if (!chainDidDoc) {
        setDid(null);
        setDidDocument(null);
        setVcList([]);
        setIsLoading(false);
        if (currentDid) {
          chainStorageUtils.clearAccountDidDocument({ chainId, accountAddress: accountId });
        }
        return;
      }

      const updateVcList = await getDidVcList({
        account: currentAccount,
        did: chainDidDoc.id,
        chainId,
        verificationMethod: chainDidDoc.accounts.find((ele) => ele.address === currentAccount.address)?.id,
      });

      setIsLoading(false);
      setDid(chainDidDoc.id);
      setDidDocument(chainDidDoc);
      setVcList(updateVcList);
    })();
  }, [chainId, accountId]);

  if (isLoading) {
    return <Status icon={'loading'} size={'l'} title={'数据加载中'} className="cancel-bold" />;
  }

  return (
    <List {...props}>
      {!did ? (
        <Status icon={'blank'} size={'l'} title={'暂无数据'} className="cancel-bold" />
      ) : (
        <>
          <List.Item>
            <HeaderCard
              className="home-did-item"
              icon={
                <span
                  onClick={() =>
                    navigate(`/did/did-detail`, {
                      state: { didDocument },
                    })
                  }
                >
                  <SvgIcon width={40} height={40} name="did" />
                </span>
              }
              content={
                <p>
                  <span
                    onClick={() =>
                      navigate(`/did/did-detail`, {
                        state: { didDocument },
                      })
                    }
                  >
                    {did}
                  </span>{' '}
                  <Copy text={did} onCopy={() => false} />
                </p>
              }
            />
          </List.Item>
          {!vcList.length ? (
            <Status icon={'blank'} title={'暂无证书'} className="cancel-bold" />
          ) : (
            // ✅ 使用类型断言避免 TS 报错
            (FixedSizeList as any as React.FC<{
              height: number;
              itemCount: number;
              itemSize: number;
              width: string | number;
              itemData: VcItem[];
              className?: string;
              children: React.ComponentType<RowProps>;
            }>)( {
              height: 220,
              itemCount: vcList.length,
              itemSize: 70,
              width: '100%',
              itemData: vcList,
              className: 'txlogs-vtable',
              children: Row,
            })
          )}
        </>
      )}
    </List>
  );
}
