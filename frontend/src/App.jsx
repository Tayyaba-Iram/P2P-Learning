import {BrowserRouter, Route, Routes} from 'react-router-dom'
import Home from "./Student Home"
import Register from './Student Register'
import Login from './Student Login'
import { createContext } from "react"
export const userContext = createContext();
import Navbar from './Student Navbar'

function App() {
  return (
    <BrowserRouter>
    <Navbar/>
    <Routes>
      <Route path="/" element={<Home />}></Route>
      <Route path='/register' element = {<Register />}></Route>
      <Route path='/register' element = {<Register />}></Route>
      <Route path='/login' element = {<Login />}></Route>
    </Routes>
    </BrowserRouter>
  )
}

export default App