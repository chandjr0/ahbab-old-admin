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
  Box,
  Typography,
  Card,
  Button,
  Tooltip,
  CardHeader,
} from "@material-ui/core";
import axios from "../../../axios";
import Spinner from "../../Shared/Spinner/Spinner";
import { useHistory } from "react-router-dom";
import SimpleModal from "../../Shared/SimpleModal/SimpleModal";
import { notification } from "antd";
import { RiDeleteBin3Line } from "react-icons/ri";
import { FaExclamationTriangle, FaRegEdit } from "react-icons/fa";
import { IoMdAddCircle } from "react-icons/io";

const AttributeValueList = () => {
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
        let modifyAttributeData = [];
        for (let valueArr of res?.data?.data) {
          for (let valueData of valueArr.options) {
            modifyAttributeData.push({
              ...valueData,
              attribute: valueArr.name,
            });
          }
        }
        setDataList(modifyAttributeData);
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
      let res = await axios.delete(`attribute/delete-option/${deleteId}`);
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
      <div className="mb-sm-30">
        <Breadcrumb routeSegments={[{ name: "Attribute Value List" }]} />
      </div>

      <Grid container>
        <Grid item md={8} xs={12}>
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
              onClick={() => history.push("/create-attribute-value")}
            >
              Add Attribute Value
            </Button>
          </Box>
          <Card elevation={3}>
            <CardHeader title="Attribute Value List" />

            {!isLoading ? (
              <div className="w-full overflow-auto px-6  py-8">
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
                          <TableCell className="min-w-100">Value Name</TableCell>
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
                            <Tooltip title={"attribute name"} placement="bottom-start">
                              <TableCell className="capitalize" align="left">
                                {data?.attribute}
                              </TableCell>
                            </Tooltip>
                            <Tooltip title={"attribute value name"} placement="bottom-start">
                              <TableCell className="capitalize" align="left">
                                {data?.name}
                              </TableCell>
                            </Tooltip>
                            <TableCell>
                              <Tooltip title={"edit value name"} placement="bottom-start">
                                <IconButton
                                  onClick={() => {
                                    history.push(`/update-attribute-value/${data._id}`);
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
                              <Tooltip title={"delete value name"} placement="bottom-start">
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
            <Button variant="outlined" color="primary" className="mr-4" onClick={deleteHandler}>
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

export default AttributeValueList;
