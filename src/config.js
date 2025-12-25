
const imageBasePath = process.env.NODE_ENV === "development"
  ? `${process.env.REACT_APP_LOCAL_API}`
  : `${process.env.REACT_APP_LIVE_API}`;

export default imageBasePath;
