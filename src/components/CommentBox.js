import React, { useState, useRef, useEffect } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

function CommentBox({ user, parentId = null, onReply }) {
  const [comment, setComment] = useState('');
  const [file, setFile] = useState(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const textareaRef = useRef(null);

  const handleFormatting = (command) => {
    document.execCommand(command, false, null);
    updateFormattingState();
  };

  const updateFormattingState = () => {
    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
    setIsUnderline(document.queryCommandState('underline'));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    console.log("Handle submit triggered"); 
  
    if (!user) {
      console.error("User is not defined. Make sure you are logged in.");
      return;
    }
  
    console.log("User object:", user); 
  
    if (!user.displayName) {
      console.error("User displayName is undefined.");
      return;
    }
  
    if (!comment.trim() && !file) {
      console.warn("Comment is empty, and no file is attached.");
      return;
    }
  
    let fileURL = null;
    if (file) {
      try {
        const storageRef = ref(storage, `attachments/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);
        await uploadTask;
        fileURL = await getDownloadURL(uploadTask.snapshot.ref);
        console.log("File uploaded successfully:", fileURL); 
      } catch (error) {
        console.error("Error uploading file:", error);
        return;
      }
    }
  
    try {
      await addDoc(collection(db, "comments"), {
        content: comment,
        author: user.displayName || "Anonymous", 
        uid: user.uid || "Unknown UID",
        photoURL: user.photoURL || "default-avatar-url",
        timestamp: serverTimestamp(),
        fileURL: fileURL,
        likes: 0,
        parentId: parentId, 
      });
      console.log("Comment added successfully"); 
  
      setComment('');
      setFile(null); 
  
      if (onReply) {
        onReply();
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  useEffect(() => {
    updateFormattingState();
  }, []);

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-4 flex flex-col">
      <div
        ref={textareaRef}
        contentEditable="true"
        suppressContentEditableWarning={true}
        onInput={(e) => setComment(e.currentTarget.textContent)}
        onKeyUp={updateFormattingState}
        className="w-full p-2 border-none focus:ring-0 resize-none outline-none"
        placeholder="Write a comment..."
      ></div>

      <div className="flex items-center justify-between border-t mt-2 pt-2">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => handleFormatting('bold')}
            className={`font-bold ${isBold ? 'text-black' : 'text-gray-500'} hover:text-black`}
          >
            B
          </button>
          <button
            type="button"
            onClick={() => handleFormatting('italic')}
            className={`italic ${isItalic ? 'text-black' : 'text-gray-500'} hover:text-black`}
          >
            I
          </button>
          <button
            type="button"
            onClick={() => handleFormatting('underline')}
            className={`underline ${isUnderline ? 'text-black' : 'text-gray-500'} hover:text-black`}
          >
            U
          </button>
          <label
            htmlFor="file-upload"
            className="text-gray-500 hover:text-black cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H4zm9.707 4.707a1 1 0 00-1.414-1.414L10 8.586 7.707 6.293a1 1 0 00-1.414 1.414l2.5 2.5a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </label>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
          {file && (
            <span className="text-sm text-gray-500 ml-2">
              {file.name}
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          {onReply && (
            <button
              type="button"
              onClick={onReply}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </form>
  );
}

export default CommentBox;
