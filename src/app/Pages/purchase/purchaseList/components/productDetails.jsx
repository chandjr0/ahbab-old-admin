import { Box, Button, MobileStepper, Paper, Typography, useTheme } from "@material-ui/core";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import { autoPlay } from "react-swipeable-views-utils";
import SwipeableViews from "react-swipeable-views";
import imageBasePath from "../../../../../config";
const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

const ProductDetails = ({ productsData }) => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (productsData.length > 0) {
      setImages(productsData);
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
            <p className="m-0">
              <strong>{`${images[activeStep]?.productId?.name} ${
                images[activeStep]?.isVariant
                  ? ` (${images[activeStep]?.variationId?.attributeOpts
                      .map((i) => i?.name)
                      .join("-")})`
                  : ""
              }`}</strong>
            </p>
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
                    src={imageBasePath + "/" + images[activeStep]?.productId?.galleryImage[0]}
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
              <Button size="small" onClick={handleNext} disabled={activeStep === maxSteps - 1}>
                Next
                {theme.direction === "rtl" ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
              </Button>
            }
            backButton={
              <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
                {theme.direction === "rtl" ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
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
