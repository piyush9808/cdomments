import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { ThumbUpIcon } from "@heroicons/react/outline";

function CommentList() {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "comments"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="mt-4">
      {comments.map((comment) => (
        <div key={comment.id} className="bg-white shadow-md rounded p-4 mb-4">
          <div className="flex items-center mb-2">
            <img src={comment.photoURL} alt="" className="w-10 h-10 rounded-full mr-2" />
            <div>
              <h4 className="font-bold">{comment.author}</h4>
              <p className="text-sm text-gray-500">{new Date(comment.timestamp?.toDate()).toLocaleString()}</p>
            </div>
          </div>
          <p>{comment.content}</p>
          {comment.fileURL && (
            <div className="mt-2">
              <a href={comment.fileURL} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                View Attachment
              </a>
            </div>
          )}
          <div className="flex items-center mt-2">
            <ThumbUpIcon className="w-5 h-5 text-gray-500 mr-2" />
            <span>{comment.likes}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CommentList;
