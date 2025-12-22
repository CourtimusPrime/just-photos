import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import Feed from './pages/Feed'
import Upload from './pages/Upload'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <header>
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </header>
        <SignedIn>
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/upload" element={<Upload />} />
          </Routes>
        </SignedIn>
      </div>
    </BrowserRouter>
  )
}

export default App
