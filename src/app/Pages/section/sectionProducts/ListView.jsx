import React from "react";
import { Card, Icon, Avatar, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import imageBasePath from "../../../../config";
import { gotoProductPage } from "../../../util/product";

const useStyles = makeStyles(({ palette, ...theme }) => ({
  listCard: {
    "& .project-image": {
      height: 75,
      width: 100,
    },
    "& .card__button-group": {
      display: "none",
      position: "absolute",
      top: 0,
      bottom: 0,
      right: 0,
      zIndex: 1,
    },
    "&:hover": {
      "& .card__button-group": {
        display: "flex",
      },
    },
  },
}));

const ListView = ({ list = [], setIsOpenModal, setDeleteId }) => {
  const classes = useStyles();

  return (
    <div>
      {list.map((item, index) => (
        <Card
          className={clsx({
            [classes.listCard]: true,
            "card p-2 relative": true,
            "mb-4": index < list.length,
          })}
          key={item._id}
          elevation={3}
        >
          <Grid container alignItems="center">
            <Grid item md={10}>
              <div className="flex items-center">
                <Avatar
                  variant="square"
                  className="project-image w-full"
                  src={imageBasePath + "/" + item.galleryImage[0]}
                  alt="project"
                />
                <div className="ml-4">
                  <p className="m-0 mb-1">
                    <small>{`SKU: ${item?.sku}`}</small>
                  </p>
                  <p
                    className="m-0 mb-2"
                    onClick={() => gotoProductPage(item?.slug)}
                  >
                    {item?.name}
                  </p>
                  <div className="flex">
                    <small className="text-green">{item?.sellingPrice} ৳</small>
                    <small className="text-muted ml-6">
                      {item?.isVariant
                        ? item?.variations.map((variant, idx) => {
                            return `${variant?.attributeOpts
                              .map((option) => option?.name)
                              .join("-")}(${variant?.stock})${
                              item?.variations.length - 1 > idx ? ", " : ""
                            }`;
                          })
                        : item?.nonVariation?.stock}
                    </small>
                  </div>
                </div>
              </div>
            </Grid>

            <Grid item md={2}>
              <div className="card__button-group items-center bg-paper">
                <Icon
                  fontSize="small"
                  className="mr-4 text-muted cursor-pointer"
                  onClick={() => {
                    setIsOpenModal(true);
                    setDeleteId(item?._id);
                  }}
                >
                  delete
                </Icon>
              </div>
            </Grid>
          </Grid>
        </Card>
      ))}
    </div>
  );
};

export default ListView;
