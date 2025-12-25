import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  MenuItem,
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
import SimpleModal from "../../Shared/SimpleModal/SimpleModal";
import Spinner from "../../Shared/Spinner/Spinner";
import { gotoProductPage } from "../../util/product";

export default function ProductList({ addSelectedProducts, existProductIds }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalData, setTotalData] = useState(0);
  const [rows, setRows] = useState([]);
  const [dataList, setDataList] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [openImgData, setOpenImgData] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [categorySlug, setCategorySlug] = useState("default");
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [allChecked, setAllChecked] = useState(false);
  const [totalChecked, setTotalChecked] = useState(0);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
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
            categorySlug: categorySlug === "default" ? "" : categorySlug,
            prodType: "",
            sort: "NEW_TO_OLD",
          };
          res = await axios.post(
            `/product/admin/all-products?page=${page + 1}&limit=${rowsPerPage}`,
            obj
          );
        }

        if (res?.data?.data) {
          setTotalData(res?.data?.metaData?.totalData);
          setDataList(
            res?.data?.data.map((i) => {
              return {
                ...i,
                checkStatus: false,
              };
            })
          );
        }
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        setErrorMsg(err?.response?.data?.message);
      }
    };

    fetchData();
  }, [page, rowsPerPage, categorySlug, searchValue]);

  useEffect(() => {
    if (dataList.length > 0) {
      let dataArray = [];
      let i = 0;
      for (let data of dataList) {
        let isAvoidProduct = existProductIds.includes(data?._id);
        if (data?.checkStatus) {
          i++;
        }
        dataArray.push({
          ...data,
          isAvoidProduct: isAvoidProduct,
        });
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
  }, [dataList, existProductIds]);

  useEffect(() => {
    let fetchData = async () => {
      try {
        const categoryData = await axios.get("/category/fetch-all");

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
        let isAvoidProduct = existProductIds.includes(i?._id);

        return checkStatus && isAvoidProduct
          ? {
              ...i,
              checkStatus: false,
            }
          : {
              ...i,
              checkStatus: checkStatus,
            };
      })
    );
  };

  const closeModalHandler = () => {
    setIsOpenModal(false);
    setOpenImgData(null);
  };

  const openImgHandler = (data) => {
    setIsOpenModal(true);
    setOpenImgData(data);
  };

  const addToAllSelectedDataHandler = () => {
    let selectedData = dataList.filter((data) => data?.checkStatus);
    addSelectedProducts(selectedData);
    setDataList(
      dataList.map((i) => {
        return {
          ...i,
          checkStatus: false,
        };
      })
    );
  };

  return (
    <div className="elevation-z6">
      <Card className="border-radius-0">
        {/* <CardHeader title="Product List" /> */}
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
                    mx: 1,
                  }}
                >
                  <Button
                    variant="contained"
                    className="bg-green text-white"
                    onClick={addToAllSelectedDataHandler}
                  >
                    ADD TO
                  </Button>
                </Box>

                <Typography
                  paragraph
                  className="ml-4 mt-2 min-w-188"
                  style={{ color: "green", fontWeight: "bold" }}
                >{`${totalChecked} product select from this page`}</Typography>
              </Box>
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
                    setCategorySlug("default");
                    setSearchValue(e.target.value);
                  }}
                  value={searchValue}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Typography
                  paragraph
                  className="mr-4 min-w-188"
                  style={{ color: "green", fontWeight: "bold" }}
                >{`Total Products: ${totalData}`}</Typography>
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
                  <MenuItem value="default">Default</MenuItem>
                  {categoryOptions.map((cat) => (
                    <MenuItem key={cat._id} value={cat?.slug}>
                      {cat?.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
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
                <div className="w-full overflow-auto py-8">
                  <Table stickyHeader className="whitespace-pre">
                    <TableHead>
                      <TableRow>
                        <TableCell className="min-w-50" align="center">
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
                        <TableCell className="min-w-100" align="center">
                          Category
                        </TableCell>
                        <TableCell className="min-w-100" align="center">
                          Total Sale
                        </TableCell>
                        <TableCell className="min-w-100" align="center">
                          Variation Name
                        </TableCell>
                        <TableCell className="min-w-100" align="center">
                          Purchase
                        </TableCell>
                        <TableCell className="min-w-100" align="center">
                          Sale
                        </TableCell>
                        <TableCell className="min-w-100" align="center">
                          Stock
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.length > 0 &&
                        rows.map((data) => (
                          <React.Fragment key={data?._id}>
                            {data?.isVariant ? (
                              <>
                                {data?.variations.length > 0 &&
                                  data?.variations.map((variant, idx) => (
                                    <TableRow key={idx}>
                                      {idx === 0 && (
                                        <>
                                          <TableCell
                                            className="capitalize"
                                            align="center"
                                            rowSpan={data?.variations.length}
                                          >
                                            <Checkbox
                                              onClick={() =>
                                                singleCheckHandler(data)
                                              }
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
                                            className="capitalize"
                                            align="center"
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
                                      <TableCell
                                        className="capitalize"
                                        align="center"
                                      >
                                        {variant?.attributeOpts
                                          .map((i) => i?.name)
                                          ?.join("-")}
                                      </TableCell>
                                      <TableCell
                                        className="capitalize"
                                        align="center"
                                      >
                                        {`${
                                          variant?.purchaseQty > 0
                                            ? (
                                                variant?.totalPurchasePrice /
                                                variant?.purchaseQty
                                              ).toFixed(2)
                                            : 0
                                        } ৳`}
                                      </TableCell>
                                      <TableCell
                                        className="capitalize"
                                        align="center"
                                      >
                                        {`${variant?.sellingPrice} ৳`}
                                      </TableCell>
                                      <TableCell
                                        className="capitalize"
                                        align="center"
                                      >
                                        {variant?.stock > 0 ? (
                                          variant?.stock
                                        ) : (
                                          <small className="rounded bg-error text-white px-2 py-2">
                                            {variant?.stock}
                                          </small>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                              </>
                            ) : (
                              <TableRow>
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
                                    style={{ cursor: "pointer", width: "58px" }}
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
                                  className="capitalize"
                                  align="center"
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
                                  {`${
                                    data?.nonVariation?.purchaseQty > 0
                                      ? (
                                          data?.nonVariation
                                            ?.totalPurchasePrice /
                                          data?.nonVariation?.purchaseQty
                                        ).toFixed(2)
                                      : 0
                                  } ৳`}
                                </TableCell>
                                <TableCell
                                  className="capitalize"
                                  align="center"
                                >
                                  {`${data?.nonVariation?.sellingPrice} ৳`}
                                </TableCell>
                                <TableCell
                                  className="capitalize"
                                  align="center"
                                >
                                  {data?.nonVariation?.stock > 0 ? (
                                    data?.nonVariation?.stock
                                  ) : (
                                    <small className="rounded bg-error text-white px-2 py-2">
                                      {data?.nonVariation?.stock}
                                    </small>
                                  )}
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))}
                    </TableBody>
                  </Table>
                  <TablePagination
                    rowsPerPageOptions={[10, 25, 100]}
                    component="div"
                    count={totalData} // total data
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </div>
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
      </SimpleModal>
    </div>
  );
}
