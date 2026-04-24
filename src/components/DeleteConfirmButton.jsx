import { useState } from 'react'

export default function DeleteConfirmButton({ onConfirm }) {
  const [confirming, setConfirming] = useState(false)
  if (!confirming) {
    return <button className="event-delete-btn" onClick={() => setConfirming(true)}>Delete</button>
  }
  return (
    <div className="delete-confirm-group">
      <button className="event-delete-btn confirm" onClick={onConfirm}>Yes, delete</button>
      <button className="delete-cancel-btn" onClick={() => setConfirming(false)}>Cancel</button>
    </div>
  )
}
