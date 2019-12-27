import React from 'react';

export default function InfoBox(props) {
  return (
    <div>
      <h2>{props.name}</h2>
      {props.name === 'Your Bet' ? (
        <div>
          <h2>{props.amount} SATS</h2>
        </div>
      ) : (
        <div>{props.luckyNumber ? <h2>{props.luckyNumber}</h2> : <h2>0</h2>}</div>
      )}
    </div>
  );
}
