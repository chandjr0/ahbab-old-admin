import { Box, Button, TextField, Typography } from "@material-ui/core";
import React from "react";
import { BiPlus, BiMinus } from "react-icons/bi";

const ChartPage = ({ chartList, setChartList }) => {
  const addRow = () => {
    let columnLength = chartList[0].length;
    let rowArray = [];
    for (let i = 0; i < columnLength; i++) {
      rowArray.push("");
    }
    setChartList([...chartList, rowArray]);
  };

  const minusRow = () => {
    if (chartList.length > 1) {
      let updateList = [...chartList];
      updateList.pop();
      setChartList(updateList);
    }
  };

  const addColumn = () => {
    if (chartList[0].length < 10) {
      let updateList = [];
      chartList.forEach((row) => {
        let storeRow = [...row, ""];
        updateList.push(storeRow);
      });
      setChartList(updateList);
    }
  };

  const minusColumn = () => {
    let updateList = [...chartList];
    updateList.forEach((row) => {
      if (row.length > 1) {
        row.pop();
      }
    });
    setChartList(updateList);
  };

  const addChatTextHandler = (value, row, column) => {
    let storeChartData = [...chartList];
    storeChartData[row][column] = value;
    setChartList(storeChartData);
  };

  return (
    <>
      <Box sx={{ display: "flex", marginBottom: "8px" }}>
        <Box sx={{ marginRight: "24px" }}>
          <Button
            variant="outlined"
            size="small"
            className="m-1 bg-light-error"
            onClick={minusRow}
            startIcon={<BiMinus />}
          >
            row
          </Button>
          <Button
            variant="outlined"
            size="small"
            className="m-1 bg-light-green"
            onClick={addRow}
            startIcon={<BiPlus />}
          >
            row
          </Button>
        </Box>
        <Box>
          <Button
            variant="outlined"
            size="small"
            className="m-1 bg-light-error"
            onClick={minusColumn}
            startIcon={<BiMinus />}
          >
            column
          </Button>
          <Button
            variant="outlined"
            size="small"
            className="m-1 bg-light-green"
            onClick={addColumn}
            startIcon={<BiPlus />}
          >
            column
          </Button>
        </Box>
      </Box>
      <p className="mb-4 mx-1">{`${chartList.length} rows, ${chartList[0].length} columns`}</p>

      <div
        style={{
          overflowY: "auto",
        }}
      >
        <Box>
          {chartList.map((row, idx1) => (
            <Box key={idx1} sx={{ display: "flex", marginBottom: "6px" }}>
              {row.map((column, idx2) => (
                <TextField
                  key={idx2}
                  label=""
                  placeholder={idx1 === 0 ? "title" : ""}
                  size="small"
                  variant="outlined"
                  className="min-w-120 max-w-120 mx-1"
                  value={chartList[idx1][idx2]}
                  onChange={(e) => addChatTextHandler(e.target.value, idx1, idx2)}
                />
              ))}
            </Box>
          ))}
        </Box>
      </div>
    </>
  );
};

export default ChartPage;
