import { Card, CardContent, CardHeader, TextField } from "@material-ui/core";
import React from "react";

const OrderNote = ({ title,adminNote, setAdminNote }) => {
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
        />
      </CardContent>
    </Card>
  );
};

export default OrderNote;
