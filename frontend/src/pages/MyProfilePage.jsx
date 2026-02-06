import React, { useRef, useEffect, useState } from "react";
import { Row, Col } from 'react-bootstrap';
import { useGetProductsQuery } from '../slices/productsApiSlice';
import {  getUserByName, uploadProfilePicture, deleteProfilePicture, updateUserBio } from '../services/userService';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import ChatWidget from '../components/ChatWidget';
import { getOrStartConversation } from '../services/conversationService';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { markConversationRead } from '../slices/chatSlice';
import { startOrOpenChat } from '../utils/chatHelpers';


import Product from '../components/Product';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Paginate from '../components/Paginate';

const MyProfilePage = () => {
  const { name: profileUsername } = useParams();
  const { userInfo } = useSelector((state) => state.auth);
  const [displayName, setDisplayName] = useState(userInfo?.name || '');
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [bio, setBio] = useState('');

  const [profileUser, setProfileUser] = useState(null);
  const [notFound, setNotFound] = useState(false);


   const loggedInUser = useSelector((state) => state.auth.userInfo);
   const dispatch = useDispatch();


  const isOwnProfile = !!(loggedInUser?.userId && profileUser?._id && loggedInUser.userId === profileUser._id);

  console.log("Logged in:", loggedInUser?.userId);
  console.log("Profile user:", profileUser?._id);
  console.log("Is own profile?", isOwnProfile);
  




  useEffect(() => {
    setImagePreview(null);
    setBio(null); //

  const fetchProfile = async () => {
    try {
      const user = await getUserByName(profileUsername); 
      if (!user || Object.keys(user).length === 0) {
        setNotFound(true);
        return;
      }

      setNotFound(false);
      setProfileUser(user);
      if (user?.profilePic) setImagePreview(user.profilePic);
      if (user?.bio) setBio(user.bio);
      if (user?.name) setDisplayName(user.name);
    } catch (err) {
      console.error("Error fetching user by name:", err);
      setNotFound(true);
    }
  };

  fetchProfile();
}, [profileUsername]);


   const [conversationId, setConversationId] = useState(null);
   const [chatVisible, setChatVisible] = useState(false);

   const [conversation, setConversation] = useState(null);




const handleStartChat = async (targetUserId) => {
  const conversation = await getOrStartConversation(targetUserId);

  try {
    await axios.put(`/api/v1/messages/${conversation._id}/read`, {}, {
      withCredentials: true
    });
    dispatch(markConversationRead(conversation._id));
  } catch (err) {
    console.error("Failed to mark conversation as read:", err);
  }

  startOrOpenChat(conversation, dispatch);
  console.log("Dispatch openChat from MyProfilePage", conversation);
};




  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [limit] = useState(4);
  const [skip, setSkip] = useState(0);

  const { search } = useSelector(state => state.search);
  const { category } = useParams();

  const { data, isLoading, error } = useGetProductsQuery({
    limit: 0, 
    skip: 0,
    search,
    category
  });

  const [userProducts, setUserProducts] = useState([]);
  const [showChat, setShowChat] = useState(false);


  useEffect(() => {
    if (data && data.products) {

     const filtered = data.products.filter(
       (product) => product.user === profileUser?._id
     );


      setUserProducts(filtered);
      setSkip((currentPage - 1) * limit);
      setTotalPage(Math.ceil(filtered.length / limit));
    }
  }, [data, profileUser, currentPage, limit]);

  const pageHandler = pageNum => {
    if (pageNum >= 1 && pageNum <= totalPage && pageNum !== currentPage) {
      setCurrentPage(pageNum);
    }
  };

  const handleChooseFileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please select an image file.");
    }
  };

  const handleSaveBio = async () => {
  try {
    const result = await updateUserBio(bio); 
    alert(result.message || "Bio updated");
  } catch (err) {
    console.error("Error updating bio:", err);
    alert(err?.response?.data?.message || "Failed to update bio");
  }
};

 if (notFound) {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>User Not Found</h2>
      <p>The user does not exist.</p>
    </div>
  );
}


  return (
    <>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
          <div
            style={{
              boxShadow: "0 0 10px green",
              padding: "20px",
              margin: "20px auto",
              borderRadius: "8px",
              backgroundColor: "#f9fff9",
              maxWidth: "90%",
              width: "100%",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
            }}
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  width: "150px",
                  height: "150px",
                  objectFit: "cover",
                  border: "2px solid grey",
                  borderRadius: "4px",
                }}
              />
            ) : (
              <div
                style={{
                  width: "150px",
                  height: "150px",
                  border: "2px solid grey",
                  boxSizing: "border-box",
                }}
              />
            )}

            <div style={{ display: "flex", gap: "10px" }}>
             {isOwnProfile && (
              <>
              <button
              onClick={async () => {
                 if (!fileInputRef.current.files[0]) {
                 alert("No image selected!");
                 return;
              }

               try {
               const result = await uploadProfilePicture(fileInputRef.current.files[0]);
               alert(result.message);
               } catch (err) {
               alert(err?.response?.data?.message || "Failed to upload image");
              }
              }}
                style={{
                  padding: "10px 20px",
                  border: "1px solid #ccc",
                  backgroundColor: "#eee",
                  cursor: "pointer",
                  borderRadius: "4px",
                }}
              >
                Upload
              </button>

              <button
                 onClick={async () => {
                 try {
                     const result = await deleteProfilePicture();
                     alert(result.message);
                     setImagePreview(null); 
                 } catch (err) {
                 alert(err?.response?.data?.message || "Failed to remove image");
                 }
              }}
            style={{
                padding: "10px 20px",
                border: "1px solid red",
                backgroundColor: "#ffe0e0",
                cursor: "pointer",
                borderRadius: "4px",
                marginLeft: "10px",
             }}
           >
            Remove Picture
            </button>


              <button
                onClick={handleChooseFileClick}
                style={{
                  padding: "10px 20px",
                  border: "1px solid #ccc",
                  backgroundColor: "#eee",
                  cursor: "pointer",
                  borderRadius: "4px",
                }}
              >
                Choose File
              </button>

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              </>
             )}
            </div>

            <div style={{ fontSize: "16px", fontWeight: "bold", marginTop: "10px" }}>
              {displayName && `@${displayName}`}
            </div>

            <div style={{ width: "100%", maxWidth: "400px", textAlign: "left" }}>
              <h3 style={{ marginBottom: "8px" }}>Bio</h3>

