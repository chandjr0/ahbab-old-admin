import React, { useEffect, useState } from "react";
import "react-loading-skeleton/dist/skeleton.css";
import {
  TableCell,
  TableRow,
  Table,
  TableHead,
  TableBody,
  Typography,
  Box,
  Card,
  Tooltip,
  CardHeader,
  Grid,
  TextField,
  MenuItem,
} from "@material-ui/core";
import axios from "../../../axios";
import Spinner from "../../Shared/Spinner/Spinner";
import { Breadcrumb } from "../../components";
import { notification } from "antd";

const DistrictList = () => {
  const [dataList, setDataList] = useState([]);
  const [divisionList, setDivisionList] = useState([]);
  const [divisionId, setDivisionId] = useState("");
  const [districtList, setDistrictList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        let res = await axios.get("/location/all");
        if (res) {
          let data = res?.data?.data;
          setDataList(data);
          setDivisionList(data?.divisions);
          setDistrictList(data?.districts.filter((i) => i.divisionId === data?.divisions[0]?._id));
          setDivisionId(data?.divisions[0]?._id);
        }

        setIsLoading(false);
        setErrorMsg("");
      } catch (err) {
        setIsLoading(false);
        setErrorMsg(err.response.data.message);
      }
    };
    fetchData();
  }, [setDataList]);

  useEffect(() => {
    if (divisionId) {
      setDistrictList(dataList?.districts.filter((i) => i.divisionId === divisionId));
    }
  }, [divisionId, dataList]);

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  const updateDistrictStatusHandler = async (status, districtId) => {
    try {
      let res = await axios.patch(
        `/location/update-district-status/${districtId}?status=${status}`
      );
      if (res) {
        setDistrictList(
          districtList.map((data) =>
            data?._id === districtId ? { ...data, status: status } : data
          )
        );
        openNotificationWithIcon(res?.data?.message, "success");
      }
    } catch (err) {
      openNotificationWithIcon(err?.response?.data?.message, "error");
    }
  };

  return (
    <div className="m-sm-30">
      <div className="mb-sm-30">
        <Breadcrumb routeSegments={[{ name: "district" }]} />
      </div>{" "}
      <Grid container>
        <Grid item lg={4} md={6} sm={8} xs={12}>
          <Card elevation={3}>
            <CardHeader title="District List" />

            {!isLoading ? (
              <div className="w-full overflow-auto  px-6 py-8">
                <TextField
                  className="mb-4 mt-2"
                  name="attributeId"
                  label=""
                  variant="outlined"
                  size="small"
                  fullWidth
                  select
                  value={divisionId}
                  onChange={(event) => setDivisionId(event.target.value)}
                >
                  {divisionList.length > 0 &&
                    divisionList?.map((item, index) => (
                      <MenuItem value={item?._id} key={index}>
                        {item?.name}
                      </MenuItem>
                    ))}
                </TextField>

                {districtList?.length > 0 && errorMsg === "" ? (
                  <Table className="whitespace-pre">
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <strong>#</strong>
                        </TableCell>
                        <TableCell>Name</TableCell>
                        {/* <TableCell>Status</TableCell> */}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {districtList.map((data, index) => (
                        <TableRow key={index}>
                          <TableCell className="capitalize" align="left">
                            {index + 1}
                          </TableCell>

                          <TableCell className="capitalize" align="left">
                            {data?.name}
                          </TableCell>

                          {/* <TableCell className="capitalize" align="left">
                            <TextField
                              name=""
                              label=""
                              variant="outlined"
                              size="small"
                              fullWidth
                              select
                              value={data?.status}
                              onChange={(e) =>
                                updateDistrictStatusHandler(e.target.value, data?._id)
                              }
                            >
                              <MenuItem value="OUTSIDE"> OUTSIDE </MenuItem>
                              <MenuItem value="SUBSIDE"> SUBSIDE </MenuItem>
                              <MenuItem value="INSIDE"> INSIDE </MenuItem>
                            </TextField>
                          </TableCell> */}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Typography
                    variant="body2"
                    style={{
                      textAlign: "center",
                      color: "gray",
                      paddingY: "14px",
                      padding: "8px",
                    }}
                  >
                    No Data Found
                  </Typography>
                )}
              </div>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  height: "auto",
                  width: "auto",
                  marginY: "58px",
                }}
              >
                <Spinner />
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default DistrictList;
