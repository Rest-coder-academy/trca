import { createTheme } from "@mui/material/styles";

/**
 * MUI's default theme sets Roboto on every Typography, Button and input, at a
 * specificity the `* { font-family }` rule in index.css cannot reach. So the
 * brand face was loaded, the CSS asked for it, and Roboto still rendered (#6).
 *
 * One face, from the token. Sizes and colours stay in CSS — this exists only
 * to stop MUI overriding the family.
 */
const theme = createTheme({
  typography: {
    fontFamily: 'var(--rca-font)',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { fontFamily: "var(--rca-font)" },
      },
    },
  },
});

export default theme;
