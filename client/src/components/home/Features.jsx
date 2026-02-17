import { Zap } from 'lucide-react';
import React from 'react'
import Title from './Title';
import { FaMicrochip } from "react-icons/fa6";
import { TbTargetArrow } from "react-icons/tb";


const Features = () => {
    const [isHover, setIsHover] = React.useState(false);
  return (
     <div id='features' className='flex flex-col items-center my-10 scroll-mt-12'>
         <div className="flex items-center gap-2 text-sm text-green-800 bg-green-400/10 border border-green-200 rounded-full px-4 py-1">
            <Zap width={14}/>
            <span>How it works</span>
        </div>
        <Title
  title="Build Your notes"
  description="Our streamlined process helps you create a professional notes in minutes with intelligent AI-powered tools and features"
/>
            <div className="flex flex-col md:flex-row items-center justify-center xl:-mt-10">
                <img className="max-w-2xl w-full xl:-ml-32" src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/features/group-image-1.png" alt="" />
                <div className="px-4 md:px-0" onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)}>
                    <div className={"flex items-center justify-center gap-6 max-w-md group cursor-pointer"}>
                        <div className={`flex items-center p-6 group-hover:bg-violet-100 border border-transparent group-hover:border-violet-300  flex gap-4 rounded-xl transition-colors ${!isHover ? 'border-violet-300 bg-violet-100' : ''}`}>
                        <FaMicrochip className="w-8 h-8 text-blue-500" />
                            <div className="space-y-2">
                                <h3 className="text-base font-semibold text-slate-700">AI-Powered Note Generation</h3>
                                <p className="text-sm text-slate-600 max-w-xs">Instantly convert ideas, topics, or content into clear, structured notes using AI.</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-6 max-w-md group cursor-pointer">
                        <div className="flex items-center p-6 group-hover:bg-green-100 border border-transparent group-hover:border-green-300 flex gap-4 rounded-xl transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6 stroke-green-600"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" /></svg>
                            <div className="space-y-2">
                                <h3 className="text-base font-semibold text-slate-700">Smart Summarization</h3>
                                <p className="text-sm text-slate-600 max-w-xs">Turn long articles, PDFs, or lectures into short, easy-to-read notes.</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-6 max-w-md group cursor-pointer">
                        <div className="flex items-center p-6 group-hover:bg-orange-100 border border-transparent group-hover:border-orange-300 flex gap-4 rounded-xl transition-colors">
                        <TbTargetArrow className="w-8 h-8 text-red-500" />
                            <div className="space-y-2">
                                <h3 className="text-base font-semibold text-slate-700">Topic-Focused Output</h3>
                                <p className="text-sm text-slate-600 max-w-xs">Get precise notes tailored to your subject, level, and purpose.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
            
                * {
                    font-family: 'Poppins', sans-serif;
                }
            `}</style>
        </div>
  )
}

export default Features