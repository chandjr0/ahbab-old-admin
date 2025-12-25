import "dotenv/config";
import React, { useEffect, useState, useMemo } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardHeader,
  Divider,
  FormControlLabel,
  Menu,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@material-ui/core";
import axios from "../../../axios";
import imageBasePath from "../../../config";
import Spinner from "../../Shared/Spinner/Spinner";
import { notification } from "antd";
import IOSSwitch from "../../Shared/Forms/iosSwitch";
import { FaExclamationTriangle, FaRegEdit } from "react-icons/fa";
import SimpleModal from "../../Shared/SimpleModal/SimpleModal";
import ProductDetails from "./productDetails";
import { useHistory, useLocation } from "react-router-dom";
import { RiDeleteBin3Line } from "react-icons/ri";

import "date-fns";

import { useDebounce } from "../../hooks/useDebounce";

export default function OrderList() {
  const history = useHistory();

  const rowperPage = localStorage.getItem("rowPerPage");

  const [page, setPage] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(
    rowperPage ? Number(rowperPage) : 10
  );
  const [statusName, setStatusName] = useState("");
  const [userType, setUserType] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const searchQuery = useDebounce(searchValue, 1500);
  const [courierValue, setCourierValue] = useState("");
  const [totalData, setTotalData] = useState(0);
  const [rows, setRows] = useState([]);
  const [dataList, setDataList] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [productsData, setProductsData] = useState([]);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [totalChecked, setTotalChecked] = useState(0);
  

  const [employeeName, setEmployeeName] = useState("");

  const fetchData = async () => {
    try {
      let res = null;

      let obj = {
        value: "",
        comboType: "",
        sort: "",
      };

      res = await axios.post(
        `/combo/admin/list?page=${page + 1}&limit=${rowsPerPage}`,
        obj
      );
      if (res) {
        setDataList(res?.data?.data);
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err?.response?.data?.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let dataArray = [];

    if (dataList.length > 0) {
      dataList.map((data, index) => {
        dataArray.push({
          _id: data?._id,
          image: data?.galleryImage[0],
          sku: data?.sku,
          name: data?.name,
          comboPrice: data?.sellingPrice,
          products: data?.comboProduct,
          isOwnDisabled: { status: data?.isOwnDisabled, id: data?._id },
          isFeatured: { status: data?.isFeatured, id: data?._id },
          isPos: { status: data?.isPosSuggest, id: data?._id },
          isReseller: { status: data?.isReseller, id: data?._id },
          description: {
            notes: data?.adminNote,
            serialId: data?.serialId,
            _id: data?._id,
          },
          action: data,
        });
      });
    }
    setRows(dataArray);
  }, [dataList]);

  const closeModalHandler = () => {
    setIsDeleteModal(false);
    setIsOpenModal(false)
  };

  const statusUpdateHandler = async (data) => {
    try {
      const createRes = await axios.patch(`/combo/admin/disable/${data?.id}`, {
        isOwnDisabled: !data?.isOwnDisabled,
      });

      if (createRes?.data?.success) {
        setDataList(
          dataList.map((i) => {
            return i?._id === data?.id
              ? {
                  ...i,
                  isOwnDisabled: !data?.isOwnDisabled,
                }
              : i;
          })
        );
        openNotificationWithIcon(createRes?.data?.message, "success");
      }
      setIsLoading(false);
    } catch (error) {
      console.log("error");
      openNotificationWithIcon(error?.response?.data?.message, "error");
      setIsLoading(false);
    }
  };

  const posUpdateHandler = async (data) => {
    try {
      const createRes = await axios.patch(
        `/combo/admin/pos-suggested/${data?.id}`,
        {
          isPosSuggest: !data?.isPosSuggest,
        }
      );

      if (createRes?.data?.success) {
        setDataList(
          dataList.map((i) => {
            return i?._id === data?.id
              ? {
                  ...i,
                  isPosSuggest: !data?.isPosSuggest,
                }
              : i;
          })
        );
        openNotificationWithIcon(createRes?.data?.message, "success");
      }
      setIsLoading(false);
    } catch (error) {
      console.log("error");
      openNotificationWithIcon(error?.response?.data?.message, "error");
      setIsLoading(false);
    }
  };

  const isResellerUpdateHandler = async (data) => {
    try {
      const createRes = await axios.patch(
        `/combo/admin/reseller-status/${data?.id}`,
        {
          isReseller: !data?.isReseller,
        }
      );

      if (createRes?.data?.success) {
        setDataList(
          dataList.map((i) => {
            return i?._id === data?.id
              ? {
                  ...i,
                  isReseller: !data?.isReseller,
                }
              : i;
          })
        );
        openNotificationWithIcon(createRes?.data?.message, "success");
      }
      setIsLoading(false);
    } catch (error) {
      console.log("error");
      openNotificationWithIcon(error?.response?.data?.message, "error");
      setIsLoading(false);
    }
  };

  const isFeaturedUpdateHandler = async (data) => {
    try {
      const createRes = await axios.patch(`/combo/admin/featured/${data?.id}`, {
        isFeatured: !data?.isFeatured,
      });

      if (createRes?.data?.success) {
        setDataList(
          dataList.map((i) => {
            return i?._id === data?.id
              ? {
                  ...i,
                  isFeatured: !data?.isFeatured,
                }
              : i;
          })
        );
        openNotificationWithIcon(createRes?.data?.message, "success");
      }
      setIsLoading(false);
    } catch (error) {
      console.log("error");
      openNotificationWithIcon(error?.response?.data?.message, "error");
      setIsLoading(false);
    }
  };

  
  const deleteHandler = async () => {
    try {
      let res = await axios.delete(`/combo/admin/delete/${deleteId}`);
      window.location.reload()
      openNotificationWithIcon(res?.data?.message, "success");
    } catch (error) {
      openNotificationWithIcon(error?.response?.data?.message, "error");
    }
    setDeleteId(false);
    setIsDeleteModal(false);
  };

  const columns = [
    {
      id: "image",
      label: "Image",
      align: "center",
      minWidth: 100,
      format: (value) => {
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box>
              <Avatar
                src={`${imageBasePath}/${value}`}
                alt={"image"}
                className="border-radius-4"
                style={{ cursor: "pointer", width: "58px" }}
              />
            </Box>
          </Box>
        );
      },
    },
    {
      id: "sku",
      label: "SKU",
      align: "left",
      minWidth: 125,
    },
    {
      id: "name",
      label: "NAME",
      minWidth: 125,
    },
    {
      id: "comboPrice",
      label: "COMBO PRICE",
      minWidth: 125,
    },
    {
      id: "products",
      label: "Products",
      align: "center",
      minWidth: 100,
      format: (value) => {
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box>
              <Avatar
                src={`${imageBasePath}/${value[0]?.galleryImage[0]}`}
                alt={value[0]?.name}
                className="border-radius-4"
                style={{ cursor: "pointer", width: "58px" }}
                onClick={() => showProductsDetails(value)}
              />
            </Box>
            <Box>
              <p style={{ margin: "0px" }}>{` X ${value?.length}`}</p>
            </Box>
          </Box>
        );
      },
    },

    {
      id: "isOwnDisabled",
      label: "Publish",
      align: "center",
      format: (value) => {
        return (
          <FormControlLabel
            control={
              <IOSSwitch
                sx={{ m: 1 }}
                checked={!value?.status}
                onClick={() =>
                  statusUpdateHandler({
                    isOwnDisabled: value?.status,
                    id: value?.id,
                  })
                }
              />
            }
            label=""
          />
        );
      },
    },
    {
      id: "isFeatured",
      label: "Featured",
      align: "center",
      format: (value) => {
        return (
          <FormControlLabel
            control={
              <IOSSwitch
                sx={{ m: 1 }}
                checked={value?.status}
                onClick={() =>
                  isFeaturedUpdateHandler({
                    isFeatured: value?.status,
                    id: value?.id,
                  })
                }
              />
            }
            label=""
          />
        );
      },
    },
    {
      id: "isPos",
      label: "Top Pos",
      align: "center",
      format: (value) => {
        return (
          <FormControlLabel
            control={
              <IOSSwitch
                sx={{ m: 1 }}
                checked={value?.status}
                onClick={() =>
                  posUpdateHandler({
                    isPosSuggest: value?.status,
                    id: value?.id,
                  })
                }
              />
            }
            label=""
          />
        );
      },
    },
    {
      id: "isReseller",
      label: "Reseller",
      align: "center",
      format: (value) => {
        return (
          <FormControlLabel
            control={
              <IOSSwitch
                sx={{ m: 1 }}
                checked={value?.status}
                onClick={() =>
                  isResellerUpdateHandler({
                    isReseller: value?.status,
                    id: value?.id,
                  })
                }
              />
            }
            label=""
          />
        );
      },
    },

    {
      id: "action",
      label: "Action",
      align: "center",
      minWidth: 140,
      format: (value) => {
        return (
          <div>
            <IconButton
              onClick={() => {
                history.push(`/update-comboProduct/${value?.slug}`);
              }}
              style={{
                backgroundColor: "#ebedec",
                color: "black",
                fontWeight: "bold",
                marginRight: "8px",
              }}
            >
              <FaRegEdit style={{ fontSize: "16px" }} />
            </IconButton>
            <IconButton
              onClick={() => {
                setIsDeleteModal(true);
                setDeleteId(value._id);
              }}
              style={{
                backgroundColor: "#ebedec",
                color: "black",
                fontWeight: "bold",
                marginRight: "8px",
              }}
            >
              <RiDeleteBin3Line style={{ fontSize: "16px",color:'red' }} />
            </IconButton>
          </div>
        );
      },
    },
  ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    localStorage.setItem("rowPerPage", +event.target.value);
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  const showProductsDetails = (data) => {
    setProductsData(data);
    setIsOpenModal(true);
  };

  return (
    <div className="m-sm-30">
      <Card className="border-radius-0 ">
        <CardHeader title="Combo Product List" />
        <div className="w-full overflow-hidden px-2 mt-4">
          {totalChecked > 0 ? (
            <Box
              sx={{
                borderBottom: "1px solid #F6F6F6",
                backgroundColor: "#FCF4F2",
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                alignItems: "center",
                py: 1,
                px: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              ></Box>
            </Box>
          ) : (
            <Box
              sx={{
                borderBottom: "1px solid #F6F6F6",
                backgroundColor: "white",
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                alignItems: "center",
                py: 1,
              }}
            >
              {/* <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  // flexWrap: "wrap",
                }}
              >
                <TextField
                  label="Filter by User"
                  size="small"
                  variant="outlined"
                  fullWidth
                  select
                  className="min-w-188 mr-4"
                  onChange={(e) => {
                    setPage(0);
                    setSearchValue("");
                    setUserType(e.target.value);
                  }}
                  value={userType}
                >
                  <MenuItem value="ALL">ALL</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="customer">Customer</MenuItem>
                  <MenuItem value="visitor">Visitor</MenuItem>
                </TextField>
                <TextField
                  label="Filter by Status"
                  size="small"
                  variant="outlined"
                  fullWidth
                  select
                  className="min-w-188 mr-4"
                  onChange={(e) => {
                    setPage(0);
                    setSearchValue("");
                    setStatusName(e.target.value);
                  }}
                  value={statusName}
                >
                  <MenuItem value="ALL">ALL</MenuItem>
                  <MenuItem value="PENDING"> Processing </MenuItem>
                  <MenuItem value="CONFIRM"> Ready to ship </MenuItem>
                  <MenuItem value="SHIPPED"> Shipping </MenuItem>
                  <MenuItem value="DELIVERED"> Delivered</MenuItem>
                  <MenuItem value="CANCELED"> Cancelled </MenuItem>
                  <MenuItem value="RETURNED"> Returned </MenuItem>
                </TextField>
              </Box>
              <Box>
                <TextField
                  label=""
                  placeholder="Search here.."
                  size="small"
                  variant="outlined"
                  fullWidth
                  className="min-w-240"
                  onChange={(e) => {
                    setPage(0);
                    setStatusName("ALL");
                    setUserType("ALL");
                    setCourierValue("ALL");
                    setEmployeeName("ALL");
                    setSearchValue(e.target.value);
                  }}
                  value={searchValue}
                />
              </Box> */}
            </Box>
          )}
        </div>
        <Divider />
      </Card>
      <Card className="border-radius-0">
        {!isLoading ? (
          <div className="w-full overflow-hidden px-2">
            {rows.length > 0 && errorMsg === "" ? (
              <>
                <div
                  style={{
                    maxHeight: 800,
                    overflow: "auto",
                  }}
                >
                  <Table stickyHeader className="whitespace-pre">
                    <TableHead>
                      <TableRow>
                        {columns.map((column, idx) => (
                          <TableCell
                            key={idx}
                            align={column.align}
                            style={{ minWidth: column.minWidth }}
                          >
                            {column.label}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row, idx1) => {
                        return (
                          <TableRow
                            hover
                            role="checkbox"
                            tabIndex={-1}
                            key={idx1}
                          >
                            {columns.map((column, idx2) => {
                              const value = row[column.id];
                              return (
                                <TableCell key={idx2} align={column.align}>
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
                  rowsPerPageOptions={[10, 25, 100, 250, 500]}
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

      <SimpleModal
        isShow={isOpenModal}
        closeModalHandler={closeModalHandler}
        width={400}
      >
        {productsData.length > 0 && (
          <ProductDetails
            productsData={productsData}
            closeModalHandler={closeModalHandler}
          />
        )}
      </SimpleModal>

      <SimpleModal isShow={isDeleteModal} closeModalHandler={closeModalHandler}>
       
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
              <Button variant="outlined" onClick={() => setIsDeleteModal(false)}>
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
