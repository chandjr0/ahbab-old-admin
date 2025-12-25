import {
  Card,
  Divider,
  Icon,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  Box,
  Typography,
} from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import moment from "moment";
import imageBasePath from "../../../../config";
import axios from "../../../../axios";
import Spinner from "../../../Shared/Spinner/Spinner";

const PrintComponent = React.forwardRef((props, ref) => {
  const { purchaseData,settingsData } = props;

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
            margin: 48px 28px;
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
              padding: 13px 8px !important; 
            }

          }
        
          `}
      </style>

      <div className="page">
        <img src={`${imageBasePath}/${settingsData?.logoImg}`} alt="logo" height="60px" className="mx-4 mb-2" />
        <div className="viewer__order-info px-4 mb-4 flex justify-between">
          <div>
            <h5 className="mb-2">Purchase Info</h5>
            <p className="mb-0">
              <strong>Purchase Number # </strong> {purchaseData?.serialId}
            </p>
            <p className="mb-0">
              <strong>Purchase date: </strong> {moment(purchaseData?.createdAt).format("lll")}
            </p>
            <p className="mb-0">
              <strong>Purchase Status :</strong>{" "}
              {purchaseData?.purchaseStatus[purchaseData?.purchaseStatus.length - 1].status}
            </p>
          </div>
          <div className="text-right">
            <h5 className="font-normal capitalize mb-2">
              <strong>{purchaseData?.pageId?.name}</strong>
            </h5>
            <h5 className="mb-2">Receive From</h5>
            <p className="m-0">{purchaseData?.supplierId?.name}</p>
            <p className="mb-0">{purchaseData?.supplierId?.phone}</p>
            <p className="mb-0 whitespace-pre-wrap">{purchaseData?.supplierId?.address}</p>
          </div>
        </div>

        <Divider className="mb-4" />

        <Card className="mb-4 px-4" elevation={0}>
          <Table>
            <TableHead>
              <TableRow className="px-4">
                <TableCell>Sku</TableCell>
                <TableCell align="center">Image</TableCell>
                <TableCell align="center">Item Name</TableCell>
                <TableCell align="center">Unit Price</TableCell>
                <TableCell align="center">Quantity</TableCell>
                <TableCell align="center">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {purchaseData?.products?.map((data, idx) => (
                <TableRow key={idx}>
                  <TableCell>{data?.productId?.sku}</TableCell>
                  <TableCell align="center">
                    <Avatar
                      className="border-radius-4 mx-auto"
                      style={{ cursor: "pointer", width: "58px" }}
                      src={imageBasePath + "/" + data?.productId?.galleryImage[0]}
                      alt={data?.name}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <p>
                      {data?.productId?.name}
                      {data?.isVariant &&
                        ` (${data?.variationId?.attributeOpts.map((i) => i?.name).join("-")})`}
                    </p>
                  </TableCell>
                  <TableCell align="center">{data?.price}</TableCell>
                  <TableCell align="center">{data?.quantity}</TableCell>
                  <TableCell align="center">{data?.price * data?.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <div className="px-4 flex justify-end">
          <div className="flex">
            <div className="pr-12">
              <p>
                <strong>Total Bill:</strong>
              </p>
            </div>
            <div>
              <p className="mb-4">
                <strong>৳ {purchaseData?.totalBill}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const PurchaseView = () => {
  const { serialId } = useParams();

  const [purchaseData, setPurchaseData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [settingsData, setSettingsData] = useState(null);


  useEffect(() => {
    if (serialId) {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          const res = await axios.get(`/purchase/fetch-single/${serialId}`);
          if (res) {
            setPurchaseData(res?.data?.data);
          }
          setIsLoading(false);
          setErrorMsg("");
        } catch (err) {
          setIsLoading(false);
          setErrorMsg(err.response.data.message);
        }
      };
      fetchData();
      const settings = async () => {
        try {
          setIsLoading(true);
          const res = await axios.get(`/setting/admin/view`);
          if (res) {
            setSettingsData(res?.data?.data);
          }
          setIsLoading(false);
          setErrorMsg("");
        } catch (err) {
          setIsLoading(false);
          setErrorMsg(err.response.data.message);
        }
      };
      settings();
    }
  }, [serialId]);

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
          <PrintComponent ref={componentRef} purchaseData={purchaseData} settingsData={settingsData} />
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

export default PurchaseView;
