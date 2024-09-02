import React from 'react';
import LoginButton from '../components/LoginButton';
import CommentList from '../components/CommentList';

function SignIn() {
  return (
    <div className="flex flex-col items-center h-screen">
       <div className="flex justify-center items-center p-4">
        <LoginButton />
      </div>
      
      <div className="flex-grow">
        <CommentList />
      </div>
     
    </div>
  );
}

export default SignIn;
