import { FileList } from '../components/FileList'
import { useFiles } from '../hooks/useFiles'

export function Resumes() {
  const { files, loading } = useFiles('resume')

  async function handleUpload() {
    await window.api.files.upload('resume')
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this resume?')) return
    await window.api.files.delete(id)
  }

  return (
    <main className="view">
      <div className="view__header">
        <div>
          <p className="eyebrow">Library</p>
          <h1>Resumes</h1>
        </div>
      </div>
      <FileList
        files={files}
        kind="resume"
        loading={loading}
        onDelete={handleDelete}
        onOpen={window.api.files.open}
        onUpload={handleUpload}
      />
    </main>
  )
}
