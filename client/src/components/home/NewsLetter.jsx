import React from 'react'

const NewsLetter = () => {
  return (
//     <>
// <div className="max-w-7xl w-full mx-auto rounded-2xl bg-gradient-to-r from-green-100 via-green-200 to-green-300 px-2 text-center text-gray-400 py-20 flex flex-col items-center justify-center">
//                 <p className="text-green-500 font-medium">Get updated</p>
//                 <h1 className="max-w-lg font-semibold text-4xl/[44px] mt-2">Subscribe to our newsletter & get the latest news</h1>
//                 <div className="flex items-center justify-center mt-10 border border-slate-600 focus-within:outline focus-within:outline-green-600 text-sm rounded-full h-14 max-w-md w-full">
//                     <input type="text" className="bg-transparent outline-none rounded-full px-4 h-full flex-1" placeholder="Enter your email address"/>
//                     <button className="bg-green-600 text-white rounded-full h-11 mr-1 px-8 flex items-center justify-center">
//                         Subscribe now
//                     </button>
//                 </div>
//             </div>
//             <style>{`
//                 @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
            
//                 * {
//                     font-family: 'Poppins', sans-serif;
//                 }
//             `}</style>
//     </>
<div className="flex flex-col items-center justify-center text-center space-y-2 mt-20">
            <h1 className="md:text-4xl text-2xl font-semibold text-gray-600">Never Miss a Deal!</h1>
            <p className="md:text-lg text-gray-500 pb-8">
                Subscribe to get the latest offers, new arrivals, and exclusive discounts
            </p>
           <form className="flex justify-between max-w-xl w-full max-sm:scale-75 mx-auto border border-gray-300 bg-white rounded-full overflow-hidden">
          <input
            type="text"
            placeholder="Enter your Email id"
            required
            className="w-full pl-4 outline-none"
          />
          <button className="bg-green-500 text-white px-8 py-2 m-1.5 rounded-full hover:scale-105 transition-all cursor-pointer">
            Subscribe
          </button>
        </form>
        </div>
  )
}

export default NewsLetter