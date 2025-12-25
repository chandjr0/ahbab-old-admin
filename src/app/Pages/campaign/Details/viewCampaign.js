import React, { useEffect, useState } from "react";
import {
  IconButton,
  Card,
  CardHeader,
  Typography,
  TableCell,
  TableRow,
  Table,
  TableHead,
  TableBody,
  Box,
  Avatar,
  Button,
} from "@material-ui/core";
import { Divider, notification } from "antd";
import { Breadcrumb } from "../../../components";
import axios from "../../../../axios";
import { useParams } from "react-router-dom";
import SimpleModal from "../../../Shared/SimpleModal/SimpleModal";
import { FaExclamationTriangle, FaRegEdit, FaEye } from "react-icons/fa";
import imageBasePath from "../../../../config";
import Spinner from "../../../Shared/Spinner/Spinner";
import moment from "moment";
import { useHistory } from "react-router-dom";
import CampaignCostDetails from "./CampaignCostDetails";
import CampaignProduct from "./CampaignProduct";

const ViewCampaign = () => {
  const { campaignId } = useParams();
  const history = useHistory();

  const [isPageLoading, setIsPageLoading] = useState(false);
  const [name, setName] = useState();
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState(null);
  const [dataList, setDataList] = useState([]);
  const [createdDate, setCreatedDate] = useState(null);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [campaignProdData, setCampaignProdData] = useState(null);

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  useEffect(() => {
    let fetchData = async () => {
      try {
        setIsPageLoading(true);
        let res = await axios.get(`/campaign/single-details-fetch/${campaignId}`);
        if (res?.data?.success) {
          setDescription(res?.data?.data?.description);
          setName(res?.data?.data?.name);
          setCost(res?.data?.data?.campaignCost?.totalCost || 0);
          setDataList(res?.data?.data?.products);
          setCreatedDate(res?.data?.data?.startDate);
        }
        setIsPageLoading(false);
      } catch (err) {
        setIsPageLoading(false);
        openNotificationWithIcon(err?.response?.data?.message, "error");
      }
    };
    fetchData();
  }, [campaignId]);

  const closeModalHandler = () => {
    setIsOpenModal(false);
  };

  return (
    <div className="m-sm-30">
      <div className="mb-sm-30">
        <Breadcrumb routeSegments={[{ name: "View Campaign" }]} />
      </div>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "28px",
          marginTop: "28px",
        }}
      >
        <Button
          style={{
            backgroundColor: "#FF8E96",
            color: "white",
          }}
          variant="contained"
          size="large"
          startIcon={<FaRegEdit />}
          onClick={() => history.push(`/update-campaign/${campaignId}`)}
        >
          Update Campaign
        </Button>
      </Box>
      <Card elevation={3}>
        <CardHeader title="View Campaign" />

        {!isPageLoading ? (
          <div className="px-4 py-6">
            <div className="viewer__order-info px-4 mb-4 flex justify-between">
              <div>
                <h4 className="mb-4">Campaign Details</h4>
                <p className="mb-2">
                  <strong>Name: </strong>
                  {name}
                </p>
                <p className="mb-2">
                  <strong>Details: </strong>
                  {description}
                </p>
                <p className="mb-2">
                  <strong>Total Cost: </strong> {cost} tk
                </p>
                <p className="mb-2">
                  <strong>Total Sell: </strong>{" "}
                  {dataList.reduce((accumulator, currentValue) => {
                    return accumulator + (currentValue?.saleDetails?.totalSalePrice || 0);
                  }, 0) + " tk"}
                </p>
                <p className="mb-2">
                  <strong>Start From: </strong> {moment(createdDate).format("lll")}
                </p>
              </div>
            </div>

            <Divider />
            <Card elevation={4}>
              {dataList.length > 0 && (
                <>
                  <Typography variant="h5" className="text-center text-green mb-6">
                    {`Campaign Products (${dataList.length})`}
                  </Typography>
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
                          <TableCell className="min-w-50" align="center">
                            #
                          </TableCell>
                          <TableCell className="min-w-100" align="center">
                            SKU
                          </TableCell>
                          <TableCell className="min-w-100" align="center">
                            Image
                          </TableCell>
                          <TableCell className="min-w-100" align="center">
                            Title
                          </TableCell>
                          <TableCell className="min-w-100" align="center">
                            Sell Qty
                          </TableCell>
                          <TableCell className="min-w-100" align="center">
                            Sell Amount
                          </TableCell>
                          <TableCell className="min-w-100" align="center">
                            Action
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dataList.length > 0 &&
                          dataList.map((data, index) => (
                            <React.Fragment key={data?._id}>
                              <TableRow>
                                <TableCell className="capitalize" align="center">
                                  {index + 1}
                                </TableCell>
                                <TableCell className="capitalize" align="center">
                                  {data?.sku}
                                </TableCell>
                                <TableCell
                                  className="capitalize flex justify-center"
                                  align="center"
                                >
                                  <Avatar
                                    className="border-radius-4"
                                    style={{ cursor: "pointer", width: "58px" }}
                                    src={imageBasePath + "/" + data?.galleryImage[0]}
                                    alt={data?.name}
                                  />
                                </TableCell>
                                <TableCell className="capitalize" align="center">
                                  {data?.name}
                                </TableCell>
                                <TableCell className="capitalize" align="center">
                                  {data?.saleDetails?.totalSaleQty || 0}
                                </TableCell>
                                <TableCell className="capitalize" align="center">
                                  {(data?.saleDetails?.totalSalePrice || 0) + " ৳"}
                                </TableCell>
                                <TableCell className="capitalize" align="center">
                                  <IconButton
                                    onClick={() => {
                                      setIsOpenModal(true);
                                      setCampaignProdData({
                                        ...data,
                                        createdTime: createdDate,
                                      });
                                    }}
                                    style={{
                                      backgroundColor: "#ebedec",
                                      color: "#1976d2",
                                      marginRight: "8px",
                                    }}
                                  >
                                    <FaEye style={{ fontSize: "16px" }} />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            </React.Fragment>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </Card>
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
      <CampaignCostDetails setCost={setCost} />

      <SimpleModal isShow={isOpenModal} closeModalHandler={closeModalHandler} width={600}>
        {campaignProdData && <CampaignProduct campaignProdData={campaignProdData} />}
      </SimpleModal>
    </div>
  );
};

export default ViewCampaign;
