import React, { useState, useEffect } from 'react';
import Card from './components/card';
import calculateDealerOdds from './bjStats';
import OddsList from './components/oddsList';
import calculatePlayerOdds from './playerStats';
import HitOddsList from './components/hitOdds';

function Blackjack2() {
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
  const [splitting, setSplitting] = useState(false);  // New state for splitting
  const [doubleDown, setDoubleDown] = useState(false);  // New state for doubling down
  const [surrendered, setSurrendered] = useState(false);  // New state for surrendering

  const initializeDeck = () => {
    return new Promise(resolve => {
      const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
      const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
      let newDeck = [];
  
      if (resetDeckMode || deck.length <= 10) {
        for (let i = 0; i < numDecks; i++) {
          newDeck = [...newDeck, ...suits.flatMap(suit => values.map(value => ({ side: 'front', suit, value })))];
        }
        setDeck(shuffleDeck(newDeck));
      } else {
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
    setSplitting(false);
    setDoubleDown(false);
    setSurrendered(false);
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

    let win = 0;
    win += dealerArr[dealerArr.length - 1];
    let tie = 0;
    let lose = 0;
    for (let i = 0; i + 17 < playerScore; i++) {
      win += dealerArr[i];
    }
    for (let z = 4; z + 17 > playerScore && z >= 0; z--) {
      lose += dealerArr[z];
    }
    if (playerScore - 17 >= 0) { 
      tie += dealerArr[playerScore - 17];
    }
    return {win, tie, lose};
  }

  function probOfHit(dealerArr, playerArr) {
    let winOdds = 0;
    winOdds += playerArr[playerArr.length - 2];
    let tieOdds = 0;
    let loseOdds = 0;
    loseOdds += playerArr[playerArr.length - 1];
    for (let i = 0; i < playerArr.length - 2; i++) {
      if (playerArr[i] > 0) {
        let {win, tie, lose} = probOfStay(dealerArr, i + 1);
        winOdds += playerArr[i] * win;
        tieOdds += playerArr[i] * tie;
        loseOdds += playerArr[i] * lose;
      }
    }
    return {winOdds, tieOdds, loseOdds};
  }

  function OddsCalc({dealerArr, playerArr}) {
    let {winOdds, tieOdds, loseOdds} = probOfHit(dealerArr, playerArr);
    return (
      <div className="odds-container">
        <p className="odds-item odds-win">Win: {(winOdds * 100).toFixed(0)}%</p>
        <p className="odds-item odds-tie">Tie: {(tieOdds * 100).toFixed(0)}%</p>
        <p className="odds-item odds-lose">Lose: {(loseOdds * 100).toFixed(0)}%</p>
      </div>
    );
  }

  function InitialOddsCalc({dealerArr, playerScore}) {
    let {win, tie, lose} = probOfStay(dealerArr, playerScore);
    return (
      <div className="odds-container">
        <p className="odds-item odds-win">Win: {(win * 100).toFixed(0)}%</p>
        <p className="odds-item odds-tie">Tie: {(tie * 100).toFixed(0)}%</p>
        <p className="odds-item odds-lose">Lose: {(lose * 100).toFixed(0)}%</p>
      </div>
    );
  }

  const hit = async () => {
    const newCard = await dealCard();
    setPlayerHand(prevHand => {
      const updatedHand = [...prevHand, newCard];
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

  useEffect(() => {
    if (gameStatus === 'playerMove' && playerHand.length > 0) {
      setBustOdds(fillOdds(playerHand));
      const odds = calculatePlayerOdds(playerHand, deck, numBustsShown + 1);
      setBustOdds(prev => [...prev, odds]);
      setNumBustsShown(prev => prev + 1);
    }
  }, [playerHand]);

  const dealerHit = async () => {
    let currentHand = [...dealerHand];
    while (sumValue(currentHand) < 17) {
      const newCard = await dealCard();
      currentHand.push(newCard);
    }
    setDealerHand(currentHand);
    setGameStatus('over');
  };

  const sumValue = (hand) => {
    const value = hand.reduce((sum, card) => {
      const cardValue = card.value === 'ace' ? 11 : 
                        card.value === 'king' || card.value === 'queen' || card.value === 'jack' ? 10 : 
                        parseInt(card.value);
      return sum + cardValue;
    }, 0);
    const numAces = hand.filter(card => card.value === 'ace').length;
    let adjustedValue = value;
    while (adjustedValue > 21 && numAces > 0) {
      adjustedValue -= 10;
      numAces -= 1;
    }
    return adjustedValue;
  };

  const checkWinner = () => {
    const playerScore = sumValue(playerHand);
    const dealerScore = sumValue(dealerHand);

    if (playerScore > 21) {
      return 'dealer';
    }
    if (dealerScore > 21 || playerScore > dealerScore) {
      return 'player';
    }
    if (playerScore === dealerScore) {
      return 'tie';
    }
    return 'dealer';
  };

  const handleSplit = async () => {
    if (playerHand.length < 2 || splitting) return;
    setSplitting(true);
    const splitCard = playerHand[1];
    setPlayerHand([playerHand[0]]);
    await initializeDeck();
    const newHand = [splitCard, await dealCard()];
    setPlayerHand(prev => [...prev, ...newHand]);
    // Deal a card to the new hand
  };

  const handleDoubleDown = async () => {
    if (doubleDown) return;
    setDoubleDown(true);
    const newCard = await dealCard();
    setPlayerHand(prevHand => [...prevHand, newCard]);
    setGameStatus('dealerMove');
    dealerHit();
  };

  const handleSurrender = () => {
    if (surrendered) return;
    setSurrendered(true);
    setLosses(prev => prev + 0.5);
    setGameStatus('over');
  };

  const handleReset = async () => {
    setSplitting(false);
    setDoubleDown(false);
    setSurrendered(false);
    await initializeDeck();
    initializeGame();
  };

  return (
    <div className="blackjack-game">
      <header>
        <h1>Blackjack</h1>
        <button onClick={resetWins}>Reset Wins/Losses</button>
      </header>
      <main>
        <div className="hands">
          <div className="hand player-hand">
            <h2>Player's Hand</h2>
            {playerHand.map((card, index) => (
              <Card key={index} card={card} />
            ))}
            <div className="actions">
              {gameStatus === 'playerMove' && (
                <>
                  <button onClick={hit}>Hit</button>
                  <button onClick={handleDoubleDown}>Double Down</button>
                  <button onClick={handleSurrender}>Surrender</button>
                  <button onClick={handleSplit}>Split</button>
                </>
              )}
              {gameStatus === 'over' && <button onClick={handleReset}>New Game</button>}
            </div>
          </div>
          <div className="hand dealer-hand">
            <h2>Dealer's Hand</h2>
            {dealerHand.map((card, index) => (
              <Card key={index} card={card} />
            ))}
          </div>
        </div>
        <OddsCalc dealerArr={dealerOdds} playerArr={bustOdds} />
        {showOdds && <InitialOddsCalc dealerArr={dealerOdds} playerScore={sumValue(playerHand)} />}
      </main>
      <footer>
        <p>Wins: {wins}</p>
        <p>Losses: {losses}</p>
        <p>Winner: {winner}</p>
      </footer>
    </div>
  );
}

export default Blackjack2;
