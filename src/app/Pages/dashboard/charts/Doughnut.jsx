import React from "react";
import ReactEcharts from "echarts-for-react";

const DoughnutChart = ({ height, doughnutData }) => {
  const option = {
    legend: {
      show: true,
      itemGap: 10,
      icon: "circle",
      bottom: 0,
      textStyle: {
        fontSize: 11,
        fontFamily: "roboto",
      },
    },
    tooltip: {
      show: false,
      trigger: "item",
      formatter: "{a} <br/>{b}: {c} ({d}%)",
    },
    xAxis: [
      {
        axisLine: {
          show: false,
        },
        splitLine: {
          show: false,
        },
      },
    ],
    yAxis: [
      {
        axisLine: {
          show: false,
        },
        splitLine: {
          show: false,
        },
      },
    ],

    series: [
      {
        name: "Traffic Rate",
        type: "pie",
        radius: ["45%", "72.55%"],
        center: ["50%", "50%"],
        avoidLabelOverlap: false,
        hoverOffset: 5,
        stillShowZeroSum: false,
        label: {
          normal: {
            show: false,
            position: "center",
            textStyle: {
              fontSize: 11,
              fontFamily: "roboto",
            },
            formatter: "{a}",
          },
          emphasis: {
            show: true,
            textStyle: {
              fontSize: "11",
              fontWeight: "normal",
            },
            formatter: "{b} \n{c} ({d}%)",
          },
        },
        labelLine: {
          normal: {
            show: false,
          },
        },
        data: doughnutData,
        itemStyle: {
          emphasis: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  return (
    <ReactEcharts
      style={{ height: height }}
      option={{
        ...option,
      }}
    />
  );
};

export default DoughnutChart;
