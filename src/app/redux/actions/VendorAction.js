import axios from '../../../axios'


export const CREATE_VENDOR = 'CREATE_VENDOR'
export const GET_VENDOR_LIST = 'GET_VENDOR_LIST'

export const createVendor = (values) => (dispatch) => {
    console.log('axiosInstance',axios)
    axios.post('/vendor/create', { ...values }).then((res) => {
        console.log('res.data=============',res.data)
        dispatch({
            type: CREATE_VENDOR,
            payload: res.data,
        })
    })
}



export const getVendorList = () => (dispatch) => {
    axios.get('/vendor/view/all').then((res) => {
        console.log('vendorssssssssss',res)
        dispatch({
            type: GET_VENDOR_LIST,
            payload: res.data,
        })
    })
}



