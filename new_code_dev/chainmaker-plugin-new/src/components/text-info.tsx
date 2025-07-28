import React from 'react';
import { Copy, Form, StyledProps, Text } from 'tea-component';

import './text-info.less';
export interface TextInfoItem extends StyledProps {
  label?: React.ReactNode;
  // value: string | number;
  value: string | number | React.ReactNode; // 允许 JSX 元素
  theme?: string;
  copyValue?: string | number;
  copyable?: boolean;
  href?: string;
}
export interface TextInfoProps extends StyledProps {
  sourceData: TextInfoItem[];
  dense?: boolean;
  labelBold?: boolean;
}

export function TextInfo({ sourceData, labelBold, className, dense, ...props }: TextInfoProps) {
  return (
    <div className={`text-info-list ${labelBold ? 'text-info-dense' : ''} ${className || ''}`} {...props}>
      {sourceData.map((ele, index) => {
        const { value, label, copyable, copyValue, className = '', style, href } = ele;
        return value || value === 0 ? (
          <div key={index} className={`text-info-item ${className}`} style={style}>
            <div className="text-info-label txs-h3" style={{ fontWeight: labelBold ? 'bold' : 'normal' }}>
              {label}
            </div>
            <div className="text-info-value">
              {href ? (
                <a className="text-blue" href={href} target="_blank" rel="noreferrer">
                  {value}
                </a>
              ) : (
                <Text theme="label">{value}</Text>
              )}{' '}
              {copyable && value && <Copy text={String(copyValue || value)} />}
            </div>
          </div>
        ) : null;
      })}
    </div>
  );
}

export interface TextSectionInfoProps extends TextInfoProps {
  title?: string;
  lineBreak?: boolean;
}

export function TextSectionInfo({
  sourceData,
  className,
  dense,
  labelBold,
  lineBreak,
  title,
  ...props
}: TextSectionInfoProps) {
  return (
    <div className={`text-section-info ${className || ''}`} {...props}>
      {title ? (
        <div className="text-info-label txs-h3" style={{ fontWeight: 'bold' }}>
          {title}
        </div>
      ) : null}

      {/* <div className={`text-info-list ${labelBold ? 'text-info-dense' : ''}`}>
        {sourceData.map((ele, index) => {
          const { value, label, copyable, className = '', style, href } = ele;
          return value || value === 0 ? (
            <div key={index} className={`text-info-item ${className}`} style={style}>
              <span className="text-info-label txs-h3" style={{ fontWeight: labelBold ? 'bold' : 'normal' }}>
                {label}
              </span>
              <span className="text-info-value">
                {href ? (
                  <a className="text-blue" href={href} target="_blank" rel="noreferrer">
                    {value}
                  </a>
                ) : (
                  value
                )}{' '}
                {copyable && value && <Copy text={String(value)} />}
              </span>
            </div>
          ) : null;
        })}
      </div> */}

      <Form readonly>
        {sourceData.map((ele, index) => {
          const { value, label } = ele;
          return (
            <Form.Item key={index} label={label}>
              <Form.Text>{value}</Form.Text>
            </Form.Item>
          );
        })}
      </Form>
    </div>
  );
}

export function TextListInfo({ sourceData, className, dense, labelBold, lineBreak, ...props }: TextSectionInfoProps) {
  return (
    <div className={`text-list-info ${className || ''}`} {...props}>
      {sourceData.map((ele, index) => {
        const { value, label, copyable, copyValue } = ele;
        if (lineBreak)
          return (
            <div key={index} className={'text-list-item'}>
              <p>
                {' '}
                <Text theme="text">{label}</Text>
              </p>
              <p className={'flex-space-between'}>
                <Text theme="label">{value}</Text>
                {copyable && value && <Copy text={String(copyValue || value)} />}
              </p>
            </div>
          );
        return (
          <div key={index} className={'flex-space-between text-list-item'}>
            <Text theme="text">{label}</Text>
            <Text theme="label">
              {value}
              {copyable && value && <Copy text={String(copyValue || value)} />}
            </Text>
          </div>
        );
      })}
    </div>
  );
}
