import { Button, Box } from "@mui/material";

/**
 * The button used everywhere on the site — Register Now, Apply Now, Enquire
 * Now, the enquiry submit.
 *
 * It previously defined exactly one state (a disabled fill of #706c61): no
 * hover, no pressed, no focus, no loading. Nothing responded to the cursor,
 * keyboard users got no visible focus at all, and the submit button could be
 * pressed over and over during a request with no feedback (#7).
 *
 * All six states now come from design/tokens.css, and each is a distinct fill
 * — no opacity tricks on the solid variant. The transition is on background
 * only: no lift, no scale.
 */

/** Colour, hover and pressed per variant. `text` never gets a background
 *  fill — only a text color and a subtle hover tint. */
const VARIANT_SX = {
  contained: {
    backgroundColor: "var(--rca-navy)",
    color: "var(--rca-ink-invert)",
    border: "1px solid transparent",
    "&:hover": { backgroundColor: "var(--rca-navy-hover)" },
    "&:active": { backgroundColor: "var(--rca-navy-pressed)" },
  },
  outlined: {
    backgroundColor: "transparent",
    color: "var(--rca-navy)",
    border: "1px solid var(--rca-navy)",
    "&:hover": { backgroundColor: "rgba(3, 8, 76, 0.06)" },
    "&:active": { backgroundColor: "rgba(3, 8, 76, 0.12)" },
  },
  // The navbar's only text-variant use (the nav links) sits on a white bar,
  // not navy — no fill, but it still needs a real text color, or it falls
  // through to MUI's default primary blue.
  text: {
    color: "var(--rca-ink)",
    "&:hover": { backgroundColor: "rgba(3, 8, 76, 0.04)" },
  },
};

const SPINNER_SX = {
  width: 16,
  height: 16,
  borderRadius: "50%",
  border: "2px solid rgba(255, 255, 255, 0.35)",
  borderTopColor: "#fff",
  animation: "rca-spin 0.7s linear infinite",
  "@keyframes rca-spin": { to: { transform: "rotate(360deg)" } },
  // Someone who has asked their OS to stop animation still needs to know the
  // request is in flight, so the spinner stays — it just stops spinning.
  "@media (prefers-reduced-motion: reduce)": { animation: "none" },
};

const ButtonComponent = ({
  label = "",
  variant = "contained",
  onBtnClick = () => {},
  size = "small",
  borderRadius = "var(--rca-radius-md)",
  fullWidth = false,
  disabled = false,
  loading = false,
  loadingLabel = "Sending…",
  children,
  paddingX = 3,
  paddingY = 1,
  sx = {},
  onMouseLeave = () => {},
  onMouseEnter = () => {},
  type = "button",
}) => {
  const isControl = variant === "contained" || variant === "outlined";
  const content = (
    <>
      {label}
      {children}
    </>
  );

  return (
    <Button
      variant={variant}
      onClick={onBtnClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      size={size}
      sx={{
        textTransform: "capitalize",
        fontFamily: "var(--rca-font)",
        fontWeight: "var(--rca-fw-semibold)",
        borderRadius,
        paddingX,
        paddingY,
        // 48px desktop / 44px mobile — tokens.css flips the value itself at
        // 767px, so there is no breakpoint to repeat here.
        ...(isControl ? { minHeight: "var(--rca-control-h)" } : {}),
        // Background only. A button that lifts or scales draws the eye away
        // from the thing it is submitting.
        transition:
          "background-color var(--rca-transition), border-color var(--rca-transition)",
        ...VARIANT_SX[variant],
        // The one state the button had before was disabled, and it was the
        // wrong grey. Placed after the variant so it wins on either.
        "&.Mui-disabled": {
          backgroundColor: "var(--rca-disabled-bg)",
          color: "var(--rca-disabled-ink)",
          border: "1px solid transparent",
        },
        // Keyboard focus only — this is what `disableFocusRipple` was quietly
        // removing, leaving keyboard users with no affordance whatsoever.
        "&.Mui-focusVisible, &:focus-visible": {
          boxShadow: "var(--rca-focus-ring)",
          outline: "none",
        },
        // Loading is disabled — that is what stops the double-submit — but it
        // must not *look* disabled, or there is no signal that anything is
        // happening. So it overrides the disabled fill by the same selector.
        ...(loading
          ? {
              "&, &.Mui-disabled": {
                backgroundColor: "var(--rca-navy-pressed)",
                color: "var(--rca-ink-invert)",
                border: "1px solid transparent",
                cursor: "progress",
              },
            }
          : {}),
        ...sx,
      }}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      disableRipple
      disableElevation
      type={type}
    >
      {/* Both labels are always rendered, stacked in one grid cell, with only
          one visible. That is what keeps the width identical in every state:
          the button is always as wide as the longer of the two, so going into
          loading never makes the layout jump. */}
      <Box
        sx={{
          display: "grid",
          gridTemplateAreas: '"stack"',
          alignItems: "center",
          justifyItems: "center",
        }}
      >
        <Box
          sx={{
            gridArea: "stack",
            display: "flex",
            alignItems: "center",
            gap: "var(--rca-space-2)",
            visibility: loading ? "hidden" : "visible",
          }}
        >
          {content}
        </Box>
        <Box
          aria-hidden={!loading}
          sx={{
            gridArea: "stack",
            display: "flex",
            alignItems: "center",
            gap: "var(--rca-space-2)",
            visibility: loading ? "visible" : "hidden",
          }}
        >
          <Box component="span" sx={SPINNER_SX} />
          {loadingLabel}
        </Box>
      </Box>
    </Button>
  );
};

export default ButtonComponent;
