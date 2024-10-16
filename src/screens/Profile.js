import { signOut } from 'firebase/auth';
import { auth } from './api/firebase';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import styled from 'styled-components';

const Img = styled.img`
height: 200px;
width: 200px;
border-radius: 50%;

`
const Profile = ({img}) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleSignOut = () => {
    signOut(auth).then(() => {
      navigate('/');
      alert('Logged out successfully');
    });
  };

  return (
    <>
      {user && (
        <>
          <Img src={user.photoURL} alt='profile' height='200px' />
        </>
      )}
      <button onClick={handleSignOut}>Log Out</button>
    </>
  );
};

export default Profile;
