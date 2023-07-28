import React from 'react'
import Header from './Header'
import { Outlet } from 'react-router-dom'

const Layout = () => {
  return (
    <main>
        <Header></Header>
        <Outlet></Outlet>
    </main>
  )
}

export default Layout