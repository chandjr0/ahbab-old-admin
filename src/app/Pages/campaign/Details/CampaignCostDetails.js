import React, { useEffect, useState } from "react";
import { Breadcrumb } from "../../../components/index";
import "react-loading-skeleton/dist/skeleton.css";

import AddCampaignCost from "./AddCampaignCost";
import CampaignCostList from "./CampaignCostList";
import { Grid } from "@material-ui/core";

const CampaignCostDetails = ({ setCost }) => {
  const [dataList, setDataList] = useState([]);
  const [updateData, setUpdateData] = useState(null);

  useEffect(() => {
    setCost(dataList.reduce((acc, curr) => acc + curr?.bdtCost, 0));
  }, [dataList, setCost]);

  return (
    <Grid container spacing={4} className="mt-8">
      <Grid item md={7} xs={12}>
        <CampaignCostList
          dataList={dataList}
          setDataList={setDataList}
          setUpdateData={setUpdateData}
        />
      </Grid>
      <Grid item md={5} xs={12}>
        <AddCampaignCost
          dataList={dataList}
          setDataList={setDataList}
          updateData={updateData}
          setUpdateData={setUpdateData}
        />
      </Grid>
    </Grid>
  );
};

export default CampaignCostDetails;
