import React from "react";
import { Card, Icon, Grid, Button, Avatar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import imageBasePath from "../../../../config";
import { gotoProductPage } from "../../../util/product";

const useStyles = makeStyles(({ palette, ...theme }) => ({
  gridCard: {
    "& .grid__card-overlay": {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 2,
      opacity: 0,
      transition: "all 250ms ease-in-out",
      background: "rgba(0, 0, 0, 0.67)",

      "& > div:nth-child(2)": {
        position: "absolute",
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        zIndex: -1,
      },
    },
    "& .grid__card-bottom": {
      "& .email": {
        display: "none",
      },
    },
    "&:hover": {
      "& .grid__card-overlay": {
        opacity: 1,
      },
      "& .grid__card-bottom": {
        "& .email": {
          display: "block",
        },
        "& .date": {
          display: "none",
        },
      },
    },
  },
}));

const calculateColumnPerRow = (value) => {
  if (value === 25) {
    return 2;
  }
  if (value === 50) {
    return 3;
  }
  if (value === 75) {
    return 4;
  }
  if (value === 100) {
    return 6;
  }
};

const GridView = ({ list = [], sliderValue, setIsOpenModal, setDeleteId }) => {
  const classes = useStyles();

  return (
    <div>
      <Grid container spacing={2}>
        {list.map((item, index) => (
          <Grid item sm={calculateColumnPerRow(sliderValue)} key={index}>
            <Card
              className={clsx("flex-column h-full", classes.gridCard)}
              elevation={6}
            >
              <div className="grid__card-top text-center relative">
                <Avatar
                  variant="square"
                  className="block w-full h-full"
                  src={imageBasePath + "/" + item.galleryImage[0]}
                  alt={item?.name}
                />
                <div className="grid__card-overlay flex-column">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Icon
                        fontSize="small"
                        className="mr-3 cursor-pointer text-white"
                        onClick={() => {
                          setIsOpenModal(true);
                          setDeleteId(item?._id);
                        }}
                      >
                        delete
                      </Icon>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <Button
                      variant="outlined"
                      className="text-white border-color-white"
                      onClick={() => gotoProductPage(item?.slug)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
              <div className="grid__card-bottom text-center py-2">
                <p className="m-0">{item?.name}</p>
                <small className="date text-muted">{`${item?.sellingPrice} ৳`}</small>
              </div>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default GridView;
