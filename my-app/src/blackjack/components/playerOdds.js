import React from 'react';

function PlayerOddsList({ arr }) {
arr.pop();
  return (
    <>
    <p>chances of scoring atleast __ without busting: </p>
    <div className="odds-list">
      {arr.map((value, i) => (
        <p key={i} className={''}>
          {i+17 !== 21 ? `>=${i + 17}` : `${i+17}`}: {(value*100).toFixed(0)}%
        </p>
      ))}
    </div>
    </>
  );
}

export default PlayerOddsList;

