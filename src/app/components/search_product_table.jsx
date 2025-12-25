import React, { useEffect, useState } from 'react'
import { ThemeProvider, makeStyles, useTheme } from '@material-ui/core/styles'
import { Button, Toolbar, AppBar } from '@material-ui/core'
import clsx from 'clsx'
import useSettings from 'app/hooks/useSettings'
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



const SearchTable = ({ isComboOffer, setisComboOffer, setselectedComboPro, setcomboPrice, comboPrice, setselectedCombo, selectedCombo, }) => {

    const [keyWord, setkeyWord] = useState('')
    const [productList, setProductList] = useState([])
    const [renderMe, setrenderMe] = useState(false)
    // const [selectedCombo, setselectedCombo] = useState([])

    const searchFuntion = async () => {
        try {
            let res = await axios.get(`/product/admin-search/${keyWord}`)
            setProductList(res?.data?.data)
        } catch (error) {

        }
    }

    const selectCombo = async (index) => {

        let selected = selectedCombo

        let datas = productList;
        console.log('......................res',datas);

        if (datas[index].comboSelect) {
            datas[index]['comboSelect'] = false

            let findOne = selected.findIndex(e => e._id == productList[index]?._id)
            if (findOne == 0) {
                selected.shift()
            } else {
                selected.splice(1, findOne)
            }

        } else {

            datas[index]['comboSelect'] = true
            selected.push(datas[index])
        }
        setselectedCombo(selected)
        setselectedComboPro(selected)
        setrenderMe(!renderMe)

    }


    const columns = [
        {
            name: 'name',
            label: 'Name',
            options: {
                filter: true,
                customBodyRenderLite: (dataIndex) => {
                    return (
                        <div className="flex items-center">
                            <Avatar

                                className="h-32 border-radius-4"
                                style={{ cursor: 'pointer', width: '100px' }}
                                src={imageBasePath + '/' + productList[dataIndex]?.thumbnail}
                                alt={productList[dataIndex].name}
                            />
                            <div className="ml-3" style={{ cursor: 'pointer' }}>
                                <h5 className="my-0 text-15">{productList[dataIndex]?.name}</h5>
                            </div>
                        </div>
                    )
                },
            },
        },

        {
            name: 'sku',
            label: 'SKU',
            options: {
                filter: true,
                customBodyRenderLite: (dataIndex) => (
                    <span className="ellipsis">
                        {productList[dataIndex]?.sku}
                    </span>
                ),
            },
        },
        {
            name: 'category',
            label: 'Category',
            options: {
                filter: true,
                customBodyRenderLite: (dataIndex) => (
                    <span className="ellipsis">
                        {productList[dataIndex]?.subsubcategory ? productList[dataIndex]?.subsubcategory?.name :
                            productList[dataIndex]?.subcategory ? productList[dataIndex]?.subcategory?.name :
                                productList[dataIndex].category?.name}
                    </span>
                ),
            },
        },


        {
            name: 'stock',
            label: 'Stock',
            options: {
                filter: true,
                customBodyRenderLite: (dataIndex) => {

                    return (
                        <small className="text-white bg-green border-radius-4 px-2 py-2px">
                            {productList[dataIndex]?.currentStock}
                        </small>
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
                    <span>৳ {productList[dataIndex]?.price}</span>
                ),
            },
        },
        {
            name: '',
            label: 'Selected',
            options: {
                filter: true,
                customBodyRenderLite: (dataIndex) => (
                    <FormControlLabel
                        control={
                            <Checkbox
                                onClick={() => selectCombo(dataIndex)}
                                checked={productList[dataIndex]?.comboSelect ? true : false}

                            />
                        }
                    />
                ),
            },
        },


    ]

    const columns2 = [
        {
            name: 'name',
            label: 'Name',
            options: {
                filter: true,
                customBodyRenderLite: (dataIndex) => {
                    return (
                        <div className="flex items-center">
                            <Avatar

                                className="h-32 border-radius-4"
                                style={{ cursor: 'pointer', width: '100px' }}
                                src={imageBasePath + '/' + selectedCombo?.[dataIndex]?.thumbnail}
                                alt={selectedCombo?.[dataIndex]?.name}
                            />
                            <div className="ml-3" style={{ cursor: 'pointer' }}>
                                <h5 className="my-0 text-15">{selectedCombo?.[dataIndex]?.name}</h5>
                            </div>
                        </div>
                    )
                },
            },
        },

        {
            name: 'sku',
            label: 'SKU',
            options: {
                filter: true,
                customBodyRenderLite: (dataIndex) => (
                    <span className="ellipsis">
                        {selectedCombo?.[dataIndex]?.sku}
                    </span>
                ),
            },
        },
        {
            name: 'category',
            label: 'Category',
            options: {
                filter: true,
                customBodyRenderLite: (dataIndex) => (
                    <span className="ellipsis">
                        {selectedCombo?.[dataIndex]?.subsubcategory ? selectedCombo?.[dataIndex]?.subsubcategory?.name :
                            selectedCombo?.[dataIndex]?.subcategory ? selectedCombo?.[dataIndex]?.subcategory?.name :
                                selectedCombo?.[dataIndex]?.category?.name}
                    </span>
                ),
            },
        },


        {
            name: 'stock',
            label: 'Stock',
            options: {
                filter: true,
                customBodyRenderLite: (dataIndex) => {

                    return (
                        <small className="text-white bg-green border-radius-4 px-2 py-2px">
                            {selectedCombo?.[dataIndex]?.currentStock}
                        </small>
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
                    <span>৳ {selectedCombo?.[dataIndex]?.price}</span>
                ),
            },
        },


    ]

    return (
        <div>
            <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <h5 className='mr-2' style={{ margin: '0px' }}>Combo Offer : </h5>
                <FormControlLabel
                    control={
                        <Checkbox
                            onClick={() => setisComboOffer(true)}
                            checked={isComboOffer ? true : false}
                            name={'Yes'}
                            value={'Yes'}
                        />
                    }
                    label={'Yes'}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            onClick={() => setisComboOffer(false)}
                            checked={isComboOffer ? false : true}
                            name={'No'}
                            value={'No'}
                        />
                    }
                    label={'No'}
                />


            </div>

            {isComboOffer ?
                <div>

                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>

                        <TextField
                            className="mt-2"
                            name="name"
                            label="Search Product..."
                            variant="outlined"
                            size="small"
                            type={'search'}
                            width={'250px'}
                            onChange={(e) => setkeyWord(e.target.value)}
                            value={keyWord}

                        />
                        <div style={{ marginTop: '10px' }}>
                            <Button onClick={() => searchFuntion()} className='btn ant-btn-block' style={{ backgroundColor: 'blue', color: '#fff', marginLeft: '5px' }}>Search</Button>
                        </div>


                    </div>
                    <MUIDataTable

                        title={''}
                        data={productList}
                        columns={columns}
                        options={{
                            filterType: 'textField',
                            responsive: 'standard',
                            selectableRows: "none", // set checkbox for each row
                            search: false, // set search option
                            filter: false, // set data filter option
                            download: false, // set download option
                            print: false, // set print option
                            pagination: stubTrue, //set pagination option
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

                    {selectedCombo?.length > 0 ?
                        <div style={{ marginTop: '30px' }}>
                            <div>
                                <h4>Selected Products</h4>

                                <TextField
                                    className="mb-4"
                                    name=""
                                    label="Combo Price here ... "
                                    variant="outlined"
                                    size="small"
                                    type={'number'}
                                    onChange={(e) => setcomboPrice(e.target.value)}
                                    value={comboPrice}

                                />
                            </div>

                            <MUIDataTable

                                title={''}
                                data={selectedCombo}
                                columns={columns2}
                                options={{
                                    filterType: 'textField',
                                    responsive: 'standard',
                                    selectableRows: "none", // set checkbox for each row
                                    search: false, // set search option
                                    filter: false, // set data filter option
                                    download: false, // set download option
                                    print: false, // set print option
                                    pagination: stubTrue, //set pagination option
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
                        : null}
                </div>
                : null}
        </div>
    )
}

export default SearchTable
