import React, { useState } from "react";
import { Breadcrumb } from "../../components/index";
import "react-loading-skeleton/dist/skeleton.css";

import CreateSticker from "./createStciker";
import StickerList from "./stcikerList";
import { Grid } from "@material-ui/core";

const Sticker = () => {
  const [dataList, setDataList] = useState([]);
  const [updateData, setUpdateData] = useState(null);

  return (
    <div className="m-sm-30">
      <div className="mb-sm-30">
        <Breadcrumb routeSegments={[{ name: "Sticker" }]} />
      </div>
      <Grid container spacing={4}>
        <Grid item md={4} xs={12}>
          <CreateSticker
            dataList={dataList}
            setDataList={setDataList}
            updateData={updateData}
            setUpdateData={setUpdateData}
          />
        </Grid>
        <Grid item md={6} xs={12}>
          <StickerList
            dataList={dataList}
            setDataList={setDataList}
            setUpdateData={setUpdateData}
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default Sticker;
