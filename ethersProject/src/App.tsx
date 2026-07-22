import './App.css'
import Campaign from '../components/Campaign.tsx'
import HomePage from '../components/HomePage.tsx'
import CreateCampaign from '../components/CreateCampaign.tsx'
import AllCampaign from '../components/AllCampaign.tsx'
import MyCampaigns from '../components/MyCampaigns.tsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { WalletProvider } from '../Provider.jsx'


function App() {

  return (
    <WalletProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/allcampaigns" element={<AllCampaign />} />
          <Route path="/create" element={<CreateCampaign />} />
          <Route path="/campaign/:id" element={<Campaign />} />
          <Route path="/mycampaigns" element={<MyCampaigns />} />
        </Routes>
      </BrowserRouter>
    </WalletProvider>
  )
}

export default App
