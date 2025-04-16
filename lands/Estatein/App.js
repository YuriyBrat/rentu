import "react-lazy-load-image-component/src/effects/blur.css";
import { RouterProvider } from "react-router-dom";
import router from "./router";

function App() {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
