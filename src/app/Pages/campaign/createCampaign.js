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
import ProductList from "../../Shared/productList/productList";
import { IoMdAddCircle } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import SimpleModal from "../../Shared/SimpleModal/SimpleModal";
import { FaExclamationTriangle } from "react-icons/fa";
import imageBasePath from "../../../config";

const CreateCampaign = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState();
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [isShowProductList, setIsShowProductList] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [existProductIds, setExistProductIds] = useState([]);
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

      if (!name) {
        openNotificationWithIcon("Campaign name must be enter!", "error");
        return;
      }

      let obj = {
        name: name,
        description: description,
        startDate: new Date(startDate),
        products: dataList.map((data) => data?._id),
      };

      setIsLoading(true);
      const res = await axios.post(`/campaign/create`, obj);
      if (res?.data?.success) {
        setName("");
        setDescription("");
        setStartDate(new Date());
        setDataList([]);
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

  const removeProductHandler = (prodId) => {
    setDataList(dataList.filter((data) => data?._id !== prodId));
  };

  const closeModalHandler = () => {
    setDeleteId(false);
    setIsOpenModal(false);
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
        <Breadcrumb routeSegments={[{ name: "Create Campaign" }]} />
      </div>

      <Grid container>
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardHeader title="Create Campaign" />

            <form className="px-4 py-6" onSubmit={formSubmitHandler}>
              <Grid container spacing={1} alignItems="center" className="mb-2">
                <Grid item lg={4} xs={12} className="mb-8">
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Box
                      sx={{
                        mb: 3,
                      }}
                    >
                      <InputLabel className="mb-2 text-black">
                        Campaign Name<span style={{ color: "red" }}>*</span>
                      </InputLabel>
                      <TextField
                        type="text"
                        label=""
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </Box>
                    <Box
                      sx={{
                        mb: 3,
                      }}
                    >
                      <InputLabel className="mb-2 text-black">
                        Description<span style={{ color: "red" }}>*</span>
                      </InputLabel>
                      <TextField
                        type="text"
                        label=""
                        variant="outlined"
                        size="small"
                        fullWidth
                        multiline
                        minRows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </Box>
                    <Box
                      sx={{
                        mb: 3,
                      }}
                    >
                      <InputLabel className="mb-2 text-black">
                        Start Date<span style={{ color: "red" }}>*</span>
                      </InputLabel>
                      <TextField
                        id="datetime-local"
                        label=""
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        variant="outlined"
                        size="small"
                        fullWidth
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Box>
                  </Box>
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

                {dataList.length > 0 && (
                  <Grid item xs={12} className="mb-4">
                    <Divider />
                    <Typography variant="h5" className="text-center text-green mb-6">
                      {`Campaign Products (${dataList.length})`}
                    </Typography>
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
                            <TableCell className="min-w-50" align="center">
                              #
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
                            <TableCell className="min-w-100" align="center">
                              Action
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dataList.length > 0 &&
                            dataList.map((data, index) => (
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
                                                {index + 1}
                                              </TableCell>
                                              <TableCell
                                                className="capitalize"
                                                align="center"
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
                                                <Avatar
                                                  className="border-radius-4"
                                                  style={{ cursor: "pointer", width: "58px" }}
                                                  src={imageBasePath + "/" + data?.galleryImage[0]}
                                                  alt={data?.name}
                                                  //   onClick={() => openImgHandler(data)}
                                                />
                                              </TableCell>
                                              <TableCell
                                                className="capitalize"
                                                align="center"
                                                rowSpan={data?.variations.length}
                                              >
                                                {data?.name}
                                              </TableCell>
                                              <TableCell
                                                className="capitalize"
                                                align="center"
                                                rowSpan={data?.variations.length}
                                              >
                                                {data?.categories.length > 0 &&
                                                  data?.categories.map((v, idx2) => (
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
                                                  ))}
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
                                          <TableCell className="capitalize" align="center">
                                            {variant?.attributeOpts.map((i) => i?.name)?.join("-")}
                                          </TableCell>
                                          <TableCell className="capitalize" align="center">
                                            {`${
                                              variant?.purchaseProducts
                                                ? (
                                                    variant?.purchaseProducts?.totalPrice /
                                                    variant?.purchaseProducts?.totalQuantity
                                                  ).toFixed(2)
                                                : 0
                                            } ৳`}
                                          </TableCell>
                                          <TableCell className="capitalize" align="center">
                                            {`${variant?.sellingPrice} ৳`}
                                          </TableCell>
                                          <TableCell className="capitalize" align="center">
                                            {variant?.stock}
                                          </TableCell>
                                          {idx === 0 && (
                                            <TableCell
                                              className="capitalize"
                                              align="center"
                                              rowSpan={data?.variations.length}
                                            >
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
                                            </TableCell>
                                          )}
                                        </TableRow>
                                      ))}
                                  </>
                                ) : (
                                  <TableRow>
                                    <TableCell className="capitalize" align="center">
                                      {index + 1}
                                    </TableCell>
                                    <TableCell className="capitalize" align="center">
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
                                      <Avatar
                                        className="border-radius-4"
                                        style={{ cursor: "pointer", width: "58px" }}
                                        src={imageBasePath + "/" + data?.galleryImage[0]}
                                        alt={data?.name}
                                        // onClick={() => openImgHandler(data)}
                                      />
                                    </TableCell>
                                    <TableCell className="capitalize" align="center">
                                      {data?.name}
                                    </TableCell>
                                    <TableCell className="capitalize" align="center">
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
                                    <TableCell className="capitalize" align="center">
                                      {data?.totalSell || 0}
                                    </TableCell>
                                    <TableCell className="capitalize" align="center">
                                      -
                                    </TableCell>
                                    <TableCell className="capitalize" align="center">
                                      {`${
                                        data?.nonVariation
                                          ? (
                                              data?.nonVariation?.totalPrice /
                                              data?.nonVariation?.totalQuantity
                                            ).toFixed(2)
                                          : 0
                                      } ৳`}
                                    </TableCell>
                                    <TableCell className="capitalize" align="center">
                                      {`${data?.nonVariation?.sellingPrice} ৳`}
                                    </TableCell>
                                    <TableCell className="capitalize" align="center">
                                      {data?.nonVariation?.stock}
                                    </TableCell>
                                    <TableCell className="capitalize" align="center">
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
                                    </TableCell>
                                  </TableRow>
                                )}
                              </React.Fragment>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  </Grid>
                )}
              </Grid>

              <Button
                className="mb-4 mt-2 px-12"
                variant="contained"
                color="primary"
                type="submit"
                style={{ marginRight: "20px" }}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : "Create"}
              </Button>
            </form>
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
          </Box>
        ) : (
          ""
        )}
      </SimpleModal>
    </div>
  );
};

export default CreateCampaign;
