import {
    GET_VENDOR_LIST,
} from '../actions/VendorAction'

const initialState = {
    vendorList: [],
}

const VendorReducer = function (state = initialState, action) {
    switch (action.type) {
        case GET_VENDOR_LIST: {
            return {
                ...state,
                vendorList: [...action.payload],
            }
        }
        default: {
            return {
                ...state,
            }
        }
    }
}

export default VendorReducer
