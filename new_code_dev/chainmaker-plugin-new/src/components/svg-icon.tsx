import React from 'react';

export default function SvgIcon({
  name,
  classN = '',
  width = 36,
  height = 36,
  fill = 'black',
  style = {},
}: {
  name: string;
  width?: number;
  height?: number;
  classN?: string;
  fill?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      style={{
        ...style,
        width,
        height,
      }}
      className={`svg-icon ${classN}`}
      fill={fill}
    >
      <use xlinkHref={`#${name}`} />
    </svg>
  );
}
