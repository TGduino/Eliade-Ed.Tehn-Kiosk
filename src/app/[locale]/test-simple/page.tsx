export default function TestSimplePage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Simple Test Page</h1>
      <p>If you can see this, the basic setup works!</p>
      <p>Time: {new Date().toISOString()}</p>
    </div>
  )
}


