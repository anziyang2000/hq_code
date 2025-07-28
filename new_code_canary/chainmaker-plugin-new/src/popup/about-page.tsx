/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import React from 'react';
import { DetailPage } from '../utils/common';

function AboutPage() {
  return (
    <DetailPage title={'关于我们'} backUrl={'/'}>
      <h3>数科链介绍</h3>
      <div className={'tea-mt-2n'}>
        数科云链是环球数科集团基于联盟链打造的合规、开放、易用的底层区块链平台，旨在推动行业升级与创新，促进不同行业、不同组织间的交流与合作，汇聚各方智慧资源，共同推动区块链技术在各领域的创新应用，带动行业发展。
      </div>
      {/* <h3 className={'mt-8n'}>SmartPlugin介绍</h3>
      <div className={'tea-mt-2n'}>
        ChainMaker SmartPlugin由长安链官方团队研发，使得用户在使用Web3应用时可直接通过SmartPlugin与长安链进行交互。
      </div> */}
      <h3 className={'mt-8n'}>数科链官网</h3>
      <div className={'tea-mt-2n'}>
        <a href={'http://www.hqsk.cn/'} target="_blank" rel="noreferrer">
          http://www.hqsk.cn
        </a>
      </div>
    </DetailPage>
  );
}

export default AboutPage;
