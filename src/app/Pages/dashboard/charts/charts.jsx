import React, { useEffect, useState } from "react";
import { Grid, Card } from "@material-ui/core";
import ComparisonChart from "./ComparisonChart";
import DoughnutChart from "./Doughnut";

const Charts = ({ orderDataList }) => {
  const [comparisonData, setComparisonData] = useState([]);
  const [doughnutData, setDoughnutData] = useState([]);

  useEffect(() => {
    // .map((data) => (data.status = "PICKED" ? { ...data, status: "STOCK OUT" } : data))

    if (orderDataList && orderDataList.length > 0) {
      let upComparisonData = [["Status", "Price"]];
      let upDoughnutData = [];
      orderDataList.forEach((data) => {
        upComparisonData.push([
          data?.status == 'PENDING'? 'PROCESSING': data?.status == 'CONFIRM'?'INVOICED': data?.status == 'SHIPPED'? 'SHIPPING': data?.status,
          data?.price,
        ]);
        upDoughnutData.push({
          value: data?.order,
          name: data?.status == 'PENDING'? 'PROCESSING': data?.status == 'CONFIRM'?'INVOICED': data?.status == 'SHIPPED'? 'SHIPPING': data?.status,
        });
      });

      setComparisonData(upComparisonData);
      setDoughnutData(upDoughnutData);
    }
  }, [orderDataList]);

  return (
    <Grid container spacing={3} className="mb-6">
      <Grid item xs={12} md={8}>
        <Card elevation={3} className="px-2 py-2">
          <ComparisonChart height="400px" comparisonData={comparisonData} />
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card elevation={3} className="px-2 py-2">
          <DoughnutChart height="400px" doughnutData={doughnutData} />
        </Card>
      </Grid>
    </Grid>
  );
};

export default Charts;
