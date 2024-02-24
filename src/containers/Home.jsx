import { React, useState, useEffect, useRef } from 'react';
import { HiMenu } from 'react-icons/hi';
import { AiFillCloseCircle } from 'react-icons/ai';
import { Link, Route, Routes } from 'react-router-dom';

import { SideBar, UserProfile } from '../components';
import Pins from './Pins';
// import { client } from '../client';
import logo from '../assets/pinasta-dark.png'
import wlogo from '../assets/Pinasta.png'
import { userQuery } from '../utils/data';
import { fetchUser } from '../utils/fetchUser';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firestore';

function Home() {
    const [toggleSidebar, setToggleSidebar] = useState(false);
    const [user, setUser] = useState()
    const scrollRef = useRef(null);

    const userInfo = fetchUser();
    // console.log('userInfo from localstorage', userInfo)

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const collectionRef = collection(db, "Users");
                const q = query(collectionRef, where("id", "==", userInfo?.sub));
                const snapshot = await getDocs(q);
                const userData = snapshot.docs.map(doc => ({ ...doc.data() }))[0];
                setUser(userData);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, [userInfo?.sub]); // Dependency added to rerun effect when userInfo?.sub changes

    useEffect(() => {
        scrollRef.current.scrollTo(0, 0)
    }, [])

    // useEffect(() => {
    //     // if (user) {
    //     console.log("Who is logged in?", user);
    //     // }
    // }, [user])

    return (
        <div className='flex bg-gray-50 md:flex-row flex-col h-screen transition-height duration-75 ease-out'>
            <div className='hidden md:flex h-screen flex-initial'>
                <SideBar user={user && user} closeToggle={setToggleSidebar} />
            </div>
            <div className='flex md:hidden flex-row'>
                <div className='p-2 w-full flex flex-row justify-between items-center shadow-md'>
                    <HiMenu fontSize={40} className='cursour-pointer' onClick={() => setToggleSidebar(true)} />
                    <Link to="/">
                        <img src={wlogo} alt="logo" className='w-20' />
                    </Link>
                    {user !== undefined && user !== null && (
                        <Link to={`user-profile/${user.id}`}>
                            <img src={user.image} alt="logo" className='w-10' />
                        </Link>
                    )}
                </div>
            </div>
            {toggleSidebar && (
                <div className='fixed w-4/5 bg-white h-screen overflow-y-auto shadow-md z-10 animate-slide-in'>
                    <div className='absolute w-full flex justify-end items-center p-2'>
                        <AiFillCloseCircle fontSize={30} className='cursor-pointer ' onClick={() => setToggleSidebar(false)} />
                    </div>
                    <SideBar user={user && user} closeToggle={setToggleSidebar} />
                </div>
            )}
            <div className='pb-2 flex-1 h-screen overflow-y-scroll' ref={scrollRef}>
                <Routes>
                    <Route path="/user-profile/:userId" element={<UserProfile />} />
                    <Route path="/*" element={<Pins user={user && user} />} />
                </Routes>
            </div>
        </div>
    )
}

export default Home

// useEffect(() => {
//     // const query = userQuery(userInfo?.sub);
//     //get docs which has id of the above user.
//     (async () => {
//         const collectionRef = collection(db, "Users");
//         const q = query(collectionRef, where("id", "==", userInfo?.sub));
//         const snapshot = await getDocs(q)
//         const results = snapshot.docs.map(doc => ({ ...doc.data() }));
//         // console.log(results[0]);
//         setUser(results[0]);
//     })();

//     // client.fetch(query)
//     //     .then((data) => {
//     //         setUser(data[0]);
//     //     })
//     scrollRef.current.scrollTo(0, 0)
// }, []);
