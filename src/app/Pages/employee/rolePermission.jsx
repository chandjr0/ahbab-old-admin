import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardHeader,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { notification } from "antd";
import { navigations } from "../../navigations";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../../axios";
import Spinner from "../../Shared/Spinner/Spinner";

const CreateRole = () => {
  
  const { employeeId } = useParams();
  const [isAlive, setIsAlive] = useState(true);
  const [selectedModule, setSelectedModule] = useState([]);
  const [renderMe, setRenderMe] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  const [navigationModel, setNavigationModel] = useState(navigations);
  const [orderStatusPermission, setOrderStatusPermission] = useState(false);


  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  useEffect(() => {
    navigations.forEach((item, index) => {
      item["selected"] = false;
      if (item?.children?.length) {
        item.children.forEach((child, ins) => {
          child["selected"] = false;
        });
      }
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setIsLoading(false);
        const res = await axios.get(`/employee/single/${employeeId}`);
        if (res.data.success) {
          setOrderStatusPermission(res?.data?.data?.orderStatusUpdate);
          setEmployeeData(res?.data?.data);
          setSelectedModule(res?.data?.data?.menuList);
          setRenderMe(res?.data?.data?.menuList);

          navigations.forEach((item, index) => {
            let is_parent = res?.data?.data?.menuList?.find(
              (val) => val.name === item.name
            );
            if (is_parent && is_parent?.subMenuList?.length) {
              item.children.forEach((child, childIndex) => {
                let is_child = is_parent?.subMenuList?.find(
                  (val) => val === child.name
                );
                if (is_child) {
                  let selected = true;
                  child["selected"] = selected;
                  item["selected"] = selected;
                  setIsAlive(!isAlive);
                } else {
                  let selected = true;
                  item["selected"] = !selected;
                }
              });
            } else if (is_parent && !is_parent?.subMenuList?.length) {
              let selected = true;
              item["selected"] = selected;
              setIsAlive(!isAlive);
            } else if (res?.data?.data?.menuList?.length === 0) {
              item["selected"] = false;
            }
          });

          setIsAlive(!isAlive);
        }
      } catch (err) {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [employeeId, renderMe?.length]);

  const getElement = (value, child, event) => {
    event.stopPropagation();
    if (!Object.keys(child)?.length) {
      let index = navigationModel.findIndex((val) => val.name === value.name);
      let filteredItem = selectedModule?.find((val) => val.name === value.name);
      if (filteredItem) {
        let items = selectedModule?.filter(
          (val) => val?.name !== filteredItem?.name
        );
        setSelectedModule(items);
        let selected = false;
        navigationModel[index] = { ...navigationModel[index], selected };
        if (navigationModel[index]?.children?.length) {
          navigationModel[index].children.map(
            (item) => (item.selected = false)
          );
        }

        // setIsAlive(!isAlive);
        setIsAlive(!isAlive);
      } else {
        setSelectedModule((selectedModule) => [
          ...selectedModule,
          {
            name: navigationModel[index]?.name,
            subMenuList:
              navigationModel[index]?.children?.length &&
              navigationModel[index]?.children?.map((item) => item?.name),
          },
        ]);
        let selected = true;
        navigationModel[index] = { ...navigationModel[index], selected };
        if (navigationModel[index]?.children?.length) {
          navigationModel[index].children.map((item) => (item.selected = true));
        }
        setIsAlive(!isAlive);
      }
    } else {
      let index = navigationModel.findIndex((val) => val.name === value.name);
      let filteredItem = selectedModule?.find((val) => val.name === value.name);
      if (!filteredItem) {
        setSelectedModule((selectedModule) => [
          ...selectedModule,
          {
            name: navigationModel[index]?.name,
            subMenuList: [child?.name],
          },
        ]);
        let parentIndex = navigationModel.findIndex(
          (val) => val.name === value.name
        );
        let childIndex = navigationModel[parentIndex].children.findIndex(
          (val) => val.name === child.name
        );
        let selected = true;
        navigationModel[parentIndex].children[childIndex].selected = selected;
        setIsAlive(!isAlive);
      } else {
        let index = selectedModule.findIndex((val) => val.name === value.name);
        let exist = selectedModule[index]?.subMenuList.includes(child.name);
        let parentIndex = navigationModel.findIndex(
          (val) => val.name === value.name
        );
        let childIndex = navigationModel[parentIndex].children.findIndex(
          (val) => val.name === child.name
        );
        let selected = true;
        navigationModel[parentIndex].children[childIndex].selected = selected;
        setIsAlive(!isAlive);
        navigationModel[parentIndex] = {
          ...navigationModel[parentIndex],
          selected,
        };
        if (!exist) {
          filteredItem.subMenuList.push(child.name);
          let parentIndex = navigationModel.findIndex(
            (val) => val.name === value.name
          );
          let childIndex = navigationModel[parentIndex].children.findIndex(
            (val) => val.name === child.name
          );
          let selected = true;
          navigationModel[parentIndex].children[childIndex].selected = selected;
          navigationModel[parentIndex].children.forEach((item) => {
            if (item?.selected) {
              navigationModel[parentIndex].selected = selected;
              setIsAlive(!isAlive);
            } else {
              navigationModel[parentIndex].selected = !selected;
              setIsAlive(!isAlive);
            }
          });
          setIsAlive(!isAlive);
        } else {
          const index = filteredItem?.subMenuList.indexOf(child.name);
          if (index > -1) {
            filteredItem.subMenuList.splice(index, 1);
          }
          let parentIndex = navigationModel.findIndex(
            (val) => val.name === value.name
          );
          let childIndex = navigationModel[parentIndex].children.findIndex(
            (val) => val.name === child.name
          );
          let selected = false;
          navigationModel[parentIndex].children[childIndex].selected = selected;
          navigationModel[parentIndex].selected = selected;
          setIsAlive(!isAlive);
        }
      }
    }
  };

  const handleSubmit2 = async () => {
    let data = {
      employeeId: employeeId,
      menuList: selectedModule,
      orderStatusUpdate: orderStatusPermission,
    };

    try {
      const createRes = await axios.patch(
        `/employee/role-permission-assign`,
        data
      );
      if (createRes?.data?.success) {
        openNotificationWithIcon(createRes?.data?.message, "success");
      }
    } catch (error) {
      openNotificationWithIcon(error?.response?.data?.message, "error");
    }
  };

  return (
    <div className="m-sm-30">
      <Grid container spacing={3}>
        <Grid item md={6} xs={12}>
          <Card elevation={3}>
            <CardHeader title={`Update Role: ${employeeData?.name || ""}`} />

            {!isLoading ? (
              <form className="px-4">
                <div className="mb-8">
                  {navigationModel?.map(
                    (item, index) =>
                      item?.type !== "label" && (
                        <Accordion key={item + "_" + index}>
                          <AccordionSummary
                            expandIcon={
                              item?.children?.length ? <ExpandMoreIcon /> : ""
                            }
                          >
                            <FormControlLabel
                              onClick={(event) => getElement(item, {}, event)}
                              onFocus={(event) => event.stopPropagation()}
                              control={
                                <Checkbox
                                  checked={item?.selected ? "checked" : ""}
                                />
                              }
                              label={item?.name}
                            />
                          </AccordionSummary>
                          <AccordionDetails style={{borderBottom:'1px solid #1234'}}>
                            <FormGroup>
                              {item?.options?.map((child, indexChild) => (
                                <>
                                  <FormControlLabel
                                    className="pl-4"
                                    style={{ color: "red" }}
                                    key={child + "_" + indexChild}
                                    onClick={(event) =>
                                      setOrderStatusPermission(
                                        !orderStatusPermission
                                      )
                                    }
                                    control={
                                      <Checkbox
                                        checked={orderStatusPermission}
                                      />
                                    }
                                    label={child?.name}
                                  />
                                </>
                              ))}
                            </FormGroup>
                          </AccordionDetails>
                          <AccordionDetails>
                            <FormGroup>
                              {item?.children?.map((child, indexChild) => (
                                <>
                                  <FormControlLabel
                                    className="pl-4"
                                    key={child + "_" + indexChild}
                                    onClick={(event) =>
                                      getElement(item, child, event)
                                    }
                                    onFocus={(event) => event.stopPropagation()}
                                    control={
                                      <Checkbox
                                        checked={child.selected ? true : false}
                                      />
                                    }
                                    label={child?.name}
                                  />
                                </>
                              ))}
                            </FormGroup>
                          </AccordionDetails>
                        </Accordion>
                      )
                  )}
                </div>

                <Button
                  className="btn btn-block m-5"
                  style={{ backgroundColor: "blue", color: "#fff" }}
                  onClick={() => handleSubmit2()}
                >
                  Save Role
                </Button>
              </form>
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
    </div>
  );
};

export default CreateRole;
