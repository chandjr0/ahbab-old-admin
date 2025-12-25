import React, { useState, useEffect } from "react";
import {
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Avatar,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { Breadcrumb } from "../../components"; // Assuming this is already Material UI styled
import imageBasePath from "../../../config";
import axios from "../../../axios";

const LogHistory = () => {
  const [logData, setLogData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0); // Material UI pagination is 0-based
  const [pageLimit, setPageLimit] = useState(20); // Number of items per page
  const [totalLogs, setTotalLogs] = useState(0); // Total number of logs for pagination

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    fetchLogData();
  }, [currentPage, pageLimit]);

  const fetchLogData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `/setting/admin/sites/log-history?page=${
          currentPage + 1
        }&pageLimit=${pageLimit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
          },
        }
      );

      // Update state with API response data
      const { data, metaData } = response.data;
      setLogData(data); // Log data
      setTotalLogs(metaData?.totalData); // Total logs count from metaData
      setPageLimit(metaData?.pageLimit); // Page limit from metaData
    } catch (error) {
      console.error("Failed to fetch log data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Material UI styled columns
  const columns = [
    { id: "user", label: "User", minWidth: 170, align: "center" },
    { id: "phone", label: "Phone", minWidth: 100, align: "center" },
    { id: "email", label: "Email", minWidth: 170, align: "center" },
    { id: "role", label: "Role", minWidth: 100, align: "center" },
    { id: "time", label: "Time", minWidth: 170, align: "center" },
    { id: "message", label: "Message", minWidth: 200, align: "center" },
  ];

  return (
    <div className="m-sm-30">
      <div className="mb-sm-30">
        <Breadcrumb routeSegments={[{ name: "Log History" }]} />
      </div>
      <Paper elevation={3} sx={{ padding: 2 }}>
        <TableContainer>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", padding: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table stickyHeader aria-label="log history table">
              <TableHead>
                <TableRow>
                  {columns?.map((column) => (
                    <TableCell
                      key={column?.id}
                      align={column?.align}
                      style={{ minWidth: column?.minWidth, fontWeight: "bold" }}
                    >
                      {column?.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {logData.map((log, index) => (
                  <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                    <TableCell align="center">
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                      >
                        {log.logCreatedBy?.image ? (
                          <Avatar
                            src={log.logCreatedBy.image}
                            alt={log.logCreatedBy.name}
                            sx={{ width: 50, height: 50 }}
                          />
                        ) : (
                          <Avatar sx={{ width: 50, height: 50 }}>
                            {log.logCreatedBy?.name?.[0]}
                          </Avatar>
                        )}
                        <Typography variant="body2" mt={1} textAlign="center">
                          {log.logCreatedBy?.name || "N/A"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {log.logCreatedBy?.phone}
                    </TableCell>
                    <TableCell align="center">
                      {log.logCreatedBy?.email}
                    </TableCell>
                    <TableCell align="center">
                      {log.logCreatedBy?.role}
                    </TableCell>
                    <TableCell align="center">
                      {new Date(log.time).toLocaleString()}
                    </TableCell>
                    <TableCell align="center">{log.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[20, 50, 100]} // Customize the rows per page options as needed
          component="div"
          count={totalLogs}
          rowsPerPage={pageLimit}
          page={currentPage}
          onPageChange={(event, newPage) => setCurrentPage(newPage)}
          onRowsPerPageChange={(event) => {
            setPageLimit(parseInt(event.target.value, 10));
            setCurrentPage(0); // Reset page when changing rows per page
          }}
        />
      </Paper>
    </div>
  );
};

export default LogHistory;
