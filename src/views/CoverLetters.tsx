import { FileList } from '../components/FileList'
import { useFiles } from '../hooks/useFiles'

export function CoverLetters() {
  const { files, loading } = useFiles('cover_letter')

  async function handleUpload() {
    await window.api.files.upload('cover_letter')
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this cover letter?')) return
    await window.api.files.delete(id)
  }

  return (
    <main className="view">
      <div className="view__header">
        <div>
          <p className="eyebrow">Library</p>
          <h1>Cover Letters</h1>
        </div>
      </div>
      <FileList
        files={files}
        kind="cover_letter"
        loading={loading}
        onDelete={handleDelete}
        onOpen={window.api.files.open}
        onUpload={handleUpload}
      />
    </main>
  )
}
