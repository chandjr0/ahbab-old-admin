import React, { useEffect, useState } from "react";
import { Breadcrumb } from "../../components/index";
import "react-loading-skeleton/dist/skeleton.css";
import {
  IconButton,
  TableCell,
  TableRow,
  Table,
  TableHead,
  TableBody,
  Grid,
  Typography,
  Box,
  Card,
  Button,
  FormControlLabel,
  Avatar,
  CardHeader,
  TextField,
} from "@material-ui/core";
import axios from "../../../axios";
import Spinner from "../../Shared/Spinner/Spinner";
import { useHistory } from "react-router-dom";
import SimpleModal from "../../Shared/SimpleModal/SimpleModal";
import { notification } from "antd";
import IOSSwitch from "../../Shared/Forms/iosSwitch";
import imageBasePath from "../../../config";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBin3Line } from "react-icons/ri";
import { IoMdAddCircle } from "react-icons/io";
import { FaExclamationTriangle } from "react-icons/fa";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

const BrandList = () => {
  const history = useHistory();
  const [dataList, setDataList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [openImgData, setOpenImgData] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [reset, setReset] = useState(false); // New state for resetting

  // Input change and filter data handler
  const handleSearchChange = (e) => {
    const inputValue = e.target.value;
    setSearchValue(inputValue);
    const filter = dataList.filter((category) => {
      return category.name.toLowerCase().includes(inputValue.toLowerCase());
    });
    setFilteredData(filter);
  };

  console.log("filteredData",filteredData); 
  useEffect(() => {
    setFilteredData(dataList);
  }, [dataList]);

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        let res = await axios.get("/category/fetch-all");

        let categoryObj = [];
        for (let parent of res?.data?.data) {
          categoryObj.push({
            _id: parent?._id,
            name: parent?.name,
            slug: parent?.slug,
            image: parent?.image,
            isFeatured: parent?.isFeatured,
            isDisabled: parent?.isDisabled,
            parentName: "",
            resellerDetails: parent?.resellerDetails,
            imageForCategoryProduct: parent?.imageForCategoryProduct,
            imageForHomePage: parent?.imageForHomePage,
            featuredSerial: parent?.featuredSerial,
          });

          for (let child of parent?.children) {
            categoryObj.push({
              _id: child?._id,
              name: child?.name,
              slug: child?.slug,
              image: child?.image,
              isFeatured: child?.isFeatured,
              isDisabled: child?.isDisabled,
              parentName: parent?.name,
              resellerDetails: child?.resellerDetails,
              imageForCategoryProduct: child?.imageForCategoryProduct,
              imageForHomePage: child?.imageForHomePage,
              featuredSerial: child?.featuredSerial,
            });
          }
        }
        setDataList(categoryObj);
        console.log("From category object: ", categoryObj);
        setIsLoading(false);
        setErrorMsg("");
      } catch (err) {
        setIsLoading(false);
        setErrorMsg(err?.response?.data?.message);
      }
    };
    fetchData();
  }, []);

  const closeModalHandler = () => {
    setDeleteId(false);
    setIsOpenModal(false);
    setOpenImgData(null);
  };

  const deleteHandler = async () => {
    try {
      let res = await axios.delete(`/category/delete/${deleteId}`);
      setDataList(dataList.filter((i) => i._id !== deleteId));
      openNotificationWithIcon(res?.data?.message, "success");
    } catch (error) {
      openNotificationWithIcon(error?.response?.data?.message, "error");
    }
    setDeleteId(false);
    setIsOpenModal(false);
  };

  const featuredUpdateHandler = async (data, serial) => {
    try {
      const createRes = await axios.patch(`/category/update/${data?._id}`, {
        parentId: data?.parentId,
        name: data?.name,
        isDisabled: data?.isDisabled,
        isFeatured: data?.featureOn,
        image: data?.image,
        imageForCategoryProduct: data?.imageForCategoryProduct,
        imageForHomePage: data?.imageForHomePage,
        featuredSerial: serial, // Send the updated serial to the server
      });

      // Update the dataList state to reflect the changes locally
      let updatedData = dataList.map((list) => {
        if (list._id === data._id) {
          list.isFeatured = data?.featureOn;
          list.featuredSerial = serial; // Update the serial as well
        }
        return list;
      });

      // Update the state
      setDataList(updatedData);

      if (createRes?.data?.success) {
        openNotificationWithIcon("Category status updated", "success");
      }

      setIsLoading(false);
    } catch (error) {
      openNotificationWithIcon(error?.response?.data?.message, "error");
      setIsLoading(false);
    }
  };

  const openImgHandler = (data) => {
    setIsOpenModal(true);
    setOpenImgData(data);
  };

  const [serials, setSerials] = React.useState({});
  const [resetSerials, setResetSerials] = useState({});

  // Handle dropdown value change
  const handleChange = (event, index, data) => {
    const serial = event.target.value;
  
    // Skip validation if serial is 0
    if (serial === 0) {
      // Update the serials state directly
      setSerials((prev) => ({
        ...prev,
        [index]: serial,
      }));
  
      // Call the update handler
      featuredUpdateHandler(data, serial);
  
      // Reset the specific index in resetSerials
      setResetSerials((prev) => ({ ...prev, [index]: false }));
      return;
    }
  
    // Check for duplicate serial in allowed range (1-5)
    const isDuplicate = filteredData?.some(
      (item) => item?.featuredSerial === serial && item?._id !== data?._id
    );
  
  
    if (isDuplicate) {
      // Show a toast notification
      openNotificationWithIcon(`Serial ${serial} is already assigned to another item.`, "error");

      return; // Exit without updating the state
    }
  
    // Update the serials state
    setSerials((prev) => ({
      ...prev,
      [index]: serial,
    }));
  
    // Call the update handler
    featuredUpdateHandler(data, serial);
  
    // Reset the specific index in resetSerials
    setResetSerials((prev) => ({ ...prev, [index]: false }));
  };
  
  

  return (
    <div className="m-sm-30">
      <div className="mb-sm-30">
        <Breadcrumb routeSegments={[{ name: "Category List" }]} />
      </div>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "28px",
          marginTop: "28px",
        }}
      >
        <Box>
          <TextField
            label=""
            placeholder="Search by category name.."
            size="small"
            variant="outlined"
            fullWidth
            className="min-w-240"
            onChange={handleSearchChange}
            value={searchValue}
          />
        </Box>
        <Button
          style={{
            backgroundColor: "#FF8E96",
            color: "white",
          }}
          variant="contained"
          size="large"
          startIcon={<IoMdAddCircle />}
          onClick={() => history.push("/create-category")}
        >
          Add Category
        </Button>
      </Box>
      <Grid container>
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardHeader title="Category List" />

            {!isLoading ? (
              <div className="w-full overflow-auto  px-6 py-8">
                {filteredData.length > 0 && errorMsg === "" ? (
                  <div
                    style={{
                      maxHeight: 800,
                      minWidth: 300,
                      overflow: "auto",
                    }}
                  >
                    <Table stickyHeader className="whitespace-pre">
                      <TableHead>
                        <TableRow>
                          <TableCell className="min-w-50">
                            <strong>#</strong>
                          </TableCell>
                          <TableCell className="min-w-100">Image</TableCell>
                          <TableCell className="min-w-100">Category</TableCell>
                          <TableCell className="min-w-100">
                            Commission
                          </TableCell>
                          <TableCell className="min-w-100">Parent</TableCell>
                          <TableCell className="min-w-100">Featured</TableCell>
                          <TableCell className="min-w-100">
                            Top Featured
                          </TableCell>
                          <TableCell className="min-w-100">Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredData.map((data, index) => {
                          return (
                            <TableRow key={index}>
                              <TableCell className="capitalize" align="left">
                                {index + 1}
                              </TableCell>
                              <TableCell className="capitalize" align="left">
                                <Avatar
                                  className="border-radius-4"
                                  style={{ cursor: "pointer", width: "58px" }}
                                  src={imageBasePath + "/" + data?.image}
                                  alt={data?.name}
                                  onClick={() => openImgHandler(data)}
                                />
                              </TableCell>
                              <TableCell className="capitalize" align="left">
                                {data?.name}
                              </TableCell>
                              <TableCell className="capitalize" align="left">
                                <div>
                                  {data?.resellerDetails?.isCommissionOn ? (
                                    <div>
                                      <p>
                                        Applied :{" "}
                                        {data?.resellerDetails?.commission}%{" "}
                                      </p>
                                    </div>
                                  ) : (
                                    <div>
                                      <p>Not Applied</p>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="capitalize" align="left">
                                {data?.parentName ? (
                                  <strong>{data?.parentName}</strong>
                                ) : (
                                  "---"
                                )}
                              </TableCell>
                              <TableCell className="capitalize" align="left">
                                <FormControlLabel
                                  control={
                                    <IOSSwitch
                                      sx={{ m: 1 }}
                                      checked={data?.isFeatured}
                                      onClick={() => {
                                        featuredUpdateHandler({
                                          ...data,
                                          featureOn: data?.isFeatured
                                            ? false
                                            : true,
                                        });
                                        // Toggle reset only for the specific item by index
                                        setResetSerials((prev) => ({
                                          ...prev,
                                          [index]: data?.isFeatured
                                            ? false
                                            : true, // Reset only when featureOn is set to false
                                        }));
                                      }}
                                    />
                                  }
                                  label=""
                                />
                              </TableCell>

                              <TableCell className="capitalize" align="left">
                                <FormControl
                                  sx={{ minWidth: 120 }}
                                  size="small"
                                >
                                  <InputLabel
                                    id={`demo-select-small-label-${index}`}
                                  >
                                    Serial
                                  </InputLabel>
                                  <Select
                                    labelId={`demo-select-small-label-${index}`}
                                    id={`demo-select-small-${index}`}
                                    value={
                                      resetSerials[index]
                                        ? ""
                                        : serials[index] ||
                                          data?.featuredSerial ||
                                          "" // Reset only the specific item
                                    }
                                    label="Serial"
                                    onChange={(e) =>
                                      handleChange(e, index, {
                                        ...data,
                                        featureOn: data?.isFeatured,
                                      })
                                    }
                                  >
                                    <MenuItem value={0}>
                                      <em>None</em>
                                    </MenuItem>
                                    <MenuItem value={1}>1</MenuItem>
                                    <MenuItem value={2}>2</MenuItem>
                                    <MenuItem value={3}>3</MenuItem>
                                    <MenuItem value={4}>4</MenuItem>
                                    <MenuItem value={5}>5</MenuItem>
                                  </Select>
                                </FormControl>
                              </TableCell>

                              <TableCell>
                                <IconButton
                                  onClick={() => {
                                    history.push(
                                      `/update-category/${data._id}`
                                    );
                                  }}
                                  style={{
                                    backgroundColor: "#ebedec",
                                    color: "#1976d2",
                                    marginRight: "8px",
                                  }}
                                >
                                  <FaRegEdit style={{ fontSize: "16px" }} />
                                </IconButton>
                                <IconButton
                                  onClick={() => {
                                    setIsOpenModal(true);
                                    setDeleteId(data._id);
                                  }}
                                  style={{
                                    backgroundColor: "#ebedec",
                                    color: "red",
                                  }}
                                >
                                  <RiDeleteBin3Line
                                    style={{ fontSize: "16px" }}
                                  />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <Typography
                    variant="body2"
                    style={{
                      textAlign: "center",
                      color: "gray",
                      paddingY: "14px",
                      padding: "8px",
                    }}
                  >
                    No Data Found
                  </Typography>
                )}
              </div>
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
          </Card>
        </Grid>
      </Grid>
      <SimpleModal isShow={isOpenModal} closeModalHandler={closeModalHandler}>
        {openImgData ? (
          <Avatar
            className="border-radius-4"
            style={{ width: "100%", height: "100%" }}
            src={imageBasePath + "/" + openImgData?.image}
            alt={openImgData?.name}
          />
        ) : (
          ""
        )}

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
                onClick={deleteHandler}
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
    </div>
  );
};

export default BrandList;
