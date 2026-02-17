import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

import { useNotes } from '../context/NotesContext'

const Navbar = () => {
  const navigate = useNavigate()
  const { refreshUser } = useNotes()
  const user = JSON.parse(localStorage.getItem('currentUser'))

  const logoutUser = () => {
    localStorage.removeItem('currentUser')
    refreshUser()
    navigate('/')
  }
  return (
    <div className='shadow bg-white'>
      <nav className='flex items-center justify-between max-w-7xl mx-auto px-4 py-3.5 text-slate-800 transition-all'>
        <NavLink to="/">
          <p className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent text-3xl font-bold">
            NoteGen AI
          </p>
        </NavLink>
        <div className='flex items-center gap-4 text-sm'>
          <p className='max-sm:hidden'>Hii, {user?.name || 'Guest'}</p>

          {user ? (
            <button onClick={logoutUser} className='bg-white hover:bg-slate-50 border border-gray-300 px-7 py-1.5 rounded-full active:scale-95 transition-all'>Logout</button>
          ) : (
            <button onClick={() => navigate('/login')} className='bg-green-500 text-white px-7 py-1.5 rounded-full active:scale-95 transition-all'>Login</button>
          )}
        </div>
      </nav>
    </div>
  )
}

export default Navbar