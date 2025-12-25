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
  setCombos,
  combos,
}) => {
  const [productList, setProductList] = useState([]);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [expandId, setExpandId] = useState("");
  const [totalPage, setTatalPage] = useState(1);
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

  const comboSelectHandler = (data) => {
    let modifiedPro = [];
    data.products.map((item, index) => {
      modifiedPro.push({
        productId: item?.productId,
        isVariant: item?.isVariant,
        variationId: item?.variationId?.length ? item?.variationId[0] : "",
        variationName: item?.variationName   || "",
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

    let uidd = uuidv4()

    if (!isExit) {
      setCombos([{ ...comboMain,uid: uidd }, ...combos]);
      setCartProducts([
        { ...data, uid: uidd, isCombo: true },
        ...cartProducts,
      ]);
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


  useEffect(() => {
    let isMounted = true; // Track if component is mounted
    
    let fetchData = async () => {
      try {
        let res = null;
        if (isMounted) setIsLoading(true);
        if (searchValue !== "") {
          res = await axios.post(`/product/admin/search?page=${page}&limit=6`, {
            value: searchValue,
          });
        } else {
          res = await axios.get(
            `/product/admin/pos-products?page=${page}&limit=6`
          );
        }

        if (isMounted && res?.data?.success) {
          setProductList(Array.isArray(res?.data?.data) ? res?.data?.data : []);
          setTatalPage(res?.data?.metaData?.totalPage || 1);
          setErrorMsg("");
        } else if (isMounted) {
          setProductList([]);
          setErrorMsg(res?.data?.message || "Failed to fetch products");
        }
        if (isMounted) setIsLoading(false);
      } catch (err) {
        if (isMounted) {
          setIsLoading(false);
          setErrorMsg(err?.response?.data?.message || "Error loading products");
          setProductList([]);
        }
      }
    };
    
    let fetchComboData = async () => {
      try {
        let res = null;
        if (isMounted) setIsLoading(true);
        res = await axios.post(`/combo/admin/pos-list?page=${page}&limit=6`, {
          value: searchValue,
        });

        if (isMounted && res?.data?.success && Array.isArray(res.data.data)) {
          const updatedData = res.data.data.map((item) => {
            const hasVariant = item.comboProduct && Array.isArray(item.comboProduct) && item.comboProduct.some(
              (product) => product.isVariant === true || product.isVariant === "true"
            );

            return {
              ...item,
              isVariant: hasVariant || false,
            };
          });

          setComboList(updatedData);
          setTatalPage(res?.data?.metaData?.totalPage || 1);
          setErrorMsg("");
        } else if (isMounted) {
          setComboList([]);
          setErrorMsg(res?.data?.message || "Failed to fetch combos");
        }
        if (isMounted) setIsLoading(false);
      } catch (err) {
        if (isMounted) {
          setIsLoading(false);
          setErrorMsg(err?.response?.data?.message || "Error loading combos");
          setComboList([]);
        }
      }
    };
    
    if (activeTab == 0) {
      fetchData();
    } else if (activeTab == 1) {
      fetchComboData();
    }
    
    return () => {
      isMounted = false; // Cleanup: mark component as unmounted
    };
  }, [page, searchValue, activeTab]);


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

  const closeModal = async () => {
    setOpenModal(false);
  };

  return (
    <>
      <Card elevation={3} style={{ height: 750 }}>
        <CardHeader title="Product Information" />
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

        <Grid container className="my-5">
          <Grid item xs={1}></Grid>
          <Grid item xs={10}>
            <TextField
              placeholder="Search by Product Name or SKU"
              label=""
              variant="outlined"
              size="small"
              fullWidth
              value={searchValue}
              onChange={(e) => {
                setPage(1);
                setSearchValue(e.target.value);
              }}
            />
          </Grid>
        </Grid>

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
                      {productList && Array.isArray(productList) && productList.length > 0 && errorMsg === "" ? (
                        <>
                          {productList.map((product) => {
                            if (!product || !product._id) return null; // Skip invalid products
                            return (
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
                                    (product?.isVariant === true || product?.isVariant === "true")
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
                                    product?.galleryImage && Array.isArray(product?.galleryImage) && product?.galleryImage.length > 0
                                      ? imageBasePath + "/" + product?.galleryImage[0]
                                      : imageBasePath + "/image/placeholder_600x.webp"
                                  }
                                  alt={product?.name || "Product"}
                                />
                                <CardContent className="p-2">
                                  <Typography
                                    paragraph
                                    className="mb-0 text-12 text-gray"
                                  >
                                    {product?.sku || "N/A"}
                                  </Typography>
                                  <Typography
                                    paragraph
                                    className="mb-0"
                                    onClick={() =>
                                      product?.slug && gotoProductPage(product?.slug)
                                    }
                                  >
                                    {product?.name && product?.name.length > 15
                                      ? product?.name.slice(0, 15) + ".."
                                      : product?.name || "No Name"}
                                  </Typography>
                                  {!(product?.isVariant === true || product?.isVariant === "true") ? (
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
                                            ((product?.isFlashDeal === true || product?.isFlashDeal === "true")
                                              ? (product?.nonVariation?.flashPrice || 0)
                                              : (product?.nonVariation?.sellingPrice || 0)) +
                                            "/="}
                                        </Typography>
                                      </Box>
                                      <Box>
                                        {(product?.isFlashDeal === true || product?.isFlashDeal === "true") && (
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
                                            (product?.variations && Array.isArray(product?.variations) && product?.variations.length > 0 &&
                                            (product?.isFlashDeal === true || product?.isFlashDeal === "true")
                                              ? (product?.variations[0]?.flashPrice || 0)
                                              : (product?.variations[0]?.sellingPrice || 0)) +
                                            "/="}
                                        </Typography>
                                      </Box>
                                      <Box>
                                        {(product?.isFlashDeal === true || product?.isFlashDeal === "true") && (
                                          <IoMdFlash className="text-secondary text-18" />
                                        )}
                                      </Box>
                                    </Box>
                                  )}
                                </CardContent>
                                <CardActions disableSpacing>
                                  {(product?.isVariant === true || product?.isVariant === "true") ? (
                                    <Typography paragraph className="m-0">
                                      select here..
                                    </Typography>
                                  ) : (
                                    <IconButton
                                      onClick={() => {
                                        productSelectHandler({
                                          productId: product?._id,
                                          slug: product?.slug || "",
                                          name: product?.name || "",
                                          isVariant: false,
                                          variantId: "",
                                          variantName: "",
                                          price: (product?.isFlashDeal === true || product?.isFlashDeal === "true")
                                            ? (product?.nonVariation?.flashPrice || 0)
                                            : (product?.nonVariation?.sellingPrice || 0),
                                          subTotal: (product?.isFlashDeal === true || product?.isFlashDeal === "true")
                                            ? (product?.nonVariation?.flashPrice || 0)
                                            : (product?.nonVariation?.sellingPrice || 0),
                                          quantity: 1,
                                          stock: product?.nonVariation?.stock || 0,
                                          images: Array.isArray(product?.galleryImage) ? product?.galleryImage : [],
                                        });
                                      }}
                                    >
                                      <ShoppingCart />
                                    </IconButton>
                                  )}
                                  {(product?.isVariant === true || product?.isVariant === "true") ? (
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
                                      {(product?.nonVariation?.stock || 0) > 0 ? (
                                        <strong>
                                          {product?.nonVariation?.stock}
                                        </strong>
                                      ) : (
                                        <small className="rounded bg-error text-white px-1 py-1">
                                          {product?.nonVariation?.stock || 0}
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
                                        {product?.variations && Array.isArray(product?.variations) && product?.variations.map(
                                          (variant, index) => (
                                            <TableRow key={index}>
                                              <TableCell
                                                className="capitalize"
                                                align="left"
                                              >
                                                <span>
                                                  {variant?.attributeOpts && Array.isArray(variant?.attributeOpts)
                                                    ? variant?.attributeOpts.map((i) => i?.name).join("-")
                                                    : ""}
                                                </span>
                                                <br />
                                                <span className="text-error">
                                                  {"৳ " +
                                                    ((product?.isFlashDeal === true || product?.isFlashDeal === "true")
                                                      ? (variant?.flashPrice || 0)
                                                      : (variant?.sellingPrice || 0)) +
                                                    "/="}
                                                </span>
                                                <br />
                                                {(variant?.stock || 0) > 0 ? (
                                                  <span>
                                                    {"St.(" +
                                                      (variant?.stock || 0) +
                                                      ")"}
                                                  </span>
                                                ) : (
                                                  <span>
                                                    {"St. "}
                                                    <small className="rounded bg-error text-white px-1 py-1">
                                                      {variant?.stock || 0}
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
                                                      slug: product?.slug || "",
                                                      name: product?.name || "",
                                                      isVariant: true,
                                                      variantId: variant?._id || "",
                                                      variantName:
                                                        variant?.attributeOpts && Array.isArray(variant?.attributeOpts)
                                                          ? variant?.attributeOpts.map((i) => i?.name).join("-")
                                                          : "",
                                                      quantity: 1,
                                                      price:
                                                        (product?.isFlashDeal === true || product?.isFlashDeal === "true")
                                                          ? (variant?.flashPrice || 0)
                                                          : (variant?.sellingPrice || 0),
                                                      subTotal:
                                                        (product?.isFlashDeal === true || product?.isFlashDeal === "true")
                                                          ? (variant?.flashPrice || 0)
                                                          : (variant?.sellingPrice || 0),
                                                      stock: variant?.stock || 0,
                                                      images: variant?.images && Array.isArray(variant?.images) && variant?.images.length > 0
                                                        ? variant?.images
                                                        : (Array.isArray(product?.galleryImage) ? product?.galleryImage : []),
                                                    });
                                                  }}
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
                            );
                          })}
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
                      {comboList && Array.isArray(comboList) && comboList.length > 0 && errorMsg === "" ? (
                        <>
                          {comboList.map((product) => {
                            if (!product || !product._id) return null; // Skip invalid combos
                            return (
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
                                    (product?.isVariant === true || product?.isVariant === "true")
                                      ? openVariationsModal(
                                          product?._id,
                                          product
                                        )
                                      : comboSelectHandler({
                                          comboId: product?._id,
                                          slug: product?.slug || "",
                                          name: product?.name || "",
                                          products: Array.isArray(product?.comboProduct) ? product?.comboProduct : [],
                                          price: product?.sellingPrice || 0,
                                          subTotal: product?.sellingPrice || 0,
                                          quantity: 1,
                                          stock: product?.nonVariation?.stock || 0,
                                          images: Array.isArray(product?.galleryImage) ? product?.galleryImage : [],
                                        })
                                  }
                                  style={{ objectFit: "fill" }}
                                  component="img"
                                  height="120"
                                  image={
                                    product?.galleryImage && Array.isArray(product?.galleryImage) && product?.galleryImage.length > 0
                                      ? imageBasePath + "/" + product?.galleryImage[0]
                                      : imageBasePath + "/image/placeholder_600x.webp"
                                  }
                                  alt={product?.name || "Product"}
                                />
                                <CardContent className="p-2">
                                  <Typography
                                    paragraph
                                    className="mb-0 text-12 text-gray"
                                  >
                                    {product?.sku || "N/A"}
                                  </Typography>
                                  <Typography
                                    paragraph
                                    className="mb-0"
                                    onClick={() =>
                                      product?.slug && gotoProductPage(product?.slug)
                                    }
                                  >
                                    {product?.name && product?.name.length > 15
                                      ? product?.name.slice(0, 15) + ".."
                                      : product?.name || "No Name"}
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
                                        {"৳ " + (product?.sellingPrice || 0) + "/="}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Box>
                            );
                          })}
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
              count={totalPage || 1}
              size="small"
              page={page}
              onChange={handleChange}
            />
          </Box>
        </Box>
      </Card>
      <ProductVariationsModal
        open={openModal}
        addProduct={comboSelectHandler}
        handleClose={closeModal}
        products={selectedVariationCombo}
      />
    </>
  );
};

export default ProductListPage;
