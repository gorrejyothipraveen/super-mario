import { useLocation } from 'react-router-dom'
import PhaserGame from '../game/PhaserGame.jsx'

export default function GamePage() {
  const { state } = useLocation()
  return <PhaserGame initialSave={state?.save ?? null} />
}
