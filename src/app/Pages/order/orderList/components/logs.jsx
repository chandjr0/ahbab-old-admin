import React from "react";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@material-ui/core";
import moment from "moment";

const Logs = ({ logsData }) => {
  return (
    <div>
      <p>
        ID: <strong className="text-secondary">{" " + logsData?.serialId}</strong>
      </p>
      <div
        style={{
          maxHeight: 300,
          overflow: "auto",
        }}
      >
        {logsData?.orderStatus.length > 0 && (
          <>
            <h6 className="text-center">Order Status Logs</h6>
            <Table stickyHeader className="whitespace-pre mt-4">
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logsData?.orderStatus &&
                  logsData?.orderStatus.map((data, idx) => (
                    <TableRow key={idx}>
                      <TableCell align="left">
                        <p style={{ maxWidth: "100px" }} className="m-0 p-0 text-gray">
                          <small> {moment(data?.time).format("LT")}</small>
                          <br />
                          <small> {moment(data?.time).format("LL")}</small>
                        </p>
                      </TableCell>
                      <TableCell align="left" className="lowercase">
                        <p style={{ maxWidth: "120px" }} className="m-0">
                          {data?.status}
                        </p>
                      </TableCell>
                      <TableCell align="left">
                        <p className="m-0"> {data?.changeBy}</p>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </>
        )}
      </div>
      <div
        style={{
          maxHeight: 300,
          overflow: "auto",
          marginTop: "24px",
        }}
      >
        {logsData?.updateHistory && logsData?.updateHistory.length > 0 && (
          <>
            <h6 className="text-center">Order Update Logs</h6>
            <Table stickyHeader className="whitespace-pre mt-4">
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>Log</TableCell>
                  <TableCell>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logsData?.updateHistory &&
                  logsData?.updateHistory.map((data, idx) => (
                    <TableRow key={idx}>
                      <TableCell align="left">
                        <p style={{ maxWidth: "100px" }} className="m-0 p-0 text-gray">
                          <small> {moment(data?.time).format("LT")}</small>
                          <br />
                          <small> {moment(data?.time).format("LL")}</small>
                        </p>
                      </TableCell>
                      <TableCell align="left">
                        <p style={{ maxWidth: "120px" }} className="m-0">
                          {" "}
                          {data?.message}
                        </p>
                      </TableCell>
                      <TableCell align="left">
                        <p className="m-0"> {data?.createdBy}</p>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </>
        )}
      </div>
    </div>
  );
};

export default Logs;