{isOwnProfile ? (
  <>
    <textarea
      rows="4"
      placeholder="Tell us about yourself..."
      value={bio}
      onChange={(e) => setBio(e.target.value)}
      style={{
        width: "100%",
        padding: "10px",
        borderRadius: "4px",
        border: "1px solid #ccc",
        resize: "vertical",
        boxSizing: "border-box",
        marginBottom: "10px",
      }}
    />
    <button
      onClick={handleSaveBio}
      style={{
        padding: "10px 20px",
        border: "1px solid #ccc",
        backgroundColor: "#eee",
        cursor: "pointer",
        borderRadius: "4px",
      }}
    >
      Save Changes
    </button>
  </>
) : (
  <p
    style={{
      whiteSpace: "pre-wrap",
      padding: "10px",
      backgroundColor: "#f4f4f4",
      borderRadius: "4px",
      border: "1px solid #ccc",
    }}
  >
    {bio || "No bio available."}
  </p>
)}

            </div>
{!isOwnProfile && (
  <div style={{ width: "100%", maxWidth: "400px", textAlign: "left", marginTop: "20px" }}>
    <div style={{ display: "flex", gap: "10px" }}>
      <button
        onClick={() => handleStartChat(profileUser._id)} 
        style={{
          flex: 1,
          padding: "10px",
          border: "1px solid #ccc",
          backgroundColor: "#e0ffe0",
          cursor: "pointer",
          borderRadius: "4px",
          fontWeight: "bold",
        }}
      >
        Chat
      </button>

      <button
  onClick={() => navigate(`/request-gift/${encodeURIComponent(profileUser.name)}`)}
  style={{
    flex: 1,
    padding: "10px",
    border: "1px solid #ccc",
    backgroundColor: "#ffe0e0",
    cursor: "pointer",
    borderRadius: "4px",
    fontWeight: "bold",
  }}
>
  Request Gift
</button>
    </div>
  </div>
)}


          </div>

          <center><h1>Products</h1></center>

          <Row>
            {userProducts
              .slice(skip, skip + limit)
              .map(product => (
                <Col key={product?._id} sm={12} md={6} lg={4} xl={3}>
                  <Product product={product} />
                </Col>
              ))}
          </Row>

          {totalPage > 1 && !search && (
            <Paginate
              currentPage={currentPage}
              totalPage={totalPage}
              pageHandler={pageHandler}
            />
          )}
        </>
      )}
      {chatVisible && conversation && (
        console.log("Rendering chat for PROFILE:") || (
  <ChatWidget
    conversation={conversation}
    currentUserId={loggedInUser.userId} //
    onClose={() => setChatVisible(false)}
  />
))}



    </>
    
  );

};

export default MyProfilePage;

