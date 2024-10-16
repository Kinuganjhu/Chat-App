import { signOut } from 'firebase/auth';
import { auth } from './api/firebase';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import styled from 'styled-components';

const Img = styled.img`
  height: 200px;
  width: 200px;
  border-radius: 50%;
`;

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px;
`;

const UserInfo = styled.div`
  text-align: center;
  margin: 10px 0;
`;

const Email = styled.p`
  margin: 5px 0;
  font-size: 1.1em;
  color: #333;
`;

const Profile = () => {
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
    <ProfileContainer>
      {user && (
        <>
          <Img src={user.photoURL} alt='profile' />
          <UserInfo>
            <h2>{user.displayName}</h2> {/* Display user name */}
            <Email>{user.email}</Email> {/* Display user email */}
          </UserInfo>
        </>
      )}
      <button onClick={handleSignOut}>Log Out</button>
    </ProfileContainer>
  );
};

export default Profile;
