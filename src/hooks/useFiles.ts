import { useCallback, useEffect, useState } from 'react'
import type { FileAsset, FileKind } from '../lib/types'

export function useFiles(kind: FileKind) {
  const [files, setFiles] = useState<FileAsset[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    setFiles(await window.api.files.list(kind))
    setLoading(false)
  }, [kind])

  useEffect(() => {
    refresh()
    return window.api.onFilesChanged(refresh)
  }, [refresh])

  return { files, loading, refresh }
}
