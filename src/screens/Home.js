import { useState, useEffect, useContext } from 'react';
import { db, auth } from './api/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import ProfileContext from '../context/ProfileContext';

const Home = () => {
  const { user, setUser } = useContext(ProfileContext);
  const [text, setText] = useState({
    name: '',
    description: '',
  });

  const [chatRooms, setChatRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser({
          name: currentUser.displayName,
          photoURL: currentUser.photoURL,
        });
      } else {
        setUser(null); // Clear user data if not authenticated
      }
    });

    return () => unsubscribe();
  }, [setUser]);

  useEffect(() => {
    fetchChatRooms();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setText((prevText) => ({
      ...prevText,
      [name]: value,
    }));
  };

  const handleCreateRoom = async () => {
    try {
      const docRef = await addDoc(collection(db, 'users'), {
        name: text.name,
        description: text.description,
      });
      fetchChatRooms();
      alert('Chat room created successfully with ID: ' + docRef.id);
    } catch (error) {
      alert('Error creating chat room: ' + error.message);
    }
  };

  const fetchChatRooms = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const rooms = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChatRooms(rooms);
    } catch (error) {
      console.log('Error fetching chat rooms: ', error);
    }
  };

  const handleNavigate = () => {
    navigate('/Profile');
  };

  return (
    <Container>
      {user?.photoURL && (
        <UserImage 
          src={user.photoURL} 
          alt="User" 
          onClick={handleNavigate}
        />
      )}
      <Title>Create a Chat Room</Title>

      <label>Enter chat-room name</label>
      <InputField 
        type="text" 
        name="name" 
        placeholder={text.name} 
        value={text.name}
        onChange={handleChange} 
      />
      
      <label>Enter chat-room description</label>
      <InputField 
        type="text" 
        name="description" 
        placeholder={text.description} 
        value={text.description}
        onChange={handleChange} 
      />
      
      <Button onClick={handleCreateRoom}>Create chat-room</Button>

      <div>
        <h3>All Chat Rooms:</h3>
        {chatRooms.length > 0 ? (
          chatRooms.map((room) => (
            <div key={room.id}>
              <p><strong>Name:</strong> {room.name}</p>
              <p><strong>Description:</strong> {room.description}</p>
              <ChatRoomLink to={`/chatroom/${room.id}`}>Enter Room</ChatRoomLink>
              <hr />
            </div>
          ))
        ) : (
          <p>No chat rooms available</p>
        )}
      </div>
    </Container>
  );
};
export default Home;

// Styled components
const Container = styled.div`
  padding: 20px;
  background-color: #f5f5f5;
  max-width: 600px;
  margin: 0 auto;
  border-radius: 8px;
  position: relative; // Add this for absolute positioning of the image
`;

const Title = styled.h2`
  text-align: left;
  color: #333;
`;

const InputField = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border-radius: 4px;
  border: 1px solid #ddd;
`;

const Button = styled.button`
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;

  &:hover {
    background-color: #45a049;
  }
`;

const ChatRoomLink = styled(Link)`
  text-decoration: none;
  color: #007BFF;
  font-weight: bold;

  &:hover {
    text-decoration: underline;
  }
`;

// New styled component for the user image
const UserImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  position: absolute; // Position the image absolutely
  top: 20px; // Space from the top
  right: 0px; // Space from the right
`;


