import React, { useState, useEffect } from 'react';
import CommentBox from '../components/CommentBox';
import CommentList from '../components/CommentList';
import { auth, db } from '../firebase';
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
            className="w-12 h-12 rounded-full mr-4"
          />
          <span className="font-bold text-lg">{user.displayName}</span>
        </div>
        <button
          onClick={() => signOut(auth)}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
      <CommentBox user={user} />
      <div className="flex justify-between items-center mt-6 mb-4">
        <h2 className="font-bold text-2xl">Comments ({commentCount})</h2>
        <div className="space-x-2">
          <button
            onClick={() => setFilter('latest')}
            className={`px-4 py-2 rounded-lg ${filter === 'latest' ? 'bg-gray-200' : 'bg-white hover:bg-gray-100'} transition-colors`}
          >
            Latest
          </button>
          <button
            onClick={() => setFilter('popular')}
            className={`px-4 py-2 rounded-lg ${filter === 'popular' ? 'bg-gray-200' : 'bg-white hover:bg-gray-100'} transition-colors`}
          >
            Popular
          </button>
        </div>
      </div>
      <CommentList filter={filter} user={user} />
    </div>
  );
}

export default Home;
