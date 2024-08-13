
import React, { useState, useEffect } from 'react';
import Card from './components/card';

function Blackjack() {
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [gameStatus, setGameStatus] = useState('playerMove');
  const [numDecks, setNumDecks] = useState(1);

  useEffect(() => {
    initializeDeck();
  }, []);

  const initializeDeck = () => {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
    let newDeck = [];
    for(let i = 0; i < numDecks; i++) {
        newDeck = [...newDeck, ...suits.flatMap(suit => values.map(value => ({side: 'front', suit, value })))]
    }
    setDeck(shuffleDeck(newDeck));
  };

  const shuffleDeck = (deck) => {
    return deck.sort(() => Math.random() - 0.5);
  };

  const dealCard = () => {
    return deck.pop();
  };

  const initializeGame = () => {
    initializeDeck();
    setPlayerHand([dealCard, dealCard]);
    setDealerHand([dealCard]);
    setGameStatus('playerMove');
  }

  const hit = () => {
    const newCard = dealCard();
    setPlayerHand((prevHand) => [...prevHand, newCard]);
    if (sumValue(playerHand) > 21) {
      endGame();
    }
  }

  const dealerHit = () => {
    while (sumValue(dealerHand) < 17) {
      const newCard = dealCard();
      setDealerHand((prevHand) => [...prevHand, newCard]);
    }
  }

  const sumValue = (hand) => {
    const vals = {
      "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
      "10": 10, "jack": 10, "queen": 10, "king": 10, "ace": 11
    };
    let sum = 0;
    let aceCount = 0;
    for (let card of hand) {
      if (card.value === 'ace') aceCount++;
      sum += vals[card.value];
    }
    while (sum > 21 && aceCount > 0) {
      sum -= 10;
      aceCount--;
    }
    return sum;
  };

  const checkPlayerBust = () => {
    return sumValue(playerHand) > 21;
  }

  const checkDealerBust = () => {
    return sumValue(dealerHand) > 21;
  }

  const checkWinner = () => {
    if (checkPlayerBust()) {
      return 'dealer';
    }
    if (checkDealerBust()) {
      return 'dealer';
    }
    if (sumValue(playerHand) > sumValue(dealerHand)) {
      return 'player';
    }
    if (sumValue(playerHand) < sumValue(dealerHand)) {
      return 'dealer';
    }
    return 'tie';
  }

  const endGame = () => {
    setGameStatus('over');
    const winner = checkWinner();
    return winner;
  }

  const stand = () => {
    dealerHit();
    checkWinner();
  }

  const handleNumDecksChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (value >= 1 && value <= 10) {
      setNumDecks(value);
    }
    initializeGame();
  };
    return (
        <div className="blackjack-game">
          <h1>Blackjack</h1>
          <div className="deck-selector">
            <label htmlFor="numDecks">Number of decks:</label>
            <input 
              id="numDecks" 
              type="number" 
              name="numDecks" 
              min="1" 
              max="10" 
              value={numDecks}
              onChange={handleNumDecksChange}
            />
          </div>
          
          {gameStatus === 'idle' && <button onClick={initializeGame}>Start Game</button>}
          {gameStatus === 'playerMove' && (
            <div>
              <div className="hand">
                <h2>Player Hand:</h2>
                <div className="cards">
                  {playerHand.map((card, index) => (
                    <Card key={index} side={card.side} suit={card.suit} value={card.value} />
                  ))}
                </div>
              </div>
              <div className="hand">
                <h2>Dealer Hand:</h2>
                <div className="cards">
                  {dealerHand.map((card, index) => (
                    <Card key={index} side={card.side} suit={card.suit} value={card.value} />
                  ))}
                  {dealerHand.length === 1 && <Card key={1} side={'back'} suit={null} title={null} />}
                </div>
              </div>
              {gameStatus === 'playerMove' && (
                <div className="game-controls">
                  <button onClick={hit}>Hit</button>
                  <button onClick={stand}>Stand</button>
                </div>
              )}
      
              {gameStatus === 'over' && (
                <div className="game-over">
                  <h2>Game Over!</h2>
                  <p>Winner: {checkWinner()}</p>
                  <p>Player Score: {sumValue(playerHand)}</p>
                  <p>Dealer Score: {sumValue(dealerHand)}</p>
                  <button onClick={initializeGame}>Reset</button>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

export default Blackjack;