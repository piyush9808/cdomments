import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase"; 
import ReplyForm from './ReplyForm';
import { ThumbUpIcon, ReplyIcon } from "@heroicons/react/outline";

function CommentItem({ comment, renderReplies }) {
  const [replyingTo, setReplyingTo] = useState(false);

  const handleLike = async () => {
    const commentRef = doc(db, "comments", comment.id);
    await updateDoc(commentRef, {
      likes: comment.likes + 1
    });
  };

  return (
    <div className="bg-white shadow-md rounded p-4 mb-4 ml-4">
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
        <button
          onClick={handleLike}
          className="flex items-center text-gray-500"
        >
          <ThumbUpIcon className="w-5 h-5 mr-1" />
          {comment.likes}
        </button>
        <button
          onClick={() => setReplyingTo(!replyingTo)}
          className="ml-4 flex items-center text-gray-500"
        >
          <ReplyIcon className="w-5 h-5 mr-1" />
          Reply
        </button>
        <span className="ml-4">{Math.floor((Date.now() - comment.timestamp?.toDate()) / 3600000)} hour</span>
      </div>

      {/* Render reply form if this comment is being replied to */}
      {replyingTo && (
        <ReplyForm parentId={comment.id} onReply={() => setReplyingTo(false)} />
      )}

      {/* Render replies */}
      {renderReplies(comment.id)}
    </div>
  );
}

export default CommentItem;
