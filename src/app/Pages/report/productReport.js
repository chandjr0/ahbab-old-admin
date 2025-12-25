import {
  Card,
  Icon,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Typography,
} from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import axios from "../../../axios";
import Spinner from "../../Shared/Spinner/Spinner";
import moment from "moment";

const PrintComponent = React.forwardRef((props, ref) => {
  const { productData, totalCalcData } = props;

  return (
    <div ref={ref} className="print-content">
      <style>
        {`
            .print-content {
              counter-reset: page;
            }
            
            .page {
              margin: 36px 28px;
              padding: 36px 28px;
              background-color: white;
              box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
              page-break-after: always;
            }
            
            .page:after {
              counter-increment: page;
            }
            
            
            @page {
            //   margin: 48px 28px;
              margin: 48px 16px;
              @bottom-left {
                content: none;
              }
            
              @bottom-right {
                content: counter(page);
              }
            }
  
            @media print {
              .page {
                margin: 0;
                padding: 0;
                box-shadow: none;
              }
  
              td, th, tr{
                padding: 10px 6px !important; 
                font-size: 9px !important;
              }
  
            }
          
            `}
      </style>

      <div className="page">
        <h4 className="text-center underline">Product Report</h4>
        <div className="viewer__order-info px-4  flex justify-between">
          <div>
            {/* <h1 className="mb-1 p-0 text-error ">Lazma.com</h1> */}
            <p className="m-0 p-0">09613-100400, 01724-318582</p>
            <p className="m-0 p-0">89, Boundari Raod, Senpara, Mirpur-10</p>
          </div>
          <div className="text-right">
            <div className="text-left">
              <p className="mb-2">
                Date: <strong>{moment(new Date()).format("lll")}</strong>
              </p>
            </div>
          </div>
        </div>

        <hr />

        <Card className="mb-4 mt-6" elevation={0}>
          <Table stickyHeader className="whitespace-pre">
            <TableHead>
              <TableRow>
                <TableCell className="min-w-50 whitespace-pre-wrap" align="center">
                  SKU
                </TableCell>
                <TableCell className="min-w-70 whitespace-pre-wrap" align="center">
                  Title
                </TableCell>
                <TableCell className="min-w-50 whitespace-pre-wrap" align="center">
                  Variant
                </TableCell>
                <TableCell className="min-w-50 whitespace-pre-wrap" align="center">
                  Purchase Qty
                </TableCell>
                <TableCell className="min-w-70 whitespace-pre-wrap" align="center">
                  Total Purchase(৳)
                </TableCell>
                <TableCell className="min-w-50 whitespace-pre-wrap" align="center">
                  Unit Purchase(৳)
                </TableCell>
                <TableCell className="min-w-50 whitespace-pre-wrap" align="center">
                  Sell Qty
                </TableCell>
                <TableCell className="min-w-70 whitespace-pre-wrap" align="center">
                  Total Sell(৳)
                </TableCell>
                <TableCell className="min-w-50 whitespace-pre-wrap" align="center">
                  Unit Sell(৳)
                </TableCell>
                <TableCell className="min-w-50 whitespace-pre-wrap" align="center">
                  Unit Profit(৳)
                </TableCell>
                <TableCell className="min-w-70 whitespace-pre-wrap" align="center">
                  Total Profit(৳)
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productData.length > 0 &&
                productData.map((data) => (
                  <React.Fragment key={data?._id}>
                    {data?.isVariant ? (
                      <>
                        {data?.variations.length > 0 &&
                          data?.variations.map((variant, idx) => (
                            <TableRow key={idx}>
                              {idx === 0 && (
                                <>
                                  <TableCell
                                    className="capitalize whitespace-pre-wrap"
                                    align="center"
                                    rowSpan={data?.variations.length}
                                  >
                                    {data?.sku}
                                  </TableCell>

                                  <TableCell
                                    className="capitalize whitespace-pre-wrap"
                                    align="center"
                                    rowSpan={data?.variations.length}
                                  >
                                    {data?.name}
                                  </TableCell>
                                </>
                              )}
                              <TableCell className="capitalize whitespace-pre-wrap" align="center">
                                {variant?.attributeOpts.map((i) => i?.name)?.join("-")}
                              </TableCell>
                              <TableCell className="capitalize whitespace-pre-wrap" align="center">
                                {variant?.purchaseQty}
                              </TableCell>
                              <TableCell className="capitalize whitespace-pre-wrap" align="center">
                                {variant?.totalPurchasePrice}
                              </TableCell>
                              <TableCell className="capitalize whitespace-pre-wrap" align="center">
                                {variant?.unitPurchase}
                              </TableCell>
                              <TableCell className="capitalize whitespace-pre-wrap" align="center">
                                {variant?.sellQty}
                              </TableCell>
                              <TableCell className="capitalize whitespace-pre-wrap" align="center">
                                {variant?.totalSellPrice}
                              </TableCell>
                              <TableCell className="capitalize whitespace-pre-wrap" align="center">
                                {variant?.unitSell}
                              </TableCell>
                              <TableCell className="capitalize whitespace-pre-wrap" align="center">
                                {variant?.unitProfit}
                              </TableCell>
                              <TableCell className="capitalize whitespace-pre-wrap" align="center">
                                {variant?.totalProfit}
                              </TableCell>
                            </TableRow>
                          ))}
                      </>
                    ) : (
                      <>
                        <TableRow>
                          <TableCell className="capitalize whitespace-pre-wrap" align="center">
                            {data?.sku}
                          </TableCell>
                          <TableCell className="capitalize whitespace-pre-wrap" align="center">
                            {data?.name}
                          </TableCell>
                          <TableCell className="capitalize whitespace-pre-wrap" align="center">
                            -
                          </TableCell>
                          <TableCell className="capitalize whitespace-pre-wrap" align="center">
                            {data?.nonVariation?.purchaseQty}
                          </TableCell>
                          <TableCell className="capitalize whitespace-pre-wrap" align="center">
                            {data?.nonVariation?.totalPurchasePrice}
                          </TableCell>
                          <TableCell className="capitalize whitespace-pre-wrap" align="center">
                            {data?.nonVariation?.unitPurchase}
                          </TableCell>
                          <TableCell className="capitalize whitespace-pre-wrap" align="center">
                            {data?.nonVariation?.sellQty}
                          </TableCell>
                          <TableCell className="capitalize whitespace-pre-wrap" align="center">
                            {data?.nonVariation?.totalSellPrice}
                          </TableCell>
                          <TableCell className="capitalize whitespace-pre-wrap" align="center">
                            {data?.nonVariation?.unitSell}
                          </TableCell>
                          <TableCell className="capitalize whitespace-pre-wrap" align="center">
                            {data?.nonVariation?.unitProfit}
                          </TableCell>
                          <TableCell className="capitalize whitespace-pre-wrap" align="center">
                            {data?.nonVariation?.totalProfit}
                          </TableCell>
                        </TableRow>
                      </>
                    )}
                  </React.Fragment>
                ))}
              <TableRow>
                <TableCell className="capitalize whitespace-pre-wrap" align="center"></TableCell>
                <TableCell className="capitalize whitespace-pre-wrap" align="center"></TableCell>
                <TableCell className="capitalize whitespace-pre-wrap" align="center"></TableCell>
                <TableCell className="capitalize whitespace-pre-wrap" align="center">
                  <strong>={totalCalcData?.tPurchaseQty}</strong>
                </TableCell>
                <TableCell className="capitalize whitespace-pre-wrap" align="center">
                  <strong>={totalCalcData?.tTotalPurchasePrice + " ৳"}</strong>
                </TableCell>
                <TableCell className="capitalize whitespace-pre-wrap" align="center">
                  {/* <strong>={totalCalcData?.tUnitPurchase}</strong> */}
                </TableCell>
                <TableCell className="capitalize whitespace-pre-wrap" align="center">
                  <strong>={totalCalcData?.tSellQty}</strong>
                </TableCell>
                <TableCell className="capitalize whitespace-pre-wrap" align="center">
                  <strong>={totalCalcData?.tTotalSellPrice + " ৳"}</strong>
                </TableCell>
                <TableCell className="capitalize whitespace-pre-wrap" align="center">
                  {/* <strong>={totalCalcData?.tUnitSell}</strong> */}
                </TableCell>
                <TableCell className="capitalize whitespace-pre-wrap" align="center">
                  {/* <strong>={totalCalcData?.tUnitProfit.toFixed(2)}</strong> */}
                </TableCell>
                <TableCell className="capitalize whitespace-pre-wrap" align="center">
                  <strong>={totalCalcData?.tTotalProfit.toFixed(2) + " ৳"} </strong>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>

        {/* <div className="px-4 flex justify-end">
          <div className="flex">
            <div>
              <p className="mb-1">Sub Total: </p>
              <p className="mb-1">Shipping:</p>
              <p className="mb-1">Discount:</p>
              <hr />
              <p>Total Amount: </p>
            </div>
            <div>
              <p className="mb-1">৳ {`12000`}</p>
              <p className="mb-1">৳ {`12000`}</p>
              <p className="mb-1">৳ {`12000`}</p>
              <hr />
              <p className="mb-1">
                <p className="mb-1">৳ {`12000`}</p>
              </p>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
});

const ProductReport = () => {
  const [productData, setProductData] = useState([]);
  const [totalCalcData, setTotalCalcData] = useState({
    tPurchaseQty: 0,
    tUnitPurchase: 0,
    tTotalPurchasePrice: 0,
    tSellQty: 0,
    tTotalSellPrice: 0,
    tUnitSell: 0,
    tUnitProfit: 0,
    tTotalProfit: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`/report/product`);
        if (res) {
          let tPurchaseQty = 0;
          let tUnitPurchase = 0;
          let tTotalPurchasePrice = 0;
          let tSellQty = 0;
          let tTotalSellPrice = 0;
          let tUnitSell = 0;
          let tUnitProfit = 0;
          let tTotalProfit = 0;

          let allProductList = res?.data?.data.map((prod) => {
            let obj = {
              ...prod,
            };

            if (prod.isVariant) {
              let updatedVariation = prod.variations.map((variant) => {
                let unitPurchase =
                  Number(variant.purchaseQty) <= 0
                    ? 0
                    : Number(variant.totalPurchasePrice) / Number(variant.purchaseQty);
                let unitSell =
                  Number(variant.sellQty) <= 0
                    ? 0
                    : Number(variant.totalSellPrice) / Number(variant.sellQty);
                let unitProfit = Number(variant.sellQty) <= 0 ? 0 : unitSell - unitPurchase;
                let totalProfit =
                  Number(variant?.totalSellPrice) - unitPurchase * (Number(variant.sellQty) || 0);

                tPurchaseQty += Number(variant.purchaseQty) || 0;
                tUnitPurchase += Number(unitPurchase.toFixed(2)) || 0;
                tTotalPurchasePrice += Number(variant.totalPurchasePrice) || 0;
                tSellQty += Number(variant.sellQty) || 0;
                tTotalSellPrice += Number(variant.totalSellPrice) || 0;
                tUnitSell += Number(unitSell.toFixed(2)) || 0;
                tUnitProfit += Number(unitProfit.toFixed(2)) || 0;
                tTotalProfit += Number(totalProfit.toFixed(2)) || 0;

                return {
                  ...variant,
                  unitPurchase: Number(unitPurchase.toFixed(2)) || 0,
                  unitSell: Number(unitSell.toFixed(2)) || 0,
                  unitProfit: Number(unitProfit.toFixed(2)) || 0,
                  totalProfit: Number(totalProfit.toFixed(2)) || 0,
                };
              });
              obj = {
                ...obj,
                variations: updatedVariation,
              };
            } else {
              let unitPurchase =
                Number(prod.nonVariation.purchaseQty) <= 0
                  ? 0
                  : Number(prod.nonVariation.totalPurchasePrice) /
                    Number(prod.nonVariation.purchaseQty);
              let unitSell =
                Number(prod.nonVariation.sellQty) <= 0
                  ? 0
                  : Number(prod.nonVariation.totalSellPrice) / Number(prod.nonVariation.sellQty);
              let unitProfit = Number(prod.nonVariation.sellQty) <= 0 ? 0 : unitSell - unitPurchase;
              let totalProfit =
                Number(prod.nonVariation?.totalSellPrice) -
                unitPurchase * (Number(prod.nonVariation.sellQty) || 0);

              tPurchaseQty += Number(prod.nonVariation.purchaseQty) || 0;
              tUnitPurchase += Number(unitPurchase.toFixed(2)) || 0;
              tTotalPurchasePrice += Number(prod.nonVariation.totalPurchasePrice) || 0;
              tSellQty += Number(prod.nonVariation.sellQty) || 0;
              tTotalSellPrice += Number(prod.nonVariation.totalSellPrice) || 0;
              tUnitSell += Number(unitSell.toFixed(2)) || 0;
              tUnitProfit += Number(unitProfit.toFixed(2)) || 0;
              tTotalProfit += Number(totalProfit.toFixed(2)) || 0;

              obj = {
                ...obj,
                nonVariation: {
                  ...obj.nonVariation,
                  unitPurchase: Number(unitPurchase.toFixed(2)) || 0,
                  unitSell: Number(unitSell.toFixed(2)) || 0,
                  unitProfit: Number(unitProfit.toFixed(2)) || 0,
                  totalProfit: Number(totalProfit.toFixed(2)) || 0,
                },
              };
            }

            return obj;
          });
          // setProductData(res?.data?.data);
          setProductData(allProductList);
          setTotalCalcData({
            tPurchaseQty,
            tUnitPurchase,
            tTotalPurchasePrice,
            tSellQty,
            tTotalSellPrice,
            tUnitSell,
            tUnitProfit,
            tTotalProfit,
          });
        }
        setIsLoading(false);
        setErrorMsg("");
      } catch (err) {
        setIsLoading(false);
        setErrorMsg(err.response.data.message);
      }
    };
    fetchData();
  }, []);

  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <>
      {!isLoading ? (
        <>
          <Card elevation={6} className="m-sm-30">
            <div className="px-4 py-2 mb-0 flex justify-end items-center">
              <IconButton
                onClick={handlePrint}
                style={{
                  backgroundColor: "#ebedec",
                  color: "#1976d2",
                  borderRadius: "4px",
                  marginRight: "8px",
                }}
              >
                <Icon>local_printshop</Icon>
              </IconButton>
            </div>
          </Card>
          {productData.length > 0 && (
            <PrintComponent
              ref={componentRef}
              productData={productData}
              totalCalcData={totalCalcData}
            />
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
      {errorMsg !== "" && (
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
  );
};

export default ProductReport;
