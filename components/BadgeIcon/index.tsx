import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Achievement } from '../../lib/achievements';

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const Badge = styled.div<{ $rarity: string; $color: string; $size?: 'sm' | 'md' | 'lg' }>`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: ${p => p.$size === 'lg' ? '10px' : '6px'};

  .badge-icon {
    width: ${p => p.$size === 'lg' ? '72px' : p.$size === 'sm' ? '40px' : '52px'};
    height: ${p => p.$size === 'lg' ? '72px' : p.$size === 'sm' ? '40px' : '52px'};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${p => p.$size === 'lg' ? '2rem' : p.$size === 'sm' ? '1.1rem' : '1.5rem'};
    background: ${p => p.$rarity === 'legendary'
      ? `linear-gradient(135deg, ${p.$color}, #fff, ${p.$color})`
      : `radial-gradient(circle, ${p.$color}33, rgba(0,0,0,0.4))`};
    border: 2px solid ${p => p.$color};
    box-shadow: 0 0 12px ${p => p.$color}66;
    transition: transform 0.2s;
    background-size: 200%;
    animation: ${p => p.$rarity === 'legendary' ? shimmer : 'none'} 2s linear infinite;

    &:hover {
      transform: scale(1.1);
    }
  }

  .badge-title {
    font-size: ${p => p.$size === 'sm' ? '0.65rem' : '0.75rem'};
    font-weight: 700;
    color: ${p => p.$color};
    text-align: center;
    max-width: ${p => p.$size === 'lg' ? '90px' : '70px'};
    line-height: 1.2;
  }
`;

const LockedBadge = styled.div<{ $size?: 'sm' | 'md' | 'lg' }>`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  opacity: 0.3;
  filter: grayscale(1);

  .badge-icon {
    width: ${p => p.$size === 'lg' ? '72px' : p.$size === 'sm' ? '40px' : '52px'};
    height: ${p => p.$size === 'lg' ? '72px' : p.$size === 'sm' ? '40px' : '52px'};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${p => p.$size === 'lg' ? '2rem' : p.$size === 'sm' ? '1.1rem' : '1.5rem'};
    background: rgba(255,255,255,0.05);
    border: 2px solid #444;
  }

  .badge-title {
    font-size: ${p => p.$size === 'sm' ? '0.65rem' : '0.75rem'};
    font-weight: 600;
    color: #666;
    text-align: center;
    max-width: 70px;
    line-height: 1.2;
  }
`;

interface BadgeIconProps {
  achievement: Achievement;
  unlocked?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showTitle?: boolean;
}

const BadgeIcon: React.FC<BadgeIconProps> = ({ achievement, unlocked = true, size = 'md', showTitle = true }) => {
  if (!unlocked) {
    return (
      <LockedBadge $size={size} title={`🔒 ${achievement.title}: ${achievement.description}`}>
        <div className="badge-icon">🔒</div>
        {showTitle && <span className="badge-title">{achievement.title}</span>}
      </LockedBadge>
    );
  }

  return (
    <Badge $rarity={achievement.rarity} $color={achievement.color} $size={size} title={`${achievement.title}: ${achievement.description}`}>
      <div className="badge-icon">{achievement.icon}</div>
      {showTitle && <span className="badge-title">{achievement.title}</span>}
    </Badge>
  );
};

export default BadgeIcon;
