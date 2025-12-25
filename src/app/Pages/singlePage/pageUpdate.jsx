import React, { useRef, useState } from "react";
import {
  Button,
  Card,
  Grid,
  TextField,
  Box,
  CircularProgress,
  CardHeader,
  InputLabel,
  MenuItem,
} from "@material-ui/core";
import { notification } from "antd";
import {
  Breadcrumb,
  RichTextEditor
} from "../../components";
import axios from "../../../axios";
import { useEffect } from "react";
import Spinner from "../../Shared/Spinner/Spinner";

import { Editor } from "@tinymce/tinymce-react";

const PageUpdate = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState("aboutUs");
  const [description, setDescription] = useState("");
  const [aboutUs, setAboutUs] = useState("");
  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [privacyPolicy, setPrivacyPolicy] = useState("");
  const [returned, setReturned] = useState("");
  const [refund, setRefund] = useState("");
  const editorRef = useRef(null);

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  // const log = () => {
  //   if (editorRef.current) {
  //     let value = editorRef.current.getContent();
  //     setDescription(value);
  //     if (currentPage === "aboutUs") {
  //       setAboutUs(value);
  //     } else if (currentPage === "termsAndConditions") {
  //       setTermsAndConditions(value);
  //     } else if (currentPage === "privacyPolicy") {
  //       setPrivacyPolicy(value);
  //     } else if (currentPage === "returned") {
  //       setReturned(value);
  //     } else if (currentPage === "refund") {
  //       setRefund(value);
  //     }
  //   }
  // };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsPageLoading(true);
        let res = await axios.get("/setting/admin/pages-view");
        if (res) {
          let data = res?.data?.data;
          setDescription(data?.pages?.aboutUs);
          setAboutUs(data?.pages?.aboutUs);
          setTermsAndConditions(data?.pages?.termsAndConditions);
          setPrivacyPolicy(data?.pages?.privacyPolicy);
          setReturned(data?.pages?.returned);
          setRefund(data?.pages?.refund);
        }
        setIsPageLoading(false);
      } catch (err) {
        setIsPageLoading(false);
      }
    };
    fetchData();
  }, []);

  const formSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      let obj = {
        pages: {
          aboutUs: aboutUs,
          termsAndConditions: termsAndConditions,
          privacyPolicy: privacyPolicy,
          returned: returned,
          refund: refund,
        },
      };

      setIsLoading(true);
      const res = await axios.patch(`/setting/admin/update-pages`, obj);
      if (res?.data?.success) {
        openNotificationWithIcon(res?.data?.message, "success");
      } else {
        openNotificationWithIcon(res?.data?.message, "error");
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      openNotificationWithIcon(err?.response?.data?.message, "error");
    }
  };

  useEffect(() => {
    if (currentPage === "aboutUs") {
      setDescription(aboutUs);
    } else if (currentPage === "termsAndConditions") {
      setDescription(termsAndConditions);
    } else if (currentPage === "privacyPolicy") {
      setDescription(privacyPolicy);
    } else if (currentPage === "returned") {
      setDescription(returned);
    } else if (currentPage === "refund") {
      setDescription(refund);
    }
  }, [currentPage, aboutUs, privacyPolicy, termsAndConditions, refund, returned]);

  const contentChangeHandler = (value) => {
    setDescription(value);
    if (currentPage === "aboutUs") {
      setAboutUs(value);
    } else if (currentPage === "termsAndConditions") {
      setTermsAndConditions(value);
    } else if (currentPage === "privacyPolicy") {
      setPrivacyPolicy(value);
    } else if (currentPage === "returned") {
      setReturned(value);
    } else if (currentPage === "refund") {
      setRefund(value);
    }
  };

  return (
    <div className="m-sm-30">
      <div className="mb-sm-30">
        <Breadcrumb routeSegments={[{ name: "update-pages" }]} />
      </div>

      <Grid container>
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardHeader title="Update Pages" />

            {!isPageLoading ? (
              <form className="px-4 py-6" onSubmit={formSubmitHandler}>
                <Grid container spacing={3}>
                  <Grid item lg={4} xs={12}>
                    <InputLabel className="mb-2 text-black">Select Page</InputLabel>
                    <TextField
                      name=""
                      label=""
                      variant="outlined"
                      size="small"
                      fullWidth
                      select
                      value={currentPage}
                      onChange={(e) => setCurrentPage(e.target.value)}
                    >
                      <MenuItem value="aboutUs"> About Us </MenuItem>
                      <MenuItem value="termsAndConditions"> Terms And Conditions </MenuItem>
                      <MenuItem value="privacyPolicy"> Privacy Policy </MenuItem>
                      <MenuItem value="returned"> Returned & Refund </MenuItem>
                      {/* <MenuItem value="refund"> Refund </MenuItem> */}
                    </TextField>
                  </Grid>

                  <Grid item xs={12}>
                    <InputLabel className="mb-2 text-black">Update Page Details</InputLabel>
                    <RichTextEditor
                      className="mb-4 border-none"
                      content={description}
                      handleContentChange={(content) => contentChangeHandler(content)}
                      placeholder="write here..."
                    />
                    {/* <Editor
                      onInit={(evt, editor) => (editorRef.current = editor)}
                      onBlur={() => log()}
                      initialValue={description}
                      init={{
                        height: 500,
                        menubar: true,
                        plugins: ["image", "table", "searchreplace", "wordcount", "autolink"],
                        toolbar:
                          "undo redo | formatselect | " +
                          "bold italic backcolor | alignleft aligncenter " +
                          "alignright alignjustify | bullist numlist outdent indent | " +
                          "removeformat",
                        content_style:
                          "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                        image_title: true,

                        automatic_uploads: true,

                        file_picker_types: "image",

                        file_picker_callback: (cb, value, meta) => {
                          const input = document.createElement("input");
                          input.setAttribute("type", "file");
                          input.setAttribute("accept", "image/*");

                          input.addEventListener("change", (e) => {
                            const file = e.target.files[0];
                            const reader = new FileReader();
                            reader.addEventListener("load", () => {
                              const id = "blobid" + new Date().getTime();
                              const blobCache = window.tinymce.activeEditor.editorUpload.blobCache;
                              const base64 = reader.result.split(",")[1];
                              const blobInfo = blobCache.create(id, file, base64);
                              blobCache.add(blobInfo);

                              cb(blobInfo.blobUri(), {
                                title: file.name,
                              });
                            });
                            reader.readAsDataURL(file);
                          });

                          input.click();
                        },
                      }}
                    /> */}
                  </Grid>
                </Grid>

                <Button
                  className="mt-8 px-12"
                  variant="contained"
                  color="primary"
                  type="submit"
                  style={{ marginRight: "20px" }}
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : "Update"}
                </Button>
              </form>
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

export default PageUpdate;
