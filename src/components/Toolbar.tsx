interface ToolbarProps {
  onUploadResume: () => void
  onUploadCoverLetter: () => void
  onOpenSettings: () => void
}

export function Toolbar({ onUploadResume, onUploadCoverLetter, onOpenSettings }: ToolbarProps) {
  return (
    <header className="toolbar">
      <button className="button button--ghost" onClick={onOpenSettings} type="button">
        Settings
      </button>
      <div className="toolbar__spacer" />
      <button className="button" onClick={onUploadResume} type="button">
        Upload resume
      </button>
      <button className="button" onClick={onUploadCoverLetter} type="button">
        Upload cover letter
      </button>
    </header>
  )
}
