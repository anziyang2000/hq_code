/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */
import { ControllerFieldState } from 'react-hook-form';
import { FormControlProps } from 'tea-component/lib/form/FormControl';

function getStatus({
  fieldState,
  isSubmitted,
  isValidating,
}: {
  fieldState: ControllerFieldState;
  isSubmitted: boolean;
  isValidating: boolean;
}): FormControlProps['status'] {
  if (isValidating) {
    return 'validating';
  }
  if (!fieldState.isDirty && !isSubmitted) {
    return undefined;
  }
  return fieldState.invalid ? 'error' : 'success';
}

export function getHostName(string) {
  try {
    const url = new URL(string);
    return `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ''}`;
  } catch (_) {
    return null;
  }
}

export class Validator {
  static validateName(name: string): string | undefined {
    if (!name || !name.length) {
      return '请输入姓名';
    }
    if (name.length > 10) {
      return '超过长度不允许输入';
    }
    const expEN = /^[A-Za-z]{1,10}$/;
    const expZH = /^[\u4e00-\u9fa5]{1,10}$/;
    if (expEN.test(name) || expZH.test(name)) {
      return undefined;
    }
    return '请输入纯字母或汉字';
  }

  static validateChainId(chainId: string): string | undefined {
    if (!chainId || !chainId.length) {
      return '请输入区块链ID';
    }
    const exp = /^[\w\-.]{1,30}$/;
    if (!exp.test(chainId)) {
      return '请输入30位以内字母、数字、中横线、下划线、小数点组合';
    }
    return undefined;
  }

  static validateOrgId(orgId: string): string | undefined {
    if (!orgId || !orgId.length) {
      return '请输入组织ID';
    }
    const exp = /^[\w\-.]{1,100}$/;
    if (!exp.test(orgId)) {
      return '请输入100位以内字母、数字、中横线、下划线、小数点组合';
    }
    return undefined;
  }

  static validateNodeIP(nodeIP: string): string | undefined {
    if (!nodeIP || !nodeIP.length) {
      return '请输入节点RPC服务地址';
    }
    // 字母:/_数字.-
    const exp = /^[\w\.\-\/:]+$/;
    if (!exp.test(nodeIP)) {
      return '请输入正确的节点RPC服务地址';
    }
    return undefined;
  }

  static validateHostname = (url: string): string | undefined => {
    if (!url || !url.length) {
      return '请输入地址';
    }
    if (!getHostName(url)) {
      return '请输入正确的地址';
    }
    return undefined;
  };
}

export default {
  getStatus,
};
