import React from "react";
import { Grid, Card, IconButton, Icon } from "@material-ui/core";
import { VscServerProcess } from "react-icons/vsc";
import { TiCancel } from "react-icons/ti";
import { FaHandHoldingUsd, FaTruckPickup, FaShippingFast } from "react-icons/fa";
import { GiConfirmed, GiReturnArrow } from "react-icons/gi";
import { RiRefund2Line } from "react-icons/ri";
import { MdOutlinePendingActions, MdOutlineDownloadDone } from "react-icons/md";

const StatCard3 = ({ orderDataList }) => {

  return (
    <div>
      <Grid container spacing={3}>
        {orderDataList?.length > 0 &&
          orderDataList?.map((data, idx) => (
            <Grid key={idx} item md={3} sm={6} xs={12}>
              <Card elevation={3} className="p-5 flex">
                <div>
                  <IconButton size="small" className="p-2 bg-light-gray">
                    {data?.status === "ALL" && <Icon className="text-muted">shopping_cart</Icon>}
                    {data?.status === "CANCELED" && <TiCancel className="text-muted" />}
                    {data?.status === "PENDING" && (
                      <MdOutlinePendingActions className="text-muted" />
                    )}
                    {data?.status === "HOLD" && <FaHandHoldingUsd className="text-muted" />}
                    {data?.status === "CONFIRM" && <GiConfirmed className="text-muted" />}
                    {data?.status === "PROCESSING" && <VscServerProcess className="text-muted" />}
                    {data?.status === "PICKED" && <FaTruckPickup className="text-muted" />}
                    {data?.status === "SHIPPED" && <FaShippingFast className="text-muted" />}
                    {data?.status === "DELIVERED" && (
                      <MdOutlineDownloadDone className="text-muted" />
                    )}
                    {data?.status === "RETURNED" && <GiReturnArrow className="text-muted" />}
                    {data?.status === "REFUND" && <RiRefund2Line className="text-muted" />}
                  </IconButton>
                </div>
                <div className="ml-4">
                  <h5 className="mt-1 font-medium">
                   
                      {data?.status === "PENDING"? "PROCESSING"  : data?.status === "CONFIRM"? 'INVOICED': data?.status === "SHIPPED"? 'SHIPPING' : data?.status}
                  </h5>
                  <h5 className="m-0 mb-2 text-green font-medium">{data?.order}</h5>
                  <p className="text-muted m-0">{`${data?.price.toLocaleString()} TK`}</p>
                  <p className="text-muted m-0"><strong>Profit: </strong>{`${data?.profitPrice.toLocaleString()} TK`}</p>
                </div>
              </Card>
            </Grid>
          ))}
      </Grid>
    </div>
  );
};

export default StatCard3;
