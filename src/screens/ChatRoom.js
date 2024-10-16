import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from './api/firebase'; // Ensure correct import path
import { doc, collection, addDoc, query, orderBy, onSnapshot, getDoc } from 'firebase/firestore';
import styled from 'styled-components';
import { format } from 'date-fns'; // Use date-fns for formatting the date and time

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f0f0f0;
  border-radius: 8px;
  position: relative;
  height: 100vh;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
`;

const HeaderTitle = styled.h2`
  margin: 0;
`;

const HeaderDescription = styled.p`
  margin: 0;
  font-style: italic;
  color: #555;
`;

const MessagesContainer = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 20px;
  padding: 10px;
  background-color: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
`;

const Message = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.isCurrentUser ? 'flex-end' : 'flex-start')};
  padding: 10px;
  margin-bottom: 10px;
`;

const MessageBubble = styled.div`
  padding: 10px;
  background-color: ${(props) => (props.isCurrentUser ? '#d1ffd1' : '#f1f1f1')};
  border-radius: 8px;
  max-width: 60%;
  word-wrap: break-word;
  align-self: ${(props) => (props.isCurrentUser ? 'flex-end' : 'flex-start')};
`;

const MessageText = styled.p`
  margin: 0;
`;

const MessageSender = styled.strong`
  color: #555;
  font-size: 0.85em;
  margin-bottom: 5px;
  display: ${(props) => (props.isCurrentUser ? 'none' : 'block')};
`;

const MessageTimestamp = styled.span`
  font-size: 0.75em;
  color: #999;
  margin-top: 5px;
  align-self: ${(props) => (props.isCurrentUser ? 'flex-end' : 'flex-start')};
`;

const InputContainer = styled.div`
  display: flex;
  padding: 10px;
  background-color: #fff;
  border-radius: 8px;
`;

const InputField = styled.input`
  padding: 10px;
  width: calc(100% - 120px);
  border: 1px solid #ddd;
  border-radius: 4px;
  flex-grow: 1;
`;

const SendButton = styled.button`
  padding: 10px;
  width: 100px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 10px;

  &:hover {
    background-color: #45a049;
  }
`;

const BackButton = styled.button`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: transparent;
  border: none;
  color: #333;
  font-size: 18px;
  cursor: pointer;

  &:hover {
    color: #000;
  }
`;

const ChatRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomInfo, setRoomInfo] = useState({ name: '', description: '' });

  useEffect(() => {
    // Fetch room info
    const fetchRoomInfo = async () => {
      const roomRef = doc(db, 'chatrooms', id);
      const roomDoc = await getDoc(roomRef);
      if (roomDoc.exists()) {
        setRoomInfo(roomDoc.data());
      } else {
        console.log('No such document!');
      }
    };

    fetchRoomInfo();

    // Fetch messages in real-time
    const messagesRef = collection(db, 'chatrooms', id, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [id]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;

    try {
      const user = auth.currentUser;

      // Check if the user is logged in
      if (!user) {
        alert('You must be logged in to send messages.');
        return;
      }

      const messageData = {
        text: newMessage,
        userId: user.uid,
        userName: user.displayName,
        createdAt: new Date(),
      };

      await addDoc(collection(db, 'chatrooms', id, 'messages'), messageData);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message: ', error.message);
    }
  };

  return (
    <Container>
      <BackButton onClick={() => navigate(-1)}>&larr; Back</BackButton>
      <Header>
        <HeaderTitle>{roomInfo.name}</HeaderTitle>
        <HeaderDescription>{roomInfo.description}</HeaderDescription>
      </Header>
      <MessagesContainer>
        {messages.map((message) => {
          // Check for existence of createdAt and handle formatting
          const timestamp = message.createdAt?.seconds
            ? format(new Date(message.createdAt.seconds * 1000), 'dd/MM/yyyy, HH:mm')
            : 'Unknown time';

          return (
            <Message key={message.id} isCurrentUser={message.userId === auth.currentUser?.uid}>
              <MessageBubble isCurrentUser={message.userId === auth.currentUser?.uid}>
                <MessageSender isCurrentUser={message.userId === auth.currentUser?.uid}>
                  {message.userName}
                </MessageSender>
                <MessageText>{message.text}</MessageText>
                <MessageTimestamp>{timestamp}</MessageTimestamp>
              </MessageBubble>
            </Message>
          );
        })}
      </MessagesContainer>
      <InputContainer>
        <InputField
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message here..."
        />
        <SendButton onClick={handleSendMessage}>Send</SendButton>
      </InputContainer>
    </Container>
  );
};

export default ChatRoom;
