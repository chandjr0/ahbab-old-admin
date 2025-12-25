import React from "react";
import ReactEcharts from "echarts-for-react";

const ComparisonChart = ({ height, comparisonData }) => {
  const option = {
    grid: {
      top: "10%",
      bottom: "10%",
      right: "5%",
    },
    legend: {
      show: false,
    },
    color: ["#223388", "rgba(34, 51, 136, 0.8)"],
    barGap: 0,
    barMaxWidth: "48px",
    tooltip: {},
    dataset: {
      source: comparisonData,
    },
    xAxis: {
      type: "category",
      axisLine: {
        show: false,
      },
      splitLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        fontSize: 11,
        fontFamily: "roboto",
      },
    },
    yAxis: {
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        lineStyle: {
          opacity: 0.5,
        },
      },
      axisLabel: {
        fontSize: 11,
        fontFamily: "roboto",
      },
    },
    series: [{ type: "bar" }],
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

export default ComparisonChart;
