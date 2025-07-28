/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import { DetailPage } from '../../utils/common';
import { DidItem } from '../../utils/storage';

import { TextInfoItem } from '../../components/text-info';
import { HeaderCard } from '../../components/header-card';
import { Copy, Form } from 'tea-component';
import SvgIcon from '../../components/svg-icon';
import { formatDate } from '../../utils/utils';
import { HomeTabs } from '../home/home-page';

export function DidDetailPage() {
  const location = useLocation();
  const { didDocument } = location.state as {
    didDocument: DidItem;
  };

  // const { selectedChain, currentAccount } = useChainStore();
  // const accountId = currentAccount?.address;
  // const { chainId } = selectedChain;

  const { updateTime, createTime } = didDocument;

  // useEffect(() => {
  //   if (!accountId || !did) return;
  //   const data = await getDidDocument({ account: currentAccount, chainId, did });
  // }, [did]);

  const detailInfo: TextInfoItem[] = [
    {
      label: '创建时间',
      value: formatDate(new Date(createTime), 'YYYY-MM-DD HH:mm:ss'),
    },
    {
      label: '更新时间',
      value: formatDate(new Date(updateTime), 'YYYY-MM-DD HH:mm:ss'), // timestamp && formatDate(new Date(timestamp * 1000), 'YYYY-MM-DD HH:mm:ss'),
    },
    {
      label: '状态',
      value: '正常',
    },
  ];
  return (
    <DetailPage title="DID详情" backUrl={'/'} backState={{ activeTab: HomeTabs.DID_VC }}>
      <HeaderCard
        icon={<SvgIcon width={40} height={40} name="did" />}
        content={
          <p>
            <span>{didDocument.id} </span> <Copy text={didDocument.id} onCopy={() => false} />
          </p>
        }
      />
      <div className="did-detail mt-2n">
        <Form readonly>
          {detailInfo.map((ele, index) => {
            const { value, label } = ele;
            return (
              <Form.Item key={index} label={label}>
                <Form.Text>{value}</Form.Text>
              </Form.Item>
            );
          })}
        </Form>
      </div>
    </DetailPage>
  );
}
