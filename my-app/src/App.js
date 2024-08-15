import React, { useState } from 'react';
import './App.css';
import Blackjack from './blackjack/blackjack'
import Blackjack2 from './blackjack/blackjack2';
import Poker from './poker/poker'

function App() {
  const [isBlackjack, setIsBlackjack] = useState(true);

  const handleGameChange = () => {
    setIsBlackjack(!isBlackjack);
  };

  return (
    <div className="App">
      <div className="game-switch">
        <span className={`game-label1 ${isBlackjack ? 'active' : ''}`}>Blackjack</span>
        <label className="switch">
          <input 
            type="checkbox" 
            checked={!isBlackjack} 
            onChange={handleGameChange}
          />
          <span className="slider round"></span>
        </label>
        <span className={`game-label1 ${!isBlackjack ? 'active' : ''}`}>Poker</span>
      </div>
      <header className="App-header">
      </header>
      {isBlackjack ? <Blackjack /> : <Poker />}
    </div>
  );
}

export default App;