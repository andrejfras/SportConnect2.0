import React, { useState } from 'react';

function Rating({ onRate, rateeId }) {
  const [rating, setRating] = useState(0);

  const submitRating = () => {
    if (rating > 0 && rating <= 5) {
      onRate(rateeId, rating);
    } else {
      alert('Please select a valid rating.');
    }
  };

  return (
    <div>
      <div>
      <h3>Rate this user:</h3>
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            style={{ color: rating >= value ? 'gold' : 'grey' }}
            onClick={() => setRating(value)}
          >
            {value}
          </button>
        ))}
      </div>
      <button onClick={submitRating}>Submit Rating</button>
    </div>
  );
}

export default Rating;