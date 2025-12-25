import React, { useEffect, useState } from 'react'
import { ThemeProvider, makeStyles, useTheme } from '@material-ui/core/styles'
import { Button, Toolbar, AppBar } from '@material-ui/core'
import clsx from 'clsx'
import useSettings from '../hooks/useSettings'
import MUIDataTable from 'mui-datatables'
import {

    Card,
    Divider,
    Grid,
    Icon,
    MenuItem,
    TextField,
    IconButton,
    CircularProgress,
    Avatar,
    Grow
} from '@material-ui/core'
import imageBasePath from '../../config'
import Checkbox from '@mui/material/Checkbox';
import { FormControlLabel } from '@material-ui/core';
import axios from '../../axios'
import { stubTrue } from 'lodash'



const SearchTable = ({products}) => {

    const [keyWord, setkeyWord] = useState('')
    // const [productList, setProductList] = useState([products])
    const [renderMe, setrenderMe] = useState(false)
    // const [selectedCombo, setselectedCombo] = useState([])



    const columns = [
        {
            name: 'name',
            label: 'Name',
            options: {
                filter: true,
                customBodyRenderLite: (dataIndex) => {
                    return (
                        <div className="flex items-center">
                            {/* <Avatar

                                className="h-32 border-radius-4"
                                style={{ cursor: 'pointer', width: '100px' }}
                                src={imageBasePath + '/' + products[dataIndex]?.thumbnail}
                                alt={products[dataIndex].name}
                            /> */}
                            <div className="ml-3" style={{ cursor: 'pointer' }}>
                                <h5 style={{  whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden',width:'100px' }} className="my-0 text-15">{products[dataIndex]?.name}</h5>
                            </div>
                        </div>
                    )
                },
            },
        },


        {
            name: 'price',
            label: 'Price',
            options: {
                filter: true,
                customBodyRenderLite: (dataIndex) => (
                    <span>৳ {products[dataIndex]?.price}</span>
                ),
            },
        },
        {
            name: 'quantity',
            label: 'Qty',
           
        },
        {
            name: '',
            label: 'Sub Total',
            options: {
                filter: true,
                customBodyRenderLite: (dataIndex) => (
                    <span>৳ {(products[dataIndex]?.price) * products[dataIndex]?.quantity}</span>
                ),
            },
        },
        {
            name: '',
            label: '',
            options: {
                filter: true,
                customBodyRenderLite: (dataIndex) => (
                    <IconButton>
                        <Icon>delete</Icon>
                    </IconButton>
                ),
            },
        },

    ]



    return (
        <div>
            <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>

            </div>

            <div>

                <MUIDataTable

                    title={''}
                    data={products}
                    columns={columns}
                    options={{
                        filterType: 'textField',
                        responsive: 'standard',
                        selectableRows: "none", // set checkbox for each row
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
                        // onRowsSelect: selectedRow,
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


            </div>

        </div>
    )
}

export default SearchTable
