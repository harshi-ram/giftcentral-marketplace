export const getOrStartConversation = async (targetUserId) => { 
  try {
    console.log('Starting/Getting conversation...');
    
    const res = await fetch('/api/v1/messages/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: targetUserId }),
      credentials: 'include', 
    });

    if (!res.ok) {
      throw new Error(`Server responded with ${res.status}`);
    }

    const data = await res.json();
    return data; 
  } catch (err) {
    console.error('Failed to start/get conversation:', err);
    return null;
  }
};