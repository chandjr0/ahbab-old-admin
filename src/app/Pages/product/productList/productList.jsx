import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardHeader,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@material-ui/core";
import axios from "../../../../axios";
import imageBasePath from "../../../../config";
import { useHistory, useLocation } from "react-router-dom";
import IOSSwitch from "../../../Shared/Forms/iosSwitch";
import { FaExclamationTriangle, FaRegEdit, FaEye } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import SimpleModal from "../../../Shared/SimpleModal/SimpleModal";
import Spinner from "../../../Shared/Spinner/Spinner";
import { notification } from "antd";
import { IoMdAddCircle } from "react-icons/io";
import { BsFiletypeXls } from "react-icons/bs";
import { createMuiTheme } from "@material-ui/core/styles";
import { gotoProductPage } from "../../../util/product";
import moment from "moment";

const theme = createMuiTheme({
  overrides: {
    MuiTableCell: {
      root: {
        padding: "10px 8px",
      },
    },
  },
});

const sortOptions = [
  {
    label: "New to Old",
    value: "NEW_TO_OLD",
  },
  {
    label: "Old to New",
    value: "OLD_TO_NEW",
  },
  {
    label: "LH Sell",
    value: "LH_SELL",
  },
  {
    label: "HL Sell",
    value: "HL_SELL",
  },
];

const prodTypeOptions = [
  {
    label: "ALL",
    value: "ALL",
  },
  {
    label: "Featured",
    value: "FEATURED",
  },
  {
    label: "Non Feature",
    value: "NON_FEATURED",
  },
  {
    label: "Top Pos",
    value: "TOP_POS",
  },
  {
    label: "Publish",
    value: "PUBLISH",
  },
  {
    label: "Unpublish",
    value: "UNPUBLISH",
  },
  {
    label: "Flash",
    value: "FLASH",
  },
];

