import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { MdDownloadForOffline } from 'react-icons/md';
import { AiTwotoneDelete } from 'react-icons/ai';
import { BiSolidUser, BiUser } from 'react-icons/bi'
import { BsFillArrowUpRightCircleFill } from 'react-icons/bs';
// import { SanityImage } from "sanity-image"
// import { client, urlFor } from '../client';

const Pin = ({ pin }) => {
  const [postHovered, setPostHovered] = useState(false);
  const [savingPost, setSavingPost] = useState(false);

  // const navigate = useNavigate();

  console.log('Pin from Pin component: ', pin);
  const { Pin: { image, url }, CreatedBy, id } = pin;

  const user = localStorage.getItem('user') !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : localStorage.clear();

  // const deletePin = (id) => {
  //   client
  //     .delete(id)
  //     .then(() => {
  //       window.location.reload()
  //       // setTimeout(window.location.reload(), 2000);
  //     });
  // };

  let alreadySaved = pin?.SavedBy?.filter((item) => item?.postedBy?.id === user?.sub);

  // alreadySaved = alreadySaved?.length > 0 ? alreadySaved : [];

  // // {console.log(user?.sub)}

  // const savePin = (id) => {
  //   if (user?.sub) {
  //     if (alreadySaved?.length === 0) {
  //       setSavingPost(true);

  //       client
  //         .patch(id)
  //         .setIfMissing({ save: [] })
  //         .insert('after', 'save[-1]', [{
  //           _key: uuidv4(),
  //           userId: user?.sub,
  //           postedBy: {
  //             _type: 'postedBy',
  //             _ref: user?.sub,
  //           },
  //         }])
  //         .commit()
  //         .then(() => {
  //           window.location.reload();
  //           setSavingPost(false);
  //           // setTimeout(() => {
  //           //   window.location.reload();
  //           //   setSavingPost(false);
  //           // }, 15000)
  //           // setTimeout(window.location.reload(), 30000);
  //           // setTimeout(window.location.reload(), 45000);
  //         });
  //     }
  //   }
  //   // make it visually appealing
  //   else {
  //     var answer = window.confirm("Please login to save the pin");
  //     if (answer) {
  //       navigate('/login');
  //     }
  //   }
  // }

  // // const url_txt = `image-${image.asset.url.slice(49,-4)}-jpg`;

  // const parts = image.asset.url.split('/');
  // const parts_copy = parts.slice();
  // parts_copy.pop();
  // const base_url = parts_copy.join('/');
  // const assetIdPart = parts[parts.length - 1];
  // const [name, format] = assetIdPart.split('.');
  // const url_txt = `image-${name}-${format}`;

  return (
    <div className="m-2">
      <div
        onMouseEnter={() => setPostHovered(true)}
        onMouseLeave={() => setPostHovered(false)}
        onClick={() => navigate(`/pin-detail/${_id}`)}
        className=" relative cursor-zoom-in w-auto hover:shadow-lg rounded-2xl overflow-hidden transition-all duration-500 ease-in-out"
      >
        {/* {console.log(image.asset.url, parts, url_txt)} */}
        {/* {image && (
          // <img className="rounded-2xl w-full" src={(urlFor(image).width(250).url())} alt="user-post" /> )}
          // To maintain high resolution images as original sources using lib called sanity-image
          <SanityImage
            // Pass the Sanity Image ID (`id`) (e.g., `image-abcde12345-1200x800-jpg`)
            className="rounded-2xl w-full"
            id={url_txt}
            alt="Demo image"
            baseUrl={`${base_url}/`}
            width={300}
            mode="cover"
            // height={250}
            queryParams={{ sharpen: 30, q: 80 }}
          />
        )} */}
        {postHovered && (
          <div
            className="absolute top-0 bg-blackOverlay w-full h-full flex flex-col justify-between p-1 pr-2 pt-2 pb-2 z-50"
            style={{ height: '100%' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <a
                  // href={`${image?.asset?.url}?dl=`}
                  href="#"
                  download
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="bg-white w-9 h-9 p-2 rounded-full flex items-center justify-center text-dark text-xl opacity-75 hover:opacity-100 hover:shadow-md outline-none"
                ><MdDownloadForOffline />
                </a>
              </div>
              {alreadySaved?.length !== 0 ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="bg-violet-500 opacity-70 hover:opacity-100 text-white font-bold px-5 py-1 text-base rounded-3xl hover:shadow-md outline-none">
                  {pin?.save?.length}  Saved
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    savePin(_id);
                  }}
                  type="button"
                  className="bg-violet-500 opacity-70 hover:opacity-100 text-white font-bold px-5 py-1 text-base rounded-3xl hover:shadow-md outline-none"
                >
                  {pin?.save?.length}   {savingPost ? 'Saving' : 'Save'}
                </button>
              )}
            </div>
            <div className=" flex justify-between items-center gap-1 w-full">
              <div>
                <Link
                  // to={`/user-profile/${postedBy?.id}`} 
                  onClick={(e) => e.stopPropagation()} className="flex gap-2 items-center pb-2 text-gray-300 hover:text-gray-100">
                  <BiUser className='ml-1' />
                  <p className="font-medium capitalize text-sm">
                    {/* {postedBy?.userName} */}
                    postedBy - username
                  </p>
                </Link>
                {destination?.slice(8).length > 0 ? (
                  <a
                    href={destination}
                    onClick={(e) => e.stopPropagation()}
                    target="_blank"
                    className="bg-white flex items-center gap-2 text-black text-sm font-medium p-1 pl-4 pr-4 rounded-full opacity-80 hover:opacity-100 hover:shadow-md"
                    rel="noreferrer"
                  >
                    {' '}
                    <BsFillArrowUpRightCircleFill />
                    {destination?.slice(7, 17)}...
                  </a>
                ) : undefined}
              </div>
              {/* {postedBy?.id === user?.sub && ( */}
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
              {/* )
              } */}
            </div>
          </div>
        )}
      </div>
      <p className='pb-3'></p>
      <Link
        // to={`/user-profile/${postedBy?.id}`} 
        className="flex gap-2 mt-2 items-center">
        <img
          className="w-8 h-8 rounded-full object-cover"
          // src={postedBy?.image}
          src="#"
          alt="user-profile"
        />
        <p className=" font-medium capitalize">
          {/* {postedBy?.userName} */}
          postedBy - username
        </p>
      </Link>
      Pin
    </div>
  );
};

export default Pin;