import React, { useState, useEffect } from "react";
import { Button, DialogActions, Typography } from "@mui/material";
import { notification } from "antd";

import SimpleModal from "../../../Shared/SimpleModal/SimpleModal";

const ProductVariationsModal = ({
  open,
  handleClose,
  products,
  addProduct,
}) => {
  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  const [productList, setProductList] = useState([]);

  useEffect(() => {
    setProductList(products?.comboProduct);
  }, [products]);

  const selectVariation = async (id, ind, index) => {
    setProductList((prevProductList) => {
      return prevProductList.map((product, productIndex) => {
        if (productIndex === index) {
          return {
            ...product,
            variations: product.variations.map((variation) => ({
              ...variation,
              selected: variation._id === id,
            })),
          };
        }
        return product;
      });
    });
  };

  const AddToCart = async () => {
    let allVariationsSelected = true;

    productList.forEach((product) => {
      if (
        product.isVariant &&
        !product.variations.some((variation) => variation.selected)
      ) {
        openNotificationWithIcon("Variation is Required", "warning");
        allVariationsSelected = false;
      }
    });

    if (!allVariationsSelected) {
      return;
    } else {


      let comboProducts = [];

      productList.map((item, index) => {
        comboProducts.push({
          productId: item?.productId,
          isVariant: item?.isVariant,
          variationId: item?.variations
          .filter(variation => variation.selected)
          .map(variation => variation._id),
          variationName: item.variations
          .filter(variation => variation.selected)
          .map(variation => variation.attributeOpts.map(opt => opt.name).join("-"))
          .join("-"),
        });
      });

      addProduct({
        comboId: products?._id,
        name: products?.name,
        isVariant:products?.isVariant,
        products: comboProducts,
        price: products?.sellingPrice || 0,
        quantity: 1,
        images: products?.galleryImage,
        subTotal:  products?.sellingPrice || 0
      });

      setProductList(products?.comboProduct);
      handleClose();
    }
  };


  return (
    <SimpleModal isShow={open} closeModalHandler={handleClose} width={800}>
      <h5 className="text-center">Select Variations</h5>
      {productList?.length &&
        productList?.map((item, index) => (
          <>
            {item?.isVariant ? (
              <div className="mt-5" key={index}>
                <h5>{item?.name}</h5>
                <div className="flex items-center justify-between flex-wrap ">
                  {item?.variations.map((variation, ind) => (
                    <div
                      key={ind}
                      style={{
                        border: "1px solid #ccc",
                        margin: "5px",
                        padding: "5px",
                        textAlign: "center",
                        cursor: "pointer",
                        background: variation?.selected ? "blue" : "",
                        color: variation?.selected ? "#fff" : "",
                      }}
                      onClick={() => {
                        selectVariation(variation?._id, ind, index);
                      }}
                    >
                      <div style={{ width: "200px" }}>
                        <Typography variant="subtitle1">
                          {variation?.attributeOpts
                            ?.map((i) => i?.name)
                            .join("-")}
                        </Typography>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ))}

      <DialogActions>
        <Button
          style={{ background: "blue", color: "#fff" }}
          onClick={() => AddToCart()}
        >
          ADD TO CART
        </Button>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </SimpleModal>
  );
};

export default ProductVariationsModal;
