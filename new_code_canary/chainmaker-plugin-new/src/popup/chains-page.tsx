/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import React, { useCallback, useRef } from 'react';
import { Button, List } from 'tea-component';
import { useNavigate } from 'react-router-dom';
import chainStorageUtils from '../utils/storage';
import { Chain } from '../utils/interface';
import { ConfirmModal, DetailPage, ListContainer } from '../utils/common';
import { deleteUpstreamCerts } from '../utils/utils';
import { isOfficialChain } from '../utils/official-chain';
import { useChainStore } from './popup';
import { getNowSeconds, sendMessageToContentScript } from '../utils/tools';
import { BEACON_EVENTS, beacon } from '../beacon';
import { MessageInfoCode } from '@src/event-page';

function ChainsPage() {
  const navigate = useNavigate();
  const gotoClick = useCallback(() => {
    beacon.onUserAction(BEACON_EVENTS.BLOCKCHAIN_ADD_START);
    navigate('/chains/new');
  }, []);

  const chains = useChainStore((state) => state.chains);
  const selectedChain = useChainStore((state) => state.selectedChain);
  const setChains = useChainStore((state) => state.setChains);
  const setSelectedChain = useChainStore((state) => state.setSelectedChain);

  const deleteConfirmRef = useRef<typeof ConfirmModal>();
  const gotoDetail = useCallback((chain: Chain) => {
    navigate(`/chains/${chain.chainId}`, {
      state: chain,
    });
  }, []);

  const handleDeleteChain = useCallback(
    (index: number) => {
      // @ts-ignore
      deleteConfirmRef.current.show({
        confirm: async () => {
          const chain = chains[index];
          if (chain.tlsEnable) {
            deleteUpstreamCerts(chain.userTLSCrtFile, chain.userTLSKeyFile, chain.nodeTLSCrtFile);
          }
          const { chainName, chainId } = chain;
          chainStorageUtils.deleteChain(index).then((res) => {
            setChains(res);
            if (res.length === 0) {
              chainStorageUtils.setSelectedChain(null);
              setSelectedChain(null);
            } else if (res.every((item) => item.chainId !== selectedChain.chainId)) {
              chainStorageUtils.setSelectedChain(res[0]);
              setSelectedChain(res[0]);
            }
            sendMessageToContentScript({
              operation: 'deleteChain',
              data: {
                status: 'done',
                timestamp: getNowSeconds(),
                info: {
                  code: MessageInfoCode.success,
                  removedChain: { chainName, chainId },
                },
              },
            });
          });
          return;
        },
      });
    },
    [deleteConfirmRef, chains],
  );

  return (
    <>
      <DetailPage title={'区块链网络管理'} backUrl={'/'}>
        <ListContainer items={chains} notFound={'暂无网络'}>
          <List className={'chains'}>
            {chains.map((item, index) => {
              const isOfficial = isOfficialChain(item);
              return (
                <List.Item key={item.chainId}>
                  <div className={'chains-item'}>
                    <div className={'cursor'} onClick={() => gotoDetail(item)}>
                      {item.chainName}
                      {isOfficial && <img src={'/img/icon-lock.png'} />}
                    </div>
                    {!isOfficial && (
                      <img src={'/img/icon-delete.png'} onClick={() => handleDeleteChain(index)} title={'删除'} />
                    )}
                  </div>
                </List.Item>
              );
            })}
          </List>
        </ListContainer>
        <ConfirmModal title={'删除确认'} confirmBtnText={'确认删除'} ref={deleteConfirmRef}>
          {'删除区块链网络后，将同步删除该区块链对应的链账户信息，请确定是否要删除该网络。'}
        </ConfirmModal>
      </DetailPage>
      <footer>
        <Button onClick={gotoClick} className={'btn-lg'} type={'primary'}>
          添加区块链网络
        </Button>
      </footer>
    </>
  );
}

export default ChainsPage;
