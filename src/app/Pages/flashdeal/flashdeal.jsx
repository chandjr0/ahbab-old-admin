import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Grid,
  TextField,
  CircularProgress,
  CardHeader,
  InputLabel,
  Typography,
  IconButton,
  TableCell,
  TableRow,
  Table,
  TableHead,
  TableBody,
  Box,
  Avatar,
} from "@material-ui/core";
import { Divider, notification } from "antd";
import { Breadcrumb } from "../../components";
import axios from "../../../axios";
import { DatePicker } from "antd";
import ProductList from "../../Shared/productList/productList";
import { IoMdAddCircle } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { RiDeleteBin5Line } from "react-icons/ri";
import moment from "moment";
import Spinner from "../../Shared/Spinner/Spinner";
import { gotoProductPage } from "../../util/product";
import SimpleModal from "../../Shared/SimpleModal/SimpleModal";
import { FaExclamationTriangle } from "react-icons/fa";

const { RangePicker } = DatePicker;

const FlashDealPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);

  const [isShowProductList, setIsShowProductList] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [existProductIds, setExistProductIds] = useState([]);
  const [dateRange, setDateRange] = useState({});
  const [defaultRangeValue, setDefaultRangeValue] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  const formSubmitHandler = async (event) => {
    try {
      event.preventDefault();

      if (dataList.length > 0 && Object.keys(dateRange).length === 0) {
        openNotificationWithIcon("Date range must be select!", "error");
        return;
      }

      let obj = {
        startTime: new Date(dateRange?.startDate).toISOString(),
        endTime: new Date(dateRange?.endDate).toISOString(),

        flashDealProducts: dataList.map((data) => {
          return {
            productId: data?._id,
            isVariant: data?.isVariant,
            flashPrice: data?.nonVariation?.flashPrice || 0,
            variations: data?.variations.map((variant) => ({
              variationId: variant?._id,
              flashPrice: variant?.flashPrice,
            })),
          };
        }),
      };

      setIsLoading(true);
      const res = await axios.post(`/flashdeal/update`, obj);
      if (res?.data?.success) {
        setDataList(
          dataList.map((i) => {
            return {
              ...i,
              isNew: false,
            };
          })
        );
        openNotificationWithIcon(res?.data?.message, "success");
      } else {
        openNotificationWithIcon(res?.data?.message, "error");
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      openNotificationWithIcon(err?.response?.data?.message, "error");
    }
  };

  useEffect(() => {
    let fetchData = async () => {
      try {
        setIsPageLoading(true);
        let res = await axios.get("/flashdeal/fetch");

        if (res) {
          if (res?.data?.success) {
            let startTime = new Date(res?.data?.data?.startTime).toLocaleString();
            let endTime = new Date(res?.data?.data?.endTime).toLocaleString();

            const defaultStartDate = moment(new Date(startTime), "YYYY-MM-DD HH:mm:ss");
            const defaultEndDate = moment(new Date(endTime), "YYYY-MM-DD HH:mm:ss");
            setDefaultRangeValue([defaultStartDate, defaultEndDate]);
            setDateRange({
              startDate: new Date(startTime).getTime(),
              endDate: new Date(endTime).getTime(),
            });
          }

          setDataList(res?.data?.data?.products);
        }

        setIsPageLoading(false);
      } catch (err) {
        setIsPageLoading(false);
      }
    };
    fetchData();
  }, []);

  const removeProductHandler = (prodId) => {
    setDataList(dataList.filter((data) => data?._id !== prodId));
  };

  const deleteProductHandler = async () => {
    try {
      setDeleteId(false);
      setIsOpenModal(false);
      let res = await axios.delete(`/flashdeal/remove-product/${deleteId}`);
      if (res?.data?.success) {
        setDataList(dataList.filter((data) => data?._id !== deleteId));
      }
      openNotificationWithIcon(res?.data?.message, "success");
    } catch (error) {
      openNotificationWithIcon(error?.response?.data?.message, "error");
    }
  };

  const closeModalHandler = () => {
    setDeleteId(false);
    setIsOpenModal(false);
  };

  const changeFlashPriceHandler = (value, productId, isVariant, variationId) => {
    if (isVariant) {
      setDataList(
        dataList.map((data) => ({
          ...data,
          variations: data.variations.map((variant) => {
            if (variant?._id === variationId) {
              return {
                ...variant,
                flashPrice: value,
              };
            } else {
              return variant;
            }
          }),
        }))
      );
    } else {
      setDataList(
        dataList.map((data) => {
          if (data?._id === productId) {
            return {
              ...data,
              nonVariation: {
                ...data?.nonVariation,
                flashPrice: value,
              },
            };
          } else {
            return data;
          }
        })
      );
    }
  };

  useEffect(() => {
    setExistProductIds(dataList.map((data) => data?._id));
  }, [dataList]);

  const addSelectedProducts = (products) => {
    let modifyProducts = products.map((product) => ({
      ...product,
      isNew: true,
    }));
    setDataList([...modifyProducts, ...dataList]);
  };

  return (
    <div className="m-sm-30">
      <div className="mb-sm-30">
        <Breadcrumb routeSegments={[{ name: "Flash Deal" }]} />
      </div>

      <Grid container>
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardHeader title="Flash Deal" />

            {!isPageLoading ? (
              <form className="px-4 py-6" onSubmit={formSubmitHandler}>
                <Grid container spacing={1} alignItems="center" className="mb-2">
                  <Grid item lg={4} xs={12} className="mb-8">
                    <InputLabel className="mb-2 text-black">
                      Time Range<span style={{ color: "red" }}>*</span>
                    </InputLabel>
                    <RangePicker
                      style={{
                        width: "100%",
                        height: "36px",
                        borderRadius: "4px",
                      }}
                      defaultValue={defaultRangeValue}
                      onChange={(range) => {
                        const a = new Date(range[0].format());
                        const b = new Date(range[1].format());
                        setDateRange({
                          startDate: Math.min(a, b),
                          endDate: Math.max(a, b),
                        });
                      }}
                      showTime
                    />
                  </Grid>
                  <Grid item xs={12} className="mb-4">
                    {isShowProductList ? (
                      <Button
                        variant="contained"
                        className="bg-error"
                        onClick={() => setIsShowProductList(false)}
                        startIcon={<RxCross2 />}
                      >
                        Close Product List
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="secondary"
                        className="text-white"
                        onClick={() => setIsShowProductList(true)}
                        startIcon={<IoMdAddCircle />}
                      >
                        Add More Products
                      </Button>
                    )}
                    {isShowProductList ? (
                      <ProductList
                        addSelectedProducts={addSelectedProducts}
                        existProductIds={existProductIds}
                      />
                    ) : null}
                  </Grid>

                  <Grid item xs={12} className="mb-4">
                    <Divider />
                    <Typography variant="h5" className="text-center text-green mb-6">
                      {`Flash Deal Products (${dataList.length})`}
                    </Typography>{" "}
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
                            <TableCell className="min-w-50" align="left">
                              Sku
                            </TableCell>
                            <TableCell className="min-w-100" align="center">
                              Image
                            </TableCell>
                            <TableCell className="min-w-100" align="center">
                              Name
                            </TableCell>
                            <TableCell className="min-w-100" align="center">
                              Variation
                            </TableCell>
                            <TableCell className="min-w-100" align="center">
                              stock
                            </TableCell>
                            <TableCell className="min-w-100" align="center">
                              Regular Price
                            </TableCell>
                            <TableCell className="min-w-100" align="center">
                              Sale Price
                            </TableCell>
                            <TableCell className="min-w-100" align="center">
                              Flash Price
                            </TableCell>
                            <TableCell className="min-w-100" align="center">
                              Action
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dataList.map((data) => (
                            <React.Fragment key={data?._id}>
                              {data?.isVariant ? (
                                data?.variations.length > 0 &&
                                data?.variations.map((variant, idx) => (
                                  <TableRow key={idx}>
                                    {idx === 0 && (
                                      <>
                                        <TableCell
                                          className="capitalize"
                                          align="left"
                                          rowSpan={data?.variations.length}
                                        >
                                          {data?.isNew ? (
                                            <p>
                                              {data?.sku}
                                              <span className="text-11 rounded bg-error elevation-z3 px-2 py-2px ml-2">
                                                NEW
                                              </span>
                                            </p>
                                          ) : (
                                            <p>{data?.sku}</p>
                                          )}
                                        </TableCell>
                                        <TableCell
                                          className="capitalize"
                                          align="center"
                                          rowSpan={data?.variations.length}
                                        >
                                          <Box
                                            sx={{
                                              display: "flex",
                                              justifyContent: "center",
                                            }}
                                          >
                                            <Avatar
                                              className="border-radius-4"
                                              style={{
                                                cursor: "pointer",
                                                width: "58px",
                                              }}
                                              src=""
                                              alt="im"
                                            />
                                          </Box>
                                        </TableCell>
                                        <TableCell
                                          className="capitalize"
                                          align="center"
                                          rowSpan={data?.variations.length}
                                          onClick={() => gotoProductPage(data?.slug)}
                                        >
                                          {data?.name}
                                        </TableCell>
                                      </>
                                    )}
                                    <TableCell className="capitalize" align="center">
                                      {variant?.attributeOpts.map((i) => i?.name)?.join("-")}
                                    </TableCell>
                                    <TableCell className="capitalize" align="center">
                                      {variant?.stock}
                                    </TableCell>
                                    <TableCell className="capitalize" align="center">
                                      {variant?.regularPrice}
                                    </TableCell>
                                    <TableCell className="capitalize" align="center">
                                      {variant?.sellingPrice}
                                    </TableCell>
                                    <TableCell className="capitalize" align="center">
                                      <TextField
                                        type="number"
                                        inputProps={{ min: 0 }}
                                        onKeyPress={(event) => {
                                          if (event?.key === "-" || event?.key === "+") {
                                            event.preventDefault();
                                          }
                                        }}
                                        label=""
                                        variant="outlined"
                                        style={{ minWidth: "80px" }}
                                        size="small"
                                        value={variant?.flashPrice}
                                        onChange={(e) =>
                                          changeFlashPriceHandler(
                                            e.target.value,
                                            data?._id,
                                            true,
                                            variant?._id
                                          )
                                        }
                                      />
                                    </TableCell>
                                    {idx === 0 && (
                                      <TableCell
                                        className="capitalize"
                                        align="center"
                                        rowSpan={data?.variations.length}
                                      >
                                        {data?.isNew ? (
                                          <IconButton
                                            onClick={() => removeProductHandler(data?._id)}
                                            style={{
                                              backgroundColor: "#ebedec",
                                              color: "red",
                                            }}
                                          >
                                            <RxCross2
                                              style={{
                                                fontSize: "16px",
                                                color: "red",
                                              }}
                                            />
                                          </IconButton>
                                        ) : (
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
                                              style={{
                                                fontSize: "16px",
                                                color: "red",
                                              }}
                                            />
                                          </IconButton>
                                        )}
                                      </TableCell>
                                    )}
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell className="capitalize" align="left">
                                    {data?.isNew ? (
                                      <p>
                                        {data?.sku}
                                        <span className="text-11 rounded bg-error elevation-z3 px-2 py-2px ml-2">
                                          NEW
                                        </span>
                                      </p>
                                    ) : (
                                      <p>{data?.sku}</p>
                                    )}
                                  </TableCell>
                                  <TableCell className="capitalize" align="center">
                                    <Box
                                      sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <Avatar
                                        className="border-radius-4"
                                        style={{
                                          cursor: "pointer",
                                          width: "58px",
                                        }}
                                        src=""
                                        alt="im"
                                      />
                                    </Box>
                                  </TableCell>
                                  <TableCell
                                    className="capitalize"
                                    align="center"
                                    onClick={() => gotoProductPage(data?.slug)}
                                  >
                                    {data?.name}
                                  </TableCell>
                                  <TableCell className="capitalize" align="center">
                                    ---
                                  </TableCell>
                                  <TableCell className="capitalize" align="center">
                                    {data?.nonVariation?.stock}
                                  </TableCell>
                                  <TableCell className="capitalize" align="center">
                                    {data?.nonVariation?.regularPrice}
                                  </TableCell>
                                  <TableCell className="capitalize" align="center">
                                    {data?.nonVariation?.sellingPrice}
                                  </TableCell>
                                  <TableCell className="capitalize" align="center">
                                    <TextField
                                      type="number"
                                      inputProps={{ min: 0 }}
                                      onKeyPress={(event) => {
                                        if (event?.key === "-" || event?.key === "+") {
                                          event.preventDefault();
                                        }
                                      }}
                                      label=""
                                      variant="outlined"
                                      style={{ minWidth: "80px" }}
                                      size="small"
                                      value={data?.nonVariation?.flashPrice}
                                      onChange={(e) =>
                                        changeFlashPriceHandler(
                                          e.target.value,
                                          data?._id,
                                          null,
                                          false
                                        )
                                      }
                                    />
                                  </TableCell>
                                  <TableCell className="capitalize" align="center">
                                    {data?.isNew ? (
                                      <IconButton
                                        onClick={() => removeProductHandler(data?._id)}
                                        style={{
                                          backgroundColor: "#ebedec",
                                          color: "red",
                                        }}
                                      >
                                        <RxCross2
                                          style={{
                                            fontSize: "16px",
                                            color: "red",
                                          }}
                                        />
                                      </IconButton>
                                    ) : (
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
                                          style={{
                                            fontSize: "16px",
                                            color: "red",
                                          }}
                                        />
                                      </IconButton>
                                    )}
                                  </TableCell>
                                </TableRow>
                              )}
                            </React.Fragment>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </Grid>
                </Grid>

                <Button
                  className="mb-4 mt-2 px-12"
                  variant="contained"
                  color="primary"
                  type="submit"
                  style={{ marginRight: "20px" }}
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : "Update"}
                </Button>
              </form>
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
                onClick={deleteProductHandler}
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

export default FlashDealPage;
