"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { trpc } from "@/lib/trpc-client"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import StudioEditor from "@grapesjs/studio-sdk/react"
import "@grapesjs/studio-sdk/style"

type CanvasElement =
  | {
      id: string
      type: "text"
      x: number
      y: number
      width?: number
      height?: number
      text: string
      color?: string
      fontSize?: number
      z?: number
    }
  | {
      id: string
      type: "rect"
      x: number
      y: number
      width: number
      height: number
      color?: string
      radius?: number
      z?: number
    }

type CanvasJson = {
  elements: CanvasElement[]
}

function uid(prefix = "el"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`
}

export default function DesignerPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const projectId = React.useMemo(() => params?.id, [params])

  const [activePageId, setActivePageId] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState<"idle" | "saving" | "saved">("idle")
  const editorRef = React.useRef<any>(null)
  const activePageIdRef = React.useRef<string | null>(null)
  const editorReadyRef = React.useRef<boolean>(false)
  const loadedOnceRef = React.useRef<boolean>(false)
  // No manual ref container; we use the React wrapper

  // Load pages for this project
  const pagesQuery = trpc.getPages.useQuery(
    { projectId: projectId! },
    { enabled: Boolean(projectId) }
  )

  const createPage = trpc.createPage.useMutation({
    onSuccess: () => pagesQuery.refetch(),
  })
  const updateCanvas = trpc.updateCanvasJson.useMutation({
    onSuccess: () => {
      setSaving("saved")
      // return to idle after a moment
      setTimeout(() => setSaving("idle"), 900)
    },
    onMutate: () => setSaving("saving"),
  })

  // Initialize active page
  React.useEffect(() => {
    const pages = pagesQuery.data
    if (!pages || pages.length === 0 || !projectId) return
    const first: any = pages[0]
    if (!first) return
    setActivePageId((prev) => prev ?? first.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagesQuery.data, projectId])

  React.useEffect(() => {
    activePageIdRef.current = activePageId
  }, [activePageId])

  // Helpers to validate and migrate project data into Studio format
  const isStudioProject = React.useCallback((data: any) => {
    return !!(
      data &&
      typeof data === "object" &&
      Array.isArray((data as any).pages) &&
      (data as any).pages.every((pg: any) => Array.isArray(pg?.frames))
    )
  }, [])

  const migrateLegacyData = React.useCallback((data: any) => {
    if (!data) return null
    if (isStudioProject(data)) return data
    if ((data as any).html) {
      return {
        pages: [
          {
            name: "Home",
            frames: [{ component: (data as any).html }],
          },
        ],
      }
    }
    return null
  }, [isStudioProject])

  const DEFAULT_PROJECT = React.useMemo(
    () => ({ pages: [{ name: "Home", frames: [{ component: "<h1>Home page</h1>" }] }] }),
    []
  )

  // Default project used only when there is no DB data yet
  const defaultProjectForEditor = DEFAULT_PROJECT

  // Auto-create a default page if none exist
  React.useEffect(() => {
    if (!projectId) return
    if (pagesQuery.isLoading) return
    if ((pagesQuery.data?.length ?? 0) > 0) return
    createPage.mutate({ projectId, name: "Home" })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, pagesQuery.isLoading, pagesQuery.data])

  // Debounced save helper
  const scheduleSaveData = React.useMemo(() => {
    let t: any
    return (data: any) => {
      if (!activePageIdRef.current) return
      setSaving("saving")
      clearTimeout(t)
      t = setTimeout(() => {
        updateCanvas.mutate({ pageId: activePageIdRef.current!, canvasJson: data ?? {} })
      }, 600)
    }
  }, [updateCanvas])

  // No manual init; React wrapper handles mounting

  // Studio handles keyboard interactions; no custom handlers needed

  function addText() {
    const e = editorRef.current
    if (e?.addComponents) e.addComponents({ type: "text", content: "New text" })
  }

  function addRect() {
    const e = editorRef.current
    if (e?.addComponents)
      e.addComponents({ tagName: "div", style: { width: "120px", height: "80px", background: "#e2e8f0" } })
  }

  function updateSelectedText(_next: string) {}

  function updateSelected<K extends keyof CanvasElement & string>(_key: K, _value: any) {}

  // No global key suppression needed

  const pages = (pagesQuery.data as any[]) || []
  const active = pages.find((p) => p.id === activePageId)

  return (
    <div className="flex h-[100svh] flex-col">
      {/* Top bar */}
      <div className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3 px-4 py-2">
          <Button variant="ghost" onClick={() => router.push("/dashboard")}>{"←"} Dashboard</Button>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">Project</div>
            <span className="text-sm font-medium">{projectId}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {pagesQuery.isLoading ? (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading pages…
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <select
                  className="h-8 rounded border bg-background px-2 text-sm"
                  value={activePageId ?? ""}
                  onChange={(e) => setActivePageId(e.target.value || null)}
                >
                  {pages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => projectId && createPage.mutate({ projectId, name: `Page ${pages.length + 1}` })}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> New page
                </Button>
              </div>
            )}
            <span className="ml-3 text-xs text-muted-foreground">
              {saving === "saving" && (
                <span className="inline-flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Saving…</span>
              )}
              {saving === "saved" && <span>Saved</span>}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-0 flex flex-col">
        {/* Studio React renders the full editor (left blocks, center canvas, right panels) */}
        <div className="bg-white h-full">
          <StudioEditor
            className="h-full w-full"
            key={activePageId ?? 'studio'}
            onEditor={(editor: any) => {
              editorRef.current = editor
              editorReadyRef.current = false
              loadedOnceRef.current = false
              // Autosave only on project:store per docs
              editor.on?.("project:store", (data: any) => scheduleSaveData(data))
              // Load DB project once editor is ready; keep defaults otherwise
              const handleReady = () => {
                if (loadedOnceRef.current) return
                editorReadyRef.current = true
                const pages = pagesQuery.data
                const p = pages?.find((x: any) => x.id === activePageIdRef.current)
                const raw = p?.canvasJson
                const projectData = migrateLegacyData(raw)
                if (projectData && isStudioProject(projectData)) {
                  try { editor.loadProjectData?.(projectData); loadedOnceRef.current = true } catch {}
                } else {
                  // keep defaults
                  loadedOnceRef.current = true
                }
              }
              editor.on?.('ready', handleReady)
              editor.on?.('load', handleReady)
            }}
            options={{
              project: {
                type: "web",
                default: defaultProjectForEditor,
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}