export default function ProductListPage() {
  const history = useHistory();

  const rowperPage = localStorage.getItem("rowPerPage");

  const [page, setPage] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(
    rowperPage ? Number(rowperPage) : 10
  );
  const [totalData, setTotalData] = useState(0);
  const [rows, setRows] = useState([]);
  const [dataList, setDataList] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [openImgData, setOpenImgData] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [allChecked, setAllChecked] = useState(false);
  const [totalChecked, setTotalChecked] = useState(0);
  const [bulkselect, setBulkSelect] = useState("");
  const [bulkActionData, setBulkActionData] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [sectionList, setSectionList] = useState([]);
  const [sectionId, setSectionId] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [sortValue, setSortValue] = useState("NEW_TO_OLD");
  const [prodTypeValue, setProdTypeValue] = useState("PUBLISH");

  function useQuery() {
    const { search } = useLocation();
    return useMemo(() => new URLSearchParams(search), [search]);
  }
  let query = useQuery();

  useEffect(() => {
    if (
      page !== null &&
      sortValue !== "" &&
      prodTypeValue !== "" &&
      categorySlug !== ""
    ) {
      history.push(
        `/product-list?srt=${sortValue}&typ=${prodTypeValue}&cat=${categorySlug}&pg=${
          page + 1
        }&lt=${rowsPerPage}`
      );
    }
  }, [history, rowsPerPage, page, sortValue, prodTypeValue, categorySlug]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  const handleChangeRowsPerPage = (event) => {
    localStorage.setItem("rowPerPage", +event.target.value);
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  useEffect(() => {
    let fetchData = async () => {
      try {
        let res = null;
        setIsLoading(true);
        if (searchValue !== "") {
          res = await axios.post(
            `product/admin/search?page=${page + 1}&limit=${rowsPerPage}`,
            { value: searchValue }
          );
        } else {
          let obj = {
            categorySlug: categorySlug === "ALL" ? "" : categorySlug,
            prodType: prodTypeValue == "ALL" ? "" : prodTypeValue,
            sort: sortValue,
          };
          res = await axios.post(
            `/product/admin/all-products?page=${page + 1}&limit=${rowsPerPage}`,
            obj
          );
        }

        if (res?.data?.data) {
          setTotalData(res?.data?.metaData?.totalData);
          setDataList(
            res?.data?.data.map((i) => ({ ...i, checkStatus: false }))
          );
        }
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        setErrorMsg(err?.response?.data?.message);
      }
    };

    fetchData();
  }, [page, rowsPerPage, categorySlug, searchValue, sortValue, prodTypeValue]);

  useEffect(() => {
    if (dataList.length > 0) {
      let dataArray = [];
      let i = 0;
      for (let data of dataList) {
        if (data?.checkStatus) {
          i++;
        }
        dataArray.push({ ...data, viewVariation: false });
      }
      if (i === dataList.length) {
        setTotalChecked(i);
        setAllChecked(true);
      } else {
        setTotalChecked(i);
        setAllChecked(false);
      }
      setRows(dataArray);
    } else {
      setRows([]);
    }
  }, [dataList]);

  useEffect(() => {
    let fetchData = async () => {
      try {
        const [categoryData, sectionData] = await Promise.all([
          axios.get("/category/fetch-all"),
        ]);

        let categoryList = [];
        for (let category of categoryData?.data?.data) {
          categoryList.push({
            _id: category?._id,
            name: category?.name,
            slug: category?.slug,
          });
          for (let subCategory of category?.children) {
            categoryList.push({
              _id: subCategory?._id,
              name: "➤ " + subCategory?.name,
              slug: subCategory?.slug,
            });
          }
        }
        setCategoryOptions(categoryList);
        setSectionList(sectionData?.data?.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, []);

  const singleCheckHandler = (data) => {
    setDataList(
      dataList.map((i) => {
        return i?._id === data?._id
          ? {
              ...i,
              checkStatus: !data?.checkStatus,
            }
          : i;
      })
    );
  };

  const allCheckedHandler = (checkStatus) => {
    setAllChecked(checkStatus);
    setDataList(
      dataList.map((i) => {
        return {
          ...i,
          checkStatus: checkStatus,
        };
      })
    );
  };

  const deleteHandler = async () => {
    try {
      let res = await axios.delete(`/product/admin/delete/${deleteId}`);
      setDataList(dataList.filter((i) => i?._id !== deleteId));
      openNotificationWithIcon(res?.data?.message, "success");
    } catch (error) {
      openNotificationWithIcon(error?.response?.data?.message, "error");
    }
    setDeleteId(false);
    setIsOpenModal(false);
  };

  const closeModalHandler = () => {
    setDataList(dataList.map((i) => ({ ...i, checkStatus: false })));
    setIsOpenModal(false);
    setDeleteId(false);
    setOpenImgData(null);

    setBulkActionData(null);
    setBulkSelect("");
    setSectionId("");
  };

  const openImgHandler = (data) => {
    setIsOpenModal(true);
    setOpenImgData(data);
  };

  const statusUpdateHandler = async (data) => {
    try {
      const createRes = await axios.patch(`/product/admin/disable-or-approve`, {
        products: [data?._id],
        isOwnDisabled: !data?.isOwnDisabled,
      });

      if (createRes?.data?.success) {
        setDataList(
          dataList.map((i) => {
            return i?._id === data?._id
              ? {
                  ...i,
                  isOwnDisabled: !i.isOwnDisabled,
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

  const variationStatusHandler = async (data) => {
    try {
      const createRes = await axios.patch(
        `/product/admin/disable-enable/variation`,
        {
          variantId: data?._id,
          isDisabled: !data?.isDisabled,
        }
      );

      if (createRes?.data?.success) {
        setDataList(
          dataList.map((i) => {
            return i?._id === data?.productId
              ? {
                  ...i,
                  variations: i?.variations.map((variant) =>
                    variant?._id === data?._id
                      ? {
                          ...variant,
                          isDisabled: !data?.isDisabled,
                        }
                      : variant
                  ),
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

  const reSellerUpdate = async (data) => {
    try {
      const createRes = await axios.patch(`/product/admin/reseller`, {
        products: [data?._id],
        isReseller: !data?.isReseller,
      });

      if (createRes?.data?.success) {
        setDataList(
          dataList.map((i) => {
            return i?._id === data?._id
              ? {
                  ...i,
                  isReseller: !i.isReseller,
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

  const topPosUpdateHandler = async (data) => {
    try {
      const createRes = await axios.patch(`/product/admin/update-top-pos`, {
        products: [data?._id],
        isPosSuggest: !data?.isPosSuggest,
      });

      if (createRes?.data?.success) {
        setDataList(
          dataList.map((i) => {
            return i?._id === data?._id
              ? {
                  ...i,
                  isPosSuggest: !i.isPosSuggest,
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

  const selectBulkHandler = (value) => {
    setBulkSelect(value);
    setBulkActionData(dataList.filter((data) => data?.checkStatus));
    setIsOpenModal(true);
  };

  const bulkActionHandler = async () => {
    try {
      setBulkLoading(true);
      let products = bulkActionData.map((i) => i?._id);

      let createRes = null;
      let obj = {};
      if (bulkselect === "feature") {
        createRes = await axios.patch(`/product/admin/feature`, {
          products: products,
          isFeatured: true,
        });
        obj = {
          isFeatured: true,
        };
      } else if (bulkselect === "nonFeature") {
        createRes = await axios.patch(`/product/admin/feature`, {
          products: products,
          isFeatured: false,
        });
        obj = {
          isFeatured: false,
        };
      } else if (bulkselect === "publish") {
        createRes = await axios.patch(`/product/admin/disable-or-approve`, {
          products: products,
          isOwnDisabled: false,
        });
        obj = {
          isOwnDisabled: false,
        };
      } else if (bulkselect === "unpublish") {
        createRes = await axios.patch(`/product/admin/disable-or-approve`, {
          products: products,
          isOwnDisabled: true,
        });
        obj = {
          isOwnDisabled: true,
        };
      } else if (bulkselect === "topPos") {
        createRes = await axios.patch(`/product/admin/update-top-pos`, {
          products: products,
          isPosSuggest: true,
        });
        obj = {
          isPosSuggest: true,
        };
      } else if (bulkselect === "notTopPos") {
        createRes = await axios.patch(`/product/admin/update-top-pos`, {
          products: products,
          isPosSuggest: false,
        });
        obj = {
          isPosSuggest: false,
        };
      }

      if (createRes?.data?.success) {
        setDataList(
          dataList.map((i) => {
            return products.includes(i?._id)
              ? {
                  ...i,
                  checkStatus: false,
                  ...obj,
                }
              : { ...i, checkStatus: false };
          })
        );
        openNotificationWithIcon(createRes?.data?.message, "success");
      }
      closeModalHandler();
      setBulkLoading(false);
    } catch (error) {
      console.log("error");
      openNotificationWithIcon(error?.response?.data?.message, "error");
      setBulkLoading(false);
    }
  };

  const sectionActionHandler = async () => {
    try {
      setBulkLoading(true);
      let products = bulkActionData.map((i) => i?._id);

      let createRes = await axios.patch(
        `/section/admin/add-multiple-products`,
        {
          sectionId: sectionId,
          products: products,
        }
      );

      if (createRes?.data?.success) {
        setDataList(dataList.map((i) => ({ ...i, checkStatus: false })));
        openNotificationWithIcon(createRes?.data?.message, "success");
      }
      closeModalHandler();
      setBulkLoading(false);
    } catch (error) {
      console.log("error");
      openNotificationWithIcon(error?.response?.data?.message, "error");
      setBulkLoading(false);
    }
  };

  const viewVariation = async (item, idx) => {
    setRows((prevDataList) => {
      const newDataList = [...prevDataList];

      newDataList[item] = {
        ...newDataList[item],
        viewVariation: !newDataList[item].viewVariation,
      };

      return newDataList;
    });
  };

  const downloadCsv = () => {
    const csvHeaders = [
      "SKU",
      "Title",
      "Variant",
      "Stock",
      "Purchase Qty",
      "Total Purchase",
      "Unit Purchase",
      "Sell Qty",
      "Total Sell",
      "Unit Sell",
      "Unit Profit",
      "Total Profit",
    ];

    const csvRows = [];

    rows
      .filter((item) => item.checkStatus === true)
      .forEach((item) => {
        if (item?.isVariant && Array.isArray(item?.variations)) {
          item.variations.forEach((variant, index) => {
            const unitPurchase =
              Number(variant.purchaseQty) <= 0
                ? 0
                : Number(variant.totalPurchasePrice) /
                  Number(variant.purchaseQty);
            const unitSell =
              Number(variant.sellQty) <= 0
                ? 0
                : Number(variant.totalSellPrice) / Number(variant.sellQty);
            const unitProfit =
              Number(variant.sellQty) <= 0 ? 0 : unitSell - unitPurchase;
            const totalProfit =
              Number(variant?.totalSellPrice) -
              unitPurchase * (Number(variant.sellQty) || 0);

            csvRows.push([
              index == 0 ? `"${item?.sku}"` : "",
              index == 0 ? `"${item?.name}"` : "",
              `"${
                variant?.attributeOpts.map((i) => i?.name)?.join("-") || ""
              }"`,
              `"${variant?.stock || 0}"`,
              `"${variant?.purchaseQty || 0}"`,
              `"${variant?.totalPurchasePrice || 0}"`,
              `"${unitPurchase?.toFixed(2) || 0}"`,
              `"${variant?.sellQty || 0}"`,
              `"${variant?.totalSellPrice || 0}"`,
              `"${unitSell.toFixed(2) || 0}"`,
              `"${unitProfit.toFixed(2) || 0}"`,
              `"${totalProfit.toFixed(2) || 0}"`,
            ]);
          });
        } else if (Array.isArray(item?.nonVariation)) {
          item.nonVariation.forEach((nonVariant, index) => {
            const unitPurchase =
              Number(item.nonVariation.purchaseQty) <= 0
                ? 0
                : Number(item.nonVariation.totalPurchasePrice) /
                  Number(item.nonVariation.purchaseQty);
            const unitSell =
              Number(item.nonVariation.sellQty) <= 0
                ? 0
                : Number(item.nonVariation.totalSellPrice) /
                  Number(item.nonVariation.sellQty);
            const unitProfit =
              Number(item.nonVariation.sellQty) <= 0
                ? 0
                : unitSell - unitPurchase;
            const totalProfit =
              Number(item.nonVariation?.totalSellPrice) -
              unitPurchase * (Number(item.nonVariation.sellQty) || 0);

            csvRows.push([
              index == 0 ? `"${item?.sku}"` : "",
              index == 0 ? `"${item?.name}"` : "",
              `"${nonVariant?.variant || ""}"`,
              `"${nonVariant?.stock || 0}"`,
              `"${nonVariant?.purchaseQty || 0}"`,
              `"${nonVariant?.totalPurchasePrice || 0}"`,
              `"${unitPurchase?.toFixed(2) || 0}"`,
              `"${nonVariant?.sellQty || 0}"`,
              `"${nonVariant?.totalSellPrice || 0}"`,
              `"${unitSell.toFixed(2) || 0}"`,
              `"${unitProfit.toFixed(2) || 0}"`,
              `"${totalProfit.toFixed(2) || 0}"`,
            ]);
          });
        }
      });

    const bom = "\uFEFF";
    const csvArray = [csvHeaders, ...csvRows];
    const csvContent = bom + csvArray.map((row) => row.join(",")).join("\n");

    const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csvContent}`);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${moment().format("L").replace(/\//g, "-")}-Product-list.csv`
    );
    document.body.appendChild(link);
    link.click();
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
          startIcon={<IoMdAddCircle />}
          onClick={() => history.push("/create-product")}
        >
          Add Products
        </Button>
      </Box>
      <Card className="border-radius-0 mx-8">
        <CardHeader title="Product List" />
        <div className="w-full overflow-hidden mt-4">
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
              >
                <Box
                  sx={{
                    backgroundColor: "white",
                    mx: 1,
                  }}
                >
                  <TextField
                    label="Bulk Action"
                    size="small"
                    variant="outlined"
                    fullWidth
                    select
                    className="min-w-188"
                    onChange={(e) => selectBulkHandler(e.target.value)}
                    value={bulkselect}
                  >
                    <MenuItem value="" disabled>
                      --select--
                    </MenuItem>
                    <MenuItem value="feature">Feature</MenuItem>
                    <MenuItem value="nonFeature">Non-Feature</MenuItem>
                    <MenuItem value="publish">Publish</MenuItem>
                    <MenuItem value="unpublish">Unpublish</MenuItem>
                    <MenuItem value="topPos">Top Pos</MenuItem>
                    <MenuItem value="notTopPos">Non-Top Pos</MenuItem>
                  </TextField>
                </Box>
                <Typography
                  paragraph
                  className="ml-4 mt-2 mb-2 min-w-188"
                  style={{ color: "green", fontWeight: "bold" }}
                >{`${totalChecked} product select from this page`}</Typography>
              </Box>
              <Button
                color="primary"
                className="text-white"
                variant="contained"
                startIcon={<BsFiletypeXls />}
                onClick={downloadCsv}
              >
                Excel
              </Button>
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
                px: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <TextField
                  label="Filter by Category"
                  size="small"
                  variant="outlined"
                  fullWidth
                  select
                  className="min-w-188"
                  onChange={(e) => {
                    setPage(0);
                    setSearchValue("");
                    setCategorySlug(e.target.value);
                  }}
                  value={categorySlug}
                >
                  <MenuItem value="all">ALL</MenuItem>
                  {categoryOptions.map((cat) => (
                    <MenuItem key={cat._id} value={cat?.slug}>
                      {cat?.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Type"
                  size="small"
                  variant="outlined"
                  fullWidth
                  select
                  className="ml-2 min-w-188"
                  onChange={(e) => {
                    setPage(0);
                    setSearchValue("");
                    setProdTypeValue(e.target.value);
                  }}
                  value={prodTypeValue}
                >
                  {prodTypeOptions.map((item) => (
                    <MenuItem key={item?.value} value={item?.value}>
                      {item?.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Sort By"
                  size="small"
                  variant="outlined"
                  fullWidth
                  select
                  className="ml-2 min-w-188"
                  onChange={(e) => {
                    setPage(0);
                    setSearchValue("");
                    setSortValue(e.target.value);
                  }}
                  value={sortValue}
                >
                  {sortOptions.map((item) => (
                    <MenuItem key={item?.value} value={item?.value}>
                      {item?.label}
                    </MenuItem>
                  ))}
                </TextField>
                <Typography
                  paragraph
                  className="ml-4 min-w-188"
                  style={{ color: "green", fontWeight: "bold" }}
                >{`Total Products: ${totalData || 0}`}</Typography>
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
                    setCategorySlug("ALL");
                    setSortValue("NEW_TO_OLD");
                    setProdTypeValue("");
                    setSearchValue(e.target.value);
                  }}
                  value={searchValue}
                />
              </Box>
            </Box>
          )}
        </div>
        <Divider />
      </Card>
      <Card className="border-radius-0 mx-8">
        {!isLoading ? (
          <div className="w-full overflow-hidden px-2">
            {rows.length > 0 && errorMsg === "" ? (
              <>
                <div
                  style={{
                    // maxHeight: 800,
                    overflow: "auto",
                  }}
                >
                  {/* <ThemeProvider> */}
                  <Table stickyHeader className="whitespace-pre">
                    <TableHead>
                      <TableRow>
                        <TableCell className="min-w-50">
                          <Checkbox
                            checked={allChecked}
                            onChange={(e) =>
                              allCheckedHandler(e.target.checked)
                            }
                          />
                        </TableCell>
                        <TableCell className="min-w-100" align="center">
                          SKU
                        </TableCell>
                        <TableCell className="min-w-100" align="center">
                          Image
                        </TableCell>
                        <TableCell className="min-w-100" align="center">
                          Title
                        </TableCell>
                        <TableCell className="min-w-150" align="center">
                          Category
                        </TableCell>
                        <TableCell className="min-w-100" align="center">
                          Total Sale
                        </TableCell>
                        <TableCell className="min-w-150" align="center">
                          Variations
                        </TableCell>
                        {/* <TableCell className="min-w-100" align="center">
                          Purchase
                        </TableCell>
                        <TableCell className="min-w-100" align="center">
                          Sale
                        </TableCell> */}
                        <TableCell className="min-w-100" align="center">
                          Stock
                        </TableCell>
                        {/* <TableCell className="min-w-100" align="center">
                          Reseller <br /> Commission
                        </TableCell>
                        <TableCell className="min-w-100" align="center">
                          Reseller
                        </TableCell> */}
                        <TableCell className="min-w-100" align="center">
                          Publish
                        </TableCell>
                        <TableCell className="min-w-100" align="center">
                          Top Pos
                        </TableCell>
                        <TableCell className="min-w-120" align="center">
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.length > 0 &&
                        rows.map((data, mainIdx) => (
                          <React.Fragment key={data?._id}>
                            {data?.isVariant ? (
                              <>
                                {data?.variations.length > 0 &&
                                  data?.variations.map((variant, idx) => (
                                    <TableRow
                                      key={idx}
                                      style={{
                                        background:
                                          mainIdx % 2 == 0
                                            ? "white"
                                            : "#FAFAFA",
                                      }}
                                    >
                                      {idx === 0 && (
                                        <>
                                          <TableCell
                                            className="capitalize"
                                            align="center"
                                            rowSpan={data?.variations.length}
                                          >
                                            <Checkbox
                                              onClick={() =>
                                                singleCheckHandler({
                                                  checkStatus:
                                                    data?.checkStatus,
                                                  _id: data?._id,
                                                })
                                              }
                                              checked={data?.checkStatus}
                                            />
                                          </TableCell>
                                          <TableCell
                                            className="capitalize"
                                            align="center"
                                            rowSpan={data?.variations.length}
                                          >
                                            {data?.sku}
                                          </TableCell>
                                          <TableCell
                                            className="capitalize"
                                            align="center"
                                            rowSpan={data?.variations.length}
                                          >
                                            <Avatar
                                              className="border-radius-4"
                                              style={{
                                                cursor: "pointer",
                                                width: "58px",
                                              }}
                                              src={
                                                imageBasePath +
                                                "/" +
                                                data?.galleryImage[0]
                                              }
                                              alt={data?.name}
                                              onClick={() =>
                                                openImgHandler(data)
                                              }
                                            />
                                          </TableCell>
                                          <TableCell
                                            className="capitalize cursor-pointer"
                                            align="left"
                                            rowSpan={data?.variations.length}
                                            onClick={() =>
                                              gotoProductPage(data?.slug)
                                            }
                                          >
                                            {data?.name}
                                          </TableCell>
                                          <TableCell
                                            className="capitalize"
                                            align="center"
                                            rowSpan={data?.variations.length}
                                          >
                                            {data?.categories.length > 0 &&
                                              data?.categories.map(
                                                (v, idx2) => (
                                                  <Box
                                                    key={idx2}
                                                    sx={{
                                                      display: "flex",
                                                      flexWrap: "wrap",
                                                    }}
                                                  >
                                                    <Box>
                                                      <small className="rounded bg-primary elevation-z3 text-white px-2 py-2px m-1">
                                                        {v?.name}
                                                      </small>
                                                    </Box>
                                                  </Box>
                                                )
                                              )}
                                          </TableCell>
                                          <TableCell
                                            className="capitalize"
                                            align="center"
                                            rowSpan={data?.variations.length}
                                          >
                                            {data?.totalSell || 0}
                                          </TableCell>
                                        </>
                                      )}
                                      {data?.viewVariation ? (
                                        <>
                                          <TableCell
                                            className="capitalize"
                                            align="center"
                                            onClick={() =>
                                              viewVariation(mainIdx, idx)
                                            }
                                          >
                                            <div className="flex items-center ">
                                              <Switch
                                                checked={!variant?.isDisabled}
                                                onChange={() =>
                                                  variationStatusHandler({
                                                    ...variant,
                                                    productId: data?._id,
                                                  })
                                                }
                                                value="checkedA"
                                                inputProps={{
                                                  "aria-label":
                                                    "secondary checkbox",
                                                }}
                                              />
                                              <p className="m-0 p-0">
                                                {variant?.attributeOpts
                                                  .map((i) => i?.name)
                                                  ?.join("-")}
                                              </p>
                                            </div>
                                          </TableCell>

                                          <TableCell
                                            className="capitalize"
                                            align="center"
                                          >
                                            {variant?.stock > 0 ? (
                                              variant?.stock
                                            ) : (
                                              <small className="rounded bg-error text-white px-2 py-2">
                                                Critical Stock{" "}
                                                <span
                                                  style={{
                                                    fontSize: "12px",
                                                    marginTop: "5px",
                                                  }}
                                                >
                                                  {variant?.stock}
                                                </span>
                                              </small>
                                            )}
                                          </TableCell>
                                        </>
                                      ) : null}

                                      {idx === 0 && (
                                        <>
                                          {!data?.viewVariation ? (
                                            <>
                                              <TableCell
                                                className="capitalize"
                                                align="center"
                                              >
                                                <IconButton
                                                  onClick={() =>
                                                    viewVariation(mainIdx, idx)
                                                  }
                                                  style={{
                                                    backgroundColor: "#ebedec",
                                                    color: "#1976d2",
                                                    marginRight: "8px",
                                                  }}
                                                >
                                                  <FaEye
                                                    style={{
                                                      fontSize: "16px",
                                                    }}
                                                  />
                                                </IconButton>
                                              </TableCell>

                                              <TableCell
                                                className="capitalize"
                                                align="center"
                                              >
                                                {data?.variations?.reduce(
                                                  (acc, item) =>
                                                    acc + item.stock,
                                                  0
                                                ) > 0 &&
                                                data?.variations?.reduce(
                                                  (acc, item) =>
                                                    acc + item.stock,
                                                  0
                                                ) >= data?.stockAlert ? (
                                                  data?.variations?.reduce(
                                                    (acc, item) =>
                                                      acc + item.stock,
                                                    0
                                                  )
                                                ) : (
                                                  <small className="rounded bg-error text-white px-2 py-2">
                                                    Cri. Stock{" "}
                                                    {data?.variations?.reduce(
                                                      (acc, item) =>
                                                        acc + item.stock,
                                                      0
                                                    )}
                                                  </small>
                                                )}
                                              </TableCell>
                                            </>
                                          ) : null}

                                          <TableCell
                                            className="capitalize"
                                            align="center"
                                            rowSpan={data?.variations.length}
                                          >
                                            {data?.resellerDetails
                                              ?.isCommissionOn ? (
                                              <small className="rounded bg-green text-white px-2 py-2">
                                                YES/
                                                {
                                                  data?.resellerDetails
                                                    ?.commission
                                                }
                                                %
                                              </small>
                                            ) : (
                                              <small className="rounded bg-warning  text-white px-2 py-2">
                                                NO
                                              </small>
                                            )}
                                          </TableCell>
                                          <TableCell
                                            className="capitalize"
                                            align="center"
                                            rowSpan={data?.variations.length}
                                          >
                                            <FormControlLabel
                                              control={
                                                <IOSSwitch
                                                  sx={{ m: 1 }}
                                                  checked={data?.isReseller}
                                                  onClick={() =>
                                                    reSellerUpdate({
                                                      isReseller:
                                                        data?.isReseller,
                                                      _id: data?._id,
                                                    })
                                                  }
                                                />
                                              }
                                              label=""
                                            />
                                          </TableCell>
                                          <TableCell
                                            className="capitalize"
                                            align="center"
                                            rowSpan={data?.variations.length}
                                          >
                                            <FormControlLabel
                                              control={
                                                <IOSSwitch
                                                  sx={{ m: 1 }}
                                                  checked={!data?.isOwnDisabled}
                                                  onClick={() =>
                                                    statusUpdateHandler({
                                                      isOwnDisabled:
                                                        data?.isOwnDisabled,
                                                      _id: data?._id,
                                                    })
                                                  }
                                                />
                                              }
                                              label=""
                                            />
                                          </TableCell>
                                          <TableCell
                                            className="capitalize"
                                            align="center"
                                            rowSpan={data?.variations.length}
                                          >
                                            <FormControlLabel
                                              control={
                                                <IOSSwitch
                                                  sx={{ m: 1 }}
                                                  checked={data?.isPosSuggest}
                                                  onClick={() =>
                                                    topPosUpdateHandler({
                                                      isPosSuggest:
                                                        data?.isPosSuggest,
                                                      _id: data?._id,
                                                    })
                                                  }
                                                />
                                              }
                                              label=""
                                            />
                                          </TableCell>
                                          <TableCell
                                            className="capitalize"
                                            align="center"
                                            rowSpan={data?.variations.length}
                                          >
                                            <a
                                              href={`/update-product/${data?.slug}`}
                                            >
                                              <IconButton
                                                // onClick={() => {
                                                //   history.push(
                                                //     `/update-product/${data?.slug}`
                                                //   );
                                                // }}
                                                style={{
                                                  backgroundColor: "#ebedec",
                                                  color: "#1976d2",
                                                  marginRight: "8px",
                                                }}
                                              >
                                                <FaRegEdit
                                                  style={{ fontSize: "16px" }}
                                                />
                                              </IconButton>
                                            </a>
                                            <IconButton
                                              onClick={() => {
                                                setIsOpenModal(true);
                                                setDeleteId(data?._id);
                                              }}
                                              style={{
                                                backgroundColor: "#ebedec",
                                                color: "red",
                                              }}
                                            >
                                              <RiDeleteBin5Line
                                                style={{ fontSize: "16px" }}
                                              />
                                            </IconButton>
                                          </TableCell>
                                        </>
                                      )}
                                    </TableRow>
                                  ))}
                              </>
                            ) : (
                              <>
                                <TableRow
                                  style={{
                                    background:
                                      mainIdx % 2 == 0 ? "white" : "#FAFAFA",
                                  }}
                                >
                                  <TableCell
                                    className="capitalize"
                                    align="center"
                                  >
                                    <Checkbox
                                      onClick={() => singleCheckHandler(data)}
                                      checked={
                                        data?.isAvoidProduct
                                          ? true
                                          : data?.checkStatus
                                      }
                                      disabled={data?.isAvoidProduct}
                                    />
                                  </TableCell>

                                  <TableCell
                                    className="capitalize"
                                    align="center"
                                  >
                                    {data?.sku}
                                  </TableCell>

                                  <TableCell
                                    className="capitalize"
                                    align="center"
                                  >
                                    <Avatar
                                      className="border-radius-4"
                                      style={{
                                        cursor: "pointer",
                                        width: "58px",
                                      }}
                                      src={
                                        imageBasePath +
                                        "/" +
                                        data?.galleryImage[0]
                                      }
                                      alt={data?.name}
                                      onClick={() => openImgHandler(data)}
                                    />
                                  </TableCell>
                                  <TableCell
                                    className="capitalize cursor-pointer"
                                    align="left"
                                    onClick={() => gotoProductPage(data?.slug)}
                                  >
                                    {data?.name}
                                  </TableCell>
                                  <TableCell
                                    className="capitalize"
                                    align="center"
                                  >
                                    {data?.categories.length > 0 &&
                                      data?.categories.map((v, idx) => (
                                        <Box
                                          key={idx}
                                          sx={{
                                            display: "flex",
                                            flexWrap: "wrap",
                                          }}
                                        >
                                          <Box>
                                            <small className="rounded bg-primary elevation-z3 text-white px-2 py-2px m-1">
                                              {v?.name}
                                            </small>
                                          </Box>
                                        </Box>
                                      ))}
                                  </TableCell>
                                  <TableCell
                                    className="capitalize"
                                    align="center"
                                  >
                                    {data?.totalSell || 0}
                                  </TableCell>

                                  <TableCell
                                    className="capitalize"
                                    align="center"
                                  >
                                    -
                                  </TableCell>
                                  <TableCell
                                    className="capitalize"
                                    align="center"
                                  >
                                    {data?.nonVariation?.stock > 0 &&
                                    data?.nonVariation?.stock >=
                                      data?.stockAlert ? (
                                      data?.nonVariation?.stock
                                    ) : (
                                      <small className="rounded bg-error text-white px-2 py-2">
                                        Cri. Stock {data?.nonVariation?.stock}
                                      </small>
                                    )}
                                  </TableCell>

                                  {/* <TableCell
                                    className="capitalize"
                                    align="center"
                                  >
                                    {data?.resellerDetails?.isCommissionOn ? (
                                      <small className="rounded bg-green text-white px-2 py-2">
                                        YES/
                                        {data?.resellerDetails?.commission}%
                                      </small>
                                    ) : (
                                      <small className="rounded bg-warning  text-white px-2 py-2">
                                        NO
                                      </small>
                                    )}
                                  </TableCell>
                                  <TableCell
                                    className="capitalize"
                                    align="center"
                                  >
                                    <FormControlLabel
                                      control={
                                        <IOSSwitch
                                          sx={{ m: 1 }}
                                          checked={data?.isReseller}
                                          onClick={() =>
                                            reSellerUpdate({
                                              isReseller: data?.isReseller,
                                              _id: data?._id,
                                            })
                                          }
                                        />
                                      }
                                      label=""
                                    />
                                  </TableCell> */}
                                  <TableCell
                                    className="capitalize"
                                    align="center"
                                  >
                                    <FormControlLabel
                                      control={
                                        <IOSSwitch
                                          sx={{ m: 1 }}
                                          checked={!data?.isOwnDisabled}
                                          onClick={() =>
                                            statusUpdateHandler({
                                              isOwnDisabled:
                                                data?.isOwnDisabled,
                                              _id: data?._id,
                                            })
                                          }
                                        />
                                      }
                                      label=""
                                    />
                                  </TableCell>
                                  <TableCell
                                    className="capitalize"
                                    align="center"
                                  >
                                    <FormControlLabel
                                      control={
                                        <IOSSwitch
                                          sx={{ m: 1 }}
                                          checked={data?.isPosSuggest}
                                          onClick={() =>
                                            topPosUpdateHandler({
                                              isPosSuggest: data?.isPosSuggest,
                                              _id: data?._id,
                                            })
                                          }
                                        />
                                      }
                                      label=""
                                    />
                                  </TableCell>
                                  <TableCell
                                    className="capitalize"
                                    align="center"
                                  >
                                    <a href={`/update-product/${data?.slug}`}>
                                      <IconButton
                                        style={{
                                          backgroundColor: "#ebedec",
                                          color: "#1976d2",
                                          marginRight: "8px",
                                        }}
                                      >
                                        <FaRegEdit
                                          style={{ fontSize: "16px" }}
                                        />
                                      </IconButton>
                                    </a>
                                    <IconButton
                                      onClick={() => {
                                        setIsOpenModal(true);
                                        setDeleteId(data?._id);
                                      }}
                                      style={{
                                        backgroundColor: "#ebedec",
                                        color: "red",
                                      }}
                                    >
                                      <RiDeleteBin5Line
                                        style={{ fontSize: "16px" }}
                                      />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              </>
                            )}
                          </React.Fragment>
                        ))}
                    </TableBody>
                  </Table>
                  {/* </ThemeProvider> */}
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
            src={imageBasePath + "/" + openImgData?.galleryImage[0]}
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

        {bulkselect && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {!bulkLoading ? (
              <>
                <Box>
                  <p>
                    <strong>{totalChecked} </strong>products are selected.
                  </p>
                  <p>
                    Are you sure{" "}
                    <strong>
                      {(bulkselect === "feature" && "feature") ||
                        (bulkselect === "nonFeature" && "remove feature") ||
                        (bulkselect === "publish" && "publish") ||
                        (bulkselect === "unpublish" && "unpublish") ||
                        (bulkselect === "topPos" && "top pos") ||
                        (bulkselect === "notTopPos" && "remove top pos")}
                    </strong>{" "}
                    selected products?
                  </p>
                </Box>
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}
                >
                  <Button
                    variant="outlined"
                    color="primary"
                    className="mr-4"
                    onClick={bulkActionHandler}
                  >
                    Yes
                  </Button>
                  <Button variant="outlined" onClick={closeModalHandler}>
                    No
                  </Button>
                </Box>
              </>
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
          </Box>
        )}

        {sectionId && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {!bulkLoading ? (
              <>
                <Box>
                  <p>
                    <strong>{totalChecked} </strong>products are selected.
                  </p>
                  <p>
                    Are you sure to add selected products{" "}
                    <strong>
                      {
                        sectionList.filter((data) => data?._id === sectionId)[0]
                          ?.name
                      }
                    </strong>{" "}
                    section?
                  </p>
                </Box>

                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}
                >
                  <Button
                    variant="outlined"
                    color="primary"
                    className="mr-4"
                    onClick={sectionActionHandler}
                  >
                    Yes
                  </Button>
                  <Button variant="outlined" onClick={closeModalHandler}>
                    No
                  </Button>
                </Box>
              </>
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
          </Box>
        )}
      </SimpleModal>
    </div>
  );
}
