import debounce from "lodash/debounce";
import { useEffect, useState } from "react";


const useWindowSize = () => {
  const isClient = typeof window !== 'undefined';
  const [width, setWidth] = useState(isClient ? window.innerWidth : 1200);

  useEffect(() => {
    if (!isClient) return;
    const handleResize = debounce(() => {
      setWidth(window.innerWidth);
    }, 250);
    window.addEventListener('resize', handleResize);
    return () => {
      handleResize.cancel();
      window.removeEventListener('resize', handleResize);
    };
  }, [isClient]);
  return width;
};

export default useWindowSize;
