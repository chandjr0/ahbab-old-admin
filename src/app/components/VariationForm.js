import React, { useState } from 'react';
import { Formik } from 'formik'
import * as yup from 'yup'


const VariationForm = ({attributes}) => {
    const [variationOne,setVariationOne] = useState({})
    const [variatonTwo,setVariationTwo] = useState({})

    const handleSubmit = async (values, { isSubmitting }) => {
    }

    return (
        <Formik
        // initialValues={initialValues}
        onSubmit={handleSubmit}
        enableReinitialize={true}
        validationSchema={productSchema}
    >
        {attributes.map((item,index) =>
            <div>
                {index}
            </div>
        )}
            
        </Formik>
    );
};


const productSchema = yup.object().shape({
   
})

export default VariationForm;