import React, { useRef, useState } from 'react';
import { processWithDelay } from './utils/processWithDelay';

class ProcessingCancelledError extends Error {
  constructor() {
    super('Processing was cancelled');
  }
}

const App: React.FC = () => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<{
    processed: number;
    total: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [delay, setDelay] = useState(1000);
  const [inputNumbers, setInputNumbers] = useState<string>('1, 2, 3, 4, 5');
  const cancelRef = useRef(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputNumbers(e.target.value);
  };

  const startProcessing = async () => {
    cancelRef.current = false;
    setProcessing(true);
    setError(null);
    setProgress({ processed: 0, total: 0 });

    const numbers = inputNumbers
      .split(',')
      .map((num) => num.trim())
      .map((num) => Number(num))
      .filter((num) => !isNaN(num));

    if (numbers.length === 0) {
      setError('Please enter valid numbers');
      setProcessing(false);
      return;
    }

    try {
      await processWithDelay(numbers, {
        delayMs: delay,
        onProgress: (processed, total) => {
          if (!cancelRef.current) {
            setProgress({ processed, total });
          }
        },
        shouldCancel: () => cancelRef.current,
      });
    } catch (err) {
      if (err instanceof ProcessingCancelledError) {
        setError('Processing was cancelled');
        setProgress(null);
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    } finally {
      setProcessing(false);
    }
  };

  const cancelProcessing = () => {
    cancelRef.current = true;
    setProgress(null);
    setInputNumbers('');
    setDelay(0);
    setError('Processing was cancelled');
  };

  const isStartButtonDisabled = !inputNumbers || delay <= 0 || processing;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>
        Process With Delay
      </h2>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Enter Numbers (comma-separated):
          <input
            type="text"
            value={inputNumbers}
            onChange={handleInputChange}
            placeholder="e.g., 1, 2, 3, 4, 5"
            style={{ marginLeft: '10px', padding: '5px' }}
            disabled={processing}
          />
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Delay (milliseconds):
          <input
            type="number"
            value={delay}
            onChange={(e) => setDelay(Number(e.target.value))}
            min="100"
            step="100"
            style={{ marginLeft: '10px', padding: '5px' }}
            disabled={processing}
          />
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={startProcessing}
          disabled={isStartButtonDisabled}
          style={{
            padding: '8px 16px',
            marginRight: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isStartButtonDisabled ? 'not-allowed' : 'pointer',
          }}
        >
          Start Processing
        </button>
        <button
          onClick={cancelProcessing}
          disabled={!processing}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: !processing ? 'not-allowed' : 'pointer',
          }}
        >
          Cancel Processing
        </button>
      </div>

      {progress && (
        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              width: '100%',
              backgroundColor: '#f0f0f0',
              borderRadius: '4px',
              height: '20px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${(progress.processed / progress.total) * 100}%`,
                height: '100%',
                backgroundColor: '#4CAF50',
                transition: 'width 0.3s ease-in-out',
              }}
            />
          </div>
          <p style={{ marginTop: '5px' }}>
            Processed: {progress.processed} / {progress.total}
          </p>
        </div>
      )}

      {error && (
        <p
          style={{
            color: '#f44336',
            padding: '10px',
            backgroundColor: '#ffebee',
            borderRadius: '4px',
            marginBottom: '20px',
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default App;
