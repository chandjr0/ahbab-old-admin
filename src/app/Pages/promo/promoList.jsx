import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardHeader,
  FormControlLabel,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@material-ui/core";
import axios from "../../../axios";
import imageBasePath from "../../../config";
import IOSSwitch from "../../Shared/Forms/iosSwitch";
import { RiDeleteBin5Line } from "react-icons/ri";
import SimpleModal from "../../Shared/SimpleModal/SimpleModal";
import Spinner from "../../Shared/Spinner/Spinner";
import { notification } from "antd";
import { useHistory } from "react-router-dom";
import moment from "moment";
import { FaExclamationTriangle,FaRegEdit } from "react-icons/fa";


export default function StickyHeadTable() {
  const history = useHistory();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalData, setTotalData] = useState(0);
  const [rows, setRows] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [openImgData, setOpenImgData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const columns = [
    {
      id: "promo",
      label: "Promo Code",
      minWidth: 120,
      format: (value) => <h6 style={{ color: "green" }}>{value}</h6>,
    },
    { id: "minBuyingAmount", label: "Min. Amount", minWidth: 120 },
    { id: "discountType", label: "Discount Type", minWidth: 120 },
    { id: "discountPrice", label: "Discount Price", minWidth: 120 },
    {
      id: "promoType",
      label: "Coupon Type",
      minWidth: 120,
      format: (value) => <span className="capitalize">{value}</span>,
    },
    {
      id: "limit",
      label: "Limit",
      minWidth: 120,
      format: (value) => (
        <span className="capitalize">{value ? "Yes" : "No"}</span>
      ),
    },
    {
      id: "maxUse",
      label: "Total Use",
      minWidth: 120,
      format: (value) => <span className="capitalize">{value}</span>,
    },
    {
      id: "maxLimit",
      label: "Total Limit",
      minWidth: 120,
      format: (value) => <span className="capitalize">{value}</span>,
    },
    {
      id: "userLimit",
      label: "Use limit",
      minWidth: 120,
      format: (value) => <span className="capitalize">{value?.maxUsed}</span>,
    },
    {
      id: "startTime",
      label: "Start Time",
      minWidth: 120,
      format: (value) => <>{moment(value).format("MMM Do , h:mm a")}</>,
    },
    {
      id: "endTime",
      label: "End Time",
      minWidth: 120,
      format: (value) => <>{moment(value).format("MMM Do , h:mm a")}</>,
    },
    {
      id: "publish",
      label: "Publish",
      minWidth: 90,
      format: (value) => (
        <FormControlLabel
          control={
            <IOSSwitch
              sx={{ m: 1 }}
              checked={!value?.isDisable}
              onClick={() => statusUpdateHandler(value)}
            />
          }
          label=""
        />
      ),
    },
    {
      id: "action",
      label: "Action",
      minWidth: 140,
      format: (value) => (
        <>
          <IconButton
            onClick={() => {
              setIsOpenModal(true);
              setDeleteId(value);
            }}
            style={{
              backgroundColor: "#ebedec",
              color: "red",
              marginRight: "5px",
            }}
          >
            <RiDeleteBin5Line style={{ fontSize: "16px" }} />
          </IconButton>
          <IconButton
            onClick={() => {
             history.push(`/update-promo/${value}`)
            }}
            style={{ backgroundColor: "#ebedec", color: "green" }}
          >
            <FaRegEdit style={{ fontSize: "16px" }} />
          </IconButton>
        </>
      ),
    },
  ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  useEffect(() => {
    let fetchData = async () => {
      try {
        setIsLoading(true);
        let res = await axios.get(
          `/promo/fetch-all-promo?promoType=all&page=${
            page + 1
          }&limit=${rowsPerPage}`
        );

        if (res?.data?.data) {
          setTotalData(res?.data?.metaData?.totalData);
          let dataArray = [];
          for (let data of res?.data?.data) {
            dataArray.push({
              _id: data?._id,
              promo: data?.promo,
              promoType: data?.promoType,
              minBuyingAmount: data?.minBuyingAmount,
              discountType: data?.discount?.discountType,
              discountPrice: data?.discount?.discountPrice,
              limit: data?.limitInfo?.haveLimit,
              maxUse: data?.limitInfo?.totalUsed,
              maxLimit: data?.limitInfo?.maxUsed,
              userLimit:data?.userLimitInfo,
              startTime: data?.startTime,
              endTime: data?.endTime,
              publish: {
                _id: data?._id,
                isDisable: data?.isDisable,
              },
              action: data?._id,
            });
          }
          setRows(dataArray);
        }
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        setErrorMsg(err?.response?.data?.message);
      }
    };

    fetchData();
  }, [page, rowsPerPage]);

  const deleteHandler = async () => {
    try {
      let res = await axios.delete(`/promo/delete/${deleteId}`);
      setRows(rows.filter((i) => i._id !== deleteId));
      openNotificationWithIcon(res?.data?.message, "success");
    } catch (error) {
      openNotificationWithIcon(error?.response?.data?.message, "error");
    }
    setDeleteId(false);
    setIsOpenModal(false);
  };

  const closeModalHandler = () => {
    setDeleteId(false);
    setIsOpenModal(false);
    setOpenImgData(null);
  };

  const statusUpdateHandler = async (data) => {
    try {
      const createRes = await axios.patch(
        `/promo/enable-or-disable/${data?._id}?isDisable=${!data?.isDisable}`
      );
      let updatedData = rows.map((list) => {
        if (list?._id === data?._id) {
          list.publish.isDisable = !list?.publish?.isDisable;
        }
        return list;
      });
      setRows(updatedData);
      if (createRes?.data?.success) {
        openNotificationWithIcon(createRes?.data?.message, "success");
      }
      setIsLoading(false);
    } catch (error) {
      console.log("error");
      openNotificationWithIcon(error?.response?.data?.message, "error");
      setIsLoading(false);
    }
  };

  return (
    <div className="m-sm-30">
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "28px",
          marginTop: "28px",
        }}
        className="mx-8"
      >
        <Button
          style={{
            backgroundColor: "#FF8E96",
            color: "white",
          }}
          variant="contained"
          size="large"
          onClick={() => history.push("/create-promo")}
        >
          Add Promo
        </Button>
      </Box>
      <Card className="border-radius-0 mx-8">
        <CardHeader title="Promo Information " />
        {!isLoading ? (
          <div className="w-full overflow-hidden px-2">
            {rows.length > 0 && errorMsg === "" ? (
              <>
                {" "}
                <div
                  style={{
                    maxHeight: 800,
                    overflow: "auto",
                  }}
                >
                  <Table stickyHeader className="whitespace-pre p-3">
                    <TableHead>
                      <TableRow>
                        {columns.map((column) => (
                          <TableCell
                            key={column.id}
                            align={column.align}
                            style={{ minWidth: column.minWidth }}
                          >
                            {column.label}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => {
                        return (
                          <TableRow
                            hover
                            role="checkbox"
                            tabIndex={-1}
                            key={row._id}
                          >
                            {columns.map((column) => {
                              const value = row[column.id];
                              return (
                                <TableCell key={column.id} align={column.align}>
                                  {column.format
                                    ? column.format(value, row?.name)
                                    : value}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <TablePagination
                  rowsPerPageOptions={[10, 25, 100]}
                  component="div"
                  count={totalData} // total data
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </>
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
}
