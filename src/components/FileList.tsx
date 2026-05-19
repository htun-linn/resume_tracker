import type { FileAsset, FileKind } from '../lib/types'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(value))
}

interface FileListProps {
  kind: FileKind
  files: FileAsset[]
  loading: boolean
  onUpload: () => void
  onDelete: (id: string) => void
  onOpen: (id: string) => void
}

export function FileList({ kind, files, loading, onUpload, onDelete, onOpen }: FileListProps) {
  const label = kind === 'resume' ? 'resume' : 'cover letter'

  return (
    <section className="file-panel">
      <div className="upload-dropzone">
        <strong>Upload a {label}</strong>
        <span>Keep the documents you use for applications in one place.</span>
        <button className="button button--primary" onClick={onUpload} type="button">
          Upload {label}
        </button>
      </div>

      <div className="table-card">
        {loading ? (
          <p className="muted">Loading files...</p>
        ) : files.length === 0 ? (
          <p className="muted">No {label}s uploaded yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>File name</th>
                <th>Uploaded</th>
                <th>Size</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id}>
                  <td>
                    <button className="link-button" onClick={() => onOpen(file.id)} type="button">
                      {file.display_name}
                    </button>
                  </td>
                  <td>{formatDate(file.created_at)}</td>
                  <td>{formatBytes(file.size_bytes)}</td>
                  <td className="table-card__actions">
                    <button className="button button--small button--danger" onClick={() => onDelete(file.id)} type="button">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
