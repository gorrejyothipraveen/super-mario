import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', textAlign: 'center', padding: 40 }}>
      <h1>Super Mario Web Game</h1>
      <p>Welcome! Choose an option below.</p>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 24 }}>
        <Link to="/game"><button>Play Game</button></Link>
        <Link to="/leaderboard"><button>Leaderboard</button></Link>
      </div>
    </div>
  )
}

export default HomePage
