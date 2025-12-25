import { Icon, IconButton, MenuItem, TableCell, TableRow, TextField } from "@material-ui/core";
import { Upload } from "antd";
import React, { useEffect, useState } from "react";
import { convertImageToBase64 } from "../../../util/convertImageToBase64";
import { RxCross2 } from "react-icons/rx";

const Variation = ({ variationData, variationList, setVariationList }) => {
  const [fileList, setFileList] = useState([]);
  const [stock, setStock] = useState(null);
  const [unitPrice, setUnitPrice] = useState(null);
  const [regularPrice, setRegularPrice] = useState(null);
  const [sellingPrice, setSellingPrice] = useState(null);
  const [discountType, setDiscountType] = useState("FLAT");
  const [discountAmount, setDiscountAmount] = useState(null);

  useEffect(() => {
    setStock(variationData.stock);
    setUnitPrice(variationData.unitPrice);
    setRegularPrice(variationData.regularPrice);
    setSellingPrice(variationData.sellingPrice);
    setDiscountType(variationData.discountType);
    setDiscountAmount(variationData.discountAmount);

    console.log("variationData: ", variationData);
  }, [variationData]);

  const imageHandler = async ({ fileList: newFileList }) => {
    setFileList(newFileList);

    let imageArray = [];
    for (let list of newFileList) {
      let baseUrl = await convertImageToBase64(list.originFileObj);
      imageArray.push(baseUrl);
    }

    let updatedVariation = [];
    for (let data of variationList) {
      if (data?.uid === variationData?.uid) {
        data.images = imageArray;
      }
      updatedVariation.push(data);
    }
    setVariationList(updatedVariation);
  };

  const deleteVariationHandler = (id) => {
    setVariationList(variationList.filter((f) => f.uid !== id));
  };

  // stock
  const stockChangeHandler = (value) => {
    let updatedVariation = [];
    for (let data of variationList) {
      if (data?.uid === variationData?.uid) {
        data.stock = Number(value) || 0;
        setStock(Number(value));
      }
      updatedVariation.push(data);
    }
    setVariationList(updatedVariation);
  };

  // unit price
  const unitPriceHandler = (value) => {
    let updatedVariation = [];
    for (let data of variationList) {
      if (data?.uid === variationData?.uid) {
        data.unitPrice = Number(value) || 0;
        setUnitPrice(Number(value));
      }
      updatedVariation.push(data);
    }
    setVariationList(updatedVariation);
  };

  // regular price
  const regularPriceHandler = (value) => {
    let updatedVariation = [];
    for (let data of variationList) {
      if (data?.uid === variationData?.uid) {
        data.regularPrice = Number(value) || 0;
        setRegularPrice(Number(value));
      }
      updatedVariation.push(data);
    }
    setVariationList(updatedVariation);
  };

  // discount type
  const discountTypeHandler = (value) => {
    let updatedVariation = [];
    for (let data of variationList) {
      if (data?.uid === variationData?.uid) {
        data.discountType = value;
        setDiscountType(value);
        if (value === "FLAT" && regularPrice < discountAmount) {
          setDiscountAmount(0);
        }
      }
      updatedVariation.push(data);
    }
    setVariationList(updatedVariation);
  };

  // discount amount
  const discountAmountHandler = (value) => {
    let updatedVariation = [];
    for (let data of variationList) {
      if (data?.uid === variationData?.uid) {
        data.discountAmount = Number(value) || 0;
        setDiscountAmount(Number(value));
      }
      updatedVariation.push(data);
    }
    setVariationList(updatedVariation);
  };

  useEffect(() => {
    if (discountType === "FLAT") {
      setSellingPrice(+regularPrice - +discountAmount);
    } else {
      let calcPrice = Math.ceil(+regularPrice - (+regularPrice * +discountAmount) / 100);
      setSellingPrice(calcPrice);
    }
  }, [regularPrice, discountAmount, discountType]);

  return (
    <TableRow>
      <TableCell className="capitalize" align="left">
        <TextField
          label=""
          value={variationData?.name}
          aria-readonly
          size="medium"
          variant="outlined"
          fullWidth
        />
      </TableCell>
      {/* <TableCell className="capitalize" align="left">
        <TextField
          type="number"
          inputProps={{ min: 0 }}
          onKeyPress={(event) => {
            if (event?.key === "-" || event?.key === "+") {
              event.preventDefault();
            }
          }}
          label=""
          placeholder="stock"
          value={stock}
          onChange={(e) => stockChangeHandler(e.target.value)}
          size="medium"
          variant="outlined"
          fullWidth
        />
      </TableCell> */}
      {/* <TableCell className="capitalize" align="left">
        <TextField
          type="number"
          inputProps={{ min: 0 }}
          onKeyPress={(event) => {
            if (event?.key === "-" || event?.key === "+") {
              event.preventDefault();
            }
          }}
          label=""
          placeholder="unit price"
          value={unitPrice}
          onChange={(e) => unitPriceHandler(e.target.value)}
          size="medium"
          variant="outlined"
          fullWidth
        />
      </TableCell> */}
      <TableCell className="capitalize" align="left">
        <TextField
          type="number"
          inputProps={{ min: 0 }}
          onKeyPress={(event) => {
            if (event?.key === "-" || event?.key === "+") {
              event.preventDefault();
            }
          }}
          label=""
          placeholder="regular price"
          value={regularPrice}
          onChange={(e) => regularPriceHandler(e.target.value)}
          size="medium"
          variant="outlined"
          fullWidth
        />
      </TableCell>
      <TableCell className="capitalize" align="left">
        <TextField
          label=""
          placeholder="type"
          size="medium"
          variant="outlined"
          fullWidth
          select
          value={discountType}
          onChange={(e) => discountTypeHandler(e.target.value)}
        >
          <MenuItem value="FLAT">Flat</MenuItem>
          <MenuItem value="PERCENT">%(per)</MenuItem>
        </TextField>
      </TableCell>
      <TableCell className="capitalize" align="left">
        <TextField
          type="number"
          inputProps={{ min: 0 }}
          onKeyPress={(event) => {
            if (event?.key === "-" || event?.key === "+") {
              event.preventDefault();
            }
          }}
          label=""
          placeholder="amount"
          value={discountAmount}
          onChange={(e) => discountAmountHandler(e.target.value)}
          size="medium"
          variant="outlined"
          fullWidth
        />
      </TableCell>
      <TableCell className="capitalize" align="left">
        <TextField
          type="number"
          inputProps={{ min: 0 }}
          onKeyPress={(event) => {
            if (event?.key === "-" || event?.key === "+") {
              event.preventDefault();
            }
          }}
          label=""
          placeholder="sale price"
          value={sellingPrice}
          InputProps={{
            readOnly: true,
            min: 0,
          }}
          size="medium"
          variant="outlined"
          fullWidth
        />
      </TableCell>
      <TableCell className="capitalize" align="left">
        <Upload listType="picture-card" fileList={fileList} onChange={imageHandler}>
          {fileList.length >= 2 ? null : (
            <span>
              <Icon style={{ color: "gray" }}>photo_size_select_actual</Icon>
            </span>
          )}
        </Upload>
      </TableCell>
      <TableCell className="capitalize" align="left">
        <IconButton
          style={{ backgroundColor: "#ebedec", color: "red" }}
          onClick={() => deleteVariationHandler(variationData.uid)}
        >
          <RxCross2
            style={{
              fontSize: "16px",
              color: "red",
            }}
          />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default Variation;
