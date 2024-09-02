import React, { useState } from "react";
import { db, storage } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

function CommentBox({ user }) {
  const [comment, setComment] = useState("");
  const [file, setFile] = useState(null);

  const handleSubmit = async () => {
    if (!comment.trim() && !file) return;

    let fileURL = null;
    if (file) {
      const storageRef = ref(storage, `files/${file.name}`);
      const uploadTask = await uploadBytesResumable(storageRef, file);
      fileURL = await getDownloadURL(uploadTask.ref);
    }

    await addDoc(collection(db, "comments"), {
      content: comment,
      author: user.displayName,
      uid: user.uid,
      photoURL: user.photoURL,
      timestamp: serverTimestamp(),
      fileURL,
      likes: 0,
    });

    setComment("");
    setFile(null);
  };

  return (
    <div className="bg-white shadow-md rounded p-4 my-4">
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write a comment..."
        className="w-full p-2 border rounded mb-2"
      />
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-2"
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Send
      </button>
    </div>
  );
}

export default CommentBox;
