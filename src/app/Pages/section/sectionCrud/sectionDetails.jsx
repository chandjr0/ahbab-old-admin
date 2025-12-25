import React, { useState } from "react";
import { Breadcrumb } from "../../../components/index";
import "react-loading-skeleton/dist/skeleton.css";

import CreateSection from "./createSection";
import SectionList from "./sectionList";
import { Grid } from "@material-ui/core";

const SectionDetails = () => {
  const [dataList, setDataList] = useState([]);
  const [updateData, setUpdateData] = useState(null);

  return (
    <div className="m-sm-30">
      <div className="mb-sm-30">
        <Breadcrumb routeSegments={[{ name: "section" }]} />
      </div>
      <Grid container spacing={4}>
        <Grid item md={4} xs={12}>
          <CreateSection
            dataList={dataList}
            setDataList={setDataList}
            updateData={updateData}
            setUpdateData={setUpdateData}
          />
        </Grid>
        <Grid item md={8} xs={12}>
          <SectionList
            dataList={dataList}
            setDataList={setDataList}
            setUpdateData={setUpdateData}
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default SectionDetails;
