import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";

export default function InputBoxComponent({
  label = "Example Label",
  variant = "outlined",
  name = "",
  params,
  value = "",
  onChange = () => {},
  helperText = "",
  error = false,
  type = "text",
}) {
  return (
    <TextField
      {...params}
      sx={{
        width: "100%",
        "& .MuiInputBase-input": {
          backgroundColor: "var(--rca-surface)",
          color: "var(--rca-ink)",
        },
        "& .MuiInputBase-input:-webkit-autofill": {
          WebkitBoxShadow: "0 0 0 1000px var(--rca-surface) inset",
          WebkitTextFillColor: "var(--rca-ink)",
        },
      }}
      name={name}
      size="small"
      // slotProps={{
      //   inputLabel: {
      //     shrink: false,
      //   },
      // }}
      label={label}
      variant={variant}
      value={value}
      onChange={onChange}
      helperText={helperText}
      error={Boolean(error)}
      type={type}
    />
  );
}
