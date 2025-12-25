import React from "react";
import { Grid, Card, Icon, Fab } from "@material-ui/core";
import { BsPeopleFill, BsCart4 } from "react-icons/bs";
import { FaRegMoneyBillAlt } from "react-icons/fa";
import { GiTakeMyMoney } from "react-icons/gi";
import { isMobile } from "react-device-detect";

const StatCards2 = ({ dataList }) => {
  return (
    <Grid container spacing={3} className="mb-6">
      <Grid item xs={isMobile ? 4 : 12} md={2}>
        <Card elevation={3} className="p-4">
          <div className="flex items-center">
            {isMobile ? null : (
              <Fab
                size="medium"
                className="bg-light-green circle-44 box-shadow-none"
              >
                <BsPeopleFill className="text-green" />
              </Fab>
            )}
            <h6 className="font-medium text-green m-0 ml-3">Active Customer</h6>
          </div>
          <div className="pt-4 flex items-center">
            <h5 className="m-0 text-muted flex-grow">
              {dataList?.totalCustomers || 0}
            </h5>
          </div>
        </Card>
      </Grid>

      <Grid item xs={isMobile ? 4 : 12} md={2}>
        <Card elevation={3} className="p-4">
          <div className="flex items-center">
            {isMobile ? null : (
              <Fab
                size="medium"
                className="bg-light-primary circle-44 box-shadow-none overflow-hidden"
              >
                <BsCart4 className="text-primary" />
              </Fab>
            )}
            <h6 className="font-medium text-primary m-0 ml-3">
              Premature Commission
            </h6>
          </div>
          <div className="pt-4 flex items-center">
            <h5 className="m-0 text-muted flex-grow">
              {dataList?.totalPrematurePay || 0} TK
            </h5>
          </div>
        </Card>
      </Grid>
      <Grid item xs={isMobile ? 4 : 12} md={2}>
        <Card elevation={3} className="p-4">
          <div className="flex items-center">
            {isMobile ? null : (
              <Fab
                size="medium"
                className="bg-light-primary circle-44 box-shadow-none overflow-hidden"
              >
                <BsCart4 className="text-primary" />
              </Fab>
            )}
            <h6 className="font-medium text-primary m-0 ml-3">
              Pending Payment
            </h6>
          </div>
          <div className="pt-4 flex items-center">
            <h5 className="m-0 text-muted flex-grow">
              {dataList?.totalPendingPay || 0} TK
            </h5>
          </div>
        </Card>
      </Grid>
      <Grid item xs={isMobile ? 4 : 12} md={2}>
        <Card elevation={3} className="p-4">
          <div className="flex items-center">
            {isMobile ? null : (
              <Fab
                size="medium"
                className="bg-light-secondary circle-44 box-shadow-none"
              >
                <FaRegMoneyBillAlt className="text-secondary" />
              </Fab>
            )}
            <h6 className="font-medium text-secondary m-0 ml-3">
              Processing Payment
            </h6>
          </div>
          <div className="pt-4 flex items-center">
            <h5 className="m-0 text-muted flex-grow">{`${
              dataList?.totalProcessingPay || 0
            } TK`}</h5>
          </div>
        </Card>
      </Grid>

      <Grid item xs={isMobile ? 4 : 12} md={2}>
        <Card elevation={3} className="p-4">
          <div className="flex items-center">
            {isMobile ? null : (
              <Fab
                size="medium"
                className="bg-light-warning circle-44 box-shadow-none overflow-hidden"
              >
                <GiTakeMyMoney className="text-warning" />
              </Fab>
            )}
            <h6 className="font-medium text-warning m-0 ml-3">Paid Payment</h6>
          </div>
          <div className="pt-4 flex items-center">
            <h5 className="m-0 text-muted flex-grow">{`${
              dataList?.totalPaidPay.toLocaleString() || 0
            } TK`}</h5>
          </div>
        </Card>
      </Grid>
    </Grid>
  );
};

export default StatCards2;
