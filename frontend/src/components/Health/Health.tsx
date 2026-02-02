import React, { useState, useEffect } from 'react';

interface HealthStatus {
  status: 'OK' | 'ERROR' | 'LOADING';
  isOnline: boolean;
}

const ServerHealthMonitor: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    status: 'LOADING',
    isOnline: false,
  });
  const [checksCount, setChecksCount] = useState<number>(0);
  const [lastCheck, setLastCheck] = useState<string>('--:--:--');
  const [uptime, setUptime] = useState<string>('00:00:00');
  const [startTime] = useState<number>(Date.now());
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const API_URL = 'https://pongrush.game/api/health';

  useEffect(() => {
    // Initial health check
    checkHealth();

    // Auto-refresh every 30 seconds
    const healthCheckInterval = setInterval(checkHealth, 30000);

    // Update uptime every second
    const uptimeInterval = setInterval(updateUptime, 1000);

    return () => {
      clearInterval(healthCheckInterval);
      clearInterval(uptimeInterval);
    };
  }, []);

  const updateUptime = () => {
    const elapsed = Date.now() - startTime;
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);

    setUptime(
      `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    );
  };

  const updateTimestamp = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour12: false });
    setLastCheck(`LAST CHECK: ${timeString}`);
  };

  const checkHealth = async () => {
    setIsChecking(true);
    setHealthStatus({ status: 'LOADING', isOnline: false });

    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      setChecksCount((prev) => prev + 1);
      updateTimestamp();

      if (response.ok && data.status === 'OK') {
        setHealthStatus({ status: 'OK', isOnline: true });
      } else {
        setHealthStatus({ status: 'ERROR', isOnline: false });
      }
    } catch (error) {
      setHealthStatus({ status: 'ERROR', isOnline: false });
      setChecksCount((prev) => prev + 1);
      updateTimestamp();
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusIcon = () => {
    if (healthStatus.status === 'LOADING') return '⚙️';
    if (healthStatus.isOnline) return '✓';
    return '✗';
  };

  const getStatusText = () => {
    if (healthStatus.status === 'LOADING') return 'CHECKING...';
    if (healthStatus.isOnline) return 'ONLINE';
    return 'OFFLINE';
  };

  const getStatusClass = () => {
    if (healthStatus.status === 'LOADING') return 'status-loading';
    if (healthStatus.isOnline) return 'status-ok';
    return 'status-error';
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        
        .server-health-monitor {
          font-family: 'Press Start 2P', cursive;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a0033 50%, #330066 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          position: relative;
        }
        
        .grid-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            linear-gradient(rgba(255, 0, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: gridMove 20s linear infinite;
          perspective: 1000px;
          transform: rotateX(60deg) translateY(-50%);
        }
        
        @keyframes gridMove {
          0% { background-position: 0 0; }
          100% { background-position: 50px 50px; }
        }
        
        .particle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: #00ffff;
          box-shadow: 0 0 10px #00ffff;
          animation: float 10s infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(50px); opacity: 0; }
        }
        
        .container {
          background: rgba(0, 0, 0, 0.8);
          border: 4px solid #ff00ff;
          border-radius: 20px;
          padding: 50px;
          box-shadow: 
            0 0 30px rgba(255, 0, 255, 0.5),
            inset 0 0 30px rgba(0, 255, 255, 0.1);
          max-width: 600px;
          width: 90%;
          position: relative;
          z-index: 10;
          animation: containerGlow 3s ease-in-out infinite;
        }
        
        @keyframes containerGlow {
          0%, 100% { box-shadow: 0 0 30px rgba(255, 0, 255, 0.5), inset 0 0 30px rgba(0, 255, 255, 0.1); }
          50% { box-shadow: 0 0 50px rgba(255, 0, 255, 0.8), inset 0 0 30px rgba(0, 255, 255, 0.2); }
        }
        
        .title {
          text-align: center;
          color: #00ffff;
          font-size: 24px;
          margin-bottom: 10px;
          text-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff;
          animation: neonPulse 2s ease-in-out infinite;
        }
        
        .subtitle {
          text-align: center;
          color: #ff00ff;
          font-size: 12px;
          margin-bottom: 40px;
          text-shadow: 0 0 10px #ff00ff;
        }
        
        @keyframes neonPulse {
          0%, 100% { text-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff; }
          50% { text-shadow: 0 0 20px #00ffff, 0 0 40px #00ffff, 0 0 60px #00ffff; }
        }
        
        .status-display {
          background: rgba(0, 20, 40, 0.8);
          border: 3px solid #00ffff;
          border-radius: 15px;
          padding: 40px;
          text-align: center;
          margin: 30px 0;
          position: relative;
          overflow: hidden;
        }
        
        .status-display::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent, rgba(0, 255, 255, 0.1), transparent);
          animation: scan 3s linear infinite;
        }
        
        @keyframes scan {
          0% { transform: translateX(-100%) translateY(-100%); }
          100% { transform: translateX(100%) translateY(100%); }
        }
        
        .status-icon {
          font-size: 80px;
          margin-bottom: 20px;
          animation: bounce 2s ease-in-out infinite;
          position: relative;
          z-index: 1;
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        
        .status-text {
          font-size: 32px;
          margin-bottom: 10px;
          position: relative;
          z-index: 1;
        }
        
        .status-ok {
          color: #00ff00;
          text-shadow: 0 0 20px #00ff00, 0 0 40px #00ff00;
        }
        
        .status-error {
          color: #ff0000;
          text-shadow: 0 0 20px #ff0000, 0 0 40px #ff0000;
        }
        
        .status-loading {
          color: #ffff00;
          text-shadow: 0 0 20px #ffff00, 0 0 40px #ffff00;
        }
        
        .timestamp {
          color: #888;
          font-size: 10px;
          margin-top: 20px;
          position: relative;
          z-index: 1;
        }
        
        .stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 30px;
        }
        
        .stat-box {
          background: rgba(0, 0, 0, 0.6);
          border: 2px solid #ff00ff;
          border-radius: 10px;
          padding: 20px;
          text-align: center;
        }
        
        .stat-label {
          color: #ff00ff;
          font-size: 10px;
          margin-bottom: 10px;
        }
        
        .stat-value {
          color: #00ffff;
          font-size: 20px;
          text-shadow: 0 0 10px #00ffff;
        }
        
        .refresh-btn {
          background: linear-gradient(135deg, #ff00ff, #00ffff);
          border: none;
          border-radius: 10px;
          color: #000;
          font-family: 'Press Start 2P', cursive;
          font-size: 12px;
          padding: 15px 30px;
          cursor: pointer;
          margin-top: 30px;
          width: 100%;
          transition: all 0.3s;
          box-shadow: 0 5px 15px rgba(255, 0, 255, 0.5);
        }
        
        .refresh-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(255, 0, 255, 0.8);
        }
        
        .refresh-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        
        .refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .loading {
          animation: rotate 1s linear infinite;
        }
        
        .corner {
          position: absolute;
          width: 30px;
          height: 30px;
          border: 3px solid #00ffff;
        }
        
        .corner-tl {
          top: 10px;
          left: 10px;
          border-right: none;
          border-bottom: none;
        }
        
        .corner-tr {
          top: 10px;
          right: 10px;
          border-left: none;
          border-bottom: none;
        }
        
        .corner-bl {
          bottom: 10px;
          left: 10px;
          border-right: none;
          border-top: none;
        }
        
        .corner-br {
          bottom: 10px;
          right: 10px;
          border-left: none;
          border-top: none;
        }
      `}</style>

      <div className="server-health-monitor">
        <div className="grid-background" />

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
            }}
          />
        ))}

        <div className="container">
          <div className="corner corner-tl" />
          <div className="corner corner-tr" />
          <div className="corner corner-bl" />
          <div className="corner corner-br" />

          <h1 className="title">PONGRUSH</h1>
          <p className="subtitle">SERVER STATUS MONITOR</p>

          <div className="status-display">
            <div
              className={`status-icon ${healthStatus.status === 'LOADING' ? 'loading' : ''}`}
            >
              {getStatusIcon()}
            </div>
            <div className={`status-text ${getStatusClass()}`}>
              {getStatusText()}
            </div>
            <div className="timestamp">{lastCheck}</div>
          </div>

          <div className="stats">
            <div className="stat-box">
              <div className="stat-label">UPTIME</div>
              <div className="stat-value">{uptime}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">CHECKS</div>
              <div className="stat-value">{checksCount}</div>
            </div>
          </div>

          <button
            className="refresh-btn"
            onClick={checkHealth}
            disabled={isChecking}
          >
            {isChecking ? 'CHECKING...' : 'REFRESH STATUS'}
          </button>
        </div>
      </div>
    </>
  );
};

export default ServerHealthMonitor;