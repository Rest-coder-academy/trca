import { Button, CircularProgress } from "@mui/material";

const ButtonComponent = ({
  label = "",
  variant = "contained",
  onBtnClick = () => {},
  fullWidth = false,
  disabled = false,
  loading = false,
  children,
  sx = {},
  onMouseLeave = () => {},
  onMouseEnter = () => {},
  type = "button",
  // backward-compat props — no longer applied
  size: _size,
  borderRadius: _borderRadius,
  bgColor: _bgColor,
  textColor: _textColor,
  paddingX: _paddingX,
  paddingY: _paddingY,
}) => {
  return (
    <Button
      variant={variant}
      onClick={onBtnClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-busy={loading || undefined}
      sx={{
        // text variant: min touch target only, no forced height
        ...(variant === "text"
          ? { minHeight: 44 }
          : { height: "var(--rca-control-h)" }),
        borderRadius: "var(--rca-radius-md)",
        textTransform: "capitalize",
        transition: "background-color var(--rca-transition), border-color var(--rca-transition)",
        position: "relative",
        ...(variant === "contained" && {
          backgroundColor: loading ? "var(--rca-navy-pressed)" : "var(--rca-navy)",
          color: "var(--rca-ink-invert)",
          boxShadow: "none",
          "&:hover": { backgroundColor: "var(--rca-navy-hover)", boxShadow: "none" },
          "&:active": { backgroundColor: "var(--rca-navy-pressed)", boxShadow: "none" },
          "&:focus-visible, &.Mui-focusVisible": { boxShadow: "var(--rca-focus-ring)", outline: "none" },
          "&.Mui-disabled": {
            backgroundColor: loading ? "var(--rca-navy-pressed)" : "var(--rca-disabled-bg)",
            color: loading ? "var(--rca-ink-invert)" : "var(--rca-disabled-ink)",
          },
        }),
        ...(variant === "outlined" && {
          borderColor: "var(--rca-navy)",
          color: "var(--rca-navy)",
          "&:hover": { backgroundColor: "rgba(3, 8, 76, 0.06)", borderColor: "var(--rca-navy)" },
          "&:active": { backgroundColor: "rgba(3, 8, 76, 0.10)", borderColor: "var(--rca-navy)" },
          "&:focus-visible, &.Mui-focusVisible": { boxShadow: "var(--rca-focus-ring)", outline: "none" },
          "&.Mui-disabled": { borderColor: "var(--rca-disabled-bg)", color: "var(--rca-disabled-ink)" },
        }),
        ...(variant === "text" && {
          color: "var(--rca-ink)",
          "&:focus-visible, &.Mui-focusVisible": { boxShadow: "var(--rca-focus-ring)", outline: "none" },
        }),
        ...sx,
      }}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      disableRipple
      disableElevation
      type={type}
    >
      {loading ? (
        <>
          {/* hidden original content keeps button width stable */}
          <span aria-hidden="true" style={{ visibility: "hidden", display: "inline-flex", alignItems: "center" }}>
            {label}{children}
          </span>
          <span
            style={{
              position: "absolute",
              inset: 0,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <CircularProgress size={16} color="inherit" />
            Sending…
          </span>
        </>
      ) : (
        <>
          {label}
          {children}
        </>
      )}
    </Button>
  );
};

export default ButtonComponent;
