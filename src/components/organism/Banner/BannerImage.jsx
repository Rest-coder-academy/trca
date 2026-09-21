import tech from "../../../assets/tech-logo.webp"
import { Box } from '@mui/material'

/**
 * Homepage hero illustration.
 *
 * Marked as the LCP element — this image is what Cloudflare RUM was clocking
 * at 8.1s on 20% of sessions before this change. Four things now make it fast:
 *
 *   - The asset is WebP, not PNG (82KB → 31KB, 62% smaller).
 *   - `fetchPriority="high"` tells the browser to skip its default lower
 *     priority for images below the very top of the page.
 *   - `decoding="async"` keeps the main thread free while the image decodes.
 *   - Explicit width/height reserves the layout box before the pixels arrive,
 *     which is what also drops the footer CLS score (the footer was jumping
 *     downward when the image finally loaded and pushed the page taller).
 */
function BannerImage() {
  return (
    <Box className="banner-image">
      <img
        src={tech}
        alt="Rest Coder Academy — mentor-led coding training"
        width="503"
        height="502"
        fetchPriority="high"
        loading="eager"
        decoding="async"
      />
    </Box>
  )
}

export default BannerImage
