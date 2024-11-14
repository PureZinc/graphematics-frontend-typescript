import GraphPage from "./pages/GraphPage";
import GraphDetail from "./pages/GraphDetail";
import HomePage from "./pages/HomePage";
// import LoginPage from "./pages/auth/LoginPage";
// import RegisterPage from "./pages/auth/RegisterPage";
import Navbar from "./components/Navbar";
import BuildGraph from "./pages/BuildGraph";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

type Route = {
  path: string,
  element: React.FC
}

function AllRoutes() {
  const routes: Route[] = [
    { element: HomePage, path: "/" },
    { element: GraphPage, path: "graphs/" },
    { element: GraphDetail, path: "graphs/:id/" },
    { element: BuildGraph, path: "create/" },
    { element: BuildGraph, path: "create/:id/" }
  ]
  return (
    <Routes>
      {routes.map((route, index) => (
        <Route key={index} element={<route.element />} path={route.path} />
      ))
      }
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <Navbar />
      <AllRoutes />
    </Router>
  );
}

export default App;