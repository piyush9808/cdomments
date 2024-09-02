import React from 'react';
import CommentBox from '../components/CommentBox';
import CommentList from '../components/CommentList';
import { auth } from '../firebase';
import { signOut } from "firebase/auth";

function Home() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Comments</h1>
        <button
          onClick={() => signOut(auth)}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
      <CommentBox />
      <CommentList />
    </div>
  );
}

export default Home;
