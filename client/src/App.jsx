import {BrowserRouter, Routes, Route} from 'react-router-dom'

function App() {
  return (
    <userContext.Provider value={user}>
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />}></Route>
      </Routes>
      <Footer/>
    </BrowserRouter>
    </userContext.Provider>
  )
}

export default App