import TypoGraphyComponent from "../../atoms/TypoGraphyComponent/TypoGraphyComponent";
import { Box } from "@mui/material";
import ButtonComponent from "../../atoms/ButtonComponent/ButtonComponent";
import { useAuth } from "../../../App";
import { useBatches } from "../Batches/useBatches";
import { getNextBatch, formatBatchDateShort } from "../Batches/batchDateUtils";
import BannerProof from "./BannerProof";
import { heroCopy } from "./heroCopy";

function BannerContent() {
  const { openModal } = useAuth();
  const batches = useBatches();
  const nextBatch = getNextBatch(batches);
  const nextBatchDate = nextBatch ? formatBatchDateShort(nextBatch.date) : "";

  return (
    <>
      <TypoGraphyComponent
        variant="h2"
        component="h1"
        className="banner-title"
        text={heroCopy.title}
      />

      <TypoGraphyComponent
        variant="body"
        component="p"
        className="banner-subhead"
      >
        {heroCopy.subhead}
      </TypoGraphyComponent>

      <BannerProof />

      <Box className="banner-content-btns">
        <ButtonComponent
          variant="contained"
          size="large"
          sx={{ px: "2rem" }}
          onBtnClick={openModal}
        >
          {heroCopy.cta}
        </ButtonComponent>

        {/* The reason to act today rather than next month. Read live from
            /api/batches, so it follows whatever Uday sets in /admin/batches —
            and simply isn't rendered when no batch is upcoming, rather than
            showing a stale or empty date. */}
        {nextBatchDate ? (
          <span className="banner-next-batch">
            {heroCopy.nextBatchLabel} · {nextBatchDate}
          </span>
        ) : null}
      </Box>
    </>
  );
}

export default BannerContent;
