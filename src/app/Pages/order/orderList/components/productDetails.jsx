import {
  Box,
  Button,
  MobileStepper,
  Paper,
  Typography,
  useTheme,
} from "@material-ui/core";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import { autoPlay } from "react-swipeable-views-utils";
import SwipeableViews from "react-swipeable-views";
import imageBasePath from "../../../../../config";
const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

const ProductDetails = ({ productsData, closeModalHandler }) => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (
      productsData?.products?.length > 0 ||
      productsData?.combos?.length > 0
    ) {
      const { products, combos } = productsData;

      const modifiedCombos = combos.map((combo) => ({
        ...combo,
        isCombo: true,
      }));

      const combinedArray = [...products, ...modifiedCombos];
      setImages(combinedArray);
    }
  }, [productsData]);


  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = images.length;

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
      }}
    >
      {images.length > 0 && (
        <>
          <Paper
            square
            elevation={0}
            sx={{
              display: "flex",
              alignItems: "center",
              pl: 2,
              bgcolor: "background.default",
            }}
          >
            {images[activeStep]?.isCombo ? (
              <p className="m-0">
                <strong>{`${images[activeStep]?.name}`}</strong>
              </p>
            ) : (
              <p className="m-0">
                <strong>{`${images[activeStep]?.product?.name} ${
                  images[activeStep]?.isVariant
                    ? ` (${images[activeStep]?.variationName})`
                    : ""
                }`}</strong>
              </p>
            )}
            <p>
              {images[activeStep]?.quantity} x {images[activeStep]?.price} ৳
            </p>
          </Paper>
          <AutoPlaySwipeableViews
            axis={theme.direction === "rtl" ? "x-reverse" : "x"}
            index={activeStep}
            onChangeIndex={handleStepChange}
            enableMouseEvents
          >
            {images.map((step, index) => (
              <div key={index}>
                {Math.abs(activeStep - index) <= 2 ? (
                  <Box
                    component="img"
                    sx={{
                      height: 355,
                      display: "block",
                      maxWidth: 400,
                      overflow: "hidden",
                      width: "100%",
                    }}
                    // src={imageBasePath + "/" + images[activeStep]?.product?.galleryImage[0]}
                    src={
                      !images[activeStep]?.isCombo
                        ? `${imageBasePath}/${
                            images[activeStep]?.isVariant
                              ? images[activeStep]?.variation?.images?.length
                                ? images[activeStep]?.variation?.images[0]
                                : images[activeStep]?.product?.galleryImage[0]
                              : images[activeStep]?.product?.galleryImage[0] ||
                                ""
                          }`
                        : `${imageBasePath}/${
                            images[activeStep]?.galleryImage?.length
                              ? images[activeStep]?.galleryImage[0]
                              : ""
                          }`
                    }
                    alt={step?.name}
                  />
                ) : null}
              </div>
            ))}
          </AutoPlaySwipeableViews>
          <MobileStepper
            steps={maxSteps}
            position="static"
            activeStep={activeStep}
            nextButton={
              <Button
                size="small"
                onClick={handleNext}
                disabled={activeStep === maxSteps - 1}
              >
                Next
                {theme.direction === "rtl" ? (
                  <KeyboardArrowLeft />
                ) : (
                  <KeyboardArrowRight />
                )}
              </Button>
            }
            backButton={
              <Button
                size="small"
                onClick={handleBack}
                disabled={activeStep === 0}
              >
                {theme.direction === "rtl" ? (
                  <KeyboardArrowRight />
                ) : (
                  <KeyboardArrowLeft />
                )}
                Back
              </Button>
            }
          />{" "}
        </>
      )}
    </Box>
  );
};

export default ProductDetails;
