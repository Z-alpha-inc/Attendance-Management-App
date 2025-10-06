import React from 'react'; // Reactの型定義を使うためインポート

function HomePage() {
  // 中央揃えにするためのCSSスタイル
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center', // 水平（横）方向の中央揃え
    alignItems: 'center',     // 垂直（縦）方向の中央揃え
    height: '100vh',          // ← これが最も重要！画面全体の高さを確保
    width: '100vw',           // 画面全体の幅を確保
  };

  return (
    <div style={containerStyle}>
      <h1>家</h1>
    </div>
  );
}

export default HomePage;