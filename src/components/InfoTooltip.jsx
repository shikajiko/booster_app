import React, { useState } from 'react';
import Tooltip from '@mui/material/Tooltip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Box from '@mui/material/Box';
import { parameterDescriptions } from '../../utils/parameterDescriptions';

function InfoTooltip({ paramName }) {
  const [open, setOpen] = useState(false);

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipOpen = () => {
    setOpen(true);
  };

  const key = paramName?.toUpperCase();
  const description = parameterDescriptions[key] || null;

  return description ? (
    <ClickAwayListener onClickAway={handleTooltipClose}>
      <span>
        <Tooltip
          PopperProps={{
            disablePortal: true,
          }}
          onClose={handleTooltipClose}
          open={open}
          disableFocusListener
          disableHoverListener
          disableTouchListener
          title={description}
          arrow
          placement="top"
        >
          <Box
            component="span"
            onClick={handleTooltipOpen}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: '#bdbdbd',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginLeft: '6px',
            }}
          >
            ?
          </Box>
        </Tooltip>
      </span>
    </ClickAwayListener>
  ) : null;
}

export default InfoTooltip;
