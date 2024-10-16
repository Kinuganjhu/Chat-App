// Home.js

import { useState, useEffect } from 'react';
import { db } from './api/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

// Styled components
const Container = styled.div`
  padding: 20px;
  background-color: #f5f5f5;
  max-width: 600px;
  margin: 0 auto;
  border-radius: 8px;
`;

const Title = styled.h2`
  text-align: center;
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

const Home = () => {

  const [text, setText] = useState({
    name: '',
    description: '',
  });

  const [chatRooms, setChatRooms] = useState([]);

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

  return (
    <Container>
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
