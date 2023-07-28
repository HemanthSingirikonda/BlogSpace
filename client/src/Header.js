import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
// import { userContext } from './UserContext';
import { UserContext } from './UserContext';

const Header = () => {
  const {userInfo,setUserInfo}= useContext(UserContext);
  useEffect(()=>{
      fetch('http://localhost:4000/profile',{
        credentials:'include',
      }).then(response =>{
        response.json().then(userInfo=>{
          // setUsername(userInfo.username);
          setUserInfo(userInfo);
        })
      })
      // console.log('working');  
  },[]);

  const username=userInfo?.username;

  function logout(){
    fetch('http://localhost:4000/logout',{
      credentials:'include',
      method: 'POST',
    })
    setUserInfo(null);
  }

  return (
    <header>
        <Link to="/" className="logo">MyBlog</Link>
        <nav>
          {
            username && (
              <>
                <Link to='/create'>Create new post</Link>
                <a onClick={logout}>Logout</a>
              </>
            )
          }
          {
            !username && (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )
          }
        </nav>
      </header>
  )
}

export default Header