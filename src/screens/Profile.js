import { auth, storage } from './api/firebase';
import { signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'; // Use uploadBytesResumable
import { useEffect, useContext, useState } from 'react';
import ProfileContext from '../context/ProfileContext';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import AvatarEditor from 'react-avatar-editor';
import { ProgressBar, Alert } from 'react-bootstrap'; // Import Bootstrap components

const Profile = () => {
  const { setUser } = useContext(ProfileContext);
  const [profileData, setProfileData] = useState(null);
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [editor, setEditor] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertVariant, setAlertVariant] = useState('success');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setProfileData({
          name: currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL,
        });
        setName(currentUser.displayName);
        setUser(currentUser);
      } else {
        setProfileData(null);
        setUser(null);
        navigate('/');
        alert('Log Out successfully');
      }
    });

    return () => unsubscribe();
  }, [navigate, setUser]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
        navigate('/');
      })
      .catch((error) => {
        console.error('Error signing out: ', error);
      });
  };

  const handleChangeFile = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSaveImage = async () => {
    if (editor) {
      const canvas = editor.getImage();
      canvas.toBlob(async (blob) => {
        if (blob) {
          const storageRef = ref(storage, `profile_images/${auth.currentUser.uid}.png`);
          const uploadTask = uploadBytesResumable(storageRef, blob);

          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress); // Update progress bar
            },
            (error) => {
              console.error('Error uploading image:', error);
              setAlertMessage('Failed to upload image.');
              setAlertVariant('danger');
            },
            async () => {
              const url = await getDownloadURL(storageRef);
              await updateProfile(auth.currentUser, { photoURL: url });
              setProfileData((prevData) => ({
                ...prevData,
                photoURL: url,
              }));
              setUploadProgress(0);
              setAlertMessage('Profile image updated successfully!');
              setAlertVariant('success');
            }
          );
        }
      });
    }
  };

  const handleSaveName = async () => {
    try {
      await updateProfile(auth.currentUser, { displayName: name });
      setProfileData((prevData) => ({
        ...prevData,
        name,
      }));
      setAlertMessage('Name updated successfully!');
      setAlertVariant('success');
    } catch (error) {
      setAlertMessage('Failed to update name.');
      setAlertVariant('danger');
    }
  };

  return (
    <ProfileContainer>
      {alertMessage && <Alert variant={alertVariant}>{alertMessage}</Alert>}

      {profileData ? (
        <>
          <ProfileImage src={profileData.photoURL} alt="Profile" />
          <ProfileName>{profileData.name}</ProfileName>
          <ProfileEmail>{profileData.email}</ProfileEmail>
          <LogoutButton onClick={handleLogout}>Logout</LogoutButton>

          <AvatarSection>
            <h3>Change Profile Picture</h3>
            <Input type="file" onChange={handleChangeFile} />
            {file && (
              <>
                <AvatarEditor
                  ref={(ref) => setEditor(ref)}
                  image={file}
                  width={200}
                  height={200}
                  border={50}
                  borderRadius={100}
                  scale={1.2}
                />
                <SaveButton onClick={handleSaveImage}>Save Image</SaveButton>
                {uploadProgress > 0 && <ProgressBar now={uploadProgress} label={`${Math.round(uploadProgress)}%`} />}
              </>
            )}
          </AvatarSection>

          <NameSection>
            <h3>Change Name</h3>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Change your name"
            />
            <SaveButton onClick={handleSaveName}>Save Name</SaveButton>
          </NameSection>
        </>
      ) : (
        <p>No user is logged in.</p>
      )}
    </ProfileContainer>
  );
};

export default Profile;

// Styled Components
const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  padding: 20px;
`;

const ProfileImage = styled.img`
  border-radius: 50%;
  width: 200px;
  height: 200px;
  object-fit: cover;
  margin-bottom: 10px;
`;

const ProfileName = styled.h1`
  font-size: 1.5rem;
  margin: 0;
  color: #333;
`;

const ProfileEmail = styled.p`
  font-size: 1rem;
  color: #555;
`;

const LogoutButton = styled.button`
  margin-top: 10px;
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background-color: #0056b3;
  }
`;

const Input = styled.input`
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const SaveButton = styled.button`
  padding: 10px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #218838;
  }
`;

const AvatarSection = styled.div`
  margin-top: 20px;
`;

const NameSection = styled.div`
  margin-top: 20px;
`;