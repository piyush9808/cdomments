import React, { useState, useEffect } from 'react';
import CommentBox from '../components/CommentBox';
import CommentList from '../components/CommentList';
import { auth, db } from '../firebase'; // Make sure db is imported
import { signOut } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";

function Home({ user }) {
  const [filter, setFilter] = useState('latest');
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "comments"), (snapshot) => {
      setCommentCount(snapshot.size);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <img
            src={user.photoURL}
            alt={user.displayName}
            className="w-10 h-10 rounded-full mr-4"
          />
          <span className="font-bold">{user.displayName}</span>
        </div>
        <button
          onClick={() => signOut(auth)}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
      <CommentBox user={user} />
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-xl">Comments({commentCount})</h2>
        <div>
          <button
            onClick={() => setFilter('latest')}
            className={`px-4 py-2 ${filter === 'latest' ? 'bg-gray-200' : ''}`}
          >
            Latest
          </button>
          <button
            onClick={() => setFilter('popular')}
            className={`px-4 py-2 ${filter === 'popular' ? 'bg-gray-200' : ''}`}
          >
            Popular
          </button>
        </div>
      </div>
      <CommentList filter={filter} />
    </div>
  );
}

export default Home;
