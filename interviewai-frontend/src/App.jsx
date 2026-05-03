import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./Redux/store";
import Home from "./Pages/Home";
import Auth from "./Pages/Auth";
import InterviewPage from "./Pages/InterviewPage";
import HistoryPage from "./Pages/HistoryPage";
import CodingPage from "./Pages/CodingPage";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";

export const serverUrl = import.meta.env.VITE_SERVER_URL;

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/interview" element={<InterviewPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/coding" element={<CodingPage />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </Provider>
  );
}

export default App;