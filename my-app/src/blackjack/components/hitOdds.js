import React from 'react';

function HitOddsList({ arr }) {
  return (
    <div className="odds-list">
      {arr.map((value, i) => (value >= 0.005 ? 
        <p key={i} className={i === 21 ? 'bust' : ''}>
          {i === 21 ? 'Bust' : `${i + 1}`}: {(value * 100).toFixed(2)}%
        </p> : null
      ))}
    </div>
  );
}

export default HitOddsList;