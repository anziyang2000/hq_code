/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Form, Input, message, Select } from 'tea-component';
import { Controller, useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { getSymbol } from '../utils/utils';
import { useChainStore } from './popup';
import GlossaryGuide from '../utils/glossary-guide';
import chainStorageUtils, { contractStoreUtils, SubscribeContractItem } from '../utils/storage';
import { ConfirmModal, DetailPage } from '../utils/common';
import { createIconToken } from '../components/contract-logo';
import { CONTRACT_TYPE } from '../config/contract';
import { SendRequestImportSubscribeContract } from '../event-page';

const ContractTypeOptions = [
  { text: 'CMEVI（区块链存证）', value: CONTRACT_TYPE.CMEVI },
  { text: 'CMDFA（同质化数字资产）', value: CONTRACT_TYPE.CMDFA },
  { text: 'CMNFA（非同质化数字资产）', value: CONTRACT_TYPE.CMNFA },
  { text: 'CMID（区块链身份认证）', value: CONTRACT_TYPE.CMID },
  { text: '其他类', value: CONTRACT_TYPE.OTHER },
];

function SubScribeContractPage() {
  const {
    control,
    getValues,
    formState: { isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      FTMinPrecision: 4,
    } as any,
  });
  const location = useLocation();
  const pageState = location.state as SendRequestImportSubscribeContract;
  const { selectedChain, currentAccount, chains, updateSelectData } = useChainStore();
  const [loading] = useState(false);
  const [contractType, setContractType] = useState<ContractType>(CONTRACT_TYPE.CMDFA);
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const [FTPerName, setFTPerName] = useState('');
  const [remark, setRemark] = useState('');

  const [contractName, setContractName] = useState('');
  const navigate = useNavigate();

  const switchConfirmRef = useRef<typeof ConfirmModal>();
  const addChainConfirmRef = useRef<typeof ConfirmModal>();
  const addAccountConfirmRef = useRef<typeof ConfirmModal>();

  // 导入订阅判断
  useEffect(() => {
    if (pageState?.operation === 'importSubscribeContract' && selectedChain && pageState.body) {
      try {
        const { chainId, contractName, contractType } = pageState.body;
        if (chainId !== selectedChain.chainId) {
          // 弹起切换提示
          const targetChain = chains.find((chain) => chain.chainId === chainId);
          if (targetChain) {
            chainStorageUtils.getChainAccounts(targetChain.chainId).then((accounts) => {
              // 如果目标链没有账户,提示用户添加，确认后切换至目标链，跳转添加账号
              if (!accounts.length) {
                // @ts-ignore
                addAccountConfirmRef.current.show({
                  confirm: async () => {
                    await updateSelectData({ chain: targetChain });
                    navigate(`/accounts/new`, {
                      state: {
                        chain: targetChain,
                        initial: false,
                      },
                    });
                  },
                  close: () => {
                    navigate('/');
                  },
                });
              } else {
                // 有账户,提示切换链
                // @ts-ignore
                switchConfirmRef.current.show({
                  confirm: async () => {
                    const targetAccount = accounts[0];
                    await updateSelectData({ chain: targetChain, account: targetAccount });
                    // 使用setSelectedChain会自动延迟一个state更新切换账户
                  },
                  close: () => {
                    navigate('/');
                  },
                });
              }
            });
          } else {
            // @ts-ignore
            addChainConfirmRef.current.show({
              confirm: async () => {
                navigate('/chains/new');
              },
              close: () => {
                navigate('/');
              },
            });
          }
        } else if (!currentAccount) {
          // 当前链没有账户
          // @ts-ignore
          addAccountConfirmRef.current.show({
            confirm: async () => {
              navigate(`/accounts/new`, {
                state: {
                  chain: selectedChain,
                  initial: false,
                },
              });
            },
            close: () => {
              navigate('/');
            },
          });
        } else if (contractName) {
          const finalType = contractType in CONTRACT_TYPE ? contractType : CONTRACT_TYPE.OTHER;
          setContractName(contractName);
          setContractType(finalType);
          handleGetSymbol(contractName, finalType);
        } else {
          // 参数错误提示
        }
      } catch (error) {
        console.error('importSubscribeContract error:', error);
      }
    }
  }, [pageState, selectedChain]);
  const onSubmit = useCallback(async () => {
    // setLoading(true);
    const values: SubscribeContractItem = getValues();
    contractStoreUtils
      .setSubscribe(selectedChain.chainId, {
        contractType,
        FTPerName,
        contractIcon: createIconToken(),
        contractName,
        remark,
        ...values,
      })
      .then((err) => {
        if (err) {
          message.error({ content: `订阅失败:${err.message || err}` });
        } else {
          message.success({ content: '订阅成功' });
          setTimeout(() => {
            navigate('/');
          }, 1000);
        }
      })
      .catch(() => {});
  }, [selectedChain.chainId, FTPerName, contractType, contractName, remark]);

  const handleGetSymbol = (contractName: string, contractType: ContractType) => {
    if (contractName && contractType === CONTRACT_TYPE.CMDFA) {
      getSymbol({ contractName, account: currentAccount, chainId: selectedChain.chainId }).then((res) => {
        if (res) {
          setFTPerName(res as string);
        } else {
          message.error({ content: '查询不到该合约，请检查您输入的信息是否正确，合约状态是否正常。' });
        }
      });
    }
  };

  // const currentValues = getValues();
  return (
    <DetailPage title={'订阅合约'} backUrl={'/'}>
      <Form layout={'vertical'} className={'mt-4n'}>
        <Form.Item label={<GlossaryGuide title={'合约类型'} />}>
          <Select
            size={'full'}
            matchButtonWidth
            value={contractType}
            onChange={(type: ContractType) => setContractType(type)}
            appearance="button"
            options={ContractTypeOptions}
          />
        </Form.Item>
        <Form.Item
          extra="请确保该合约已经部署到当前链上，否则将获取不到数据"
          label={<GlossaryGuide title={'合约名称'} />}
        >
          <Input
            size={'full'}
            value={contractName}
            onBlur={() => handleGetSymbol(contractName, contractType)}
            onChange={setContractName}
          />
        </Form.Item>

        {contractType === CONTRACT_TYPE.CMDFA ? (
          <>
            <Form.Item label={<GlossaryGuide title={'FT简称'} />}>
              <Input size={'full'} value={FTPerName} onChange={setFTPerName} />
            </Form.Item>
            <Controller
              control={control}
              name="FTMinPrecision"
              render={({ field }) => (
                <Form.Item label={<GlossaryGuide title={'最小精度'} />}>
                  <Input
                    type="number"
                    step={1}
                    min={1}
                    max={8}
                    size={'full'}
                    {...field}
                    onChange={(nextVal) => {
                      field.onChange(Math.max(Math.min(parseInt(nextVal.charAt(nextVal.length - 1), 10) || 1, 8), 1));
                    }}
                  />
                </Form.Item>
              )}
            />
          </>
        ) : (
          <Form.Item label={<GlossaryGuide title={'合约备注名（选填）'} />}>
            <Input size={'full'} value={remark} onChange={setRemark} />
          </Form.Item>
        )}
      </Form>

      <footer className={'mt-6n'}>
        <Button
          type={'primary'}
          className={'btn-lg'}
          disabled={!isValid || (contractType === CONTRACT_TYPE.CMDFA && (!FTPerName || !contractName))}
          onClick={() => {
            onSubmit();
          }}
          loading={loading}
        >
          确定订阅
        </Button>
      </footer>
      <ConfirmModal title={'切换网络'} confirmBtnText={'确定切换'} ref={switchConfirmRef}>
        {`Dapp请求切换到${pageState?.body?.chainId}区块链网络，请确定是否要切换。`}
      </ConfirmModal>
      <ConfirmModal title={'添加链账户'} cancelBtnText="取消" confirmBtnText={'去添加'} ref={addAccountConfirmRef}>
        {`当前网络尚无链账户，请先添加链账户，再进行订阅合约操作。`}
      </ConfirmModal>
      <ConfirmModal title={'添加链网络'} cancelBtnText="取消" confirmBtnText={'去添加'} ref={addChainConfirmRef}>
        {`您所选择的区块链网络尚未导入到插件里，请先
添加该区块链网络。`}
      </ConfirmModal>
    </DetailPage>
  );
}

export default SubScribeContractPage;
