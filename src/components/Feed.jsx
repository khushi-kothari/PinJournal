import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

// import { client } from '../client';
import { feedQuery, searchQuery } from '../utils/data';
import MasonryLayout from './MasonryLayout';
import Spinner from './Spinner';
import { collection, doc, onSnapshot, getDoc } from 'firebase/firestore';
import db from '../firestore';

const Feed = () => {
  const [pins, setPins] = useState();
  const [loading, setLoading] = useState(false);
  const { categoryId } = useParams();

  useEffect(() => {
    if (categoryId) {
      setLoading(true);
      const collectionRef = collection(db, "Users");
      onSnapshot(collectionRef, (snapshot) => {
      });
    }

    else {
      setLoading(true);
      const unsubscribe = onSnapshot(collection(db, "Pins"), async (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          ...doc.data(),
        }));
        const updatedData = await Promise.all(data.map(async (d) => {
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


        setPins(updatedData);
        setLoading(false);
        console.log(updatedData);
      });

      // Cleanup function to unsubscribe from the snapshot listener
      return () => unsubscribe();
    }
  }, [categoryId]);

  // useEffect(() => {
  //   console.log('Pins', pins);
  // }, [pins])


  const ideaName = categoryId || 'new';
  if (loading) {
    return (
      <Spinner
        message={`We are fetching ${ideaName} ideas to your feed!`} />
    );
  }

  //comment
  if (!pins?.length) return <h1 className='flex items-center justify-center text-center mt-10 leading-loose text-lg text-gray-500 font-medium'>No pins here :( <br /> Add pins to this category to get a beautiful grid!</h1>

  return (
    <div>
      {pins && (
        <MasonryLayout pins={pins} />
      )}
    </div>
  );
};

export default Feed;