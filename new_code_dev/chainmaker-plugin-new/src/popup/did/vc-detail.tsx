/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { DetailPage } from '../../utils/common';
import { VcItem } from '../../utils/storage';

import { TextInfoItem, TextSectionInfo } from '../../components/text-info';

import { HeaderCard } from '../../components/header-card';
import SvgIcon from '../../components/svg-icon';
import { formatDate } from '../../utils/utils';
import { HomeTabs } from '../home/home-page';

const getCertInfo = (vcData) => {
  const { credentialSubject, template, issuanceDate, expirationDate, status } = vcData;
  switch (template.id) {
    case '100001':
      // 企业类型
      return [
        {
          label: '证书名称',
          value: credentialSubject.certificateName,
        },
        {
          label: '证书模版ID',
          value: template.id,
        },
        {
          label: '证书类型',
          value: template.id,
        },
        {
          label: '企业名称',
          value: credentialSubject.entname,
        },
        {
          label: '统一社会信用代码',
          value: credentialSubject.uniscid,
        },
        {
          label: '法人名称',
          value: credentialSubject.legalName,
        },
        // 注册地：dom
        {
          label: '签发时间',
          value: formatDate(new Date(issuanceDate), 'YYYY-MM-DD HH:mm:ss'),
        },
        {
          label: '过期时间',
          value: formatDate(new Date(expirationDate), 'YYYY-MM-DD HH:mm:ss'),
        },
        {
          label: '状态',
          value: status,
        },
      ];
    case '100000':
      // 个人
      return [
        {
          label: '证书名称',
          value: credentialSubject.certificateName,
        },
        {
          label: '证书模版ID',
          value: template.id,
        },
        {
          label: '证书类型',
          value: template.id,
        },
        {
          label: '姓名',
          value: credentialSubject.name,
        },
        {
          label: '证件号码',
          value: credentialSubject.identityCardNumber,
        },
        {
          label: '手机号',
          value: credentialSubject.phone,
        },
        {
          label: '签发时间',
          value: formatDate(new Date(issuanceDate), 'YYYY-MM-DD HH:mm:ss'),
        },
        {
          label: '过期时间',
          value: formatDate(new Date(expirationDate), 'YYYY-MM-DD HH:mm:ss'),
        },
        {
          label: '状态',
          value: status,
        },
      ];
    default:
      return [];
  }
};

export function VcDetailPage() {
  const location = useLocation();
  const { vcData } = location.state as {
    vcData: VcItem;
  };

  const { credentialSubject, issuer } = vcData;

  const certInfo: TextInfoItem[] = useMemo(() => getCertInfo(vcData), [vcData]);

  const issuerInfo: TextInfoItem[] = [
    {
      label: '机构名称',
      value: credentialSubject.issuerName,
    },
    {
      label: '机构DID',
      value: issuer,
    },
  ];
  return (
    <DetailPage title="数字证书详情" backUrl={'/'} backState={{ activeTab: HomeTabs.DID_VC }}>
      <HeaderCard
        icon={<SvgIcon width={40} height={40} name="identityCert" />}
        content={<p className="overflow-ellipsis font-16 font-bold">{credentialSubject.certificateName}</p>}
      />
      <div className="vc-detail">
        <div>
          {/* <p className="text-info-title">证书信息</p> */}
          <TextSectionInfo title={'证书信息'} sourceData={certInfo} />
        </div>
        <div>
          {/* <p className="text-info-title">签发机构信息</p> */}

          <TextSectionInfo title={'签发机构信息'} sourceData={issuerInfo} />
        </div>
      </div>
    </DetailPage>
  );
}
