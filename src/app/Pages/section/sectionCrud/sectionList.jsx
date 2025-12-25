import React, { useEffect, useState } from "react";
import "react-loading-skeleton/dist/skeleton.css";
import {
  IconButton,
  TableCell,
  TableRow,
  Table,
  TableHead,
  TableBody,
  Typography,
  Box,
  Card,
  Button,
  CardHeader,
} from "@material-ui/core";
import axios from "../../../../axios";
import Spinner from "../../../Shared/Spinner/Spinner";
import SimpleModal from "../../../Shared/SimpleModal/SimpleModal";
import { notification } from "antd";
import { FaExclamationTriangle, FaRegEdit, FaRegEye } from "react-icons/fa";
import { RiDeleteBin3Line } from "react-icons/ri";
import { useHistory } from "react-router-dom";

const SectionList = ({ dataList, setDataList, setUpdateData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [deleteId, setDeleteId] = useState("");

  const history = useHistory();

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        let res = await axios.get("/section/fetch-all");
        setDataList(res?.data?.data);
        setIsLoading(false);
        setErrorMsg("");
      } catch (err) {
        setIsLoading(false);
        setErrorMsg(err.response.data.message);
      }
    };
    fetchData();
  }, [setDataList]);

  const closeModalHandler = () => {
    setDeleteId("");
    setIsOpenModal(false);
  };

  const deleteHandler = async () => {
    try {
      let res = await axios.delete(`/section/delete/${deleteId}`);
      setDataList(dataList.filter((i) => i._id !== deleteId));
      openNotificationWithIcon(res?.data?.message, "success");
    } catch (error) {
      openNotificationWithIcon(error?.response?.data?.message, "error");
    }
    setDeleteId("");
    setIsOpenModal(false);
  };

  return (
    <>
      <Card elevation={3}>
        <CardHeader title="Section List" />

        {!isLoading ? (
          <div className="w-full overflow-auto  px-6 py-8">
            {dataList?.length > 0 && errorMsg === "" ? (
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
                      <TableCell className="min-w-100">Description</TableCell>
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
                        <TableCell className="capitalize" align="left">
                          {data?.description}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            style={{
                              backgroundColor: "#ebedec",
                              color: "green",
                              marginRight: "8px",
                            }}
                            onClick={() =>
                              history.push("/section/" + data?.slug)
                            }
                          >
                            <FaRegEye style={{ fontSize: "16px" }} />
                          </IconButton>
                          <IconButton
                            onClick={() => {
                              setUpdateData(data);
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
                            <RiDeleteBin3Line style={{ fontSize: "16px" }} />
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
      </SimpleModal>{" "}
    </>
  );
};

export default SectionList;
