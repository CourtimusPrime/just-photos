/*
 * JustPhotos
 * Copyright (C) 2025 JustPhotos contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 *
 * See the LICENSE file for more details.
 */
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
