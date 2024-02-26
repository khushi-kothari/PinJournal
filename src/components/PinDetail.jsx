import React, { useEffect, useState } from 'react';
import { MdDownloadForOffline } from 'react-icons/md';
import { Link, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { saveAs } from 'file-saver'

// import { client, urlFor } from '../client';
import MasonryLayout from './MasonryLayout';
import { pinDetailMorePinQuery, pinDetailQuery } from '../utils/data';
import Spinner from './Spinner';
import { collection, doc, getDoc, getDocs, query, where, arrayUnion, updateDoc, Firestore } from 'firebase/firestore';
import { db } from '../firestore';

const PinDetail = ({ user }) => {
  const [pins, setPins] = useState();
  const [pinDetail, setPinDetail] = useState();
  const [comment, setComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  const { pinId } = useParams();

  // const user = localStorage.getItem('user') !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : localStorage.clear();

  const addComment = async (id) => {
    if (comment) {
      setAddingComment(true);

      const docRef = doc(db, "Pins", id); //(db, collection_name, doc_id)
      // const docRef = Firestore().collection('Pins').doc(id)

      const newComment = {
        Comment: comment,
        CommentedBy: doc(db, 'Users', user.id)
      };

      try {
        await updateDoc(docRef, { Comments: arrayUnion(newComment) });
        console.log('Comment Added', newComment);
      }
      catch (error) {
        console.error('Error adding comment:', error);
      }

      setAddingComment(false);
      setComment('');
      // docRef
      //   .update({
      //     Comments: arrayUnion(newComment)
      //   })
      //   .then(() => {
      //     console.log('Comment Added', newComment);
      //   });


      // await docRef.update({
      //   Comments: arrayUnion(newComment)
      // })
    }
  }

  // console.log('id from adding Comment', id);

  // client
  //   .patch(pinId)
  //   .setIfMissing({ comments: [] })
  //   .insert('after', 'comments[-1]', [{
  //     comment,
  //     _key: uuidv4(),
  //     postedBy: {
  //       _type: 'postedBy',
  //       _ref: user._id
  //     }
  //   }])
  //   .commit()
  //   .then(() => {
  //     fetchPinDetails();
  //     setComment('');
  //     setAddingComment(false);
  //   });
  //   }
  // }


  const fetchPinDetails = async () => {
    // let query = pinDetailQuery(pinId);
    const docRef = doc(db, "Pins", pinId);
    const pinSnap = (await getDoc(docRef)).data();
    // console.log(pinSnap)
    let arr = [];
    arr.push(pinSnap);
    const updatedData = await Promise.all(arr.map(async (d) => {
      const createdDocRef = doc(db, "Users", d.CreatedBy.id)
      const createdArr = (await getDoc(createdDocRef)).data();

      let savedArr;
      if (d.SavedBy) {
        savedArr = await Promise.all(d.SavedBy.map(async (s) => {
          const docRef = doc(db, "Users", s.id);
          let data = (await getDoc(docRef)).data();
          return data;
        }));
      }

      if (d.Comments) {
        const commentedArr = await Promise.all(d.Comments.map(async (c) => {
          const docRef = doc(db, "Users", c.CommentedBy.id)
          let data = (await getDoc(docRef)).data();
          return data;
        }));

        for (let i = 0; i < commentedArr.length; i++) {
          d.Comments[i].CommentedBy = commentedArr[i];
        }
      }

      if (d.SavedBy)
        return { ...d, CreatedBy: createdArr, SavedBy: savedArr }
      else return { ...d, CreatedBy: createdArr }
    }));

    setPinDetail(updatedData[0]);
    // console.log('Doc Snap', updatedData[0]);

    if (pinSnap) {
      const collectionRef = collection(db, "Pins");
      const q = query(collectionRef, where("Pin.Category", "==", pinSnap.Pin.Category));
      const snapshot = await getDocs(q);
      // console.log(snapshot.docs); //Array of docs but no useful data
      const results = snapshot.docs.map(doc => ({ ...doc.data() }));
      const updatedData = await Promise.all(results.map(async (d) => {
        const createdDocRef = doc(db, "Users", d.CreatedBy.id)
        const createdArr = (await getDoc(createdDocRef)).data();

        let savedArr;
        if (d.SavedBy) {
          savedArr = await Promise.all(d.SavedBy.map(async (s) => {
            const docRef = doc(db, "Users", s.id);
            let data = (await getDoc(docRef)).data();
            return data;
          }));
        }

        if (d.Comments) {
          const commentedArr = await Promise.all(d.Comments.map(async (c) => {
            const docRef = doc(db, "Users", c.CommentedBy.id)
            let data = (await getDoc(docRef)).data();
            return data;
          }));

          for (let i = 0; i < commentedArr.length; i++) {
            d.Comments[i].CommentedBy = commentedArr[i];
          }
        }

        if (d.SavedBy)
          return { ...d, CreatedBy: createdArr, SavedBy: savedArr }
        else return { ...d, CreatedBy: createdArr }
      }));
      // console.log(updatedData);
      setPins(updatedData)
    }

    // if (query) {

    //   // client.fetch(query)
    //   //   .then((data) => {
    //   //     setPinDetail(data[0]);

    //   //     if (data[0]) {
    //   //       query = pinDetailMorePinQuery(data[0]);
    //   //       client.fetch(query)
    //   //         .then((res) => setPins(res));
    //   //     }
    //   //   })

    // }
  }

  useEffect(() => {
    fetchPinDetails();
  }, [pinId])

  if (!pinDetail) return <Spinner message='Loading pin...' />

  return (
    <>
      <div className='flex xl:flex-row flex-col m-auto bg-white'
        style={{ maxWidth: '1500px', borderRadius: '32px' }}>
        <div className='flex justify-center items-center md:items-start flex-initial'>
          <img
            src={pinDetail?.Pin.image}
            className='rounded-t-3xl rounded-b-lg'
            alt="user-post" />
        </div>
        <div className='w-full p-5 flex-1 xl:min-w-620'>
          <div className='flex items-center justify-between'>
            <div className='flex gap-2 items-center'>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  saveAs(pinDetail?.Pin.image, 'image.jpg')
                }}
                className="bg-white w-9 h-9 p-2 rounded-full flex items-center justify-center text-dark text-xl opacity-75 hover:opacity-100 hover:shadow-md outline-none"
              ><MdDownloadForOffline />
              </span>
            </div>
            <a href={pinDetail.Pin.url} target="_blank" rel="noreferrer" className=' w-36 truncate overflow-hidden' >
              {pinDetail.Pin.url}
            </a>
          </div>
          <div>
            <h1 className='text-4xl font-bold break-words mt-3'>{pinDetail.Pin.Title}</h1>
            <p className='mt-3'>{pinDetail.Pin.About}</p>
            <p className='mt-3'>{pinDetail.Pin.Description}</p>
          </div>
          <Link to={`/user-profile/${pinDetail.CreatedBy?.id}`} className="flex gap-2 mt-5 items-center bg-white rounded-lg">
            <img
              className="w-8 h-8 rounded-full object-cover"
              src={pinDetail.CreatedBy?.image}
              alt="user-profile"
            />
            <p className=" font-medium capitalize">{pinDetail.CreatedBy?.userName}</p>
          </Link>
          <h2 className='mt-5 text-2xl'>Comments</h2>
          <div className='max-h-370 overflow-y-auto'>{pinDetail?.Comments?.map((comment, i) => (
            <div className='flex gap-2 mt-5 items-center bg-white rounded-lg' key={i}>
              <img src={comment.CommentedBy.image}
                alt="user-profile"
                className='w-10 h-10 rounded-full cursor-pointer' />
              <div className='flex flex-col'>
                <p className='font-bold'>{comment.CommentedBy.name}</p>
                <p>{comment.Comment}</p>
              </div>
            </div>
          ))}
          </div>
          <div className='flex flex-wrap mt-6 gap-3'>
            <Link to={`/user-profile/${pinDetail.CreatedBy?.id}`}>
              <img
                className="w-8 h-8 rounded-full cursor-pointer"
                src={pinDetail.CreatedBy?.image}
                alt="user-profile"
              />
            </Link>
            <form onSubmit={(e) => {
              e.preventDefault();
              addComment(pinDetail.id);
            }}>
              <input className='flex-1 border-gray-100 outline-none border-2 p-2 rounded-2xl focus:border-gray-300'
                type="text"
                placeholder='Add a comment'
                value={comment}
                onChange={(e) => setComment(e.target.value)} />
              <button
                type="submit"
                className='bg-violet-500 text-white rounded-full px-6 py-2 font-semibold text-base outline-none'
                onClick={() => addComment(pinDetail.id)}>
                {addingComment ? 'Posting...' : 'Post'}
              </button>
            </form>
          </div>
        </div>
      </div>
      {/* {console.log(pins)} */}
      {pins?.length > 0 ? (
        <>
          <h2 className='text-center font-bold text-2xl mt-8 mb-4'>
            More like this
          </h2>
          <MasonryLayout pins={pins} />
        </>
      ) : (
        <Spinner message="Loading more pins..." />
      )}
    </>
  )
}

export default PinDetail