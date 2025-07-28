/* eslint-disable prettier/prettier */
/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */
import React from 'react';
import { Bubble, Icon, Text } from 'tea-component';

const GLOSSARY_INFO: { [index: string]: React.ReactNode } = {
  '登录密码': '该密码用于对上链交易进行二次确认，以及解锁插件。本插件完全去中心化，平台不保存任何用户信息，故请妥善保存密码，若密码遗忘了，无法找回，只能重置插件。',
  '区块链网络名称':
      '该名称是区块链id在插件内的备注名，请任意取方便记忆的名字即可。',
  '区块链ID': '区块链ID用于标识链的唯一身份，不可重复。',
  '节点RPC服务地址': <div>
    <p>如果选择HTTP代理连接，此处请填写封装HTTP代理服务后的节点RPC服务地址。例：https://chainmaker.org.com/v1/rpc/public</p>
    <p>如果选择的是gRPC连接、HTTP直连，此处请填写节点的RPC服务IP和Port地址。例：182.22.12.201:12301</p>
  </div>,
  '用户所在组织ID': '请正确填写所要订阅的链的组织id，并确保下方上传的用户证书和节点证书属于该组织。',
  '待上链信息': '待上链信息由Dapp传递给web插件，请检查是否有误，若有问题，可从Dapp重新发起上链。',
  '选择账户': '此处选择将由哪个链账户发起上链交易，如需选择其他账户，可在链账户管理处添加。',
  '交易密码': '交易密码即为插件的登录密码。',
  '安全码':'安全码即为插件的登录密码。',
  '账户名称':
      '该名称是该链账户在插件内的备注名，请任意取方便记忆的名字即可。',
  '选择签名账户': '此处选择将由哪个链账户发起上链交易，如需选择其他账户，可在链账户管理处添加。',
  '待签名信息': '该信息由Dapp提供，请检查是否有误，若有问题，可重新发起。注意此处确定签名后，将返回签名后的结果给Dapp并不会产生上链交易。',
  '指定签名账户': '签名账户由Dapp指定，不可修改，确定签名后将使用该账户的私钥对上文信息进行签名，并返回给Dapp',
  '是否开启TLS': <p>使用http协议时，建议使用机构颁发的tls证书，开发时可选择信任节点提供的自签证书进行调试
    <a target="_blank"
       href="https://docs.chainmaker.org.cn/dev/%E9%95%BF%E5%AE%89%E9%93%BEWeb3%E6%8F%92%E4%BB%B6.html#id18" rel="noreferrer">
      (参考文档)
    </a>
  </p>,
  "区块链浏览器链接（选填）": <div>
    <p>请填写您要添加的区块链网络对应的区块链浏览器地址，填写后插件内的涉及交易ID的地方将变为超链接状态，点击后可跳转到对应的区块链浏览器内。</p>
    <p>浏览器地址示例：https://explorer-testnet.chainmaker.org.cn/</p>
    <p>超链接格式示例：区块链浏览器地址/chainid/transaction/txid</p>
  </div>,
  'GAS消耗最大值限制':'如果您的链开启了GAS计费，则往链上发送交易时，需要消耗GAS作为资源服务费。此处预估的GAS消耗量仅作为参考，实际消耗量以交易最终执行结果为准。此处可设置最大能接受的GAS消耗量，如果交易执行后实际消耗的GAS量小于最大值，则扣除实际的量，如果大于最大值，则扣除预设的最大值，且交易执行失败。',
  '网络通讯方式':  <div>
  <p>长安链默认与客户端的通讯方式是gRPC，Web3插件客户端的通讯协议是HTTP，因而需要网络代理对请求进行转发。如果使用插件内的代理服务进行转发，则选择gRPC直连链，如果自己本地搭建代理服务进行转发，则选择HTTP代理连接链。</p>
  <p>此外长安链V2.3.0+版本支持HTTP协议直连链，可通过修改链配置开启，开启后可选择HTTP协议直连链。</p>
</div>,
};

/**
 * 对于系统中的名词增加解释提示
 */
const GlossaryGuide = ({ title }: { title: string }) => (
  <>
    <Text className={'tea-mr-1n'}>{title}</Text>
    {GLOSSARY_INFO[title] && (
      <Bubble content={GLOSSARY_INFO[title]}>
        <Icon type="info"/>
      </Bubble>
    )}
  </>
);

export default GlossaryGuide;
