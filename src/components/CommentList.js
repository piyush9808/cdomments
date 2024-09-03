import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, limit, startAfter, getDocs } from "firebase/firestore";
import CommentItem from "./CommentItem";
import { toast } from 'react-toastify';

function CommentList({ filter, user }) {
  const [comments, setComments] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const commentsPerPage = 8;

  useEffect(() => {
    fetchComments();
  }, [filter]);

  const fetchComments = async (direction = 'next') => {
    setLoading(true);

    try {
      const commentsRef = collection(db, "comments");
      let q;

      if (direction === 'next') {
        q = query(
          commentsRef,
          orderBy("timestamp", filter === "latest" ? "desc" : "asc"),
          ...(lastVisible ? [startAfter(lastVisible)] : []),
          limit(commentsPerPage)
        );
      } else if (direction === 'prev') {
        q = query(
          commentsRef,
          orderBy("timestamp", filter === "latest" ? "desc" : "asc"),
          limit(commentsPerPage)
        );
      }

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const fetchedComments = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setComments(fetchedComments);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === commentsPerPage);
      } else {
        setHasMore(false);
        toast.info('No more comments to load.');
      }
    } catch (error) {
      console.error("Error fetching comments: ", error);
      toast.error('Failed to load comments.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (hasMore) {
      setPage((prevPage) => prevPage + 1);
      fetchComments('next');
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((prevPage) => prevPage - 1);
      fetchComments('prev');
    }
  };

  const renderReplies = (parentId) => {
    return comments
      .filter((comment) => comment.parentId === parentId)
      .map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          user={user}
          renderReplies={renderReplies}
        />
      ));
  };

  const renderComments = () => {
    if (comments.length === 0) {
      return <p>No comments yet. Be the first to comment!</p>;
    }

    return comments
      .filter((comment) => !comment.parentId)
      .map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          user={user}
          renderReplies={renderReplies}
        />
      ));
  };

  return (
    <div className="mt-4">
      {loading && <p>Loading comments...</p>}
      {renderComments()}
      
      <div className="flex justify-center mt-6">
        <button
          onClick={handlePrevPage}
          disabled={page === 1}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors mr-4"
        >
          Previous
        </button>
        <button
          onClick={handleNextPage}
          disabled={!hasMore}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default CommentList;
