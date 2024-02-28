import React, { useEffect, useState } from 'react';

import MasonryLayout from './MasonryLayout';
// import { client } from '../client';
import { feedQuery, searchQuery } from '../utils/data';
import Spinner from './Spinner';
import { db } from '../firestore';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';


const Search = ({ searchTerm }) => {
  const [pins, setPins] = useState();
  const [loading, setLoading] = useState(true);
  const [allPins, setAllPins] = useState();

  useEffect(() => {
    let updatedData;
    onSnapshot(collection(db, "Pins"), async (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        ...doc.data(),
      }));
      updatedData = await Promise.all(data.map(async (d) => {
        const createdDocRef = doc(db, "Users", d.CreatedBy.id)
        const createdArr = (await getDoc(createdDocRef)).data();

        let savedArr;
        if (d.SavedBy) {
          savedArr = await Promise.all(d.SavedBy.map(async (s) => {
            const docRef = doc(db, "Users", s.id);
            let data = (await getDoc(docRef)).data();
            return data;
          }))
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
      setAllPins(updatedData);
    });
  }, [])

  useEffect(() => {
    if (searchTerm) {
      setLoading(true);
      //match title, category and about
      const search = searchTerm.toLowerCase();
      let filteredArray = allPins?.filter(obj => obj.Pin && (obj.Pin.Title.includes(search) || obj.Pin.Category === search || obj.Pin.About.includes(search) || obj.Pin.Description.includes(search)));
      setPins(filteredArray);
      setLoading(false);
    }
    else {
      setPins(allPins);
      setLoading(false);
    }

  }, [searchTerm, allPins])


  return (
    <div>
      {loading && <Spinner className="mt-10" message="Search for pins..." />}
      {pins?.length !== 0 && <MasonryLayout pins={pins} />}
      {pins?.length === 0 && searchTerm !== '' && !loading &&
        <div className='mt-10 text-center tet-xl'>No pins found</div>}
    </div>
  )
}

export default Search