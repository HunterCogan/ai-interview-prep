import { Route, Routes } from 'react-router-dom'
import Header from '@/components/Header'
import HomePage from '@/pages/HomePage'
import HistoryPage from '@/pages/HistoryPage'
import InterviewDetailPage from '@/pages/InterviewDetailPage'

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/history/:interviewId" element={<InterviewDetailPage />} />
      </Routes>
    </>
  )
}

export default App
