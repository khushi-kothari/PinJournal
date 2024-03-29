import React, { useState } from 'react';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { MdDelete } from 'react-icons/md';
import { debounce } from 'lodash';

import { categories } from '../utils/data';
import Spinner from './Spinner';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../firestore'
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";


const CreatePin = ({ user }) => {
  const [title, setTitle] = useState('');
  const [about, setAbout] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [destination, setDestination] = useState();
  const [fields, setFields] = useState();
  const [category, setCategory] = useState();
  const [imageAsset, setImageAsset] = useState();
  const [wrongImageType, setWrongImageType] = useState(false);

  const navigate = useNavigate();

  const uploadImg = async (pickedFile) => {
    try {
      const imageName = `${Date.now()}.${pickedFile.type}`;
      const firebaseStorageRef = ref(storage, `images/${imageName}`);
      const snapshot = await uploadBytes(firebaseStorageRef, pickedFile);
      console.log('Uploaded a blob or file!', snapshot);
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('File available at', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  // const uploadTask = firebaseStorageRef.put(pickedFile);
  // const taskSnapshot = await uploadTask;

  // Get the image URL
  // const fileURL = await taskSnapshot.ref.getDownloadURL();

  // Save this image URL in Cloud Firestore
  // This will save the image in "images" collection & update the "uploadedImage" value of document with id the same as the value of "id" variable.
  // await firebase.firestore().collection('images').doc(id).update({ uploadedImage: fileURL });
  // return fileURL;
  // };


  const uploadImage = (e) => {
    const { type, name } = e.target.files[0];
    if (type === 'image/png' || type === 'image/svg' || type === 'image/jpg' || type === 'image/gif' || type === 'image/tiff' || type === 'image/jpeg') {
      setWrongImageType(false);
      setLoading(true);
      console.log('image file', e.target.files[0])
      uploadImg(e.target.files[0])
        .then((imgUrl) => {
          console.log('Download URL:', imgUrl);
          setImageAsset(imgUrl);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
    else setWrongImageType(true)
  }

  const handleNew = async () => {
    const collectionRef = collection(db, "Pins");
    const userDocRef = doc(db, 'Users', user.id);
    const payload = {
      // Comments: [
      //   { Comment: '', CommentedBy: '' }
      // ],
      CreatedBy: userDocRef,
      // CreatedBy: db.doc('Users/' + user.id),
      Pin: {
        About: about,
        Category: category,
        Description: desc,
        Title: title,
        image: imageAsset,
        url: destination
      },
      // SavedBy: [''],
      id: '',
    };
    const docRef = await addDoc(collectionRef, payload); //let's save this result
    console.log('document uploaded', docRef.id);
    const payload2 = { id: docRef.id };
    await updateDoc(docRef, payload2).then(navigate('/'));
  };

  // client.assets
  //   .upload('image', e.target.files[0], { contentType: type, filename: name })
  //   .then((document) => {
  //     setImageAsset(document)
  //     setLoading(false)
  //   })
  //   .catch((error) => {
  //     console.log("Image upload error ", error);
  //   })

  const savePin = () => {
    if (title && about && destination && imageAsset && category) {
      handleNew();
      // const doc = {
      //   _type: "pin",
      //   title,
      //   about,
      //   destination,
      //   image: {
      //     _type: "image",
      //     asset: {
      //       _type: 'reference',
      //       _ref: imageAsset?._id,
      //     }
      //   },
      //   userId: user._id,
      //   postedBy: {
      //     _type: "postedBy",
      //     _ref: user._id
      //   },
      //   category,
      // }
      // client.create(doc)
      //   .then(navigate('/'));
    }
    else {
      setFields(true);
      setTimeout(() => {
        setFields(false);
      }, 2000);
    }
  }

  // Debounce the setDesc function to delay state updates
  const debouncedSetDesc = debounce((value) => {
    setDesc(value);
  }, 300); // Adjust the delay time as needed

  const handleChange = (e) => {
    const { value } = e.target;
    debouncedSetDesc(value);
  };

  return (
    <div className="flex flex-col justify-center items-center mt-5 lg:h-4/5">
      {fields && (
        <p className='text-red-500 mb-5 text-xl transition-all duration-150 ease-in '>Please fill in all the fields</p>
      )}
      <div className='flex lg:flex-row flex-col justify-center items-center bg-white lg:p-5 p-3 lg:w-4/5 w-full'>
        <div className='bg-secondaryColor p-3 flex flex-0.7 w-full'>
          <div className='flex justify-center items-center cursor-pointer flex-col border-2 border-dotted border-gray-300 p-3 w-full h-420'>
            {loading && <Spinner />}
            {wrongImageType &&
              <p>Wrong image type</p>}
            {!imageAsset ? (
              <label className='cursor-pointer '>
                <div className='flex flex-col items-center justify-center h-full'>
                  <div className='flex flex-col items-center justify-center'>
                    <p className='font-bold text-2xl'>
                      <AiOutlineCloudUpload />
                    </p>
                    <p className='text-lg'>Click to upload</p>
                  </div>
                  <p className='mt-32 text-gray-400 '>Use high-quality JPG, SVG, PNG, GIF less than 20 MB</p>
                </div>
                <input
                  type="file"
                  name="upload-image"
                  onChange={uploadImage}
                  className='w-0 h-0'
                />
              </label>
            ) : (
              <div className='relative h-full' >
                <img src={imageAsset?.url} alt="uploaded-pic" className='h-full w-full' />
                <button
                  type="button"
                  className='absolute bottom-3 right-3 p-3 rounded-full bg-white text-xl cursor-pointer outline-none hover:shadow-md transition-all duration-500 ease-in-out'
                  onClick={() => setImageAsset(null)}>
                  <MdDelete />
                </button>
              </div>
            )
            }
          </div>
        </div>

        <div className='flex flex-1 flex-col gap-6 lg:pl-5 mt-5 w-full'>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add your tilte"
            className='outline-none text-2xl sm:text-3xl font-bold border-b-2 border-gray-200 p-2'
          />
          {user && (
            <div className='flex gap-2 my-2 items-center bg-white rounded-lg'>
              <img
                src={user.image}
                className='w-10 h-10 rounded-full'
                alt="user-profile"
              />
              <p className='font-bold'>{user.userName}</p>
            </div>
          )}
          <input
            type="text"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="What is your pin about?"
            className='outline-none text-base sm:text-lg border-b-2 border-gray-200 p-2'
          />
          <textarea
            // value={desc}
            onChange={handleChange}
            placeholder="Add more thoughts..."
            className='outline-none text-base sm:text-lg border-b-2 border-gray-200 p-2'
          />
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Add a destination link"
            className='outline-none text-base sm:text-lg border-b-2 border-gray-200 p-2'
          />
          <div className='flex flex-col'>
            <div>
              <p className='mb-2 font-semibold text-lg sm:text-xl'>Choose Pin Category</p>
              <select
                onChange={(e) => setCategory(e.target.value)}
                className='outline-none w-4/5 text-base border-b-2 border-gray-200 p-2 rounded-md cursor-pointer'
              >
                <option value="other" className='bg-white'>Select Category</option>
                {categories.map((category, i) => (
                  <option
                    key={i}
                    className='text-base border-0 outline-none capitalize bg-white text-black'
                    value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className='flex justify-end items-end mt-5'>
              <button
                type="button"
                onClick={savePin}
                className='bg-violet-500 text-white font-bold p-2 rounded-full w-28 outline-none'
              >Save Pin</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CreatePin;


// const uploadImage = (e) => {
//   const selectedFile = e.target.files[0];
//   // uploading asset to sanity
//   if (selectedFile.type === 'image/png' || selectedFile.type === 'image/svg' || selectedFile.type === 'image/jpeg' || selectedFile.type === 'image/gif' || selectedFile.type === 'image/tiff') {
//     setWrongImageType(false);
//     setLoading(true);
//     client.assets
//       .upload('image', selectedFile, { contentType: selectedFile.type, filename: selectedFile.name })
//       .then((document) => {
//         setImageAsset(document);
//         setLoading(false);
//       })
//       .catch((error) => {
//         console.log('Upload failed:', error.message);
//       });
//   } else {
//     setLoading(false);
//     setWrongImageType(true);
//   }
// };

// const savePin = () => {
//   if (title && about && destination && imageAsset?._id && category) {
//     const doc = {
//       _type: 'pin',
//       title,
//       about,
//       destination,
//       image: {
//         _type: 'image',
//         asset: {
//           _type: 'reference',
//           _ref: imageAsset?._id,
//         },
//       },
//       userId: user._id,
//       postedBy: {
//         _type: 'postedBy',
//         _ref: user._id,
//       },
//       category,
//     };
//     client.create(doc).then(() => {
//       navigate('/');
//     });
//   } else {
//     setFields(true);

//     setTimeout(
//       () => {
//         setFields(false);
//       },
//       2000,
//     );
//   }
// };

// {fields && (
//   <p className="text-red-500 mb-5 text-xl transition-all duration-150 ease-in ">Please add all fields.</p>
// )}
// <div className=" flex lg:flex-row flex-col justify-center items-center bg-white lg:p-5 p-3 lg:w-4/5  w-full">
//   <div className="bg-secondaryColor p-3 flex flex-0.7 w-full">
//     <div className=" flex justify-center items-center flex-col border-2 border-dotted border-gray-300 p-3 w-full h-420">
//       {loading && (
//         <Spinner />
//       )}
//       {
//         wrongImageType && (
//           <p>It&apos;s wrong file type.</p>
//         )
//       }
//       {!imageAsset ? (
//         // eslint-disable-next-line jsx-a11y/label-has-associated-control
//         <label>
//           <div className="flex flex-col items-center justify-center h-full">
//             <div className="flex flex-col justify-center items-center">
//               <p className="font-bold text-2xl">
//                 <AiOutlineCloudUpload />
//               </p>
//               <p className="text-lg">Click to upload</p>
//             </div>

//             <p className="mt-32 text-gray-400">
//               Recommendation: Use high-quality JPG, JPEG, SVG, PNG, GIF or TIFF less than 20MB
//             </p>
//           </div>
//           <input
//             type="file"
//             name="upload-image"
//             onChange={uploadImage}
//             className="w-0 h-0"
//           />
//         </label>
//       ) : (
//         <div className="relative h-full">
//           <img
//             src={imageAsset?.url}
//             alt="uploaded-pic"
//             className="h-full w-full"
//           />
//           <button
//             type="button"
//             className="absolute bottom-3 right-3 p-3 rounded-full bg-white text-xl cursor-pointer outline-none hover:shadow-md transition-all duration-500 ease-in-out"
//             onClick={() => setImageAsset(null)}
//           >
//             <MdDelete />
//           </button>
//         </div>
//       )}
//     </div>
//   </div>

//   <div className="flex flex-1 flex-col gap-6 lg:pl-5 mt-5 w-full">
//     <input
//       type="text"
//       value={title}
//       onChange={(e) => setTitle(e.target.value)}
//       placeholder="Add your title"
//       className="outline-none text-2xl sm:text-3xl font-bold border-b-2 border-gray-200 p-2"
//     />
//     {user && (
//       <div className="flex gap-2 mt-2 mb-2 items-center bg-white rounded-lg ">
//         <img
//           src={user.image}
//           className="w-10 h-10 rounded-full"
//           alt="user-profile"
//         />
//         <p className="font-bold">{user.userName}</p>
//       </div>
//     )}
//     <input
//       type="text"
//       value={about}
//       onChange={(e) => setAbout(e.target.value)}
//       placeholder="Tell everyone what your Pin is about"
//       className="outline-none text-base sm:text-lg border-b-2 border-gray-200 p-2"
//     />
//     <input
//       type="url"
//       vlaue={destination}
//       onChange={(e) => setDestination(e.target.value)}
//       placeholder="Add a destination link"
//       className="outline-none text-base sm:text-lg border-b-2 border-gray-200 p-2"
//     />

//     <div className="flex flex-col">
//       <div>
//         <p className="mb-2 font-semibold text:lg sm:text-xl">Choose Pin Category</p>
//         <select
//           onChange={(e) => {
//             setCategory(e.target.value);
//           }}
//           className="outline-none w-4/5 text-base border-b-2 border-gray-200 p-2 rounded-md cursor-pointer"
//         >
//           <option value="others" className="sm:text-bg bg-white">Select Category</option>
//           {categories.map((item) => (
//             <option className="text-base border-0 outline-none capitalize bg-white text-black " value={item.name}>
//               {item.name}
//             </option>
//           ))}
//         </select>
//       </div>
//       <div className="flex justify-end items-end mt-5">
//         <button
//           type="button"
//           onClick={savePin}
//           className="bg-violet-500 text-white font-bold p-2 rounded-full w-28 outline-none"
//         >
//           Save Pin
//         </button>
//       </div>
//     </div>
//   </div>
// </div>