import React from 'react';

type NFTType = 'img' | 'video' | 'audio';
interface NFTImageProps {
  url: string;
  type?: NFTType;
  width?: string;
}

// length	设置背景图片高度和宽度。第一个值设置宽度，第二个值设置的高度。如果只给出一个值，第二个是设置为 auto(自动)
// percentage	将计算相对于背景定位区域的百分比。第一个值设置宽度，第二个值设置的高度，各个值之间以空格 隔开指定高和宽，以逗号 , 隔开指定多重背景。如果只给出一个值，第二个是设置为"auto(自动)"
// cover	此时会保持图像的纵横比并将图像缩放成将完全覆盖背景定位区域的最小大小。
// contain	此时会保持图像的纵横比并将图像缩放成将适合背景定位区域的最大大小。
export function NFTImage({ url, type, width }: NFTImageProps) {
  return (
    <div
      style={{
        width: width ? width : '100%',
        height: '110px',
        background: `url(${url}) center center no-repeat`,
        backgroundSize: 'cover',
        borderRadius: '4px',
        // border: '1px solid #eee',
      }}
    />
  );
}
