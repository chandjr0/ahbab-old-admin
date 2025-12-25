import React, { useEffect, useState } from "react";
import "react-loading-skeleton/dist/skeleton.css";
import {
  TableCell,
  TableRow,
  Table,
  TableHead,
  TableBody,
  Typography,
  Box,
} from "@material-ui/core";
import axios from "../../../../axios";
import Spinner from "../../../Shared/Spinner/Spinner";

const CampaignProduct = ({ campaignProdData }) => {
  const [dataList, setDataList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        let res = await axios.post("/campaign/product-details", {
          createdTime: campaignProdData?.createdTime,
          productId: campaignProdData?._id,
        });
        console.log("res: ", res);
        setDataList(res?.data?.data);
        setIsLoading(false);
        setErrorMsg("");
      } catch (err) {
        setIsLoading(false);
        setErrorMsg(err.response.data.message);
      }
    };
    fetchData();
  }, [campaignProdData]);


  return (
    <>
      {!isLoading ? (
        <div className="w-full overflow-auto px-2 py-2">
          <p>
            <strong>{campaignProdData?.sku + " : "}</strong>
            {campaignProdData?.name}
          </p>
          {dataList?.length > 0 && errorMsg === "" ? (
            <div
              style={{
                maxHeight: 500,
                overflow: "auto",
              }}
            >
              <Table stickyHeader className="whitespace-pre">
                <TableHead>
                  <TableRow>
                    <TableCell align="center">
                      <strong>#</strong>
                    </TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Num of Order</TableCell>
                    <TableCell align="center">Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataList.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell className="capitalize" align="center">
                        {index + 1}
                      </TableCell>
                      <TableCell className="capitalize" align="center">
                        {data?._id}
                      </TableCell>
                      <TableCell className="capitalize" align="center">
                        {data?.totalSaleQty}
                      </TableCell>
                      <TableCell className="capitalize" align="center">
                        {data?.totalSalePrice}
                      </TableCell>
                    </TableRow>
                  ))}
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
              No Data Added
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
    </>
  );
};

export default CampaignProduct;
