import React, { useEffect, useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/pinasta-dark.png'
import { jwtDecode } from 'jwt-decode'
import db from '../firestore'
import { onSnapshot, collection, doc, getDoc, setDoc } from "firebase/firestore";

function Login() {
  const navigate = useNavigate();

  const getData = (docRef) => {
    const usersArray = [];
    async function asyncall(docRef) {
      try {
        const docSnapshot = await getDoc(docRef);
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          usersArray.push(data);
        } else {
          console.log('Document does not exist');
        }
      } catch (error) {
        console.error('Error getting document:', error);
      }
    }
    asyncall(docRef);
    return usersArray;
  }

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "Pins"), async (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        ...doc.data(),
      }));
      // const createdArr = [];
      const updatedData = data.map((d) => {
        const createdDocRef = doc(db, "Users", d.CreatedBy.id)
        const createdArr = getData(createdDocRef);
        const savedArr = [];
        const commentedArr = [];
        d.SavedBy.forEach(s => {
          const docRef = doc(db, "Users", s.id)
          savedArr.push(getData(docRef));
        })
        d.Comments.forEach(c => {
          const docRef = doc(db, "Users", c.CommentedBy.id)
          commentedArr.push(getData(docRef));
        })
        for (let i = 0; i < commentedArr.length; i++) {
          d.Comments[i].CommentedBy = commentedArr[i];
        }

        //for each element in savedBy and comments call this function and return new data with all fields
        return { ...d, CreatedBy: createdArr, SavedBy: savedArr }
      })

      console.log(data, updatedData, typeof (data[0].CreatedBy))
    });

    // Cleanup function to unsubscribe from the snapshot listener
    return () => unsubscribe();
  }, []);

  const responseGoogle = (response) => {
    const details = jwtDecode(response.credential);
    localStorage.setItem('user', JSON.stringify(details));
    console.log(response, details);
    const userDoc = {
      id: details.sub,
      name: details.name,
      image: details.picture,
    }
    console.log(userDoc);
    (async () => {
      const docRef = doc(db, "Users", userDoc.id);
      await setDoc(docRef, userDoc);
      navigate('/')
    })();
    // client.createIfNotExists(doc)
    //   .then(() => {
    //     navigate('/', { replace: true })
    //   }) 
  }

  return (
    <div className='flex justify-start items-center flex-col h-screen'>
      <div className='relative w-full h-full'>
        <video
          src="https://i.imgur.com/kWHlqpX.mp4"
          type="video/mp4"
          loop
          controls={false}
          muted
          autoPlay
          className='w-full h-full object-cover'
        />

        <div className='absolute flex flex-col justify-center items-center top-0 left-0 right-0 bottom-0 bg-black opacity-80 '>
          <div className='p-5'>
            <img src={logo} width='190px' alt="logo" className='opacity-100' />
            <div className='shadow-2xl'>
              <GoogleOAuthProvider clientId='437821503313-hk5thvt6mjqpdqms5l4h2hsmglod225a.apps.googleusercontent.com' >
                {/* <GoogleOAuthProvider
                clientId='810705148177-cl6vfntk7fhi2uevrpnc2b30g56dlpct.apps.googleusercontent.com'> */}
                {/* clientId={process.env.REACT_APP_GOOGLE_API_TOKEN} > */}
                <GoogleLogin
                  onSuccess={responseGoogle}
                  onError={() => {
                    console.log('Error, Login Failed');
                  }}
                />;
              </GoogleOAuthProvider>;
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login







// import { FcGoogle } from 'react-icons/fc';
// import tunnel from '../assets/tunnel.mp4';
// import fractal from '../assets/fractal.mp4';
// import ink from '../assets/ink.mp4';

//  {/* <button
//     type="button"
//     className='bg-white flex justify-center items-center p-3 rounded-lg cursor-pointer outline-none '
//     // onClick={renderProps.onClick}
//     >
//     <FcGoogle className="mr-3" />Sign in with Google
//   </button> */}


// const login = useGoogleLogin({
//   onSuccess: tokenResponse => console.log(tokenResponse),
//   onError: () => console.log('Login Failed'),
// })
//cookiePolicy='single_host_origin'