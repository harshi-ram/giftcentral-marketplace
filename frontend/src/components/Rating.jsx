import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const Rating = ({ value, text }) => {
  const starColor = '#22c55e'; 

  return (
    <div className='rating'>
      <span>
        {value >= 1 ? (
          <FaStar color={starColor} />
        ) : value >= 0.5 ? (
          <FaStarHalfAlt color={starColor} />
        ) : (
          <FaRegStar color={starColor} />
        )}
      </span>
      <span>
        {value >= 2 ? (
          <FaStar color={starColor} />
        ) : value >= 1.5 ? (
          <FaStarHalfAlt color={starColor} />
        ) : (
          <FaRegStar color={starColor} />
        )}
      </span>
      <span>
        {value >= 3 ? (
          <FaStar color={starColor} />
        ) : value >= 2.5 ? (
          <FaStarHalfAlt color={starColor} />
        ) : (
          <FaRegStar color={starColor} />
        )}
      </span>
      <span>
        {value >= 4 ? (
          <FaStar color={starColor} />
        ) : value >= 3.5 ? (
          <FaStarHalfAlt color={starColor} />
        ) : (
          <FaRegStar color={starColor} />
        )}
      </span>
      <span>
        {value >= 5 ? (
          <FaStar color={starColor} />
        ) : value >= 4.5 ? (
          <FaStarHalfAlt color={starColor} />
        ) : (
          <FaRegStar color={starColor} />
        )}
      </span>
      <span className='rating-text' style={{ color: '#22c55e' }}>{text}</span>
    </div>
  );
};

export default Rating;