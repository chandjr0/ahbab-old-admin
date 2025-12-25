import React, { useState, useEffect } from "react";
import ListTopbar from "./ListTopbar";
import ListView from "./ListView";
import GridView from "./GridView";
import {
  Box,
  Button,
  Card,
  CardHeader,
  Hidden,
  Typography,
} from "@material-ui/core";
import axios from "../../../../axios.js";
import { notification } from "antd";
import { Breadcrumb } from "../../../components";
import Spinner from "../../../Shared/Spinner/Spinner";
import { useParams } from "react-router-dom";
import SimpleModal from "../../../Shared/SimpleModal/SimpleModal";
import { FaExclamationTriangle } from "react-icons/fa";

const SectionProducts = () => {
  const { sectionSlug } = useParams();
  const [sliderValue, setSliderValue] = useState(25);
  const [list, setList] = useState([]);
  const [sectionData, setSectionData] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [deleteId, setDeleteId] = useState("");

  const handleSldierChange = (event, value) => {
    setSliderValue(value);
  };

  const handleViewChange = (view) => {
    setViewMode(view);
  };

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        let res = await axios.get(`section/single-fetch/${sectionSlug}`);
        setList(res?.data?.data?.products);
        setSectionData({
          name: res?.data?.data?.name,
          _id: res?.data?.data?._id,
        });
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [sectionSlug]);

  const closeModalHandler = () => {
    setDeleteId("");
    setIsOpenModal(false);
  };

  const deleteHandler = async () => {
    try {
      let res = await axios.patch(
        `/section/remove-product/${sectionData?._id}`,
        {
          productId: deleteId,
        }
      );
      setList(list.filter((i) => i._id !== deleteId));
      openNotificationWithIcon(res?.data?.message, "success");
    } catch (error) {
      openNotificationWithIcon(error?.response?.data?.message, "error");
    }
    setDeleteId("");
    setIsOpenModal(false);
  };

  return (
    <div className="m-sm-30">
      <div className="mb-sm-30">
        <Breadcrumb
          routeSegments={[
            { name: "Section", path: "/section" },
            { name: "Section view" },
          ]}
        />
      </div>
      <Card>
        <CardHeader title={`section# ${sectionData?.name}`} />
        <div className="list m-sm-30">
          <div className="mb-4">
            <ListTopbar
              viewMode={viewMode}
              handleViewChange={handleViewChange}
              handleSldierChange={handleSldierChange}
              sliderValue={sliderValue}
              list={list}
              setList={setList}
              sectionData={sectionData}
            />
          </div>
          {!isLoading ? (
            <>
              <Hidden xsDown>
                {viewMode === "list" ? (
                  <ListView
                    list={list}
                    setIsOpenModal={setIsOpenModal}
                    setDeleteId={setDeleteId}
                  />
                ) : (
                  <GridView
                    list={list}
                    sliderValue={sliderValue}
                    setIsOpenModal={setIsOpenModal}
                    setDeleteId={setDeleteId}
                  />
                )}
              </Hidden>

              <Hidden smUp>
                <GridView
                  list={list}
                  sliderValue={sliderValue}
                  setIsOpenModal={setIsOpenModal}
                  setDeleteId={setDeleteId}
                />
              </Hidden>
            </>
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                height: "auto",
                width: "auto",
                marginY: "58px",
              }}
            >
              <Spinner />
            </Box>
          )}
        </div>
      </Card>
      <SimpleModal isShow={isOpenModal} closeModalHandler={closeModalHandler}>
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
              onClick={deleteHandler}
            >
              Yes
            </Button>
            <Button variant="outlined" onClick={() => setIsOpenModal(false)}>
              No
            </Button>
          </Box>
        </Box>
      </SimpleModal>{" "}
    </div>
  );
};

export default SectionProducts;
