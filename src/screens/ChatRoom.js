import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { db, storage } from "./api/firebase.js";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

const ChatRoom = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() && !image) return;

    let imageUrl = null;
    if (image) {
      const imageRef = ref(storage, `images/${uuidv4()}`);
      await uploadBytes(imageRef, image);
      imageUrl = await getDownloadURL(imageRef);
    }

    await addDoc(collection(db, "messages"), {
      text,
      imageUrl,
      timestamp: new Date(),
    });

    setText("");
    setImage(null);
  };

  return (
    <ChatContainer>
      <MessagesContainer>
        {messages.map((msg) => (
          <Message key={msg.id} isUser={msg.text === text}>
            {msg.text && <Text>{msg.text}</Text>}
            {msg.imageUrl && <Image src={msg.imageUrl} alt="Sent Image" />}
          </Message>
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      <InputContainer>
        <Input 
          type="text" 
          placeholder="Type your message..." 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
        />
        <FileInput 
          type="file" 
          accept="image/*" 
          onChange={(e) => setImage(e.target.files[0])} 
        />
        <SendButton onClick={sendMessage}>Send</SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default ChatRoom;

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 600px;
  margin: auto;
  border: 1px solid #ddd;
  background-color: #f0f0f0;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
`;

const Message = styled.div`
  max-width: 80%;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 8px;
  background-color: ${(props) => (props.isUser ? "#dcf8c6" : "#fff")};
  align-self: ${(props) => (props.isUser ? "flex-end" : "flex-start")};
  display: flex;
  flex-direction: column;
`;

const Text = styled.p`
  margin: 0;
  font-size: 14px;
  word-wrap: break-word;
`;

const Image = styled.img`
  max-width: 100%;
  border-radius: 5px;
  margin-top: 5px;
`;

const InputContainer = styled.div`
  display: flex;
  padding: 10px;
  background: #fff;
  border-top: 1px solid #ddd;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  border: none;
  outline: none;
`;

const FileInput = styled.input`
  margin-left: 10px;
`;

const SendButton = styled.button`
  padding: 10px;
  background-color: #25d366;
  color: white;
  border: none;
  cursor: pointer;
  margin-left: 10px;
  border-radius: 5px;
`;

