import React, { useEffect, useState } from "react";
import { Breadcrumb } from "../../components/index";
import "react-loading-skeleton/dist/skeleton.css";
import {
  IconButton,
  TableCell,
  TableRow,
  Table,
  TableHead,
  TableBody,
  Grid,
  Chip,
  Typography,
  Box,
  Card,
  Button,
  FormControlLabel,
  Tooltip,
  CardHeader,
} from "@material-ui/core";
import axios from "../../../axios";
import Spinner from "../../Shared/Spinner/Spinner";
import { useHistory } from "react-router-dom";
import SimpleModal from "../../Shared/SimpleModal/SimpleModal";
import { notification } from "antd";
import IOSSwitch from "../../Shared/Forms/iosSwitch";
import { FaExclamationTriangle, FaRegEdit } from "react-icons/fa";
import { RiDeleteBin3Line } from "react-icons/ri";
import { IoMdAddCircle } from "react-icons/io";

const AttributeList = () => {
  const history = useHistory();

  const [dataList, setDataList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        let res = await axios.get("/attribute/fetch-all");
        setDataList(res?.data?.data);
        setIsLoading(false);
        setErrorMsg("");
      } catch (err) {
        setIsLoading(false);
        setErrorMsg(err.response.data.message);
      }
    };
    fetchData();
  }, []);

  const closeModalHandler = () => {
    setDeleteId(false);
    setIsOpenModal(false);
  };

  const deleteHandler = async () => {
    try {
      let res = await axios.delete(`attribute/delete/${deleteId}`);
      setDataList(dataList.filter((i) => i._id !== deleteId));
      openNotificationWithIcon(res?.data?.message, "success");
    } catch (error) {
      openNotificationWithIcon(error?.response?.data?.message, "error");
    }
    setDeleteId(false);
    setIsOpenModal(false);
  };

  const updateHandler = async (data) => {
    try {
      const createRes = await axios.patch(
        `/attribute/update-name/${data._id}`,
        {
          name: data.name,
          isDisabled: !data.isDisabled,
        }
      );
      let updatedData = dataList.map((list) => {
        if (list._id === data._id) {
          list.isDisabled = !data.isDisabled;
        }
        return list;
      });
      setDataList(updatedData);
      if (createRes?.data?.success) {
        openNotificationWithIcon("Attribute status update", "success");
      }
      setIsLoading(false);
    } catch (error) {
      openNotificationWithIcon(error?.response?.data?.message, "error");
      setIsLoading(false);
    }
  };

  return (
    <div className="m-sm-30">
      <div className="mb-sm-30">
        <Breadcrumb routeSegments={[{ name: "Attribute List" }]} />
      </div>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "28px",
          marginTop: "28px",
        }}
      >
        <Button
          style={{
            backgroundColor: "#FF8E96",
            color: "white",
          }}
          variant="contained"
          size="large"
          startIcon={<IoMdAddCircle />}
          onClick={() => history.push("/create-attribute")}
        >
          Add Attribute
        </Button>
      </Box>
      <Grid container>
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardHeader title="Attribute List" />

            {!isLoading ? (
              <div className="w-full overflow-auto  px-6 py-8">
                {dataList.length > 0 && errorMsg === "" ? (
                  <div
                    style={{
                      maxHeight: 800,
                      minWidth: 300,
                      overflow: "auto",
                    }}
                  >
                    <Table stickyHeader className="whitespace-pre">
                      <TableHead>
                        <TableRow>
                          <TableCell className="min-w-50">
                            <strong>#</strong>
                          </TableCell>
                          <TableCell className="min-w-100">Attribute</TableCell>
                          <TableCell className="min-w-100">Values</TableCell>
                          <TableCell className="min-w-100">Status</TableCell>
                          <TableCell className="min-w-100">Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dataList.map((data, index) => (
                          <TableRow key={index}>
                            <Tooltip title={"serial"} placement="bottom-start">
                              <TableCell className="capitalize" align="left">
                                {index + 1}
                              </TableCell>
                            </Tooltip>
                            <Tooltip
                              title={"Attribute"}
                              placement="bottom-start"
                            >
                              <TableCell className="capitalize" align="left">
                                {data?.name}
                              </TableCell>
                            </Tooltip>
                            <Tooltip
                              title={"Attribute Values"}
                              placement="bottom-start"
                            >
                              <TableCell className="capitalize" align="left">
                                {data?.options.map((i, index) => (
                                  <span
                                    key={index}
                                    style={{ position: "relative" }}
                                  >
                                    <Chip
                                      style={{
                                        marginRight: "5px",
                                        marginBottom: "10px",
                                      }}
                                      key={index}
                                      label={i.name}
                                    />
                                  </span>
                                ))}
                              </TableCell>
                            </Tooltip>
                            <Tooltip
                              title={"Active or inactive"}
                              placement="bottom-start"
                            >
                              <TableCell className="capitalize" align="left">
                                {!data?.isDisabled ? (
                                  <small className="rounded bg-primary elevation-z3 text-white px-2 py-2px mr-4">
                                    active
                                  </small>
                                ) : (
                                  <small className="rounded bg-light-error elevation-z3 px-2 py-2px mr-4">
                                    inactive
                                  </small>
                                )}
                                <FormControlLabel
                                  control={
                                    <IOSSwitch
                                      sx={{ m: 1 }}
                                      checked={!data?.isDisabled}
                                      onClick={() => updateHandler(data)}
                                    />
                                  }
                                  label=""
                                />
                              </TableCell>
                            </Tooltip>
                            <TableCell>
                              <Tooltip title={"edit"} placement="bottom-start">
                                <IconButton
                                  onClick={() => {
                                    history.push(
                                      `/update-attribute/${data._id}`
                                    );
                                  }}
                                  style={{
                                    backgroundColor: "#ebedec",
                                    color: "#1976d2",
                                    marginRight: "8px",
                                  }}
                                >
                                  <FaRegEdit style={{ fontSize: "16px" }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip
                                title={"delete"}
                                placement="bottom-start"
                              >
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
                                  <RiDeleteBin3Line
                                    style={{ fontSize: "16px" }}
                                  />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
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
      </SimpleModal>
    </div>
  );
};

export default AttributeList;
