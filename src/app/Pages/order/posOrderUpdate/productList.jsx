import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Collapse,
  IconButton,
  styled,
  TextField,
  Typography,
  Grid,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@material-ui/core";
import { ExpandMore as ExpandMoreIcon, ShoppingCart } from "@material-ui/icons";
import { CardActions, Pagination } from "@mui/material";
import axios from "../../../../axios";
import imageBasePath from "../../../../config";
import { Scrollbar } from "react-scrollbars-custom";
import Spinner from "../../../Shared/Spinner/Spinner";
import { v4 as uuidv4 } from "uuid";
import { gotoProductPage } from "../../../util/product";
import { IoMdFlash } from "react-icons/io";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import ProductVariationsModal from "../posOrder/variationModal";

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

const ProductListPage = ({
  cartProducts,
  setCartProducts,
  type,
  setCombos,
  combos,
}) => {
  const [productList, setProductList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTatalPage] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [expandId, setExpandId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [comboList, setComboList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedVariationCombo, setSelectedVariationCombo] = useState({});

  const handleChange = (event, value) => {
    setPage(value);
  };

  const productSelectHandler = (data) => {
    let isExit = false;
    cartProducts.forEach((obj) => {
      let objUid = obj?.uid;
      delete obj?.uid;
      if (
        obj?.productId === data?.productId &&
        obj?.variantId === data?.variantId
      ) {
        isExit = true;
      }
      obj.uid = objUid;
    });

    if (!isExit) {
      setCartProducts([{ ...data, uid: uuidv4() }, ...cartProducts]);
    }
  };

  useEffect(() => {
    let fetchData = async () => {
      let searchUrl =
        type == "reseller"
          ? "/product/admin/reseller-search"
          : "/product/admin/search";
      let mianUrl =
        type == "reseller"
          ? "/product/admin/reseller-pos-products"
          : "/product/admin/pos-products";

      try {
        let res = null;
        setIsLoading(true);
        if (searchValue !== "") {
          res = await axios.post(`${searchUrl}?page=${page}&limit=6`, {
            value: searchValue,
          });
        } else {
          res = await axios.get(`${mianUrl}?page=${page}&limit=6`);
        }
        if (res?.data?.success) {
          setProductList(res?.data?.data);
          setTatalPage(res?.data?.metaData?.totalPage);
        }
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        setErrorMsg(err?.response?.data?.message);
      }
    };

    let fetchComboData = async () => {
      try {
        let res = null;
        setIsLoading(true);
        res = await axios.post(`/combo/admin/pos-list?page=${page}&limit=6`, {
          value: searchValue,
        });

        if (res?.data?.success) {
          const updatedData = res.data.data.map((item) => {
            const hasVariant = item.comboProduct.some(
              (product) => product.isVariant === true
            );

            if (hasVariant) {
              return {
                ...item,
                isVariant: true,
              };
            } else {
              return {
                ...item,
                isVariant: false,
              };
            }
          });

          setComboList(updatedData);
          setTatalPage(res?.data?.metaData?.totalPage);
        }
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        setErrorMsg(err?.response?.data?.message);
      }
    };
    if (activeTab == 1) {
      fetchComboData();
    }

    fetchData();
  }, [page, searchValue]);

  const handleExpandClick = (id) => {
    setExpanded(!expanded);
    if (!expanded) {
      setExpandId(id);
    } else {
      setExpandId("");
    }
  };

  const openVariationsModal = async (id, product) => {
    setOpenModal(true);
    setSelectedVariationCombo(product);
  };

  const comboSelectHandler = (data) => {
    let modifiedPro = [];
    data.products.map((item, index) => {
      modifiedPro.push({
        productId: item?.productId,
        isVariant: item?.isVariant,
        variationId: item?.variationId?.length ? item?.variationId[0] : "",
        variationName: item?.variationName  || "",
      });
    });

    const comboMain = {
      comboId: data?.comboId,
      products: modifiedPro,
      price: data?.price,
      quantity: 1,
    };

    let isExit = false;

    for (let i = 0; i < combos.length; i++) {
      let obj = combos[i];
      if (obj?.comboId === data?.comboId) {
        if (data.isVariant) {
          let flag = checkVariationIdsMatchWithCombo(data, obj);
          if (flag == true) {
            isExit = true;
            break;
          }
        } else {
          isExit = true;
        }
      }
    }

    let uidd = uuidv4();

    if (!isExit) {
      setCombos([{ ...comboMain, uid: uidd }, ...combos]);
      setCartProducts([{ ...data, uid: uidd, isCombo: true }, ...cartProducts]);
    }

    function checkVariationIdsMatchWithCombo(data, combo) {
      if (data.products.length !== combo.products.length) {
        return false;
      }

      for (let i = 0; i < data.products.length; i++) {
        if (combo.products[i].isVariant) {
          if (
            data.products[i].variationId[0] !== combo.products[i].variationId
          ) {
            return false;
          }
        }
      }

      return true;
    }
  };

  const closeModal = async () => {
    setOpenModal(false);
  };

  return (
    <Card elevation={3} style={{ height: 720 }}>
      <CardHeader title="Product Information" />

      <Grid container className="my-3">
        <Grid item xs={1}></Grid>
        <Grid item xs={10}>
          <TextField
            placeholder="Search by Product Name or SKU"
            label=""
            variant="outlined"
            size="small"
            fullWidth
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </Grid>
      </Grid>
      <div>
        <Tabs
          value={activeTab}
          onChange={() => setActiveTab(activeTab == 0 ? 1 : 0)}
          aria-label="two tabs example"
        >
          <Tab label="Regular Products" />
          <Tab label="Combo Products" />
        </Tabs>
      </div>

      <div
        style={{
          height: 520,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <Scrollbar>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {!isLoading ? (
              <>
                {activeTab == 0 ? (
                  <>
                    {productList.length > 0 && errorMsg === "" ? (
                      <>
                        {productList.map((product) => (
                          <Box
                            sx={{
                              m: 1,
                              width: 150,
                            }}
                            key={product?._id}
                          >
                            <Card
                              className="elevation-z3"
                              style={{ minHeight: 240, cursor: "pointer" }}
                            >
                              <CardMedia
                                onClick={() =>
                                  product?.isVariant
                                    ? handleExpandClick(product?._id)
                                    : productSelectHandler({
                                        productId: product?._id,
                                        slug: product?.slug,
                                        name: product?.name,
                                        isVariant: false,
                                        variantId: "",
                                        variantName: "",
                                        price: product?.isFlashDeal
                                          ? product?.nonVariation?.flashPrice
                                          : product?.nonVariation
                                              ?.sellingPrice || 0,
                                        subTotal: product?.isFlashDeal
                                          ? product?.nonVariation?.flashPrice
                                          : product?.nonVariation
                                              ?.sellingPrice || 0,
                                        quantity: 1,
                                        stock: product?.nonVariation?.stock,
                                        images: product?.galleryImage,
                                      })
                                }
                                style={{ objectFit: "fill" }}
                                component="img"
                                height="120"
                                image={
                                  imageBasePath + "/" + product?.galleryImage[0]
                                }
                                alt={product?.name}
                              />
                              <CardContent className="p-2">
                                <Typography
                                  paragraph
                                  className="mb-0 text-12 text-gray"
                                >
                                  {product?.sku}
                                </Typography>
                                <Typography
                                  paragraph
                                  className="mb-0"
                                  onClick={() => gotoProductPage(product?.slug)}
                                >
                                  {product?.name.length > 15
                                    ? product?.name.slice(0, 15) + ".."
                                    : product?.name}
                                </Typography>
                                {!product?.isVariant ? (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Box>
                                      <Typography
                                        paragraph
                                        className="m-0 text-error"
                                      >
                                        {"৳ " +
                                          (product?.isFlashDeal
                                            ? product?.nonVariation?.flashPrice
                                            : product?.nonVariation
                                                ?.sellingPrice) +
                                          "/="}
                                      </Typography>
                                    </Box>
                                    <Box>
                                      {product?.isFlashDeal && (
                                        <IoMdFlash className="text-secondary text-18" />
                                      )}
                                    </Box>
                                  </Box>
                                ) : (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Box>
                                      <Typography
                                        paragraph
                                        className="m-0 text-error"
                                      >
                                        {"৳ " +
                                          (product?.variations.length > 0 &&
                                          product?.isFlashDeal
                                            ? product?.variations[0]?.flashPrice
                                            : product?.variations[0]
                                                ?.sellingPrice) +
                                          "/="}
                                      </Typography>
                                    </Box>
                                    <Box>
                                      {product?.isFlashDeal && (
                                        <IoMdFlash className="text-secondary text-18" />
                                      )}
                                    </Box>
                                  </Box>
                                )}
                              </CardContent>
                              <CardActions disableSpacing>
                                {product?.isVariant ? (
                                  <Typography paragraph className="m-0">
                                    select here..
                                  </Typography>
                                ) : (
                                  <IconButton
                                    onClick={() => {
                                      productSelectHandler({
                                        productId: product?._id,
                                        slug: product?.slug,
                                        name: product?.name,
                                        isVariant: false,
                                        variantId: "",
                                        variantName: "",
                                        price: product?.isFlashDeal
                                          ? product?.nonVariation?.flashPrice
                                          : product?.nonVariation
                                              ?.sellingPrice || 0,
                                        subTotal: product?.isFlashDeal
                                          ? product?.nonVariation?.flashPrice
                                          : product?.nonVariation
                                              ?.sellingPrice || 0,
                                        quantity: 1,
                                        stock: product?.nonVariation?.stock,
                                        images: product?.galleryImage,
                                      });
                                    }}
                                    // disabled={product?.nonVariation?.stock > 0 ? false : true}
                                  >
                                    <ShoppingCart />
                                  </IconButton>
                                )}
                                {product?.isVariant ? (
                                  <ExpandMore
                                    expand={
                                      expanded && expandId === product?._id
                                    }
                                    onClick={() =>
                                      handleExpandClick(product?._id)
                                    }
                                  >
                                    <ExpandMoreIcon />
                                  </ExpandMore>
                                ) : (
                                  <Typography>
                                    {"stock: "}
                                    {product?.nonVariation?.stock > 0 ? (
                                      <strong>
                                        {product?.nonVariation?.stock}
                                      </strong>
                                    ) : (
                                      <small className="rounded bg-error text-white px-1 py-1">
                                        {product?.nonVariation?.stock}
                                      </small>
                                    )}
                                  </Typography>
                                )}
                              </CardActions>
                              <Collapse
                                in={expanded && expandId === product?._id}
                                timeout="auto"
                                unmountOnExit
                              >
                                <CardContent className="p-0">
                                  <Table className="whitespace-pre">
                                    <TableBody>
                                      {product?.variations.map(
                                        (variant, index) => (
                                          <TableRow key={index}>
                                            <TableCell
                                              className="capitalize"
                                              align="left"
                                            >
                                              <span>
                                                {variant?.attributeOpts
                                                  ?.map((i) => i?.name)
                                                  .join("-")}
                                              </span>
                                              <br />
                                              <span className="text-error">
                                                {"৳ " +
                                                  (product?.isFlashDeal
                                                    ? variant?.flashPrice
                                                    : variant?.sellingPrice) +
                                                  "/="}
                                              </span>
                                              <br />
                                              {variant?.stock > 0 ? (
                                                <span>
                                                  {"St.(" +
                                                    variant?.stock +
                                                    ")"}
                                                </span>
                                              ) : (
                                                <span>
                                                  {"St. "}
                                                  <small className="rounded bg-error text-white px-1 py-1">
                                                    {variant?.stock}
                                                  </small>
                                                </span>
                                              )}
                                            </TableCell>
                                            <TableCell
                                              className="capitalize"
                                              align="left"
                                            >
                                              <IconButton
                                                onClick={() => {
                                                  productSelectHandler({
                                                    productId: product?._id,
                                                    slug: product?.slug,
                                                    name: product?.name,
                                                    isVariant: true,
                                                    variantId: variant?._id,
                                                    variantName:
                                                      variant?.attributeOpts
                                                        ?.map((i) => i?.name)
                                                        .join("-"),
                                                    quantity: 1,
                                                    price: product?.isFlashDeal
                                                      ? variant?.flashPrice
                                                      : variant?.sellingPrice ||
                                                        0,
                                                    subTotal:
                                                      product?.isFlashDeal
                                                        ? variant?.flashPrice
                                                        : variant?.sellingPrice ||
                                                          0 ||
                                                          0,
                                                    stock: variant?.stock,
                                                    images: variant?.images
                                                      ?.length
                                                      ? variant?.images
                                                      : product?.galleryImage,
                                                  });
                                                }}
                                                // disabled={variant?.stock > 0 ? false : true}
                                              >
                                                <ShoppingCart />
                                              </IconButton>
                                            </TableCell>
                                          </TableRow>
                                        )
                                      )}
                                    </TableBody>
                                  </Table>
                                </CardContent>
                              </Collapse>
                            </Card>
                          </Box>
                        ))}
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
                  </>
                ) : (
                  <>
                    {comboList.length > 0 && errorMsg === "" ? (
                      <>
                        {comboList.map((product) => (
                          <Box
                            sx={{
                              m: 1,
                              width: 150,
                            }}
                            key={product?._id}
                          >
                            <Card
                              className="elevation-z3"
                              style={{ minHeight: 240, cursor: "pointer" }}
                            >
                              <CardMedia
                                onClick={() =>
                                  product?.isVariant
                                    ? openVariationsModal(product?._id, product)
                                    : comboSelectHandler({
                                        comboId: product?._id,
                                        slug: product?.slug,
                                        name: product?.name,
                                        products: product?.comboProduct,
                                        price: product?.sellingPrice || 0,
                                        subTotal: product?.sellingPrice || 0,
                                        quantity: 1,
                                        stock: product?.nonVariation?.stock,
                                        images: product?.galleryImage,
                                      })
                                }
                                style={{ objectFit: "fill" }}
                                component="img"
                                height="120"
                                image={
                                  imageBasePath + "/" + product?.galleryImage[0]
                                }
                                alt={product?.name}
                              />
                              <CardContent className="p-2">
                                <Typography
                                  paragraph
                                  className="mb-0 text-12 text-gray"
                                >
                                  {product?.sku}
                                </Typography>
                                <Typography
                                  paragraph
                                  className="mb-0"
                                  onClick={() => gotoProductPage(product?.slug)}
                                >
                                  {product?.name.length > 15
                                    ? product?.name.slice(0, 15) + ".."
                                    : product?.name}
                                </Typography>

                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <Box>
                                    <Typography
                                      paragraph
                                      className="m-0 text-error"
                                    >
                                      {"৳ " + product?.sellingPrice + "/="}
                                    </Typography>
                                  </Box>
                                </Box>
                              </CardContent>
                            </Card>
                          </Box>
                        ))}
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
                  </>
                )}
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
        </Scrollbar>
      </div>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box>
          <Pagination
            count={totalPage}
            size="small"
            page={page}
            onChange={handleChange}
          />
        </Box>
      </Box>
      <ProductVariationsModal
        open={openModal}
        addProduct={comboSelectHandler}
        handleClose={closeModal}
        products={selectedVariationCombo}
      />
    </Card>
  );
};

export default ProductListPage;
