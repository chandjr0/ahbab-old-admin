import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@material-ui/core";
import axios from "../../../axios";
import Spinner from "../../Shared/Spinner/Spinner";
import { Breadcrumb } from "../../components";
import moment from "moment";

export default function SmsList() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalData, setTotalData] = useState(0);
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const columns = [
    {
      id: "createdAt",
      label: "Time",
      align: "left",
      minWidth: 140,
      format: (value) => (
        <>
          <p style={{ color: "gray", margin: "0px" }}>
            <small>{moment(value).format("lll")}</small>
          </p>
        </>
      ),
    },
    {
      id: "phone",
      label: "Phone",
      minWidth: 120,
    },
    {
      id: "message",
      label: "Message",
      minWidth: 150,
    },
  ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  useEffect(() => {
    let fetchData = async () => {
      try {
        setIsLoading(true);

        let res = await axios.get(`/customer/fetch-all-sms?page=${page + 1}&limit=${rowsPerPage}`);

        if (res?.data?.data) {
          setTotalData(res?.data?.metaData?.totalData);
          let dataArray = [];
          for (let data of res?.data?.data) {
            dataArray.push({
              _id: data?._id,
              createdAt: data?.createdAt,
              name: data?.name,
              phone: data?.phone,
              message: data?.message,
            });
          }
          setRows(dataArray);
        }
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        setErrorMsg(err?.response?.data?.message);
      }
    };

    fetchData();
  }, [page, rowsPerPage]);

  return (
    <div className="m-sm-30">
      <div className="mb-sm-30">
        <Breadcrumb routeSegments={[{ name: "SMS List" }]} />
      </div>
      <Card className="border-radius-0 mx-8">
        <CardHeader title={`SMS List`} />
        <div className="w-full overflow-hidden px-2 mt-4">
          <Box
            sx={{
              borderBottom: "1px solid #F6F6F6",
              backgroundColor: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 1,
            }}
          >
            <Box>
              <Typography paragraph>{`Total Sms send: ${totalData || 0} `}</Typography>
            </Box>
          </Box>
        </div>
        <Divider />
      </Card>
      <Card className="border-radius-0 mx-8">
        {!isLoading ? (
          <div className="w-full overflow-hidden px-2">
            {rows.length > 0 && errorMsg === "" ? (
              <>
                <div
                  style={{
                    maxHeight: 800,
                    overflow: "auto",
                  }}
                >
                  <Table stickyHeader className="whitespace-pre">
                    <TableHead>
                      <TableRow>
                        {columns.map((column) => (
                          <TableCell
                            key={column.id}
                            align={column.align}
                            style={{ minWidth: column.minWidth }}
                          >
                            {column.label}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => {
                        return (
                          <TableRow hover role="checkbox" tabIndex={-1} key={row._id}>
                            {columns.map((column) => {
                              const value = row[column.id];
                              return (
                                <TableCell key={column.id} align={column.align}>
                                  {column.format ? column.format(value, row?.name) : value}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <TablePagination
                  rowsPerPageOptions={[10, 25, 100]}
                  component="div"
                  count={totalData} // total data
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </>
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
    </div>
  );
}
