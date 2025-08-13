"use client"

import * as React from "react"
import Image from "next/image"
import { Textarea } from "@/components/ui/textarea"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Calendar,
  ChevronDown,
  Dot,
  EllipsisVertical,
  Files,
  Folder,
  Grid3X3,
  Hand,
  HardDriveDownload,
  LayoutGrid,
  List,
  MoreHorizontal,
  PackageOpen,
  Plus,
  Search,
  Settings,
  Sparkles,
  Star,
  Users,
  ExternalLink,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { type Site, SORTS, type SortKey } from "../../types/site"
import { trpc } from "@/lib/trpc-client"

export default function Dashboard() {
  const [query, setQuery] = React.useState("")
  const [sort, setSort] = React.useState<SortKey>("Date created")
  const [view, setView] = React.useState<"grid" | "list">("grid")
  const [newOpen, setNewOpen] = React.useState(false)
  const [paletteOpen, setPaletteOpen] = React.useState(false)
  const [aiPromptOpen, setAiPromptOpen] = React.useState(false)
  const [renameOpen, setRenameOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [selectedSite, setSelectedSite] = React.useState<Site | null>(null)
  const [aiPrompt, setAiPrompt] = React.useState("")
  const [newSiteName, setNewSiteName] = React.useState("")
  const [compactCards, setCompactCards] = React.useState(false)
  const [pinnedIds, setPinnedIds] = React.useState<Set<string>>(new Set())

  // tRPC: load projects and provide mutations
  const { data: projects, isLoading } = trpc.listProjects.useQuery()
  const utils = trpc.useUtils()
  const createProject = trpc.createProject.useMutation({
    onSuccess: () => utils.listProjects.invalidate(),
  })
  const renameProject = trpc.renameProject.useMutation({
    onSuccess: () => utils.listProjects.invalidate(),
  })
  const deleteProject = trpc.deleteProject.useMutation({
    onSuccess: () => utils.listProjects.invalidate(),
  })

  React.useEffect(() => {
    localStorage.setItem("view-mode", view)
  }, [view])

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setPaletteOpen((o) => !o)
      }
      if (!e.metaKey && !e.ctrlKey && e.key.toLowerCase() === "n") {
        setNewOpen(true)
      }
      if (!e.metaKey && !e.ctrlKey && e.key === "/") {
        e.preventDefault()
        document.getElementById("global-search")?.focus()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  // Map server projects into Site shape; no mock fallback
  const sourceSites: Site[] = React.useMemo(() => {
    if (!projects) return []
    return projects.map((p: any) => ({
      id: p.id,
      name: p.name,
      createdAt: typeof p.createdAt === "string" ? p.createdAt : new Date(p.createdAt).toISOString(),
      status: "Starter",
      pages: 0,
      views: 0,
      starred: pinnedIds.has(p.id),
    }))
  }, [projects, pinnedIds])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = q ? sourceSites.filter((s) => s.name.toLowerCase().includes(q)) : sourceSites.slice()
    switch (sort) {
      case "Name":
        base.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "Most viewed":
        base.sort((a, b) => (b.views || 0) - (a.views || 0))
        break
      case "Date created":
      default:
        base.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        break
    }
    return base
  }, [sourceSites, query, sort])

  const pinned = filtered.filter((s) => s.starred)
  const others = filtered.filter((s) => !s.starred)

  function toggleStar(id: string) {
    setPinnedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function createSite(data: { name: string; starter: boolean }) {
    createProject.mutate({ name: data.name })
    setNewOpen(false)
  }

  function createAiSite(prompt: string) {
    const name = `AI: ${prompt.slice(0, 30)}${prompt.length > 30 ? "..." : ""}`
    createProject.mutate({ name })
    setAiPromptOpen(false)
    setAiPrompt("")
  }

  function deleteSite(siteId: string) {
    deleteProject.mutate({ projectId: siteId })
    setDeleteOpen(false)
    setSelectedSite(null)
  }

  function renameSite(siteId: string, newName: string) {
    renameProject.mutate({ projectId: siteId, name: newName })
    setRenameOpen(false)
    setSelectedSite(null)
    setNewSiteName("")
  }

  // Define all components inline to avoid import issues
  function SiteActions({ site }: { site: Site }) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem>Open designer</DropdownMenuItem>
          <DropdownMenuItem>Open site</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setSelectedSite(site)
              setNewSiteName(site.name)
              setRenameOpen(true)
            }}
          >
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => {
              setSelectedSite(site)
              setDeleteOpen(true)
            }}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  function SiteCard({ site, onStar }: { site: Site; onStar: (id: string) => void }) {
    return (
      <Card className="group relative overflow-hidden transition-all hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <button
                className={cn(
                  "rounded p-1 transition hover:bg-muted",
                  site.starred ? "text-yellow-500" : "text-muted-foreground",
                )}
                onClick={() => onStar(site.id)}
                aria-label={site.starred ? "Unpin" : "Pin"}
              >
                <Star className={cn("h-4 w-4", site.starred && "fill-yellow-500")} />
              </button>
              <CardTitle className="truncate text-base">{site.name}</CardTitle>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <EllipsisVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem>Open designer</DropdownMenuItem>
                <DropdownMenuItem>Open site</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedSite(site)
                    setNewSiteName(site.name)
                    setRenameOpen(true)
                  }}
                >
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => {
                    setSelectedSite(site)
                    setDeleteOpen(true)
                  }}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardDescription className="flex items-center gap-2 pt-1">
            <Badge variant="outline" className="text-[10px]">
              {site.status}
            </Badge>
            <span className="text-xs text-muted-foreground">{new Date(site.createdAt).toLocaleDateString()}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="relative group/card">
            <div className="relative block overflow-hidden rounded-md border">
              <Image
                src={site.thumbnail || "/placeholder.svg?height=240&width=420"}
                alt={`${site.name} thumbnail`}
                width={420}
                height={240}
                className="aspect-video w-full object-cover transition group-hover:scale-[1.01]"
              />
              {/* Hover overlay with "Open in Webflow" */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <Button size="sm" className="bg-white text-black hover:bg-gray-100">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in Webflow
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-0">
          <Button variant="outline" size="sm">
            <ExternalLink className="mr-2 h-4 w-4" />
            View site
          </Button>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="hidden sm:inline tabular-nums">{site.pages ?? 0} pages</span>
            <span className="tabular-nums">{site.views?.toLocaleString() ?? 0} views</span>
          </div>
        </CardFooter>
      </Card>
    )
  }

  function SitesList({ sites, onStar }: { sites: Site[]; onStar: (id: string) => void }) {
    return (
      <div className="overflow-hidden rounded-lg border">
        {/* Header uses same grid as rows for alignment */}
        <div className="grid grid-cols-[auto_1fr_4rem_6rem] items-center gap-3 border-b bg-muted/50 px-3 py-2">
          <div />
          <div className="text-xs text-muted-foreground">Name</div>
          <div className="hidden text-right text-xs text-muted-foreground sm:block">Pages</div>
          <div className="hidden text-right text-xs text-muted-foreground sm:block">Views</div>
        </div>
        <ul role="list" className="divide-y">
          {sites.map((s) => (
            <li key={s.id} className="group grid grid-cols-[auto_1fr_4rem_6rem] items-center gap-3 px-3 py-3">
              <button
                className={cn(
                  "rounded p-1 transition hover:bg-muted",
                  s.starred ? "text-yellow-500" : "text-muted-foreground",
                )}
                onClick={() => onStar(s.id)}
                aria-label={s.starred ? "Unpin" : "Pin"}
              >
                <Star className={cn("h-4 w-4", s.starred && "fill-yellow-500")} />
              </button>
              <div className="relative min-w-0 pr-8">
                <a href="#" className="truncate font-medium hover:underline">
                  {s.name}
                </a>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                  <SiteActions site={s} />
                </div>
              </div>
              <div className="hidden tabular-nums text-right text-sm sm:block">{s.pages ?? 0}</div>
              <div className="hidden tabular-nums text-right text-sm sm:block">{s.views?.toLocaleString() ?? 0}</div>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  function SitesGrid({
    sites,
    compact,
    onToggleCompact,
    onStar,
  }: {
    sites: Site[]
    compact: boolean
    onToggleCompact: (checked: boolean) => void
    onStar: (id: string) => void
  }) {
    return (
      <>
        <div className="flex items-center justify-between text-sm mb-4">
          <div className="text-xs text-muted-foreground">
            Showing {sites.length} {sites.length === 1 ? "site" : "sites"}
          </div>
          <div className="flex items-center gap-2">
            <Switch id="compact" checked={compact} onCheckedChange={onToggleCompact} />
            <Label htmlFor="compact" className="text-xs text-muted-foreground">
              Compact cards
            </Label>
          </div>
        </div>
        <div
          className={cn(
            "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
            compact && "sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
          )}
        >
          {sites.map((s) => (
            <SiteCard key={s.id} site={s} onStar={onStar} />
          ))}
        </div>
      </>
    )
  }

  function Stat({ label, value }: { label: string; value: number }) {
    return (
      <div className="rounded-lg border bg-card p-3">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-1 text-lg font-semibold tabular-nums">{value.toLocaleString()}</div>
      </div>
    )
  }

  function SectionHeader({ title }: { title: string }) {
    return (
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 md:flex">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Date created</span>
          </div>
        </div>
      </div>
    )
  }

  function AppSidebar({ onNewSite }: { onNewSite?: () => void }) {
    const primary = [
      { label: "All sites", icon: LayoutGrid, href: "#" },
      { label: "Tutorials", icon: Hand, href: "#" },
    ]
    const settings = [
      { label: "General", icon: Settings, href: "#" },
      { label: "Team", icon: Users, href: "#" },
      { label: "Plans", icon: PackageOpen, href: "#" },
      { label: "Billing", icon: HardDriveDownload, href: "#" },
      { label: "Apps & Integrations", icon: Files, href: "#" },
      { label: "Libraries & Templates", icon: Folder, href: "#" },
    ]

    return (
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="size-6 rounded bg-foreground/10 flex-shrink-0" />
              <span className="text-sm font-medium truncate group-data-[collapsible=icon]:hidden">
                Rush's Workspace
              </span>
            </div>
            <Badge variant="outline" className="text-[10px] group-data-[collapsible=icon]:hidden">
              Starter
            </Badge>
          </div>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {primary.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild isActive={item.label === "All sites"}>
                      <a href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={onNewSite}>
                    <Plus />
                    <span>New site</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Settings</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {settings.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild>
                      <a href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <Card className="mx-2 group-data-[collapsible=icon]:mx-1">
            <CardHeader className="py-3">
              <CardTitle className="text-sm group-data-[collapsible=icon]:hidden">Pro tip</CardTitle>
              <CardDescription className="text-xs group-data-[collapsible=icon]:hidden">
                Press Ctrl/Cmd+B to toggle sidebar.
              </CardDescription>
              <div className="group-data-[collapsible=icon]:block hidden">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  ⌘B
                </kbd>
              </div>
            </CardHeader>
          </Card>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>
    )
  }

  function EmptyState({ onCreate }: { onCreate: () => void }) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border p-8 text-center">
        <Image
          src="/placeholder.svg?height=160&width=320"
          alt="Empty workspace illustration"
          width={320}
          height={160}
          className="mb-4"
        />
        <h3 className="text-lg font-semibold">No sites yet</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Create your first site to get started. You can choose a starter or begin from scratch.
        </p>
        <div className="mt-4 flex gap-2">
          <Button onClick={onCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New site
          </Button>
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Explore templates
          </Button>
        </div>
      </div>
    )
  }

  function CommandDialog({
    open,
    onOpenChange,
    onNewSite,
  }: {
    open: boolean
    onOpenChange: (v: boolean) => void
    onNewSite: () => void
  }) {
    const [localQuery, setLocalQuery] = React.useState("")

    const actions = [{ label: "New site", icon: Plus, run: onNewSite, kbd: "N" }]

    const visible = actions.filter((a) => a.label.toLowerCase().includes(localQuery.trim().toLowerCase()))

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="p-0 sm:max-w-lg overflow-hidden">
          <div className="border-b p-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                autoFocus
                placeholder="Type a command…"
                className="border-0 pl-8 shadow-none"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-64 overflow-auto p-1">
            {visible.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">No commands found</div>
            ) : (
              <ul className="space-y-1 p-1">
                {visible.map((a) => (
                  <li key={a.label}>
                    <button
                      onClick={() => {
                        a.run()
                        onOpenChange(false)
                      }}
                      className="flex w-full items-center justify-between rounded px-2 py-2 text-left text-sm hover:bg-muted"
                    >
                      <span className="flex items-center gap-2">
                        <a.icon className="h-4 w-4" />
                        {a.label}
                      </span>
                      {a.kbd && (
                        <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {a.kbd}
                        </kbd>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <SidebarProvider className="bg-background">
      {/* App Sidebar */}
      <AppSidebar onNewSite={() => setNewOpen(true)} />

      {/* Main content in an inset layout so content gets rounded/raised on desktop */}
      <SidebarInset className="bg-background min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-3 px-4 py-3">
            <SidebarTrigger className="-ml-1 flex-shrink-0" />
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm text-muted-foreground truncate">Rush's Workspace</span>
              <Badge variant="secondary" className="flex-shrink-0">
                Starter Workspace
              </Badge>
            </div>
            <div className="ml-auto flex items-center gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={() => setNewOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New site
              </Button>
            </div>
          </div>

          <div className="px-4 pb-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-2">
              <div className="flex items-center gap-2 w-full md:max-w-xl">
                <div className="relative w-full min-w-0">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="global-search"
                    placeholder="Search sites…"
                    className="pl-8 w-full"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <kbd className="hidden md:inline-flex select-none items-center gap-1 rounded border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground flex-shrink-0">
                  /
                </kbd>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <SortMenu sort={sort} onChange={setSort} />
                <ViewToggle view={view} onChange={setView} />
                <div className="hidden lg:flex items-center gap-2 pl-2">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Tips: Cmd/Ctrl+K, N, and Ctrl/Cmd+B</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 pb-8 min-w-0">
          {projects === undefined || isLoading ? (
            <div className="flex h-[60vh] items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-sm">Loading your sites…</span>
            </div>
          ) : (
            <>
              {/* Stats strip */}
              <div className="grid grid-cols-2 gap-3 pt-4 sm:grid-cols-4 lg:grid-cols-6">
                <Stat label="Total sites" value={sourceSites.length} />
                <Stat label="Pinned" value={pinned.length} />
                <Stat label="Pages" value={sourceSites.reduce((a: number, s: Site) => a + (s.pages || 0), 0)} />
                <Stat label="Views" value={sourceSites.reduce((a: number, s: Site) => a + (s.views || 0), 0)} />
                <Stat label="Pro" value={sourceSites.filter((s: Site) => s.status === "Pro").length} />
                <Stat label="Starter" value={sourceSites.filter((s: Site) => s.status === "Starter").length} />
              </div>

              {/* Sections */}
              {pinned.length > 0 && (
                <section className="mt-8">
                  <SectionHeader title="Pinned" />
                  {view === "list" ? (
                    <SitesList sites={pinned} onStar={toggleStar} />
                  ) : (
                    <SitesGrid
                      sites={pinned}
                      compact={compactCards}
                      onToggleCompact={setCompactCards}
                      onStar={toggleStar}
                    />
                  )}
                </section>
              )}

              <section className="mt-8">
                <SectionHeader title="All sites" />
                {filtered.length > 0 ? (
                  view === "list" ? (
                    <SitesList sites={others} onStar={toggleStar} />
                  ) : (
                    <SitesGrid
                      sites={others}
                      compact={compactCards}
                      onToggleCompact={setCompactCards}
                      onStar={toggleStar}
                    />
                  )
                ) : (
                  <EmptyState onCreate={() => setNewOpen(true)} />
                )}
              </section>
            </>
          )}
        </main>

        <footer className="mt-auto border-t bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
          Built for speed. Keyboard-first. Delightfully familiar.
        </footer>
      </SidebarInset>

      {/* New Site Dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create new site</DialogTitle>
            <DialogDescription>Choose a template to get started with your new site.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 bg-transparent"
              onClick={() => createSite({ name: "Untitled Site", starter: true })}
            >
              <LayoutGrid className="h-6 w-6" />
              <span className="text-xs">Blank site</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 bg-transparent"
              onClick={() => {
                setNewOpen(false)
                setAiPromptOpen(true)
              }}
            >
              <Sparkles className="h-6 w-6" />
              <span className="text-xs">AI generated</span>
            </Button>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={() => setNewOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Prompt Dialog */}
      <Dialog open={aiPromptOpen} onOpenChange={setAiPromptOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate AI Site</DialogTitle>
            <DialogDescription>Describe what kind of website you want to create.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ai-prompt" className="mb-2 block">Website description</Label>
              <Textarea
                id="ai-prompt"
                placeholder="e.g., A modern portfolio website for a photographer with dark theme and gallery..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAiPromptOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => createAiSite(aiPrompt)} disabled={!aiPrompt.trim()}>
              Generate Site
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Site</DialogTitle>
            <DialogDescription>Enter a new name for your site.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="site-name">Site name</Label>
              <Input
                id="site-name"
                value={newSiteName}
                onChange={(e) => setNewSiteName(e.target.value)}
                placeholder="Enter site name..."
              />
            </div>
    </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedSite && renameSite(selectedSite.id, newSiteName)}
              disabled={!newSiteName.trim()}
            >
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Site</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedSite?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => selectedSite && deleteSite(selectedSite.id)}>
              Delete Site
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Command Palette */}
      <CommandDialog open={paletteOpen} onOpenChange={setPaletteOpen} onNewSite={() => setNewOpen(true)} />
    </SidebarProvider>
  )
}

function SortMenu({ sort, onChange }: { sort: SortKey; onChange: (s: SortKey) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="min-w-[9rem] justify-between bg-transparent">
          {sort}
          <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[12rem]">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SORTS.map((s) => (
          <DropdownMenuItem key={s} onClick={() => onChange(s)}>
            {s} {s === sort && <Dot className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ViewToggle({
  view,
  onChange,
}: {
  view: "grid" | "list"
  onChange: (v: "grid" | "list") => void
}) {
  return (
    <Tabs value={view} onValueChange={(v) => onChange(v as "grid" | "list")}>
      <TabsList className="grid grid-cols-2">
        <TabsTrigger value="grid" className="gap-2">
          <Grid3X3 className="h-4 w-4" />
          Grid
        </TabsTrigger>
        <TabsTrigger value="list" className="gap-2">
          <List className="h-4 w-4" />
          List
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
