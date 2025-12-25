import axios from '../../../axios'


export const SIGN_IN_ADMIN = 'SIGN_IN_ADMIN'

export const signInAdmin = (email,password) => (dispatch) => {

    axios.post('/admin/signin', { email, password }).then((res) => {
        console.log('res.data=============',res.data)
        dispatch({
            type: SIGN_IN_ADMIN,
            payload: res.data,
        })
    })
}


// export const getVendorList = (uid) => (dispatch) => {
//     axios.get('/api/ecommerce/get-cart-list', { data: uid }).then((res) => {
//         dispatch({
//             type: GET_VENDOR_LIST,
//             payload: res.data,
//         })
//     })
// }



