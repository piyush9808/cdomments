import React, { useState, useRef } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import CommentBox from "./CommentBox";
import { ThumbUpIcon, ReplyIcon, HeartIcon, EmojiHappyIcon, FireIcon, EmojiSadIcon } from "@heroicons/react/outline";

function CommentItem({ comment, user, renderReplies }) {
  const [replying, setReplying] = useState(false);
  const [hovering, setHovering] = useState(null);
  const [reactions, setReactions] = useState({
    like: comment.reactions?.like || 0,
    love: comment.reactions?.love || 0,
    haha: comment.reactions?.haha || 0,
    wow: comment.reactions?.wow || 0,
    sad: comment.reactions?.sad || 0,
  });
  const hoverTimer = useRef(null);

  const handleReaction = async (reaction) => {
    try {
      let updatedReactions = { ...reactions };
      updatedReactions[reaction] += 1;

      setReactions(updatedReactions); // Update local state first

      const impressions = Object.values(updatedReactions).reduce((a, b) => a + b, 0);

      const commentRef = doc(db, "comments", comment.id);
      await updateDoc(commentRef, {
        reactions: updatedReactions,
        likes: updatedReactions.like,
        impressions: impressions,
      });
    } catch (error) {
      console.error("Error updating reaction: ", error);
    }
  };

  const handleMouseEnter = () => {
    clearTimeout(hoverTimer.current);
    setHovering(comment.id);
  };

  const handleMouseLeave = () => {
    hoverTimer.current = setTimeout(() => {
      setHovering(null);
    }, 1000);
  };

  const getReactionIcon = (reaction) => {
    switch (reaction) {
      case "love":
        return <HeartIcon className="w-5 h-5 text-red-500" />;
      case "haha":
        return <EmojiHappyIcon className="w-5 h-5 text-yellow-500" />;
      case "wow":
        return <FireIcon className="w-5 h-5 text-orange-500" />;
      case "sad":
        return <EmojiSadIcon className="w-5 h-5 text-gray-500" />;
      default:
        return <ThumbUpIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  const renderReactions = () => {
    return (
      <>
        <div className="flex items-center text-gray-500 ml-2">
          <ThumbUpIcon className="w-5 h-5 text-blue-500" />
          <span className="ml-1">{reactions.like}</span>
        </div>
        {Object.entries(reactions).map(([reaction, count]) => {
          if (reaction !== "like" && count > 0) {
            return (
              <div key={reaction} className="flex items-center text-gray-500 ml-2">
                {getReactionIcon(reaction)}
                <span className="ml-1">{count}</span>
              </div>
            );
          }
          return null;
        })}
      </>
    );
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
          <img src={comment.fileURL} alt="Attachment" className="w-full h-auto rounded" />
        </div>
      )}
      <div className="flex items-center mt-2 relative">
        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex items-center">
            {renderReactions()}
          </div>
          {hovering === comment.id && (
            <div
              className="absolute top-0 left-0 mt-8 flex space-x-2 bg-white p-2 rounded-lg shadow-lg z-10"
              onMouseEnter={() => clearTimeout(hoverTimer.current)}
              onMouseLeave={handleMouseLeave}
            >
              <button onClick={() => handleReaction("like")}>
                <ThumbUpIcon className="w-8 h-8 text-blue-500 hover:scale-110 transition-transform" />
              </button>
              <button onClick={() => handleReaction("love")}>
                <HeartIcon className="w-8 h-8 text-red-500 hover:scale-110 transition-transform" />
              </button>
              <button onClick={() => handleReaction("haha")}>
                <EmojiHappyIcon className="w-8 h-8 text-yellow-500 hover:scale-110 transition-transform" />
              </button>
              <button onClick={() => handleReaction("wow")}>
                <FireIcon className="w-8 h-8 text-orange-500 hover:scale-110 transition-transform" />
              </button>
              <button onClick={() => handleReaction("sad")}>
                <EmojiSadIcon className="w-8 h-8 text-gray-500 hover:scale-110 transition-transform" />
              </button>
            </div>
          )}
        </div>
        <span className="ml-4">{Math.floor((Date.now() - comment.timestamp?.toDate()) / 3600000)} hour</span>
        <button
          onClick={() => setReplying(!replying)}
          className="ml-4 flex items-center text-gray-500"
        >
          <ReplyIcon className="w-5 h-5 mr-1" />
          Reply
        </button>
      </div>

      {replying && (
        <div className="mt-4">
          <CommentBox
            user={user}
            parentId={comment.id}
            onReply={() => setReplying(false)}
          />
        </div>
      )}

      {renderReplies(comment.id)}
    </div>
  );
}

export default CommentItem;
