export default function SimplePage() {
  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center',
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#f0f8ff',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#2563eb', marginBottom: '20px' }}>
        🏡 うちのきろく - VPS接続成功！
      </h1>
      <p style={{ fontSize: '18px', color: '#374151' }}>
        VPSとNext.jsが正常に動作しています
      </p>
      <div style={{ 
        marginTop: '30px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2>✅ 動作確認項目</h2>
        <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
          <li>ConoHa VPS: 正常</li>
          <li>nginx: 正常</li>
          <li>Next.js: 正常</li>
          <li>外部アクセス: 正常</li>
        </ul>
      </div>
      <p style={{ marginTop: '30px', color: '#6b7280' }}>
        時刻: {new Date().toLocaleString('ja-JP')}
      </p>
    </div>
  )
}