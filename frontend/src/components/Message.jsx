import React from 'react';
import { Alert } from 'react-bootstrap';

const Message = ({ children }) => {
  const customGreen = {
    backgroundColor: '#d4edda', 
    borderColor: '#c3e6cb',    
    color: '#155724',           
  };

  return (
    <Alert style={customGreen}>
      {children}
    </Alert>
  );
};

export default Message;