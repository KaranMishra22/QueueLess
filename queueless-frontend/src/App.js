import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Queue from './pages/Queue';
import ProviderDashboard from './pages/ProviderDashboard'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/queue/:serviceId" element={<Queue />} />
        <Route path="/provider" element={<ProviderDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
