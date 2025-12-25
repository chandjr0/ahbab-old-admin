import React, { useState, useEffect } from "react";
import { Icon } from "@material-ui/core";
import styles from "./ImageUpload.module.css";

const ImageUpload = ({ selectedFile, setSelectedFile }) => {
  const [preview, setPreview] = useState();

  // create a preview as a side effect, whenever selected file is changed
  useEffect(() => {
    if (!selectedFile) {
      setPreview(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
    // free memory when ever this component is unmounted
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const onSelectFile = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(undefined);
      return;
    }
    // I've kept this example simple by using the first image instead of multiple
    setSelectedFile(e.target.files[0]);
  };

  return (
    <div className={styles.image__upload}>
      <label for="file-input">
        <Icon>publish</Icon>
        <span>
          Upload Image <span style={{ color: "red" }}> *</span>
        </span>
      </label>

      <input id="file-input" type="file" onChange={onSelectFile} />
      <div>
        {selectedFile && (
          <img
            style={{ height: "100px", width: "auto", marginBottom: "10px" }}
            src={preview}
            alt="Preview Img"
          />
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
