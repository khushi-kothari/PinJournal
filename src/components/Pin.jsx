import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { MdDownloadForOffline } from 'react-icons/md';
import { AiTwotoneDelete } from 'react-icons/ai';
import { BiSolidUser, BiUser } from 'react-icons/bi'
import { BsFillArrowUpRightCircleFill } from 'react-icons/bs';
import { db } from '../firestore';
import { arrayUnion, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { saveAs } from 'file-saver'

const Pin = ({ pin }) => {
  const [postHovered, setPostHovered] = useState(false);
  const [savingPost, setSavingPost] = useState(false);

  const navigate = useNavigate();

  const { Pin: { image, url }, CreatedBy, id } = pin;
  // console.log(image, url, CreatedBy, id);

  const user = localStorage.getItem('user') !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : localStorage.clear();

  const deletePin = async (id) => {
    const docRef = doc(db, "Pins", id); //(db, collection_name, doc_id)
    await deleteDoc(docRef);
  };

  // console.log('pin ', pin)

  let alreadySaved = pin?.SavedBy?.filter((item) => {
    return item?.id === user?.sub;
  });
  // console.log('user, alreadySaved ', alreadySaved);

  alreadySaved = alreadySaved?.length > 0 ? alreadySaved : [];

  // // {console.log(user?.sub)}

  const downloadImage = () => {
    saveAs(image, 'image.jpg') // Put your image URL here.
  }

  const savePin = async (id) => {
    if (user?.sub) {
      if (alreadySaved?.length === 0) {
        setSavingPost(true);

        //pin id -> ana SavedBy ma add reference of this user -> 
        const docRef = doc(db, "Pins", id);
        const referenceToAdd = doc(db, "Users", user?.sub);

        await updateDoc(docRef, { SavedBy: arrayUnion(referenceToAdd) });
      }
    }
    else {
      var answer = window.confirm("Please login to save the pin");
      if (answer) {
        navigate('/login');
      }
    }
  }

  return (
    <div className="m-2">
      <div
        onMouseEnter={() => setPostHovered(true)}
        onMouseLeave={() => setPostHovered(false)}
        onClick={() => navigate(`/pin-detail/${id}`)}
        className=" relative cursor-zoom-in w-auto hover:shadow-lg rounded-2xl overflow-hidden transition-all duration-500 ease-in-out"
      >
        {image && (
          <img className="rounded-2xl w-full" src={image} />
        )}
        {postHovered && (
          <div
            className="absolute top-0 bg-blackOverlay w-full h-full flex flex-col justify-between p-1 pr-2 pt-2 pb-2 z-50"
            style={{ height: '100%' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadImage();
                  }}
                  className="bg-white w-9 h-9 p-2 rounded-full flex items-center justify-center text-dark text-xl opacity-75 hover:opacity-100 hover:shadow-md outline-none"
                >
                  <MdDownloadForOffline />
                </span>
              </div>
              {alreadySaved?.length !== 0 ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="bg-violet-500 opacity-70 hover:opacity-100 text-white font-bold px-5 py-1 text-base rounded-3xl hover:shadow-md outline-none">
                  {pin?.SavedBy?.length}  Saved
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    savePin(id);
                  }}
                  type="button"
                  className="bg-violet-500 opacity-70 hover:opacity-100 text-white font-bold px-5 py-1 text-base rounded-3xl hover:shadow-md outline-none"
                >
                  {savingPost ? 'Saving' : 'Save'}
                </button>
              )}
            </div>
            <div className=" flex justify-between items-center gap-1 w-full">
              <div>
                <Link
                  to={`/user-profile/${CreatedBy?.id}`}
                  onClick={(e) => e.stopPropagation()} className="flex gap-2 items-center pb-2 text-gray-300 hover:text-gray-100">
                  <BiUser className='ml-1' />
                  <p className="font-medium capitalize text-sm">
                    {CreatedBy?.name}
                  </p>
                </Link>
                {url?.slice(8).length > 0 ? (
                  <a
                    href={url}
                    onClick={(e) => e.stopPropagation()}
                    target="_blank"
                    className="bg-white flex items-center gap-2 text-black text-sm font-medium p-1 pl-4 pr-4 rounded-full opacity-80 hover:opacity-100 hover:shadow-md"
                    rel="noreferrer"
                  >
                    {' '}
                    <BsFillArrowUpRightCircleFill />
                    {url?.slice(7, 17)}...
                  </a>
                ) : undefined}
              </div>
              {CreatedBy?.id === user?.sub && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePin(id);
                  }}
                  className="bg-white p-2 rounded-full w-8 h-8 flex items-center justify-center text-dark opacity-75 hover:opacity-100 outline-none"
                >
                  <AiTwotoneDelete />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <p className='pb-3'></p>
      <Link
        to={`/user-profile/${CreatedBy?.id}`}
        className="flex gap-2 mt-2 items-center">
        <img
          className="w-8 h-8 rounded-full object-cover"
          src={CreatedBy?.image}
          alt="user-profile"
        />
        <p className=" font-medium capitalize">
          {CreatedBy?.name}
        </p>
      </Link>
    </div>
  );
};

export default Pin;