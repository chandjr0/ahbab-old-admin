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
  CardHeader,
  Grid,
  TextField,
  MenuItem,
  IconButton,
  Button,
} from "@material-ui/core";
import axios from "../../../axios";
import Spinner from "../../Shared/Spinner/Spinner";
import { Breadcrumb } from "../../components";
import { notification } from "antd";
import { RiDeleteBin3Line } from "react-icons/ri";
import SimpleModal from "../../Shared/SimpleModal/SimpleModal";
import { FaExclamationTriangle } from "react-icons/fa";

const UpazilaList = () => {
  const [dataList, setDataList] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [districtId, setDistrictId] = useState("");
  const [upazilaList, setUpazilaList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [upazilaName, setUpazilaName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        let res = await axios.get("/location/all");
        if (res) {
          let data = res?.data?.data;
          setDataList(data);
          setDistrictList(data?.districts);
          setUpazilaList(
            data?.areas.filter(
              (i) => i.districtId === data?.districts[0]?._id
            )
          );
          setDistrictId(data?.districts[0]?._id);
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
    if (districtId) {
      setUpazilaList(
        dataList?.areas.filter((i) => i.districtId === districtId)
      );
    }
  }, [districtId, dataList]);

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  const updateDistrictStatusHandler = async (status, upazilaId) => {
    try {
      let res = await axios.patch(
        `/location/update-upazila-status/${upazilaId}?status=${status}`
      );
      if (res) {
        setUpazilaList(
          upazilaList.map((data) =>
            data?._id === upazilaId ? { ...data, status: status } : data
          )
        );
        openNotificationWithIcon(res?.data?.message, "success");
      }
    } catch (err) {
      openNotificationWithIcon(err?.response?.data?.message, "error");
    }
  };

  const closeModalHandler = () => {
    setDeleteId(false);
    setIsOpenModal(false);
  };

  const deleteHandler = async () => {
    try {
      let res = await axios.delete(`/location/area/remove/${deleteId}`);
      setUpazilaList(upazilaList.filter((i) => i._id !== deleteId));
      openNotificationWithIcon(res?.data?.message, "success");
    } catch (error) {
      openNotificationWithIcon(error?.response?.data?.message, "error");
    }
    setDeleteId(false);
    setIsOpenModal(false);
  };

  const addUpazilaHandler = async () => {
    try {
      if (upazilaName === "") {
        openNotificationWithIcon("enter a upazila name", "error");
        return;
      }
      let obj = {
        districtId: districtId,
        name: upazilaName,
      };
      let res = await axios.post(`/location/area/add`, obj);
      setUpazilaName("");
      setUpazilaList([...upazilaList, res?.data?.data]);
      openNotificationWithIcon(res?.data?.message, "success");
    } catch (error) {
      openNotificationWithIcon(error?.response?.data?.message, "error");
    }
    setDeleteId(false);
    setIsOpenModal(false);
  };

  return (
    <div className="m-sm-30">
      <div className="mb-sm-30">
        <Breadcrumb routeSegments={[{ name: "Area" }]} />
      </div>{" "}
      <Grid container>
        <Grid item md={6} sm={8} xs={12}>
          <Card elevation={3}>
            <CardHeader title="Area List" />

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
                  value={districtId}
                  onChange={(event) => setDistrictId(event.target.value)}
                >
                  {districtList.length > 0 &&
                    districtList?.map((item, index) => (
                      <MenuItem value={item?._id} key={index}>
                        {item?.name}
                      </MenuItem>
                    ))}
                </TextField>
                <Grid container spacing={2} className="border mb-8">
                  <Grid item xs={8}>
                    <TextField
                      label=""
                      placeholder="add new upazila"
                      name="name"
                      size="small"
                      variant="outlined"
                      fullWidth
                      value={upazilaName}
                      onChange={(e) => setUpazilaName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      color="primary"
                      variant="contained"
                      fullWidth
                      onClick={addUpazilaHandler}
                    >
                      Add
                    </Button>
                  </Grid>
                </Grid>

                {upazilaList?.length > 0 && errorMsg === "" ? (
                  <Table className="whitespace-pre">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">
                          <strong>#</strong>
                        </TableCell>
                        <TableCell align="center">Name</TableCell>
                        <TableCell align="center">Status</TableCell>
                        {/* <TableCell align="center">Action</TableCell> */}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {upazilaList.map((data, index) => (
                        <TableRow key={index}>
                          <TableCell className="capitalize" align="center">
                            {index + 1}
                          </TableCell>

                          <TableCell className="capitalize" align="center">
                            {data?.name}
                          </TableCell>

                          {/* <TableCell className="capitalize" align="center">
                            <TextField
                              name=""
                              label=""
                              variant="outlined"
                              size="small"
                              fullWidth
                              select
                              value={data?.status}
                              onChange={(e) =>
                                updateDistrictStatusHandler(
                                  e.target.value,
                                  data?._id
                                )
                              }
                            >
                              <MenuItem value="OUTSIDE"> OUTSIDE </MenuItem>
                              <MenuItem value="SUBSIDE"> SUBSIDE </MenuItem>
                              <MenuItem value="INSIDE"> INSIDE </MenuItem>
                            </TextField>
                          </TableCell> */}
                          <TableCell align="center">
                            <IconButton
                              onClick={() => {
                                setIsOpenModal(true);
                                setDeleteId(data._id);
                              }}
                              style={{
                                backgroundColor: "#ebedec",
                                color: "red",
                              }}
                            >
                              <RiDeleteBin3Line style={{ fontSize: "16px" }} />
                            </IconButton>
                          </TableCell>
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
      <SimpleModal isShow={isOpenModal} closeModalHandler={closeModalHandler}>
        {deleteId ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <FaExclamationTriangle className="text-secondary text-32" />
              <Typography paragraph className="ml-2 text-16">
                Are you sure you want to delete these?
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
              <Button
                variant="outlined"
                color="primary"
                className="mr-4"
                onClick={deleteHandler}
              >
                Yes
              </Button>
              <Button variant="outlined" onClick={() => setIsOpenModal(false)}>
                No
              </Button>
            </Box>
          </Box>
        ) : (
          ""
        )}
      </SimpleModal>
    </div>
  );
};

export default UpazilaList;
