
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
  const [wins, setWins] = useState(() => parseInt(localStorage.getItem('wins')) || 0);
  const [losses, setLosses] = useState(() => parseInt(localStorage.getItem('losses')) || 0);
  const [winner, setWinner] = useState('neither');

    // State to manage visibility of each HitOddsList instance
  const [hitOddsVisibility, setHitOddsVisibility] = useState({});

    // Toggle function to show/hide HitOddsList by index
    const toggleHitOddsList = (index) => {
      setHitOddsVisibility(prevVisibility => ({
        ...prevVisibility,
        [index]: !prevVisibility[index] // Toggle visibility
      }));
    };

  const initializeDeck = () => {
    return new Promise(resolve => {
      const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
      const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
      let newDeck = [];
  
      if (resetDeckMode || deck.length <=10) {
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
    localStorage.setItem('wins', wins);
  }, [wins]);
  
  useEffect(() => {
    localStorage.setItem('losses', losses);
  }, [losses]);

  useEffect(() => {
    localStorage.setItem('losses', losses);
  }, [losses]);

  useEffect(() => {
    if(dealerHand[0] && deck) {
    setDealerOdds(calculateDealerOdds([dealerHand[0]], deck));
  }}, [deck]);
  
  useEffect(() => {
    initializeDeck();
  }, [numDecks]);

  useEffect(() => {
    if (sumValue(playerHand) >= 21) {
      setWinner(checkWinner());
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

    const newDealerOdds = calculateDealerOdds([card3], deck);
    setDealerOdds(newDealerOdds);
  };

  const resetWins = () => {
    setWins(0);
    setLosses(0);
  }

  const getTextColor = (value) => {
    if (value === 'player') return 'green';
    return 'red'
  };

  const resetProbs = () => {
    setNumBustsShown(0);
    setBustOdds([]);
  }

  // given a players score, what is the chance that they beat the dealer?
  function probOfStay(dealerArr, playerScore) {
    if (playerScore === 21) {
      let win = 1;
      let tie = 0; 
      let lose = 0;
      return {win, tie, lose};
    }
    if (playerScore > 21) {
      let win = 0;
      let tie = 0; 
      let lose = 1;
      return {win, tie, lose};
    }

    let win = 0
    win += dealerArr[dealerArr.length - 1]; //chance of dealer busting 
    let tie = 0;
    let lose = 0;
    for(let i=0; i+17 < playerScore; i++) {
      win += dealerArr[i]; //chance the dealer scores less than the player
    }
    for (let z=4; z + 17 > playerScore && z >= 0; z--)   {
      lose += dealerArr[z];
    }
    if (playerScore-17 >= 0 ) { 
      tie += dealerArr[playerScore - 17];
    }
    return {win, tie, lose};
  }

  // probability that the player beats the dealer if they hit again
  function probOfHit(dealerArr, playerArr) {
    let winOdds = 0
    winOdds += playerArr[playerArr.length - 2]; // chance of the player getting BlackJack // + dealerArr[dealerArr.length - 1] * (1-playerArr[playerArr.length - 1]);
    let tieOdds = 0;
    let loseOdds = 0;
    loseOdds += playerArr[playerArr.length - 1]; // chance of the player busting
    for(let i = 0; i < playerArr.length - 2; i++) {
      if (playerArr[i] > 0) {
      let {win, tie, lose} = probOfStay(dealerArr, i+1);
      winOdds += playerArr[i] * win; // probability of player getting this sum * probability of them winning if they get this sum
      tieOdds += playerArr[i] * tie; 
      loseOdds += playerArr[i] * lose;
    }}
    return {winOdds, tieOdds, loseOdds};
  }

  function OddsCalc({dealerArr, playerArr}) {
    let {winOdds, tieOdds, loseOdds} = probOfHit(dealerArr, playerArr);
    return(<div className="odds-container"><p className="odds-item odds-win">win: {(winOdds*100).toFixed(0)}%</p>
    <p className="odds-item odds-tie">tie: {(tieOdds*100).toFixed(0)}%</p>
    <p className="odds-item odds-lose">lose: {(loseOdds*100).toFixed(0)}%</p></div>)}

  function InitialOddsCalc({dealerArr, playerScore}) {
    let {win, tie, lose} = probOfStay(dealerArr, playerScore);
    return(<div className="odds-container"><p className="odds-item odds-win">win: {(win*100).toFixed(0)}%</p>
    <p className="odds-item odds-tie">tie: {(tie*100).toFixed(0)}%</p>
    <p className="odds-item odds-lose">lose: {(lose*100).toFixed(0)}%</p></div>);
  }
  
  const hit = async () => {
    const newCard = await dealCard();
    setPlayerHand(prevHand => {
      const updatedHand = [...prevHand, newCard];
      // Recalculate dealer odds if needed
      const updatedDealerOdds = calculateDealerOdds([dealerHand[0]], deck);
      setDealerOdds(updatedDealerOdds);
      setBustOdds(fillOdds(updatedHand));
      return updatedHand;
    });
  };
  

  const fillOdds = (updatedHand) => { 
    let arr = [];
    for (let i = 1; i <= numBustsShown; i++) {
      arr.push(calculatePlayerOdds(updatedHand, deck, i));
    }
    return arr;
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
      setLosses(losses + 1);
      return 'dealer';
    }
    if (checkDealerBust()) {
      setWins(wins + 1);
      return 'player';
    }
    if (sumValue(playerHand) > sumValue(dealerHand)) {
      setWins(wins + 1);
      return 'player';
    }
    if (sumValue(playerHand) < sumValue(dealerHand)) {
      setLosses(losses + 1);
      return 'dealer';
    }
    return 'tie';
  };
  
  const stand = async () => {
    await dealerHit();
    const gameResult = checkWinner();
    setWinner(gameResult);
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
      <div className='wins-counter'><p className='wins'>wins: {wins}</p>
      <p className='losses'>losses: {losses}</p><button onClick={resetWins}>reset score</button></div>
      
  
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
            {/* {bustOdds.map((bust, index) => <div id='numBusts' key={index}><>{index + 1} hit{index > 0 ? 's' : ''}: </>
            <OddsCalc key={index + 50} dealerArr={dealerOdds} playerArr={bust}/>
            <HitOddsList  key={index} arr={bust}/>
            </div>)} */}

            {bustOdds.map((bust, index) => (
                <div id='numBusts' key={index}>
                  {index + 1} hit{index > 0 ? 's' : ''}: 
                  <OddsCalc key={index + 50} dealerArr={dealerOdds} playerArr={bust} />
                  <button onClick={() => toggleHitOddsList(index)}>
                    {hitOddsVisibility[index] ? 'Hide Details' : 'Show Details'}
                  </button>
                  <div style={{ display: hitOddsVisibility[index] ? 'block' : 'none' }}>
                    <HitOddsList key={index} arr={bust} />
                  </div>
                </div>
              ))}
            </>)}

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
            {winner !== 'tie' &&
            <h2 style={{ color: getTextColor(winner) }}>{capitalizeFirstLetter(winner)} Wins!</h2>}
            {winner === 'tie' && 
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