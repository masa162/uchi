export default function TestPage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>VPS接続テスト</h1>
      <p>この画面が表示されれば、VPSとNext.jsは正常に動作しています。</p>
      <p>時刻: {new Date().toLocaleString('ja-JP')}</p>
    </div>
  )
}