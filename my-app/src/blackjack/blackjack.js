
import React, { useState, useEffect } from 'react';
import Card from './components/card';
import calculateDealerOdds from './bjStats';
import OddsList from './components/oddsList';
import calculatePlayerOdds from './playerStats';
// import PlayerOddsList from './components/playerOdds';
import HitOddsList from './components/hitOdds';

function Blackjack() {
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [gameStatus, setGameStatus] = useState('playerMove');
  const [numDecks, setNumDecks] = useState(1);
  const [resetDeckMode, setResetDeckMode] = useState(true);
  const [showOdds, setShowOdds] = useState(false);
  const [dealerOdds, setDealerOdds] = useState([]);
  const [numBustsShown, setNumBustsShown] = useState(0);
  const [bustOdds, setBustOdds] = useState([]);

  const initializeDeck = () => {
    return new Promise(resolve => {
      const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
      const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
      let newDeck = [];
  
      if (resetDeckMode || deck.length >=10) {
        // Initialize a new deck
        for(let i = 0; i < numDecks; i++) {
          newDeck = [...newDeck, ...suits.flatMap(suit => values.map(value => ({ side: 'front', suit, value })))];
        }
        setDeck(shuffleDeck(newDeck));
      } else {
        // Shuffle the existing deck
        setDeck(deck);
      }
      resolve();
    });
  };
  
  useEffect(() => {
    initializeDeck();
  }, [numDecks]);

  useEffect(() => {
    if (sumValue(playerHand) >= 21) {
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
    setShowOdds(false);
    setNumBustsShown(0);
    setBustOdds([]);
  };

  const getTextColor = (value) => {
    if (value === 'player') return 'green';
    return 'red'
  };

  const resetProbs = () => {
    setNumBustsShown(0);
    setBustOdds([]);
  }

  function probOfStay(dealerArr, playerScore) {
    let win = dealerArr[dealerArr.length - 1]; //chance of dealer busting 
    let tie = 0;
    for(let i=0; i+17 < playerScore; i++) {
      win += dealerArr[i];
    }
    if (playerScore >= 17) { 
      tie = dealerArr[playerScore - 17];
    }
    let lose = 1- (win + tie);
    return {win, tie, lose};
  }

  function probOfHit(dealerArr, playerArr) {
    let winOdds = playerArr[playerArr.length - 2];
    let tieOdds = 0;
    let loseOdds = playerArr[playerArr.length -1];
    console.log('called');
    console.log('playerArr length: ' + playerArr.length)
    for(let i = 0; i < playerArr.length - 2; i++) {
      console.log("i calc: " + i);
      let {win, tie, lose} = probOfStay(dealerArr, i);
      winOdds += playerArr[i] * win;
      tieOdds += playerArr[i] * tie; 
      loseOdds += playerArr[i] * lose;
    }
    return {winOdds, tieOdds, loseOdds};
  }

  function OddsCalc({dealerArr, playerArr}) {
    let {winOdds, tieOdds, loseOdds} = probOfHit(dealerArr, playerArr);
    return(<div className="odds-container"><p className="odds-item odds-win">win: {(winOdds*100).toFixed(0)}%</p>
    <p className="odds-item odds-tie">tie: {(tieOdds*100).toFixed(0)}%</p>
    <p className="odds-item odds-lose">lose: {(loseOdds*100).toFixed(0)}%</p></div>)}

  function InitialOddsCalc({dealerArr, playerScore}) {
    console.log('dealerArr: ' + dealerArr);
    console.log('playerScore: ' + playerScore);
    let {win, tie, lose} = probOfStay(dealerArr, playerScore);
    return(<div className="odds-container"><p className="odds-item odds-win">win: {(win*100).toFixed(0)}%</p>
    <p className="odds-item odds-tie">tie: {(tie*100).toFixed(0)}%</p>
    <p className="odds-item odds-lose">lose: {(lose*100).toFixed(0)}%</p></div>);
  }

  const hit = async () => {
    const newCard = await dealCard();
    setPlayerHand(prevHand => [...prevHand, newCard]);
    setBustOdds(fillOdds);
  };

  const fillOdds = () => { 
    let arr = [];
    for (let i = 1; i <= numBustsShown; i++) {
      arr.push(calculatePlayerOdds(playerHand, deck, i));
    }
    return arr;
  }

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

  const updateProbs = async () => {
    const odds = calculatePlayerOdds(playerHand, deck, numBustsShown + 1);
    setBustOdds(prev => [...prev, odds]);
    setNumBustsShown(prev => prev + 1);
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

  const stand = async () => {
    await dealerHit();
    setGameStatus('over');
  };

  function capitalizeFirstLetter(str) {
    if (!str) return ''; // Return an empty string if input is empty
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

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

  let counts = new Array(6).fill(0);

  const dealerOddsBtn = () => {
    setShowOdds(true);
    const odds = calculateDealerOdds([dealerHand[0]], deck);
    setDealerOdds(odds);
  };

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
            <p id="numCards">{gameStatus==='playerMove' ? deck.length-1 : deck.length} cards left in deck</p>
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
            {gameStatus === 'playerMove' && dealerHand.length > 0 && (
          <div>current odds: <InitialOddsCalc key={1} dealerArr={dealerOdds.length > 0 ? dealerOdds : calculateDealerOdds([dealerHand[0]], deck)} playerScore={sumValue(playerHand)}/></div>
            )}
            {gameStatus ==='playerMove' && (<><button className="numBustsBtn" onClick={updateProbs}>show probabilities after {numBustsShown + 1} hit{numBustsShown > 0 ? 's' : ''}</button>
            {numBustsShown > 0 && (<button className="numBustsBtn" onClick={resetProbs}>clear</button>)}
            {bustOdds.map((bust, index) => <div id='numBusts' key={index}><>{index + 1} hit{index > 0 ? 's' : ''}: </> {/*<HitOddsList key={index} arr={bust}/>*/}
            <OddsCalc key={index + 50} dealerArr={dealerOdds.length > 0 ? dealerOdds : calculateDealerOdds([dealerHand[0]], deck)} playerArr={bust}/></div>)}</>)}
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
            <>
        {showOdds && (
            <>
            <p>Dealer odds:</p>
            <OddsList arr={dealerOdds} />
            </>
        )}
        <div className="game-controls">
            <button onClick={() => hit().catch(console.error)}>Hit</button>
            <button onClick={() => stand().catch(console.error)}>Stand</button>
        {!showOdds && (<button onClick={dealerOddsBtn}>Show Dealer Odds</button>)}
        {showOdds && (<button onClick={dealerOddsBtn}>Recalculate dealer odds</button>)}
        <button onClick={initializeGame}>Restart</button>
        </div>
        </>
        )}
          {gameStatus === 'over' && (
            <div className="game-over">
              {checkWinner() !== 'tie' &&
              <h2 style={{ color: getTextColor(checkWinner()) }}>{capitalizeFirstLetter(checkWinner())} Wins!</h2>}
              {checkWinner() === 'tie' && 
              <h2 style={{ color: 'blue' }}>Push!</h2>}
              <button onClick={initializeGame}>Play Again</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Blackjack;