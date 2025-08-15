import React, { useState, useEffect, useCallback, useRef } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

const DIFFICULTIES = {
  easy: { speed: 200, multiplier: 1 },
  medium: { speed: 150, multiplier: 1.5 },
  hard: { speed: 100, multiplier: 2 },
  extreme: { speed: 50, multiplier: 3 }
};

const Snake = () => {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [specialFood, setSpecialFood] = useState(null);
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('snakeHighScore') || '0', 10);
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [difficulty, setDifficulty] = useState('medium');
  const [moveCount, setMoveCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [level, setLevel] = useState(1);
  const [pointsAnimation, setPointsAnimation] = useState([]);
  
  const audioRef = useRef({});

  useEffect(() => {
    audioRef.current.eat = new Audio('data:audio/wav;base64,UklGRl0CAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YTkCAACAAAAA');
    audioRef.current.gameOver = new Audio('data:audio/wav;base64,UklGRl0CAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YTkCAACAAAAA');
  }, []);

  const playSound = (type) => {
    if (soundEnabled && audioRef.current[type]) {
      audioRef.current[type].currentTime = 0;
      audioRef.current[type].play().catch(() => {});
    }
  };

  const generateRandomFood = useCallback(() => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, [snake]);

  const generateSpecialFood = useCallback(() => {
    if (Math.random() < 0.1 && !specialFood) {
      let newSpecialFood;
      do {
        newSpecialFood = {
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE),
          type: Math.random() < 0.5 ? 'bonus' : 'speed',
          timer: 100
        };
      } while (
        snake.some(segment => segment.x === newSpecialFood.x && segment.y === newSpecialFood.y) ||
        (food.x === newSpecialFood.x && food.y === newSpecialFood.y)
      );
      setSpecialFood(newSpecialFood);
    }
  }, [snake, food, specialFood]);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 15, y: 15 });
    setSpecialFood(null);
    setDirection({ x: 1, y: 0 });
    setGameOver(false);
    setScore(0);
    setIsPlaying(false);
    setIsPaused(false);
    setSpeed(DIFFICULTIES[difficulty].speed);
    setMoveCount(0);
    setLevel(1);
    setPointsAnimation([]);
  };

  const addPointAnimation = (x, y, points) => {
    const id = Date.now();
    setPointsAnimation(prev => [...prev, { id, x, y, points }]);
    setTimeout(() => {
      setPointsAnimation(prev => prev.filter(anim => anim.id !== id));
    }, 1000);
  };

  const moveSnake = useCallback(() => {
    if (gameOver || !isPlaying || isPaused) return;

    setMoveCount(prev => prev + 1);

    if (moveCount % 100 === 0) {
      generateSpecialFood();
    }

    if (specialFood) {
      setSpecialFood(prev => {
        if (prev && prev.timer > 0) {
          return { ...prev, timer: prev.timer - 1 };
        }
        return null;
      });
    }

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };
      
      head.x += direction.x;
      head.y += direction.y;

      if (head.x < 0 || head.x >= GRID_SIZE || 
          head.y < 0 || head.y >= GRID_SIZE ||
          newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        setIsPlaying(false);
        playSound('gameOver');
        
        if (score > highScore) {
          setHighScore(score);
          localStorage.setItem('snakeHighScore', score.toString());
        }
        return currentSnake;
      }

      newSnake.unshift(head);

      let ateFood = false;
      let points = 0;

      if (head.x === food.x && head.y === food.y) {
        points = 10 * DIFFICULTIES[difficulty].multiplier;
        setScore(prev => {
          const newScore = prev + points;
          if (newScore > 0 && newScore % 100 === 0) {
            setLevel(prev => prev + 1);
            setSpeed(prev => Math.max(30, prev - 10));
          }
          return newScore;
        });
        addPointAnimation(head.x, head.y, `+${points}`);
        setFood(generateRandomFood());
        playSound('eat');
        ateFood = true;
      }

      if (specialFood && head.x === specialFood.x && head.y === specialFood.y) {
        if (specialFood.type === 'bonus') {
          points = 50 * DIFFICULTIES[difficulty].multiplier;
          setScore(prev => prev + points);
          addPointAnimation(head.x, head.y, `+${points} BONUS!`);
        } else if (specialFood.type === 'speed') {
          setSpeed(prev => prev + 20);
          addPointAnimation(head.x, head.y, 'SLOW!');
        }
        setSpecialFood(null);
        playSound('eat');
        ateFood = true;
      }

      if (!ateFood) {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, specialFood, gameOver, isPlaying, isPaused, generateRandomFood, generateSpecialFood, moveCount, difficulty, highScore, score]);

  useEffect(() => {
    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [moveSnake, speed]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        setShowSettings(prev => !prev);
        return;
      }

      if (e.key === 'p' || e.key === 'P') {
        if (isPlaying) {
          setIsPaused(prev => !prev);
        }
        return;
      }

      if (!isPlaying && !gameOver && e.key === ' ') {
        setIsPlaying(true);
        return;
      }

      if (!isPlaying || isPaused) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, isPlaying, gameOver, isPaused]);

  const handleDirectionButton = (newDirection) => {
    if (!isPlaying) {
      setIsPlaying(true);
      return;
    }

    if (isPaused) return;

    if (newDirection.x !== 0 && direction.x === 0) {
      setDirection(newDirection);
    } else if (newDirection.y !== 0 && direction.y === 0) {
      setDirection(newDirection);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🐍 Snake Game Pro</h1>
        <button 
          style={styles.settingsButton}
          onClick={() => setShowSettings(!showSettings)}
        >
          ⚙️
        </button>
      </div>

      {showSettings && (
        <div style={styles.settings}>
          <div style={styles.settingRow}>
            <label>Difficulté:</label>
            <select 
              value={difficulty} 
              onChange={(e) => {
                setDifficulty(e.target.value);
                if (!isPlaying) {
                  setSpeed(DIFFICULTIES[e.target.value].speed);
                }
              }}
              style={styles.select}
              disabled={isPlaying}
            >
              <option value="easy">Facile</option>
              <option value="medium">Moyen</option>
              <option value="hard">Difficile</option>
              <option value="extreme">Extrême</option>
            </select>
          </div>
          <div style={styles.settingRow}>
            <label>Son:</label>
            <button 
              style={styles.soundToggle}
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
          </div>
        </div>
      )}

      <div style={styles.scoreBoard}>
        <div style={styles.scoreItem}>
          <span style={styles.scoreLabel}>Score</span>
          <span style={styles.scoreValue}>{score}</span>
        </div>
        <div style={styles.scoreItem}>
          <span style={styles.scoreLabel}>Niveau</span>
          <span style={styles.scoreValue}>{level}</span>
        </div>
        <div style={styles.scoreItem}>
          <span style={styles.scoreLabel}>Record</span>
          <span style={styles.scoreValue}>{highScore}</span>
        </div>
      </div>

      {isPaused && (
        <div style={styles.pausedOverlay}>PAUSE</div>
      )}

      {gameOver && (
        <div style={styles.gameOverOverlay}>
          <h2>Game Over!</h2>
          <p>Score: {score}</p>
          {score > highScore && <p style={styles.newRecord}>🏆 Nouveau Record!</p>}
        </div>
      )}
      
      <div style={styles.gameWrapper}>
        <div style={styles.gameBoard}>
          {Array.from({ length: GRID_SIZE }).map((_, y) => (
            <div key={y} style={styles.row}>
              {Array.from({ length: GRID_SIZE }).map((_, x) => {
                const isSnake = snake.some(segment => segment.x === x && segment.y === y);
                const isHead = snake[0].x === x && snake[0].y === y;
                const isFood = food.x === x && food.y === y;
                const isSpecialFood = specialFood && specialFood.x === x && specialFood.y === y;
                
                let cellStyle = { ...styles.cell };
                
                if (isHead) {
                  cellStyle.backgroundColor = '#2ecc71';
                  cellStyle.boxShadow = '0 0 10px #2ecc71';
                  cellStyle.transform = 'scale(1.1)';
                } else if (isSnake) {
                  const index = snake.findIndex(s => s.x === x && s.y === y);
                  const opacity = 1 - (index / snake.length) * 0.3;
                  cellStyle.backgroundColor = `rgba(39, 174, 96, ${opacity})`;
                } else if (isFood) {
                  cellStyle.backgroundColor = '#e74c3c';
                  cellStyle.borderRadius = '50%';
                  cellStyle.animation = 'pulse 0.5s infinite';
                } else if (isSpecialFood) {
                  if (specialFood.type === 'bonus') {
                    cellStyle.backgroundColor = '#f39c12';
                    cellStyle.borderRadius = '50%';
                    cellStyle.animation = 'spin 1s infinite linear';
                  } else {
                    cellStyle.backgroundColor = '#9b59b6';
                    cellStyle.borderRadius = '50%';
                    cellStyle.animation = 'pulse 0.3s infinite';
                  }
                } else {
                  cellStyle.backgroundColor = '#34495e';
                }
                
                return <div key={`${x}-${y}`} style={cellStyle} />;
              })}
            </div>
          ))}
          {pointsAnimation.map(anim => (
            <div
              key={anim.id}
              style={{
                ...styles.pointAnimation,
                left: `${anim.x * CELL_SIZE}px`,
                top: `${anim.y * CELL_SIZE}px`
              }}
            >
              {anim.points}
            </div>
          ))}
        </div>
      </div>

      <div style={styles.controls}>
        {!isPlaying && !gameOver && (
          <button style={styles.startButton} onClick={() => setIsPlaying(true)}>
            🎮 Commencer (Espace)
          </button>
        )}
        
        {isPlaying && (
          <button style={styles.pauseButton} onClick={() => setIsPaused(!isPaused)}>
            {isPaused ? '▶️ Reprendre' : '⏸️ Pause'} (P)
          </button>
        )}
        
        {gameOver && (
          <button style={styles.startButton} onClick={resetGame}>
            🔄 Rejouer
          </button>
        )}

        {(isPlaying || (!isPlaying && !gameOver)) && (
          <div style={styles.directionControls}>
            <div style={styles.controlRow}>
              <button 
                style={styles.controlButton} 
                onClick={() => handleDirectionButton({ x: 0, y: -1 })}
                disabled={isPaused}
              >
                ↑
              </button>
            </div>
            <div style={styles.controlRow}>
              <button 
                style={styles.controlButton} 
                onClick={() => handleDirectionButton({ x: -1, y: 0 })}
                disabled={isPaused}
              >
                ←
              </button>
              <button 
                style={styles.controlButton} 
                onClick={() => handleDirectionButton({ x: 0, y: 1 })}
                disabled={isPaused}
              >
                ↓
              </button>
              <button 
                style={styles.controlButton} 
                onClick={() => handleDirectionButton({ x: 1, y: 0 })}
                disabled={isPaused}
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={styles.instructions}>
        <p>🎮 Flèches/WASD ou boutons • P pour pause • ESC pour options</p>
        <div style={styles.foodLegend}>
          <span>🔴 Normal +10pts</span>
          <span>🟡 Bonus +50pts</span>
          <span>🟣 Ralentissement</span>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeUp {
          0% { 
            opacity: 1;
            transform: translateY(0);
          }
          100% { 
            opacity: 0;
            transform: translateY(-30px);
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    padding: '20px',
    boxSizing: 'border-box',
    position: 'relative'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '20px'
  },
  title: {
    fontSize: '2.5rem',
    textAlign: 'center',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    margin: 0
  },
  settingsButton: {
    fontSize: '1.5rem',
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  settings: {
    background: 'rgba(0,0,0,0.3)',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '20px',
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap'
  },
  settingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  select: {
    padding: '5px 10px',
    borderRadius: '5px',
    border: 'none',
    background: 'rgba(255,255,255,0.9)',
    color: '#333',
    fontSize: '1rem',
    cursor: 'pointer'
  },
  soundToggle: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    borderRadius: '5px',
    padding: '5px 10px',
    fontSize: '1.2rem',
    cursor: 'pointer'
  },
  scoreBoard: {
    display: 'flex',
    gap: '30px',
    marginBottom: '20px',
    background: 'rgba(0,0,0,0.3)',
    padding: '15px 30px',
    borderRadius: '15px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  scoreItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px'
  },
  scoreLabel: {
    fontSize: '0.9rem',
    opacity: 0.8,
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  scoreValue: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
  },
  pausedOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '3rem',
    fontWeight: 'bold',
    textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
    zIndex: 10,
    animation: 'pulse 1s infinite'
  },
  gameOverOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(0,0,0,0.8)',
    padding: '30px',
    borderRadius: '15px',
    textAlign: 'center',
    zIndex: 10
  },
  newRecord: {
    color: '#f39c12',
    fontSize: '1.2rem',
    marginTop: '10px'
  },
  gameWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '15px',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '15px',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
    backdropFilter: 'blur(4px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    position: 'relative'
  },
  gameBoard: {
    display: 'inline-block',
    border: '2px solid rgba(255,255,255,0.3)',
    backgroundColor: '#2c3e50',
    borderRadius: '5px',
    position: 'relative',
    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)'
  },
  row: {
    display: 'flex'
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    border: '0.5px solid rgba(52, 73, 94, 0.3)',
    boxSizing: 'border-box',
    transition: 'all 0.1s ease'
  },
  pointAnimation: {
    position: 'absolute',
    color: '#f39c12',
    fontWeight: 'bold',
    fontSize: '1.2rem',
    animation: 'fadeUp 1s ease-out',
    pointerEvents: 'none',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
    zIndex: 100
  },
  controls: {
    marginTop: '30px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px'
  },
  startButton: {
    padding: '15px 30px',
    fontSize: '1.2rem',
    background: 'linear-gradient(45deg, #00b4db, #0083b0)',
    color: 'white',
    border: 'none',
    borderRadius: '30px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 4px 15px rgba(0,180,219,0.4)',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  pauseButton: {
    padding: '10px 20px',
    fontSize: '1rem',
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '20px',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  directionControls: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px'
  },
  controlRow: {
    display: 'flex',
    gap: '5px'
  },
  controlButton: {
    width: '60px',
    height: '60px',
    fontSize: '2rem',
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.2s',
    touchAction: 'manipulation',
    backdropFilter: 'blur(10px)'
  },
  instructions: {
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '0.9rem',
    opacity: 0.9
  },
  foodLegend: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    marginTop: '10px',
    fontSize: '0.85rem'
  }
};

export default Snake;