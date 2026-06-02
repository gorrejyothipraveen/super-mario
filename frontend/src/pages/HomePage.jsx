import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <div>
      <h1>Super Mario Web Game</h1>
      <p>Welcome! Use the menu to navigate.</p>
      <Link to="/game">
        <button>Play Game</button>
      </Link>
    </div>
  )
}

export default HomePage
