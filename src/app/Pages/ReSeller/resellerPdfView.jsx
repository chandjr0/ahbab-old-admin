import {
  Box,
  Card,
  Icon,
  IconButton,
  Typography,
  Grid,
  CardContent,
  Avatar,
} from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import axios from "../../../axios";
import Spinner from "../../Shared/Spinner/Spinner";
import { useParams } from "react-router-dom";
import imageBasePath from "../../../config";


const PrintComponent = React.forwardRef((props, ref) => {
  const { detailsInfo } = props;


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
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Card style={{minHeight:'300px'}}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Profile Info
                </Typography>
                <img style={{borderRadius:'10px',paddingBottom:'5px'}} width={100} height={100} src={`${imageBasePath}/${detailsInfo?.image}`} />

                <Typography style={{fontSize:'15px'}}> <span style={{fontWeight:'bold'}}>Name :</span> {detailsInfo?.name}</Typography>
                <Typography style={{fontSize:'15px'}}><span style={{fontWeight:'bold'}}>Email :</span> {detailsInfo?.email}</Typography>
                <Typography style={{fontSize:'15px'}}><span style={{fontWeight:'bold'}}>Phone :</span> {detailsInfo?.phone}</Typography>
               
                <Typography style={{fontSize:'15px'}}>
                <span style={{fontWeight:'bold'}}>WhatsApp :</span>
                   {detailsInfo?.whatsAppNo}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card style={{minHeight:'300px'}}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Payment Info
                </Typography>
                <Typography style={{fontSize:'15px'}}> <span style={{fontWeight:'bold'}}>Bank Name :</span> {detailsInfo?.paymentDetails?.bank?.bankName}</Typography>
                <Typography style={{fontSize:'15px'}}><span style={{fontWeight:'bold'}}>Branch Name :</span> {detailsInfo?.paymentDetails?.bank?.branchName}</Typography>
                <Typography style={{fontSize:'15px'}}><span style={{fontWeight:'bold'}}>Routing Number :</span> {detailsInfo?.paymentDetails?.bank?.routingNumber}</Typography>
                <Typography style={{fontSize:'15px'}}><span style={{fontWeight:'bold'}}>AC Name :</span> {detailsInfo?.paymentDetails?.bank?.accName}</Typography>
                <Typography style={{fontSize:'15px'}}><span style={{fontWeight:'bold'}}>AC Number :</span> {detailsInfo?.paymentDetails?.bank?.accNumber}</Typography>
                <Typography style={{fontSize:'15px'}}><span style={{fontWeight:'bold'}}>Bkash :</span> {detailsInfo?.paymentDetails?.bkash}</Typography>
                <Typography style={{fontSize:'15px'}}><span style={{fontWeight:'bold'}}>Nagad :</span> {detailsInfo?.paymentDetails?.nagad}</Typography>
                <Typography style={{fontSize:'15px'}}><span style={{fontWeight:'bold'}}>Rocket :</span> {detailsInfo?.paymentDetails?.rocket}</Typography>
               
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={12}>
            <Card style={{minHeight:'250px'}}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Address & Social Info
                </Typography>
                <Typography style={{fontSize:'15px'}} className="pb-2">
                <span style={{fontWeight:'bold'}}>Present Address : </span>
                   {detailsInfo?.address?.present}
                </Typography>
                <Typography style={{fontSize:'15px'}} className="pb-2">
                <span style={{fontWeight:'bold'}}>Permanent Address : </span>
                   {detailsInfo?.address?.permanent}
                </Typography>
                <Typography style={{fontSize:'15px'}} className="pb-2">
                <span style={{fontWeight:'bold'}}>Office Address : </span>
                   {detailsInfo?.address?.office}
                </Typography >
                <Typography style={{fontSize:'15px'}} className="pb-2"><span style={{fontWeight:'bold'}}>Fb Id:</span> {detailsInfo?.fbId}</Typography>
                <Typography style={{fontSize:'15px'}}>
                <span style={{fontWeight:'bold'}}> Facebook Page : </span>
                  {detailsInfo?.fbPageName}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card style={{minHeight:'300px'}}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  NID/Passport Info
                </Typography>
                <img style={{borderRadius:'10px',paddingBottom:'10px'}} width={300} height={200} src={`${imageBasePath}/${detailsInfo?.nid?.nidImage}`} />
                <Typography style={{fontSize:'15px'}}><span style={{fontWeight:'bold'}}>Nid/Password: </span> {detailsInfo?.nid?.number}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card style={{minHeight:'300px'}}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Other Info
                </Typography>
                <Typography style={{fontSize:'15px'}} className="pb-2"> <span style={{fontWeight:'bold'}}>Refer ID : </span> {detailsInfo?.referId}</Typography>
                <Typography style={{fontSize:'15px'}} className="pb-2"><span style={{fontWeight:'bold'}}>Status : </span> {detailsInfo?.status}</Typography>
                <Typography style={{fontSize:'15px'}} className="pb-2"><span style={{fontWeight:'bold'}}>Commission : </span> {detailsInfo?.commission}</Typography>
                <Typography style={{fontSize:'15px'}} className="pb-2">
                <span style={{fontWeight:'bold'}}>Website Domain : </span>
                   {detailsInfo?.website?.domain}
                </Typography>
                <Typography style={{fontSize:'15px'}}>
                <span style={{fontWeight:'bold'}}>Website URL : </span>
                   {detailsInfo?.website?.url}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>
    </div>
  );
});

const InvoicePrinting = () => {
  const { appId } = useParams();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [invoiceInfo, setInvoiceInfo] = useState({});

  useEffect(() => {
    let fetchData = async () => {
      try {
        let res = null;
        res = await axios.get(`/reseller/view/${appId}`);

        if (res) {
          setInvoiceInfo(res?.data?.data);
        }
      } catch (err) {}
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
            <div className="px-4 py-2 mb-0 flex justify-end items-right">
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
          <PrintComponent ref={componentRef} detailsInfo={invoiceInfo} />
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

export default InvoicePrinting;
