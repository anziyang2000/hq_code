import React, { useMemo } from 'react';
import SvgIcon from '../../components/svg-icon';

export default function HeaderIcon({
  width = 40,
  height = 40,
  color = 'white',
  classN,
  onClick,
  style = {},
}: {
  width?: number;
  height?: number;
  color?: string;
  classN?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  const { iconColor, bgColor } = useMemo(() => {
    // const fillcolor = Color(color);
    // return Color.rgb(fillcolor.rgb().array().map(numb=>{
    //     const newnumb = numb+128;
    //     return newnumb>255?newnumb-255:newnumb;
    // })).hex();
    const colors = color.split('&');
    return {
      iconColor: colors[0],
      bgColor: colors[1],
    };
  }, [color]);
  return (
    <span
      className={classN}
      onClick={onClick}
      style={{
        ...style,
        width,
        height,
        display: 'flex',
        backgroundColor: bgColor,
        borderRadius: '50%',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <SvgIcon name="account" width={width * 0.5} height={height * 0.5} fill={iconColor} />
    </span>
  );
}
