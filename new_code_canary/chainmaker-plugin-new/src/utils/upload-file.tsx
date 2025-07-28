/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */
import React, { forwardRef, Ref, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { Button, Text, Upload } from 'tea-component';
import { UploadProps } from 'tea-component/lib/upload/Upload';
import { FormControlProps } from 'tea-component/lib/form/FormControl';

export type TextTheme = 'text' | 'label' | 'weak' | 'strong' | 'primary' | 'success' | 'warning' | 'danger' | 'cost';

/**
 * 文件上传
 */
function UploadContainer(
  props: {
    onSuccess: (content: File | null) => void;
  } & Omit<UploadProps & React.RefAttributes<HTMLSpanElement>, 'onSuccess' | 'children'>,
  parentRef: Ref<any>,
) {
  const { accept, onSuccess, ...rest } = props;
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const [status, setStatus] = useState<FormControlProps['status'] | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleStart = (file: File) => {
    setFile(file);
    setStatus('success');
    onSuccess(file);
  };

  const handleDelete = useCallback(() => {
    setFile(null);
    setStatus(null);
    onSuccess(null);
  }, []);

  const handleSuccess = () => {
  };
  const handleError = () => {
    setStatus('error');
  };
  const handleBeforeUpload = (file: File, fileList: File[], isAccepted: boolean) => {
    if (!isAccepted) {
      setStatus('error');
      onSuccess(null);
    }
    return isAccepted;
  };
  const handleAbort = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
    }
    handleDelete();
  };

  useImperativeHandle(
    parentRef,
    () => ({
      status,
      setDefaultValue: (value: string | File) => {
        setStatus('success');
        const file = typeof value === 'string' ? new File([''], value) : value;
        setFile(file);
        onSuccess(file);
      },
    }),
    [status],
  );

  return (
    <Upload
      accept={accept}
      onStart={handleStart}
      onSuccess={handleSuccess}
      onError={handleError}
      beforeUpload={handleBeforeUpload}
      ref={parentRef}
      {...rest}
    >
      {({ open, isDragging }) => (
        <Upload.Dragger
          filename={file?.name}
          description={file && <p>文件大小：{Math.floor(file.size)}bytes</p>}
          button={
            status === 'validating' ? (
              <Button type="link" onClick={handleAbort}>
                取消上传
              </Button>
            ) : (
              <>
                <Button type="link" onClick={open}>
                  重新上传
                </Button>
                <Button type="link" className="tea-ml-2n" onClick={handleDelete}>
                  删除
                </Button>
              </>
            )
          }
        >
          {isDragging ? (
            '释放鼠标'
          ) : (
            <>
              <Button type="link" onClick={open}>
                点击上传
              </Button>
              <Text>/拖拽到此区域</Text>
            </>
          )}
        </Upload.Dragger>
      )}
    </Upload>
  );
}

export const UploadFile = forwardRef(UploadContainer);

export function file2Buffer(file) {
  return new Promise(function (resolve) {
    const reader = new FileReader();
    const readFile = function () {
      const buffer = reader.result;
      resolve(buffer);
    };

    reader.addEventListener('load', readFile);
    reader.readAsArrayBuffer(file);
  });
}
