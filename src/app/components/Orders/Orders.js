import React, { useState } from 'react';
import MUIDataTable from 'mui-datatables';
import Moment from 'react-moment';
import { Link } from 'react-router-dom'
import { Grow, TextField, Icon, MenuItem, IconButton, Tooltip } from '@material-ui/core';
import CustomToolbar from '../customToolbar';
import CustomToolbarPrint from '../customToolbarPrint';
import imageBasePath from '../../../config';
import axios from '../../../axios'
import { useHistory } from "react-router-dom";
import CircleLoader from "react-spinners/ClipLoader";
import { Pagination } from 'antd';
import moment from 'moment';

const Orders = (props) => {

    // loader elements
    let [color, setColor] = useState("#ffffff");
    const override = `
            display: block;
            margin: 0 auto;
            border-color: green;
            `;

    const history = useHistory();

    const getSingleOrderDetails = async value => {

        const invoiceRes = await axios.get(`/order/invoice/download/${value}`);
        if (invoiceRes?.data?.success) {
            console.log(imageBasePath + '/' + invoiceRes?.data?.data)
            // window.location.replace(imageBasePath+'/'+invoiceRes?.data?.data?.invoice)
            window.open(imageBasePath + '/' + invoiceRes?.data?.data, '_blank').focus();

        }
    }


    const { orderList, updateOrder, loading, pagination, currentPageNo, totalItems  } = props;



    const [selectedRows, setselectedRows] = useState([])
    const [selectedOrderIds, setselectedOrderIds] = useState([])



    const [printData, setPrintData] = useState([])

    let printOrders = []

    const printSelected = value => {
        console.log('value', value)
        for (let i = 0; i < value.length; i++) {
            if (orderList[value[i]?.index].selected) {
                orderList[value[i]?.index]['selected'] = false;
            } else {
                orderList[value[i]?.index]['selected'] = true;
            }
            printOrders.push(orderList[value[i].index])
            setPrintData(orderList.filter(val => val.selected == true));

        }
    }

    const selectedRow = (curRowSelected, allRowsSelected) => {
        setselectedRows(allRowsSelected)

        let orderIds = []
        allRowsSelected.map((item, index) => {
            orderIds.push(orderList[item?.index]?.orderId)
        })
        setselectedOrderIds(orderIds)

    }


    const ChangeAllStatus = async (value) => {

        const data = {
            orders: selectedOrderIds,
            status: value
        }

        try {
            let res = await axios.post('/order/update/multiple-state', data)
            if (res) {
                window.location.reload()
            }
        } catch (error) {

        }
    }


    const columns = [
        {
            name: 'orderId',
            label: 'Serial ID & Date',
            options: {
                customBodyRenderLite: (dataIndex) => (
                    <>
                        <span className="ellipsis">{orderList[dataIndex].voSerialId}</span>
                        <span className="ellipsis">{ moment(orderList[dataIndex].createdAt).format('llll') }</span>
                    </>
                ),
            },
        },

        {
            name: 'customerName',
            label: 'Customer Info',
            options: {
                customBodyRenderLite: (dataIndex) => (
                    <>
                        <span className="ellipsis">{orderList[dataIndex].customer.name}</span>
                        <span className="ellipsis">{orderList[dataIndex].customer?.phone}</span>
                    </>


                ),
            },
        },

        {
            name: 'totalProducts',
            label: 'Qty',
          
        },
        {
            name: '',
            label: 'Amount',
            options: {
                customBodyRenderLite: (dataIndex) => (
                    <div>
                       <span>{orderList[dataIndex]?.customerCharge?.TotalBill}</span>
                    </div>
                ),
            },
        },
        {
            name: 'createdBy',
            label: 'Created BY',
           
        },
        {
            name: 'state',
            label: 'Status',
            options: {
                filter: true,
                customBodyRenderLite: (dataIndex) => (
                    <div>
                        {selectedRows?.length >= 1 ?
                            null :
                            <TextField
                                className="mb-4"
                                name=""
                                label="Status"
                                variant="outlined"
                                size="small"
                                fullWidth
                                select
                                value={orderList[dataIndex]?.orderStatus[orderList[dataIndex]?.orderStatus?.length-1]?.status}
                                onChange={(event) => updateOrder(event.target.value, orderList[dataIndex]?._id)}
                            >
                                <MenuItem value={'PENDING'}> Pending </MenuItem>
                                <MenuItem value={'CONFIRM'}> Confirm </MenuItem>
                                <MenuItem value={'PROCESSING'}> Processing </MenuItem>
                                <MenuItem value={'PICKED'}> Stock out </MenuItem>
                                <MenuItem value={'SHIPPED'}> Shipped </MenuItem>
                                <MenuItem value={'DELIVERED'}> Delivered</MenuItem>
                                <MenuItem value={'CANCELED'}> Cancelled </MenuItem>

                            </TextField>
                        }
                    </div>

                )
            },
        },
        // {
        //     name: 'profitAmount',
        //     label: 'Profit',
        //     options: {
        //         customBodyRenderLite: (dataIndex) => (
        //             <span className="ellipsis">৳ {orderList[dataIndex].profitAmount}</span>
        //         ),
        //     },
        // },
        // {
        //     name: 'action',
        //     label: 'Order Details',
        //     options: {
        //         filter: false,
        //         customBodyRenderLite: (dataIndex) => (
        //             <div className="flex items-center">
        //                 <Link to={`/invoice/${orderList[dataIndex]._id}`}>
        //                     <Tooltip title="View Order">
        //                         <IconButton>
        //                             <Icon fontSize="small">
        //                                 remove_red_eye
        //                             </Icon>
        //                         </IconButton>
        //                     </Tooltip>
        //                 </Link>
        //             </div>
        //         ),
        //     },
        // },
        // {
        //     name: 'action',
        //     label: 'Order Invoice',
        //     options: {
        //         filter: false,
        //         customBodyRenderLite: (dataIndex) => (
        //             <div className="flex items-center">

        //                 <Tooltip onClick={() => getSingleOrderDetails(orderList[dataIndex]?.orderId)}>
        //                     <IconButton>
        //                         <Icon fontSize="small">
        //                             picture_as_pdf
        //                         </Icon>
        //                     </IconButton>
        //                 </Tooltip>
        //             </div>
        //         ),
        //     },
        // },
    ]



    return (
        <div style={{ width: '1550px' }}>
            {selectedRows?.length >= 1 ?

                <TextField
                    className="mb-4"
                    name=""
                    label="Change All Status"
                    variant="outlined"
                    size="small"
                    select
                    style={{ width: '300px' }}
                    // value={orderList[dataIndex]?.state}
                    onChange={(event) => ChangeAllStatus(event.target.value)}
                >
                    <MenuItem value={'PENDING'}> Pending </MenuItem>
                    <MenuItem value={'CONFIRM'}> Confirmed </MenuItem>
                    <MenuItem value={'PROCESSING'}> Processing </MenuItem>
                    <MenuItem value={'PICKED'}> Stock out </MenuItem>
                    <MenuItem value={'SHIPPED'}> Shipped </MenuItem>
                    <MenuItem value={'DELIVERED'}> Delivered</MenuItem>
                    <MenuItem value={'CANCELED'}> Cancelled </MenuItem>

                </TextField>
                : null}
            {orderList?.length > 0 ?
                <MUIDataTable
                    data={orderList}
                    columns={columns}
                    options={{
                        // onRowsSelect: data => {
                        //     printSelected(data)
                        // },
                        filterType: 'textField',
                        responsive: 'standard',
                        selectableRows: "multiple", // set checkbox for each row
                        search: false, // set search option
                        filter: false, // set data filter option
                        download: false, // set download option
                        print: false, // set print option
                        pagination: false, //set pagination option
                        viewColumns: false, // set column option
                        elevation: 0,
                        DeleteIcon: false,

                        // onChangePage:hello,
                        // selectableRows: false
                        // selectableRows: false,

                        customToolbarSelect: () => { },
                        onRowSelectionChange: selectedRow,
                        rowsPerPageOptions: [10, 20, 40, 80, 100],
                        customSearchRender: (
                            searchText,
                            handleSearch,
                            hideSearch,
                            options
                        ) => {
                            return (
                                <Grow appear in={true} timeout={300}>
                                    <TextField
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        onChange={({ target: { value } }) =>
                                            handleSearch(value)
                                        }
                                        InputProps={{
                                            style: {
                                                paddingRight: 0,
                                            },
                                            startAdornment: (
                                                <Icon
                                                    className="mr-2"
                                                    fontSize="small"
                                                >
                                                    search
                                                </Icon>
                                            ),
                                            endAdornment: (
                                                <IconButton
                                                    onClick={hideSearch}
                                                >
                                                    <Icon fontSize="small">
                                                        clear
                                                    </Icon>
                                                </IconButton>
                                            ),
                                        }}
                                    />
                                </Grow>
                            )
                        },
                    }}
                />
                :
                <div style={{ textAlign: 'center' }}>
                    {loading ?
                        null :
                        <h3>No items Found</h3>
                    }
                </div>
            }
            <div style={{ margin: '0 auto', textAlign: 'center' }}>
                <CircleLoader color={color} loading={loading} css={override} size={100} />
                {loading ?
                    <h5 style={{ marginLeft: '10px', color: 'green' }}>Please Wait...</h5>
                    :
                    <div style={{ marginTop: '50px', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{ margin: '10px 0px 10px 0px', alignItems: 'center' }}>
                            <Pagination current={currentPageNo} pageSize={20} total={totalItems} onChange={(page) => pagination(page)} showSizeChanger={false} />
                        </div>

                    </div>
                }
            </div>
        </div>
    );
};

export default Orders;