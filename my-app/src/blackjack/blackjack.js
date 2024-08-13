
import React, { useState, useEffect } from 'react';
import Card from './components/card';

function Blackjack() {
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [gameStatus, setGameStatus] = useState('playerMove');
  const [numDecks, setNumDecks] = useState(1);
  const [resetDeckMode, setResetDeckMode] = useState(true);

  const initializeDeck = () => {
    return new Promise(resolve => {
      const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
      const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
      let newDeck = [];
      for(let i = 0; i < numDecks; i++) {
        newDeck = [...newDeck, ...suits.flatMap(suit => values.map(value => ({side: 'front', suit, value })))];
      }
      setDeck(shuffleDeck(newDeck));
      resolve();
    });
  };

    
  useEffect(() => {
    initializeDeck();
  }, [numDecks]);

  useEffect(() => {
    if (sumValue(playerHand) > 21) {
      setGameStatus('over');
    }
  }, [playerHand]);

  useEffect(() => {
    const initGame = async () => {
      await initializeDeck();
      initializeGame();
    };
    initGame();
  }, []);

  const shuffleDeck = (deck) => {
    return deck.sort(() => Math.random() - 0.5);
  };

  const dealCard = () => {
    return new Promise(resolve => {
      setDeck(prevDeck => {
        const newDeck = [...prevDeck];
        const card = newDeck.pop();
        resolve(card);
        return newDeck;
      });
    });
  };

  const initializeGame = async () => {
    setGameStatus('idle');
    await initializeDeck();
    const card1 = await dealCard();
    const card2 = await dealCard();
    const card3 = await dealCard();
    setPlayerHand([card1, card2]);
    setDealerHand([card3]);
    setGameStatus('playerMove');
  };

  const hit = async () => {
    const newCard = await dealCard();
    setPlayerHand(prevHand => [...prevHand, newCard]);
  };

  const dealerHit = async () => {
    let currentHand = [...dealerHand];
    while (sumValue(currentHand) < 17) {
      const newCard = await dealCard();
      currentHand.push(newCard);
    }
    setDealerHand(currentHand);
  };

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
    // If it's the initial deal (2 cards) and there's an ace, keep it as 11 unless it causes a bust
    if (hand.length === 2 && aceCount > 0 && sum <= 21) {
      return sum;
    }
    // Otherwise, adjust aces as needed
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
      return 'player';
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

  const stand = async () => {
    await dealerHit();
    setGameStatus('over');
  };
  

  const handleNumDecksChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (value >= 1 && value <= 10) {
      setNumDecks(value);
    }
    initializeGame();
  };

  const resetDeckModeChange = (event) => {
    setResetDeckMode(!resetDeckMode);
    initializeGame();
  }

  return (
    <div className="blackjack-game">
      <h1>Blackjack</h1>
      
      <div className="game-settings">
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
        <div className="reset-selector">
          <input 
            id="resetDeckMode" 
            type="checkbox" 
            name="resetDeckMode" 
            checked={resetDeckMode}
            onChange={resetDeckModeChange}
          />
          <label htmlFor="resetDeckMode">Reset Deck each game</label>
        </div>
        {!resetDeckMode && 
          <div className="reset-deck-button">
            <p id="numCards">{deck.length} cards left in deck</p>
            <button id="reset-deck-btn" onClick={initializeGame}>Reset Deck</button>
          </div>
        }
      </div>
  
      {gameStatus === 'idle' && (
        <button onClick={initializeGame}>Start Game</button>
      )}
  
      {(gameStatus === 'playerMove' || gameStatus === 'over') && (
        <div className="game-area">
          <div className="hand player-hand">
            <h2>Player Hand:</h2>
            <div className="cards">
              {playerHand.map((card, index) => (
                <Card key={index} side={card.side} suit={card.suit} value={card.value} />
              ))}
            </div>
            <p>Player Score: {sumValue(playerHand)}</p>
          </div>
  
          <div className="hand dealer-hand">
            <h2>Dealer Hand:</h2>
            <div className="cards">
              {dealerHand.map((card, index) => (
                <Card key={index} side={card.side} suit={card.suit} value={card.value} />
              ))}
              {dealerHand.length === 1 && <Card key={1} side={'back'} suit={null} value={null} />}
            </div>
            <p>Dealer Score: {gameStatus === 'over' ? sumValue(dealerHand) : '?'}</p>
          </div>
  
          {gameStatus === 'playerMove' && (
            <div className="game-controls">
              <button onClick={() => hit().catch(console.error)}>Hit</button>
              <button onClick={() => stand().catch(console.error)}>Stand</button>
            </div>
          )}
  
          {gameStatus === 'over' && (
            <div className="game-over">
              <h2>Game Over!</h2>
              <p>Winner: {checkWinner()}</p>
              <button onClick={initializeGame}>Play Again</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


export default Blackjack;