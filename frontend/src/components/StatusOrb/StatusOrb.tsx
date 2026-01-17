import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

type GameStatus = 'online' | 'idle' | 'offline' | 'playing' | 'spectating';

interface StatusOrbProps {
  userStatus?: GameStatus;
  onStatusChange?: (status: GameStatus) => void;
}

const STATUS_CONFIG = {
  online: {
    color: '#39FF14',
    label: 'Online',
    icon: '●',
    bgColor: 'bg-lime-500',
  },
  idle: {
    color: '#FFB500',
    label: 'Idle',
    icon: '◐',
    bgColor: 'bg-orange-500',
  },
  offline: {
    color: '#7A8599',
    label: 'Offline',
    icon: '○',
    bgColor: 'bg-gray-400',
  },
  playing: {
    color: '#00F0FF',
    label: 'Playing',
    icon: '▶',
    bgColor: 'bg-cyan-500',
  },
  spectating: {
    color: '#AA00FF',
    label: 'Spectating',
    icon: '◈',
    bgColor: 'bg-purple-500',
  },
};

const StatusOrb: React.FC<StatusOrbProps> = ({ 
  userStatus = 'online', 
  onStatusChange 
}) => {
  const [status, setStatus] = useState<GameStatus>(userStatus);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLabel, setShowLabel] = useState(false);
  const orbRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP glow pulse animation
    if (glowRef.current) {
      gsap.to(glowRef.current, {
        boxShadow: `0 0 40px ${STATUS_CONFIG[status].color}, 0 0 60px ${STATUS_CONFIG[status].color}`,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }

    return () => {
      if (glowRef.current) {
        gsap.killTweensOf(glowRef.current);
      }
    };
  }, [status]);

  const handleStatusChange = (newStatus: GameStatus) => {
    setStatus(newStatus);
    setIsMenuOpen(false);
    onStatusChange?.(newStatus);
  };

  const currentConfig = STATUS_CONFIG[status];

  return (
    <div className="relative">
      {/* Hover Label */}
      {showLabel && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs text-white bg-dark-950 px-2 py-1 rounded border border-cyan-500/30 z-50">
          {currentConfig.label}
        </div>
      )}

      {/* Status Orb */}
      <div
        ref={orbRef}
        className="relative cursor-pointer"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        onMouseEnter={() => setShowLabel(true)}
        onMouseLeave={() => setShowLabel(false)}
      >
        <div
          ref={glowRef}
          className="w-3 h-3 rounded-full transition-all duration-300"
          style={{
            backgroundColor: currentConfig.color,
            boxShadow: `0 0 20px ${currentConfig.color}, inset 0 0 10px ${currentConfig.color}`,
          }}
        />
      </div>

      {/* Status Menu */}
      {isMenuOpen && (
        <div className="absolute top-8 right-0 mt-2 p-3 bg-dark-950/95 border border-cyan-500/30 rounded-lg backdrop-blur-md z-50 min-w-40">
          <div className="text-xs text-cyan-400 font-semibold mb-2">SELECT STATUS</div>
          <div className="space-y-2">
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <button
                key={key}
                onClick={() => handleStatusChange(key as GameStatus)}
                className={`w-full px-3 py-2 rounded flex items-center gap-2 transition-all duration-200 ${
                  status === key
                    ? 'bg-cyan-500/20 border border-cyan-500/50'
                    : 'bg-dark-800/50 border border-transparent hover:bg-dark-700/50'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-xs text-white">{config.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusOrb;
