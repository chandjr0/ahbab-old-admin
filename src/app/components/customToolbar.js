import React from 'react';
import { Icon } from '@material-ui/core';
import jsPDF from "jspdf";
import "jspdf-autotable";

const CustomToolbar = ({orderList}) => {
    const exportAsPDF = () => {
        const unit = "pt";
    const size = "A4";
    const orientation = "portrait"; 
    const doc = new jsPDF(orientation, unit, size);
    doc.setFontSize(15);

    const headers = [["Order ID", "Order Date", "Customer Name", "Phone", "Order Status", "Total Bill"]];

    const data = orderList.map(item=> [item.orderId, item.createdAt.toLocaleString('en-US', { hour: 'numeric', hour12: true }), item.customer.name, item.phone, 
        item.state == 0 ? `Pending` : item?.state == 1 ? `Processing` : item?.state == 2 ? `Send for delivery` :
        item?.state == 3 ? `Delivered` : item?.state == 4 ? `Delivered` : item?.state == 5 ? `Returned` : `Canceled`
        , item.totalBill]);

    let content = {
      startY: 50,
      head: headers,
      body: data
    };

    doc.autoTable(content);
    doc.save("orders.pdf")
    }
    return (
        <Icon style={{color: 'rgba(0, 0, 0, 0.54)',cursor: 'pointer',position: 'absolute',top: '20px'}}  onClick={() => exportAsPDF()} fontSize="small">
        picture_as_pdf
      </Icon>
    );
};

export default CustomToolbar;