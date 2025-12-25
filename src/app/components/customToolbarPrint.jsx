import React from 'react';
import { Icon } from '@material-ui/core';
import jsPDF from "jspdf";
import "jspdf-autotable";
import axios from '../../axios';
import imageBasePath from '../../config';

const CustomToolbarPrint = ({printData}) => {
    // console.log('printData',printData)
    // const exportAsPDF = () => {
    // const unit = "pt";
    // const size = "A4";
    // const orientation = "portrait"; 
    // const doc = new jsPDF(orientation, unit, size);
    // doc.setFontSize(15);

    // const headers = [["Order ID", "Order Date", "Customer Name", "Phone", "Order Status", "Total Bill"]];

    // const data = orderList.map(item=> [item.orderId, item.createdAt.toLocaleString('en-US', { hour: 'numeric', hour12: true }), item.customer.name, item.phone, 
    //     item.state == 0 ? `Pending` : item?.state == 1 ? `Processing` : item?.state == 2 ? `Send for delivery` :
    //     item?.state == 3 ? `Delivered` : item?.state == 4 ? `Delivered` : item?.state == 5 ? `Returned` : `Canceled`
    //     , item.totalBill]);

    // let content = {
    //   startY: 50,
    //   head: headers,
    //   body: data
    // };

    // doc.autoTable(content);
    // doc.save("orders.pdf")
    // }
    const getMultipleOrderInvoice = async () => {
      let orderArray = printData?.map(order => order?.orderId);
      const multipleRes = await axios.post(`order/invoice/multiple/download`,{orderAr: orderArray});
      // console.log('mullllllll',multipleRes);
      if(multipleRes?.data?.success){
        // console.log('value',imageBasePath+'/'+multipleRes?.data?.data)
        window.open(imageBasePath+'/'+multipleRes?.data?.data, '_blank').focus();

      }
    }
    return (
      <span style={{
        backgroundColor: 'rgba(0, 0, 0, 0.54)',
        cursor: 'pointer',color: '#fff',
        padding: '10px',
        borderRadius: '100%',
        display: 'grid',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '5px'
        }}
        onClick={() => getMultipleOrderInvoice()}>        
        <Icon 
        style={{}}   fontSize="small">
        picture_as_pdf
      </Icon>
      </span>
    );
};

export default CustomToolbarPrint;