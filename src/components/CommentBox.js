import React, { useState, useRef, useEffect } from "react";
import { addDoc, collection, serverTimestamp, getDocs } from "firebase/firestore";
import { db, storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { PiPaperclip } from "react-icons/pi";

function CommentBox({ user, parentId = null, onReply }) {
  const [comment, setComment] = useState('');
  const [file, setFile] = useState(null);
  const [users, setUsers] = useState([]); 
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef(null);

  const CHAR_LIMIT = 250;

  useEffect(() => {
    // Fetch users from Firestore
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          // console.log("Fetched user:", data.name);  // Logging displayName directly
          return data;
        });
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    };

    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setCharCount(value.length);

    if (value.length <= CHAR_LIMIT) {
      setComment(value);

      const lastChar = value[value.length - 1];
      if (lastChar === "@") {
        setShowSuggestions(true);
        setFilteredSuggestions(users); 
        // console.log("Showing all users for tagging:", users);
      } else if (showSuggestions) {
        const lastWord = value.split(" ").pop();
        const filtered = users.filter(user =>
          user.name?.toLowerCase().startsWith(lastWord.replace("@", "").toLowerCase())
        );
        setFilteredSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
        // console.log("Filtered users:", filtered);
      }
    }
  };

  const handleUserSelect = (selectedUser) => {
    const words = comment.split(" ");
    words.pop(); 
    const newComment = `${words.join(" ")} @${selectedUser.name} `;
    setComment(newComment);
    setCharCount(newComment.length); 
    setShowSuggestions(false);
    textareaRef.current.focus();

    // console.log(`Tagged user: ${selectedUser.name}`);  // Log the selected user's displayName
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      console.error("User is not defined. Make sure you are logged in.");
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
      } catch (error) {
        console.error("Error uploading file:", error);
        return;
      }
    }

    try {
      await addDoc(collection(db, "comments"), {
        content: comment,
        author: user.name || "Anonymous",
        uid: user.uid || "Unknown UID",
        photoURL: user.photoURL || "default-avatar-url",
        timestamp: serverTimestamp(),
        fileURL: fileURL,
        likes: 0,
        parentId: parentId,
      });

      setComment('');
      setCharCount(0); 
      setFile(null);

      if (onReply) {
        onReply();
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-4 flex flex-col">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={comment}
          onChange={handleInputChange}
          className="w-full p-2 border-none focus:ring-0 resize-none outline-none"
          placeholder="Write a comment..."
        ></textarea>

        {showSuggestions && filteredSuggestions.length > 0 && (
          <ul className="absolute z-10 bg-white shadow-md rounded-lg p-2 mt-2 max-h-32 overflow-y-auto w-full">
            {filteredSuggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => handleUserSelect(suggestion)}
                className="cursor-pointer hover:bg-gray-200 p-2"
              >
                {suggestion.name} 
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between border-t mt-2 pt-2">
        <div className="flex items-center space-x-4">
          <button
            type="button"
            className="font-bold text-xl text-gray-500 hover:text-black"
            onClick={() => document.execCommand('bold', false, null)}
          >
            B
          </button>
          <button
            type="button"
            className="italic text-xl text-gray-500 hover:text-black"
            onClick={() => document.execCommand('italic', false, null)}
          >
            I
          </button>
          <button
            type="button"
            className="underline text-xl text-gray-500 hover:text-black"
            onClick={() => document.execCommand('underline', false, null)}
          >
            U
          </button>
          <label
            htmlFor="file-upload"
            className="text-gray-500 hover:text-black cursor-pointer"
          >
            <PiPaperclip className="size-5" />
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
        <div className="flex items-center space-x-2">
          <span className={`text-sm ${charCount > CHAR_LIMIT ? 'text-red-500' : 'text-gray-500'}`}>
            {charCount}/{CHAR_LIMIT}
          </span>
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
            disabled={charCount > CHAR_LIMIT}
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
