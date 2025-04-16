import { Stack, useTheme, Typography, Button, Box } from "@mui/material";
import React from "react";

const QuestionItem = ({ id, title, text }) => {
  const theme = useTheme();
  const borderValue = `1px solid ${theme.palette.divider}`;

  return (
    <Stack
      border={borderValue}
      p={{ xs: "20px", md: "30px" }}
      direction="column"
      justifyContent="space-between"
      key={id}
      borderRadius="10px"
      minHeight="300px"
    >
      <Typography variant="h5" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="subtitle2" color="text.secondary">
        {text}
      </Typography>
      <Box mt={2}>
        <Button variant="contained" color="primary">
          Read More
        </Button>
      </Box>
    </Stack>
  );
};

export default QuestionItem;
