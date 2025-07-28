import { StatisticCard } from '@ant-design/pro-components';
import { Col, Row } from 'antd';
import { Area } from '@ant-design/charts';
import dayjs from 'dayjs';
import '../components/css/charts.less';
import React, { useState, useEffect } from 'react';

interface ChartsType {
  dataCharts: { count: number; datetime: string }[];
}

const Charts: React.FC<ChartsType> = (props) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // 模拟的数据生成逻辑
  // const generateMockData = () => {
  //   const mockData = [];
  //   const baseDate = dayjs().subtract(30, 'day'); // 从当前日期往前推30天
  //   let baseCount = 500; // 初始 count 数值

  //   for (let i = 0; i < 30; i++) {
  //     // 随机生成一些波动较大的 count 值
  //     const count = Math.floor(baseCount + Math.random() * 200 - 100); // 在 400 到 600 之间波动
  //     mockData.push({
  //       datetime: baseDate.add(i, 'day').format('YYYY-MM-DD'),
  //       count: count.toString(),
  //     });
  //     // 让 baseCount 每次稍微变化，模拟更真实的交易数
  //     baseCount += Math.random() * 20 - 10;
  //   }

  //   return mockData;
  // };

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 动态配置 'point' 属性，根据 windowWidth 判断是否显示白点
  const pointConfig = windowWidth >= 768 ? {
    color: '#3488FF',
    size: 3,
    style: {
      stroke: '#3488FF',  // 圆圈的边框颜色
      lineWidth: 2, // 设置折线的粗细
    },
    pattern: {
      type: 'dot',
      cfg: {
        size: 3,
        padding: 4,
        rotation: 0,
        fill: '#FFFFFF',
        isStagger: true,
        backgroundColor: '#FFFFFF',
      },
    },
  } : undefined; // 当宽度小于768px时，不渲染 'point' 属性

  // 动态配置网格线样式
  const xAxisGridStyle = windowWidth >= 768 ? {
    stroke: 'RGBA(240, 243, 246, 1)',
    lineDash: [4, 4],
    lineWidth: 1
  } : {
    stroke: 'none', // 移除纵向网格线
    lineDash: [],
    lineWidth: 0,
  };

  const yAxisGridStyle = windowWidth >= 768 ? {
    stroke: 'RGBA(240, 243, 246, 1)',
    lineDash: [4, 4],
    lineWidth: 1,
  } : {
    stroke: 'rgba(226, 228, 234, 1)', // 横向网格线颜色保持不变
    lineDash: [], // 实线
    lineWidth: 1,
  };

  // 动态配置日期格式
  const formatDate = (text: string) => {
    return windowWidth >= 768 ? dayjs(text).format('MM-DD') : dayjs(text).format('MM/DD');
  };

  const scaleFactor = windowWidth < 768 ? windowWidth / 750 : 1;
  const getDynamicSize = (baseSize: number) => baseSize * scaleFactor;

  const areaStyle = () => {
    if (windowWidth < 768) {
      return {
        fill: 'l(90) 0.1:#2E5BFF 0.7:#2F86F6',
      };
    }
    return {
      fill: 'l(90) 0:#6686FF 0.4:F5F5FF 1:#FFFFFF',
    };
  };

  const config = {
    // data: generateMockData(),
    data: props?.dataCharts.length > 0 ? props?.dataCharts : [],
    // data: filteredData(),
    xField: 'datetime',
    yField: 'count',
    height: 400,
    autoFit: true,
    appendPadding: [0, 0, 0, 0],
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        lineStyle: {
          type: 'dashed', // 设置虚线样式
          color: 'RGBA(189, 193, 204, 1)', // 自定义颜色
        },
      },
      fields: ['datetime', 'count'],
      customContent: (title: string, params: any): any => {
        if (params[0]) {
          const { data } = params[0];
          let result = '';
          if (title) {
            result += `<div style="padding: 15px 10px 15px 5px; color: rgba(119, 124, 133, 1); font-weight: 600;">
              <div style="font-size: 15px; margin-bottom: 7.5px;"> <span style="font-size: 14px; font-weight: 500;"></span>${data.datetime}</div>
              <div style="font-size: 15px; color: rgba(0, 0, 0, 1); font-weight: 700;"> <span style="font-size: 14px; font-weight: 700;"></span>${data.count} (次)</div>
            </div>`;
          }
          return result;
        }
      },
      // customContent: (title: string, params: any): any => {
      //   if (params[0]) {
      //     const { data } = params[0];
      //     return `
      //       <div style="padding: ${getDynamicSize(15)}px ${getDynamicSize(10)}px; color: rgba(119, 124, 133, 1); font-weight: 600;">
      //         <div style="font-size: ${getDynamicSize(15)}px; margin-bottom: ${getDynamicSize(7.5)}px;">
      //           <span style="font-size: ${getDynamicSize(14)}px; font-weight: 500;"></span>${data.datetime}
      //         </div>
      //         <div style="font-size: ${getDynamicSize(15)}px; color: rgba(0, 0, 0, 1); font-weight: 700;">
      //           <span style="font-size: ${getDynamicSize(14)}px; font-weight: 700;"></span>${data.count} (次)
      //         </div>
      //       </div>`;
      //   }
      // },
    },
    xAxis: {
      range: [0, 1],
      tickCount: 16,
      line: { style: { stroke: '#CBD3FA', lineWidth: 2 } },
      label: {
        style: {
          // stroke: 'rgba(176, 186, 201, 1)',
          fontSize: windowWidth < 768 ? getDynamicSize(20) : 15,
          fontWeight: 500,
          fontFamily: 'Apercu',
        },
        formatter: formatDate,
        offset: windowWidth < 768 ? 10 : 15, // 调整此值使标签更靠近 x 轴
      },
      grid: {
        line: {
          style: xAxisGridStyle,
        },
      },
      tickLine: {
        style: {
          stroke: 'rgba(176, 186, 201, 1)', // Change tick line color to red
          lineWidth: 2, // Set the tick line width
        },
        length: 0,
      },
    },
    yAxis: {
      line: { style: { stroke: '#D0D8FF', lineWidth: 2 } },
      label: {
        formatter: (v: any) => `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => `${s},`),
        offset: windowWidth < 768 ? 10 : 15, // 调整此值使标签更靠近 y 轴
        style: {
          // stroke: 'rgba(176, 186, 201, 1)',
          fontSize: windowWidth < 768 ? getDynamicSize(20) : 15,
          fontWeight: 400,
          fontFamily: 'Apercu',
        },
      },
      grid: {
        line: {
          style: yAxisGridStyle,
        },
      },
    },
    point: pointConfig,
    line: {
      color: 'rgba(46, 91, 255, 1)',
      style: {
        lineWidth: 1, // 设置折线的粗细
      },
    },
    areaStyle: areaStyle
  };

  return (
    <Row justify="center">
      <Col className="chart_center">
        <StatisticCard
          title={<div className="chart_title">交易数</div>}
          // headStyle={{ paddingBottom: '40px' }}
          style={{ backgroundColor: 'transparent' }}
          chart={<Area {...config} className="chart-container" />} // 应用CSS类
        />
      </Col>
    </Row>
  );
};

export default Charts;