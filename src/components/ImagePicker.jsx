import { useRef, useState } from 'react'
import { PRESETS } from './EventImage'
import { uploadEventImage } from '../lib/storage'

export default function ImagePicker({ value, onChange, userId }) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadEventImage(userId, file)
      onChange(url)
    } catch (err) {
      console.error('Failed to upload event image', err)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const selectedPresetId = value?.startsWith('preset:') ? value.slice(7) : null
  const hasUpload = value && !value.startsWith('preset:')

  return (
    <div className="image-picker">
      <div className="image-picker-grid">
        <button
          type="button"
          className={`image-picker-none${!value ? ' selected' : ''}`}
          onClick={() => onChange(null)}
        >
          None
        </button>
        {PRESETS.map(preset => (
          <button
            key={preset.id}
            type="button"
            className={`image-picker-preset${selectedPresetId === preset.id ? ' selected' : ''}`}
            style={{ background: preset.bg }}
            title={preset.label}
            onClick={() => onChange(`preset:${preset.id}`)}
          >
            <span className="image-picker-emoji">{preset.emoji}</span>
            <span className="image-picker-label">{preset.label}</span>
          </button>
        ))}
        <button
          type="button"
          className={`image-picker-upload${hasUpload ? ' selected' : ''}`}
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Uploading…' : hasUpload ? 'Change photo' : '+ Upload'}
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
    </div>
  )
}
