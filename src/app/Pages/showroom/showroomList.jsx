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
  Typography,
  Box,
  Card,
  Button,
  FormControlLabel,
  Avatar,
  CardHeader,
} from "@material-ui/core";
import axios from "../../../axios";
import Spinner from "../../Shared/Spinner/Spinner";
import { useHistory } from "react-router-dom";
import SimpleModal from "../../Shared/SimpleModal/SimpleModal";
import { notification } from "antd";
import IOSSwitch from "../../Shared/Forms/iosSwitch";
import imageBasePath from "../../../config";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBin3Line } from "react-icons/ri";
import { IoMdAddCircle } from "react-icons/io";
import { FaExclamationTriangle } from "react-icons/fa";

const EmployeeList = () => {
  const history = useHistory();

  const [dataList, setDataList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [openImgData, setOpenImgData] = useState(null);

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        let res = await axios.get("/setting/showroom/view-all");
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
    setOpenImgData(null);
  };

  const deleteHandler = async () => {
    try {
      let res = await axios.delete(`/setting/showroom/delete/${deleteId}`);
      setDataList(dataList.filter((i) => i._id !== deleteId));
      openNotificationWithIcon(res?.data?.message, "success");
    } catch (error) {
      openNotificationWithIcon(error?.response?.data?.message, "error");
    }
    setDeleteId(false);
    setIsOpenModal(false);
  };



  return (
    <div className="m-sm-30">
     
      <Grid container>
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardHeader className="text-center" title="Showroom List" />

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
                          <TableCell className="min-w-100">Name</TableCell>
                          <TableCell className="min-w-100">Address</TableCell>
                          <TableCell className="min-w-100">Phone</TableCell>
          
                          <TableCell className="min-w-100">Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dataList.map((data, index) => (
                          <TableRow key={index}>
                            <TableCell className="capitalize" align="left">
                              {index + 1}
                            </TableCell>
                           
                            <TableCell className="capitalize" align="left">
                              {data?.name}
                            </TableCell>
                            <TableCell align="left">
                              {data?.address}
                            </TableCell>{" "}
                            <TableCell className="capitalize" align="left">
                              {data?.phones}
                            </TableCell>
                            <TableCell>
                              <IconButton
                                onClick={() => {
                                  history.push(`/update-showroom/${data._id}`);
                                }}
                                style={{
                                  backgroundColor: "#ebedec",
                                  color: "#1976d2",
                                  marginRight: "8px",
                                }}
                              >
                                <FaRegEdit style={{ fontSize: "16px" }} />
                              </IconButton>

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
        {openImgData ? (
          <Avatar
            className="border-radius-4"
            style={{ width: "100%", height: "100%" }}
            src={imageBasePath + "/" + openImgData?.image}
            alt={openImgData?.name}
          />
        ) : (
          ""
        )}

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

export default EmployeeList;
