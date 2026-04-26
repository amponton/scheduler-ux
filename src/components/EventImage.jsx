export function getEventBackground(imageUrl) {
  if (!imageUrl) return null
  if (imageUrl.startsWith('preset:')) {
    const preset = PRESETS.find(p => p.id === imageUrl.slice(7))
    return preset ? { type: 'preset', bg: preset.bg, emoji: preset.emoji } : null
  }
  return { type: 'upload', url: imageUrl }
}

export const PRESETS = [
  { id: 'birthday',    emoji: '🎂', label: 'Birthday',    bg: '#fef3c7' },
  { id: 'anniversary', emoji: '💑', label: 'Anniversary', bg: '#fce7f3' },
  { id: 'dinner',      emoji: '🍽️', label: 'Dinner',      bg: '#ecfdf5' },
  { id: 'party',       emoji: '🎉', label: 'Party',       bg: '#eff6ff' },
  { id: 'wedding',     emoji: '💒', label: 'Wedding',     bg: '#fdf4ff' },
  { id: 'graduation',  emoji: '🎓', label: 'Graduation',  bg: '#eef2ff' },
  { id: 'game-night',  emoji: '🎮', label: 'Game Night',  bg: '#f0fdf4' },
  { id: 'outdoor',     emoji: '🌿', label: 'Outdoor',     bg: '#f0fdf9' },
  { id: 'holiday',     emoji: '🎄', label: 'Holiday',     bg: '#fef2f2' },
  { id: 'sports',      emoji: '⚽', label: 'Sports',      bg: '#f0f9ff' },
  { id: 'concert',     emoji: '🎵', label: 'Concert',     bg: '#faf5ff' },
  { id: 'movie',       emoji: '🎬', label: 'Movie Night', bg: '#f5f3ff' },
]

export default function EventImage({ imageUrl, className = '' }) {
  if (!imageUrl) return null

  if (imageUrl.startsWith('preset:')) {
    const preset = PRESETS.find(p => p.id === imageUrl.slice(7))
    if (!preset) return null
    return (
      <div className={`event-image event-image-preset ${className}`} style={{ background: preset.bg }}>
        <span className="event-image-emoji">{preset.emoji}</span>
      </div>
    )
  }

  return (
    <div className={`event-image event-image-upload ${className}`}>
      <img src={imageUrl} alt="" />
    </div>
  )
}
