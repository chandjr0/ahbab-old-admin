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
  Card,
  Tooltip,
  CardHeader,
  Grid,
} from "@material-ui/core";
import axios from "../../../axios";
import Spinner from "../../Shared/Spinner/Spinner";
import { Breadcrumb } from "../../components";

const DivisionList = () => {
  const [dataList, setDataList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        let res = await axios.get("/location/divisions");
        setDataList(res?.data?.data);
        setIsLoading(false);
        setErrorMsg("");
      } catch (err) {
        setIsLoading(false);
        setErrorMsg(err.response.data.message);
      }
    };
    fetchData();
  }, [setDataList]);

  return (
    <div className="m-sm-30">
      <div className="mb-sm-30">
        <Breadcrumb routeSegments={[{ name: "division" }]} />
      </div>{" "}
      <Grid container>
        <Grid item md={4} xs={12}>
          <Card elevation={3}>
            <CardHeader title="Division List" />

            {!isLoading ? (
              <div className="w-full overflow-auto  px-6 py-8">
                {dataList?.length > 0 && errorMsg === "" ? (
                  <Table className="whitespace-pre">
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <strong>#</strong>
                        </TableCell>
                        <TableCell>Name</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dataList.map((data, index) => (
                        <TableRow key={index}>
                          <Tooltip title={"serial"} placement="bottom-start">
                            <TableCell className="capitalize" align="left">
                              {index + 1}
                            </TableCell>
                          </Tooltip>

                          <Tooltip title={"name"} placement="bottom-start">
                            <TableCell className="capitalize" align="left">
                              {data?.name}
                            </TableCell>
                          </Tooltip>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
    </div>
  );
};

export default DivisionList;
