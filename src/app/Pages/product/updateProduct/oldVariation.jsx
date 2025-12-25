import {
  Box,
  Button,
  Icon,
  IconButton,
  MenuItem,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from "@material-ui/core";
import { Upload } from "antd";
import React, { useEffect, useState } from "react";
import { RiDeleteBin5Line } from "react-icons/ri";
import imageBasePath from "../../../../config";
import { convertImageToBase64 } from "../../../util/convertImageToBase64";
import SimpleModal from "../../../Shared/SimpleModal/SimpleModal";
import { FaExclamationTriangle } from "react-icons/fa";
import { notification } from "antd";
import axios from "../../../../axios";

const OldVariation = ({ variationData, oldVariationList, setOldVariationList }) => {
  const [fileList, setFileList] = useState([]);
  const [regularPrice, setRegularPrice] = useState(null);
  const [sellingPrice, setSellingPrice] = useState(null);
  const [discountType, setDiscountType] = useState("FLAT");
  const [discountAmount, setDiscountAmount] = useState(null);

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);


  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  useEffect(() => {
    setRegularPrice(variationData?.regularPrice);
    setSellingPrice(variationData?.sellingPrice);
    setDiscountType(variationData?.discount?.discountType);
    setDiscountAmount(variationData?.discount?.amount);

    let imagesArray = [];
    imagesArray = variationData?.images.map((img) => ({
      url: imageBasePath + "/" + img,
    }));
    setFileList(imagesArray);
  }, [variationData]);

  const imageHandler = async ({ fileList: newFileList }) => {
    setFileList(newFileList);

    let imageArray = [];
    for (let list of newFileList) {
      let baseUrl = null;
      if (list?.originFileObj) {
        baseUrl = await convertImageToBase64(list?.originFileObj);
      } else {
        baseUrl = list?.url.split(imageBasePath + "/")[1];
      }
      if (baseUrl) {
        imageArray.push(baseUrl);
      }
    }

    let updatedVariation = [];
    for (let data of oldVariationList) {
      if (data?._id === variationData?._id) {
        data.images = imageArray;
      }
      updatedVariation.push(data);
    }
    setOldVariationList(updatedVariation);
  };

  const deleteVariationHandler = async () => {
    try {
      if (oldVariationList.length === 1) {
        setDeleteId(false);
        setIsOpenModal(false);
        openNotificationWithIcon("Must have minimum one variation", "error");
        return;
      }

      let res = await axios.delete(`/product/admin/delete-variation/${deleteId}`);
      setOldVariationList(oldVariationList.filter((f) => f._id !== deleteId));
      openNotificationWithIcon(res?.data?.message, "success");
    } catch (error) {
      openNotificationWithIcon(error?.response?.data?.message, "error");
    }
    setDeleteId(false);
    setIsOpenModal(false);
  };


  // regular price
  const regularPriceHandler = (value) => {
    let updatedVariation = [];
    for (let data of oldVariationList) {
      if (data?._id === variationData?._id) {
        data.regularPrice = Number(value) || 0;
        setRegularPrice(Number(value));
      }
      updatedVariation.push(data);
    }
    setOldVariationList(updatedVariation);
  };

  // discount type
  const discountTypeHandler = (value) => {
    let updatedVariation = [];
    for (let data of oldVariationList) {
      if (data?._id === variationData?._id) {
        data.discount.discountType = value;
        setDiscountType(value);
        if (value === "FLAT" && regularPrice < discountAmount) {
          setDiscountAmount(0);
        }
      }
      updatedVariation.push(data);
    }
    setOldVariationList(updatedVariation);
  };

  // discount amount
  const discountAmountHandler = (value) => {
    let updatedVariation = [];
    for (let data of oldVariationList) {
      if (data?._id === variationData?._id) {
        data.discount.amount = Number(value) || 0;
        setDiscountAmount(Number(value));
      }
      updatedVariation.push(data);
    }
    setOldVariationList(updatedVariation);
  };

  useEffect(() => {
    if (discountType === "FLAT") {
      setSellingPrice(+regularPrice - +discountAmount);
    } else {
      let calcPrice = Math.ceil(+regularPrice - (+regularPrice * +discountAmount) / 100);
      setSellingPrice(calcPrice);
    }
  }, [regularPrice, discountAmount, discountType]);

  const closeModalHandler = () => {
    setDeleteId(false);
    setIsOpenModal(false);
  };

  return (
    <>
      <TableRow>
        <TableCell className="capitalize" align="left">
          <TextField
            label=""
            value={variationData?.attributeOpts.map((i) => i?.name).join("-")}
            aria-readonly
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
            style={{ backgroundColor: "#ebedec" }}
            // onClick={() => deleteVariationHandler(variationData?._id)}
            onClick={() => {
              setIsOpenModal(true);
              setDeleteId(variationData?._id);
            }}
            disabled={variationData?.isUsed}
          >
            {variationData?.isUsed ? (
              <RiDeleteBin5Line style={{ fontSize: "16px", color: "gray" }} />
            ) : (
              <RiDeleteBin5Line style={{ fontSize: "16px", color: "red" }} />
            )}
          </IconButton>
        </TableCell>
      </TableRow>
      <SimpleModal isShow={isOpenModal} closeModalHandler={closeModalHandler}>
        {deleteId ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <FaExclamationTriangle className="text-secondary text-32" />
              <Typography paragraph className="ml-2 text-16">
                Are you sure you want to delete these?
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
              <Button
                variant="outlined"
                color="primary"
                className="mr-4"
                onClick={deleteVariationHandler}
              >
                Yes
              </Button>
              <Button variant="outlined" onClick={() => setIsOpenModal(false)}>
                No
              </Button>
            </Box>
          </Box>
        ) : (
          ""
        )}
      </SimpleModal>
    </>
  );
};

export default OldVariation;
