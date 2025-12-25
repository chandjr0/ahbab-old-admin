import React, { useState, useEffect } from 'react'
import { Fab, Icon, Button } from '@material-ui/core'

const SingleImageUpload = ({file, setFile, preview, setPreview, message}) => {
  

    const handleFileSelect = (event) => {
        setFile(event.target.files[0])
    }
    // console.log('file',file)

    const handleSingleRemove = () => {
        setFile(null)
        setPreview(null)
    }
    // console.log('preview',preview)
    useEffect(() => {
        if (!file) {
            setPreview(null)
            return
        } else { const objectUrl = URL.createObjectURL(file)
        setPreview(objectUrl)
        return () => URL.revokeObjectURL(objectUrl)}
    }, [file])


  
    return (
        <div className="upload-form  mb-6">
                <div className="flex flex-wrap">
                    <label htmlFor="upload-single-file">
                        <Fab
                            className="capitalize"
                            color="primary"
                            component="span"
                            variant="extended"
                        >
                            <div className="flex items-center">
                                <Icon className="pr-8">cloud_upload</Icon>
                                <span>Upload Image</span>
                            </div>
                        </Fab>
                         <br/>
                    <span style={{color: 'red',fontWeight: '500'}}>{message ? message : `* Thumbnail maximum height x width (188px x 188px)`}</span>
                    </label>
                   
                    <input
                        className="hidden"
                        onChange={handleFileSelect}
                        id="upload-single-file"
                        type="file"
                        multiple={true}
                    />
                    
                </div>
                {preview && <>
                <div style={{border: '1px solid #ccc', margin: '20px 20px 0 0', padding: '5px', display: 'inline-block', borderRadius: '4px' }}>
                    <img height='100px' src={preview} alt='Preview Thumbnail' />
                    
                </div>
                <Button
                        variant="contained"
                        size="small"
                        className="bg-error mt-2"
                        onClick={() =>
                            handleSingleRemove()
                        }
                    >
                        Remove
                    </Button>
                    </>
}
               
        </div>
    )
}

export default SingleImageUpload
