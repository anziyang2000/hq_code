import React from 'react';

import './header-card.less';
export const HeaderCard = ({
  content,
  icon,
  borderNone,
  className,
}: {
  borderNone?: boolean;
  icon: React.ReactNode;
  content: React.ReactNode;
  className?: string;
}) => (
  <div className={`header-card ${borderNone ? 'border-none' : ''} ${className}`}>
    {icon}
    <div className="header-card-content">{content}</div>
  </div>
);
