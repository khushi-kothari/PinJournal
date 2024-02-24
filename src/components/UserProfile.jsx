import React, { useEffect, useState } from 'react';
import { AiOutlineLogout } from 'react-icons/ai';
import { useParams, useNavigate } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';

import { userCreatedPinsQuery, userQuery, userSavedPinsQuery } from '../utils/data';
// import { client } from '../client';
import MasonryLayout from './MasonryLayout';
import Spinner from './Spinner';
import { collection, where, query, getDocs, onSnapshot, getDoc, doc } from 'firebase/firestore';
import db from '../firestore';

const activeBtnStyles = 'bg-violet-500 text-white font-bold p-2 rounded-full w-20 outline-none';
const notActiveBtnStyles = 'bg-primary mr-4 text-black font-bold p-2 rounded-full w-20 outline-none';

const randomImage = 'https://source.unsplash.com/1600x900/?nature,wallpaper,technology,aesthetic,ai,painting'

const UserProfile = () => {
  const [user, setUser] = useState();
  const [pins, setPins] = useState();
  const [text, setText] = useState('Created');
  const [activeBtn, setActiveBtn] = useState('created');
  const navigate = useNavigate();
  const { userId } = useParams();
  const [allPins, setAllPins] = useState();

  const fetchDetails = async (arr) => {
    const updatedData = await Promise.all(arr.map(async (d) => {
      const createdDocRef = doc(db, "Users", d.CreatedBy.id)
      const createdArr = (await getDoc(createdDocRef)).data();
      const savedArr = await Promise.all(d.SavedBy.map(async (s) => {
        const docRef = doc(db, "Users", s.id);
        let data = (await getDoc(docRef)).data();
        return data;
      }));
      const commentedArr = await Promise.all(d.Comments.map(async (c) => {
        const docRef = doc(db, "Users", c.CommentedBy.id)
        let data = (await getDoc(docRef)).data();
        return data;
      }));

      for (let i = 0; i < commentedArr.length; i++) {
        d.Comments[i].CommentedBy = commentedArr[i];
      }

      return { ...d, CreatedBy: createdArr, SavedBy: savedArr }
    }));
    // console.log('updatedData', updatedData)
    setAllPins(updatedData);
  }

  useEffect(() => {
    const collectionRef = collection(db, "Pins");
    onSnapshot(collectionRef, (snapshot) => {
      let arr = snapshot.docs.map((doc) => doc.data());
      fetchDetails(arr);
    })
  }, []);

  useEffect(() => {
    (async () => {
      const collectionRef = collection(db, "Users");
      const q = query(collectionRef, where("id", "==", userId));
      const snapshot = await getDocs(q)
      const results = snapshot.docs.map(doc => ({ ...doc.data() }));
      setUser(results[0]);
    })();
  }, [userId])

  useEffect(() => {
    if (text === 'Created') {
      (async () => {
        const filteredPins = allPins?.filter(item => item.CreatedBy.id === userId);
        // console.log("Filterd Created Data", filteredPins)
        setPins(filteredPins);
      })();
    }
    else {
      (async () => {
        // console.log("All pins", allPins);
        const filteredPins = allPins?.filter(obj => obj.SavedBy.some(item => item.id === userId));
        // console.log('filteredPins', filteredPins);
        setPins(filteredPins);
      })();
    }
  }, [userId, text, allPins])


  const logout = () => {
    googleLogout();
    localStorage.clear();

    navigate('/login');
  }


  if (!user) {
    return <Spinner message="Loading Profile" />
  }

  return (
    <div className='relative pb-2 h-full justify-center items-center'>
      <div className='flex flex-col pb-5'>
        <div className='relative flex flex-col mb-7'>
          <div className='flex flex-col justify-center items-center'>
            <img
              src={randomImage}
              className='w-full h-370 xl:h-510 shadow-lg object-cover'
              alt='banner-pic' />
            <img
              src={user.image}
              className='rounded-full h-20 w-20 -mt-10 shadow-xl object-cover '
              alt='user-pic' />
            <h1 className='font-bold text-3xl text-center m-3'>{user.name}</h1>
            {/* Implementing Google Logout */}
            <div className='absolute top-0 z-1 right-0 p-2'>{userId === user.id && (
              <button onClick={logout}
                className='bg-white p-2 rounded-full cursor-pointer outline-none shadow-md' >
                <AiOutlineLogout color="red" fontSize={21} /></button>
            )}</div>
            {/*  */}
          </div>
          <div className='text-center mb-7'>
            <button type="button"
              onClick={(e) => {
                setText(e.target.textContent);
                setActiveBtn('created');
              }}
              className={`${activeBtn === 'created' ? activeBtnStyles : notActiveBtnStyles}`}>
              Created
            </button>
            <button type="button"
              onClick={(e) => {
                setText(e.target.textContent);
                setActiveBtn('saved');
              }}
              className={`${activeBtn === 'saved' ? activeBtnStyles : notActiveBtnStyles}`}>
              Saved
            </button>
          </div>
          {/* {console.log(pins)} */}
          <div className='px-2'>
            <MasonryLayout pins={pins} />
          </div>
          {pins?.length === 0 && (
            <div className='flex justify-center font-bold items-center w-full text-xl mt-2'>No Pins Found!</div>
          )
          }
        </div>
      </div>
    </div>
  )
}

export default UserProfile