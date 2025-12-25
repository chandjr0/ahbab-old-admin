const textLight = {
  primary: "rgba(52, 49, 76, 1)",
  secondary: "rgba(52, 49, 76, 0.54)",
  disabled: "rgba(52, 49, 76, 0.38)",
  hint: "rgba(52, 49, 76, 0.38)",
};
const secondaryColor = {
  light: "#f9a352",
  main: "#FFBE2F",
  dark: "#ff932e",
  contrastText: textLight.primary,
};
const errorColor = {
  main: "#FF3D57",
};

export const themeColors = {
  whitePurple: {
    palette: {
      type: "light",
      primary: {
        main: "#ffffff",
        contrastText: textLight.primary,
      },
      secondary: {
        main: "#7467ef",
        contrastText: "#ffffff",
      },
      error: errorColor,
      text: textLight,
    },
  },
  whiteBlue: {
    palette: {
      type: "light",
      primary: {
        main: "#ffffff",
        contrastText: textLight.primary,
      },
      secondary: {
        main: "#007BFF",
        contrastText: "#ffffff",
      },
      text: textLight,
    },
  },
  slateDark1: {
    palette: {
      type: "dark",
      primary: {
        main: "#0d1a3f",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#FFBE2F",
        contrastText: textLight.primary,
      },
      error: errorColor,
      background: {
        paper: "#0d1a3f",
        default: "#091536",
      },
    },
  },
  slateDark2: {
    palette: {
      type: "dark",
      primary: {
        main: "#091536",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#FFBE2F",
        contrastText: textLight.primary,
      },
      error: errorColor,
      background: {
        paper: "#0d1a3f",
        default: "#091536",
      },
    },
  },
  purple1: {
    palette: {
      type: "light",
      primary: {
        main: "#7467ef",
        contrastText: "#ffffff",
      },
      secondary: secondaryColor,
      error: errorColor,
      text: textLight,
    },
  },
  purple2: {
    palette: {
      type: "light",
      primary: {
        main: "#6a75c9",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#FFBE2F",
        contrastText: textLight.primary,
      },
      error: errorColor,
      text: textLight,
    },
  },
  purpleDark1: {
    palette: {
      type: "dark",
      primary: {
        main: "#7467ef",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#FFBE2F",
        contrastText: textLight.primary,
      },
      error: errorColor,
      background: {
        paper: "#0d1a3f",
        default: "#091536",
      },
    },
  },
  purpleDark2: {
    palette: {
      type: "dark",
      primary: {
        main: "#6a75c9",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#FFBE2F",
        contrastText: textLight.primary,
      },
      error: errorColor,
      background: {
        paper: "#0d1a3f",
        default: "#091536",
      },
    },
  },
  blue: {
    palette: {
      type: "light",
      primary: {
        main: "#1976d2",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#FFAF38",
        contrastText: textLight.primary,
      },
      error: errorColor,
      text: textLight,
    },
  },
  blueDark: {
    palette: {
      type: "dark",
      primary: {
        main: "#1976d2",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#FF4F30",
        contrastText: textLight.primary,
      },
      error: errorColor,
      background: {
        paper: "#0d1a3f",
        default: "#091536",
      },
    },
  },
  red: {
    palette: {
      type: "dark",
      primary: {
        main: "#e53935",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#FFAF38",
        contrastText: textLight.primary,
      },
      error: errorColor,
    },
  },
};
