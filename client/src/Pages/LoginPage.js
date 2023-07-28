import React, { useContext, useState } from 'react'
import { Navigate } from 'react-router-dom';
import {UserContext} from '../UserContext';

const LoginPage = () => {
  const [username,setUsername]=useState('');
  const [password,setPassword]=useState('');
  const [redirect,setRedirect]=useState(false);
  const {setUserInfo}= useContext(UserContext);
  async function login(ev){
    ev.preventDefault();
    const response=await fetch('http://localhost:4000/login',{
      method:'POST',
      body: JSON.stringify({username,password}),
      headers:{'Content-Type':'application/json'},
      credentials:'include',
    })
    // console.log(response);
    if(response.ok){
      // console.log(123);
      response.json().then(userInfo=>{
        setUserInfo(userInfo);
        setRedirect(true);
      })
      
    }
    else{
      // console.log(response);
      alert('wrong credentials');
    }
  }

  if(redirect){
    return <Navigate to={'/'}/>
  }

  return (
    <form action='' className='login' onSubmit={login}>
        <h1>Login</h1>
        <input type='text' placeholder='Username' value={username} onChange={ev=>setUsername(ev.target.value)}></input>
        <input type="password" placeholder='Password' value={password} onChange={ev=>setPassword(ev.target.value)}></input>
        <button>Login</button>
    </form>
  )
}

export default LoginPage