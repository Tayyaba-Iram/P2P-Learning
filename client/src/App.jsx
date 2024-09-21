import Navbar from "./Navbar"
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Home from "./Home"
import { createContext, useEffect, useState } from "react"
import axios from "axios"
import Footer from "./Footer.jsx"
export const userContext = createContext();

function App() {
  const [user, setUser] = useState({
    username: null,
    email: null
  })
  axios.defaults.withCredentials = true;
  useEffect(() => {
    axios.get('http://localhost:3001/')
    .then(user => {
      setUser(user.data)
    })
    .catch(err => console.log(err))
  }, [])

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