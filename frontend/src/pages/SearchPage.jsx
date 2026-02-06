import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Row, Col, Tabs, Tab } from 'react-bootstrap';
import { useGetProductsQuery } from '../slices/productsApiSlice';
import axios from 'axios';
import { Link } from 'react-router-dom';

import Product from '../components/Product';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Paginate from '../components/Paginate';

const SearchPage = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q') || '';

  const [activeTab, setActiveTab] = useState('products');
  const [users, setUsers] = useState([]);

  const [userData, setUserData] = useState({
  users: [],
  total: 0,
  pages: 1,
});
const [userPage, setUserPage] = useState(1);
const userLimit = 4; 

useEffect(() => {
  if (!query) return;

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`/api/v1/users/search`, {
        params: {
          keyword: query,
          limit: userLimit,
          page: userPage,
        },
      });
      setUserData({
        users: data.users,
        total: data.total,
        pages: data.pages,
      });
    } catch (err) {
      console.error(err);
      setUserData({ users: [], total: 0, pages: 1 });
    }
  };

  fetchUsers();
}, [query, userPage]);

const userPageHandler = (pageNum) => {
  if (pageNum >= 1 && pageNum <= userData.pages && pageNum !== userPage) {
    setUserPage(pageNum);
  }
};


  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(4); 
  const skip = (currentPage - 1) * limit;
  const [sortOrder, setSortOrder] = useState('Newest');

  const { data, isLoading, error } = useGetProductsQuery({
    limit,
    skip,
    search: query,
    sortOrder,
  });

  useEffect(() => {
    if (query) {
      axios
        .get(`/api/v1/users?keyword=${query}`)
        .then((res) => setUsers(res.data))
        .catch((err) => console.error(err));
    }
  }, [query]);
  const total = data?.total || 0;
  const totalPage = Math.ceil(total / limit);

  const pageHandler = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPage && pageNum !== currentPage) {
      setCurrentPage(pageNum);
    }
  };


  return (
    <div>
      <h2>Search Results for "{query}"</h2>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        <Tab
          eventKey="products"
          title={`Products (${total})`}
        >
          <Row className="align-items-center mb-3">
            <Col md={3}>
              <select
                className="form-select"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="Newest">Newest</option>
                <option value="Oldest">Oldest</option>
                <option value="PriceLowToHigh">Price: Low to High</option>
                <option value="PriceHighToLow">Price: High to Low</option>
              </select>
            </Col>
          </Row>

          {isLoading ? (
            <Loader />
          ) : error ? (
            <Message variant="danger">
              {error?.data?.message || 'Failed to load products.'}
            </Message>
          ) : data?.products?.length === 0 ? (
            <Message variant="info">No products found.</Message>
          ) : (
            <>
              <Row>
                {data.products.map((product) => (
                  <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                    <Product product={product} />
                  </Col>
                ))}
              </Row>

             

              {totalPage > 1 && (
                <Paginate
                  currentPage={currentPage}
                  totalPage={totalPage}
                  pageHandler={pageHandler}
                />
              )}
            </>
          )}
        </Tab>

        

        <Tab eventKey="users" title={`Users (${userData.total})`}>
         {userData.users.length === 0 && !isLoading ? (
        <Message variant="info">No users found.</Message>
        ) : (
       <>
       <Row className="gy-3">
        {userData.users.map((user) => (
          <Col key={user._id} sm={12} md={6} lg={4} xl={3}>
            <div className="p-3 border rounded shadow-sm bg-light text-center">
              {/* Name link */}
              <Link 
                to={`/users/${user.name}`} 
                className="text-decoration-none fw-bold d-block mb-2"
              >
                {user.name}
              </Link>
              {user.profilePic ? (
                <img
                  src={user.profilePic}
                  alt={`${user.name}'s profile`}
                  className="rounded-circle"
                  style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '50%',
                    margin: '0 auto',
                  }}
                />
              )}
            </div>
          </Col>
        ))}
      </Row>

      {userData.pages > 1 && (
        <Paginate
          currentPage={userPage}
          totalPage={userData.pages}
          pageHandler={userPageHandler}
        />
      )}
      </>
      )}
      </Tab>
      </Tabs>
    </div>
  );
};

export default SearchPage;