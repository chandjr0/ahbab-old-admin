import React, { useState } from "react";
import { Breadcrumb } from "../../components/index";
import "react-loading-skeleton/dist/skeleton.css";

import CreateCourier from "./createCourier";
import CourierList from "./courierList";
import { Grid } from "@material-ui/core";

const Courier = () => {
  const [dataList, setDataList] = useState([]);
  const [updateData, setUpdateData] = useState(null);

  return (
    <div className="m-sm-30">
      <div className="mb-sm-30">
        <Breadcrumb routeSegments={[{ name: "Courier" }]} />
      </div>
      <Grid container spacing={4}>
        <Grid item md={4} xs={12}>
          <CreateCourier
            dataList={dataList}
            setDataList={setDataList}
            updateData={updateData}
            setUpdateData={setUpdateData}
          />
        </Grid>
        <Grid item md={6} xs={12}>
          <CourierList
            dataList={dataList}
            setDataList={setDataList}
            setUpdateData={setUpdateData}
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default Courier;
