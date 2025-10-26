import React from 'react'

export const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="flex items-center">
            {/* Pangolin Logo */}
            <div className="logo">
              <div className="logo-icon">
                <img 
                  src="/pangolinlogo1:4.svg" 
                  alt="Pangolin" 
                  style={{ width: '222px', height: '222px', marginRight: '-175px' }}
                />
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="nav hidden" style={{ display: 'none' }}>
              <button className="nav-item">Swap</button>
              <button className="nav-item active">Recovery</button>
              <button className="nav-item">Stake</button>
              <button className="nav-item">Stats</button>
            </nav>
          </div>
          
          <div className="flex items-center">
            <div className="network-indicator">
              {/* Network indicator kaldırıldı - sadece logo */}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}