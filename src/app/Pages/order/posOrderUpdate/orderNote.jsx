import {
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@material-ui/core";
import React from "react";
import moment from "moment";

const OrderNote = ({ title, adminNote, setAdminNote, noteList }) => {
  return (
    <Card elevation={3}>
      <CardHeader title={`${title} Order Note`} />
      <CardContent>
        <TextField
          label=""
          placeholder="write a note.."
          size="small"
          multiline
          minRows={5}
          variant="outlined"
          fullWidth
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
        />{" "}
        {title == "Customer" ? null : (
          <>
            {noteList?.length > 0 && (
              <Table stickyHeader className="whitespace-pre mt-4">
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Note</TableCell>
                    <TableCell>Create</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {noteList &&
                    noteList.map((data, idx) => (
                      <TableRow key={idx}>
                        <TableCell align="left">
                          <p
                            style={{ maxWidth: "100px" }}
                            className="m-0 p-0 text-gray"
                          >
                            <small> {moment(data?.time).format("LT")}</small>
                            <br />
                            <small> {moment(data?.time).format("LL")}</small>
                          </p>
                        </TableCell>
                        <TableCell align="left">
                          <p className="m-0"> {data?.message}</p>
                        </TableCell>
                        <TableCell align="left">
                          <p className="m-0"> {data?.createdBy}</p>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderNote;
