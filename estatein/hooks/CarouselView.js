export const FourViewCarousel = (width) => {
  if (width < 600) {
    return 1;
  } else if (width > 600 && width < 900) {
    return 2;
  } else if (width > 900 && width < 1200) {
    return 3;
  } else {
    return 4;
  }
};

export const ThreeViewCarousel = (width) => {
  if (width < 600) {
    return 1;
  } else if (width > 600 && width < 900) {
    return 1;
  } else if (width > 900 && width < 1200) {
    return 2;
  } else {
    return 3;
  }
};

export const TooViewCarousel = (width) => {
  if (width < 1100) {
    return 1;
  } else {
    return 2;
  }
};
