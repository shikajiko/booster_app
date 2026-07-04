import React from 'react';
import { TextField } from '@mui/material';

function SearchBar({
  value,
  onChange,
  label = 'Search',
  placeholder = 'Type to search...',
}) {
  return (
    <TextField
      label={label}
      variant="outlined"
      size="small"
      fullWidth
      value={value}
      onChange={onChange}
      style={{ marginTop: 10 }}
      placeholder={placeholder}
    />
  );
}

export default SearchBar;
