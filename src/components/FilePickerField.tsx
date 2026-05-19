import type { FileAsset, FileKind } from '../lib/types'

interface FilePickerFieldProps {
  label: string
  kind: FileKind
  files: FileAsset[]
  value: string | null
  onChange: (id: string | null) => void
  onUpload: (kind: FileKind) => Promise<FileAsset | null>
}

export function FilePickerField({ label, kind, files, value, onChange, onUpload }: FilePickerFieldProps) {
  const selectedFile = files.find((file) => file.id === value)

  async function handleUpload() {
    const file = await onUpload(kind)
    if (file) onChange(file.id)
  }

  return (
    <label className="field">
      <span>{label}</span>
      <div className="file-picker">
        <select value={value ?? ''} onChange={(event) => onChange(event.target.value || null)}>
          <option value="">No file selected</option>
          {files.map((file) => (
            <option key={file.id} value={file.id}>
              {file.display_name}
            </option>
          ))}
        </select>
        <button className="button" onClick={handleUpload} type="button">
          Upload new
        </button>
      </div>
      <small>{selectedFile ? `Linked file: ${selectedFile.display_name}` : `Choose an existing ${label.toLowerCase()} or upload a new one.`}</small>
    </label>
  )
}
