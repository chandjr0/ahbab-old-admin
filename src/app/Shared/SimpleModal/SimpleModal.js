import { Backdrop, Box, Divider, Fade, Icon, IconButton, Modal } from "@material-ui/core";
import React from "react";

const SimpleModal = ({ children, isShow, closeModalHandler, width }) => {
  if (!width) {
    width = 400;
  }
  return (
    <Modal keepMounted open={isShow} onClose={closeModalHandler}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: width,
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          
          <IconButton style={{ color: "red" }} onClick={closeModalHandler}>
            <Icon>close</Icon>
          </IconButton>
        </Box>
        <Divider />
        <Box
          sx={{
            // px: 2,
            // pb: 4,
            p: 2,
          }}
        >
          {children}
        </Box>
      </Box>
    </Modal>
  );
};

export default SimpleModal;
