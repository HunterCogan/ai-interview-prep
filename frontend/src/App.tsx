import { Route, Routes } from 'react-router-dom'
import Header from '@/components/Header'
import HomePage from '@/pages/HomePage'
import HistoryPage from '@/pages/HistoryPage'

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </>
  )
}

export default App
