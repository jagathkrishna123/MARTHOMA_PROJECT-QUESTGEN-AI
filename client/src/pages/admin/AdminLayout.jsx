import React from 'react'
import { Outlet } from 'react-router-dom'

import AdminSidebar from './AdminSidebar'

const AdminLayout = () => {
  return (
    <div className='min-h-screen bg-gray-50'>
        <div className='flex'>
          <AdminSidebar/>
          <div className='flex-1 overflow-y-auto ml-56'>
            <Outlet/>
          </div>
        </div>
    </div>
  )
}

export default AdminLayout