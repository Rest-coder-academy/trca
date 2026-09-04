import { ListItem, ListItemIcon, ListItemText } from '@mui/material'
import React from 'react';

/**
 * One "Date : 16-09-2026" row on a batch card.
 *
 * These were ListItemButtons — with the ripples disabled, because somebody had
 * already noticed they should not feel clickable. They still rendered as
 * role="button" with a tab stop, so a keyboard user tabbed through seven fake
 * buttons per card, and each counted as a 212 x 32 tap target that could never
 * meet the 44px minimum without doubling the card's height (#11).
 *
 * They are read-only facts. A ListItem is what they always were.
 */
function BatchItem({title, data, icon}) {
  return (
    <ListItem>
      <ListItemIcon>
        {icon}
      </ListItemIcon>
      <ListItemText primary={`${title} : ${data}`} />
    </ListItem>
  );
}

export default BatchItem
