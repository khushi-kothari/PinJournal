import React from 'react';
import { Circles } from 'react-loader-spinner';

const Spinner = ({ message }) => {
  return (
    <div className='flex flex-col justify-center items-center w-full h-full'> 
        <Circles 
            type="circles"
            color="#00bfff"
            height={50}
            width= {200}
            className="m-5"
        />
        <p className='tex-lg text-center px-4 mt-6 text-lg text-gray-500 font-medium'>{message}</p>
    </div>
  )
}

export default Spinner