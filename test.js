// AuthContext.js
import { createContext, useReducer, useEffect } from 'react'

export const AuthContext = createContext()

export const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { user: action.payload }
    case 'LOGOUT':
      return { user: null }
    default:
      return state
  }
}

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, { 
    user: null
  }) 

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))

    if (user) {
      dispatch({ type: 'LOGIN', payload: user }) 
    }
  }, [])

  console.log('AuthContext state:', state)
  
  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      { children }
    </AuthContext.Provider>
  )

}

// useAuthContext.js
import { AuthContext } from "../context/AuthContext"
import { useContext } from "react"

export const useAuthContext = () => {
  const context = useContext(AuthContext)

  if(!context) {
    throw Error('useAuthContext must be used inside an AuthContextProvider')
  }

  return context
}

// useLogin.js
import { useState } from 'react'
import { useAuthContext } from './useAuthContext'

export const useLogin = () => {
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(null)
  const { dispatch } = useAuthContext()

  const login = async (companyName, password) => {
    setIsLoading(true)
    setError(null)

    const response = await fetch('https://dostbackend.onrender.com/api/user/login', {
    // const response = await fetch('http://localhost:5000/api/user/login', {

      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ companyName, password })
    })
    const json = await response.json()

    if (!response.ok) {
      setIsLoading(false)
      setError(json.error)
    }
    if (response.ok) {
      localStorage.setItem('user', JSON.stringify(json))

      dispatch({type: 'LOGIN', payload: json})

      setIsLoading(false)
    }
  }

  return { login, isLoading, error }
}

// userSignup
import { useState } from 'react';

export const useSignup = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const signup = async (email, password, companyName, accessCode) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://dostbackend.onrender.com/api/user/signup', {

        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email, password, companyName, accessCode })
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || 'Signup failed');
      }

      localStorage.setItem('user', JSON.stringify(json));
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { signup, isLoading, error };
};

// Login.js
import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import './AuthCss.css';
import bus1 from '../img/bus1.png';
import bus2 from '../img/bus2.png';
import Header from '../scenes/global/Header';
import { useLogin } from "../hooks/useLogin"

export default function BusCorporations() {
  const [companyName, setCompanyName] = useState('')
  const [password, setPassword] = useState('');
  const {login, error, isLoading} = useLogin()

    const handleSubmit = async (e) => {
      e.preventDefault()

      await login(companyName, password)
    }

    return (
        <div>
            <Header/>
            <section id="sectiona">
                <div className='left'>
                    <div className='upper'>
                        <div className='imgCtn'>
                            <img src={bus1} alt=''/>
                        </div>
                        <div className='imgCtn'>
                            <img src={bus2} alt=''/>
                        </div>
                    </div>
                    <div className='middle'>
                        <h1>Corporate Transit Partnership</h1>
                    </div>
                </div>

                <div className='right'>
                    <form onSubmit={handleSubmit}>
                        <input
                          type="text"
                          onChange={(e) => setCompanyName(e.target.value)}
                          value={companyName}
                          placeholder="Company Name"
                        />
                        <input
                          type="password"
                          onChange={(e) => setPassword(e.target.value)}
                          value={password}
                          placeholder="Password"
                        />
                        <button className='button btn' type="submit" disabled={isLoading}>
                          {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                        <p>
                          Don't have an account? <Link to='/signup'>Signup</Link>
                        </p>
                        {error && <div className="error">{error}</div>}
                    </form>)};


  //Signup.js
  import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import './AuthCss.css';
import bus1 from '../img/bus1.png';
import bus2 from '../img/bus2.png';
import Header from '../scenes/global/Header';
import { useSignup } from "../hooks/useSignup";

export default function BusCorporations() {
    const [email, setEmail] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [password, setPassword] = useState('');
    const [accessCode, setAccessCode] = useState('');
    const { signup, isLoading, error } = useSignup();

    const handleSubmit = async (e) => {
        e.preventDefault();

        await signup(email, password, companyName, accessCode);
    };

    return (
        <div>
            <Header/>
            <section id="sectiona">
                <div className='left'>
                    <div className='upper'>
                        <div className='imgCtn'>
                            <img src={bus1} alt=''/>
                        </div>
                        <div className='imgCtn'>
                            <img src={bus2} alt=''/>
                        </div>
                    </div>
                    <div className='middle'>
                        <h1>Corporate Transit Partnership</h1>
                    </div>
                </div>

                <div className='right'>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            placeholder="Email"
                        />
                        <input
                            type="password"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            placeholder="Password"
                        />
                        <input
                            type="text"
                            onChange={(e) => setCompanyName(e.target.value)}
                            value={companyName}
                            placeholder="Company Name"
                        />
                        <input
                            type="text"
                            onChange={(e) => setAccessCode(e.target.value)}
                            value={accessCode}
                            placeholder="Access Code"
                        />
                        <button className='button btn' type="submit" disabled={isLoading}>
                            {isLoading ? 'Signing up...' : 'Signup'}
                        </button>
                        <p>
                          Already have an account? <Link to='/login'>Login</Link>
                        </p>
                        {error && <div className="error">{error}</div>}
                    </form>


//App.js
import { useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Signup from './pages/Signup';
import Login from './pages/Login';
import Home from "./scenes/home/Home";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import { useAuthContext } from './hooks/useAuthContext'

function App() {
  const location = useLocation();
  const { user } = useAuthContext()

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <main className="content">
            <Routes>
              <Route
                path="/"
                element={user ? <Home/> : <Navigate to='/login' />} 
              />
              <Route
                path="/login"
                element={!user ? <Login /> : <Navigate to="/" />} 
              />
              <Route 
                path="/signup"
                element={!user ? <Signup /> : <Navigate to="/login" />}
              />

            </Routes>

          </main>
          {shouldDisplaySidebarAndTopbar() && <RightSidebar isSidebar={isSidebar} />}

        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;


