export type Site = {
  id: string
  name: string
  createdAt: string
  status: "Starter" | "Pro" | "Paused"
  starred?: boolean
  views?: number
  pages?: number
  thumbnail?: string
}

export const initialSites: Site[] = [
  {
    id: "rush-trendy",
    name: "Rush's Trendy Site",
    createdAt: "2025-07-01T10:22:00Z",
    status: "Starter",
    starred: true,
    views: 1280,
    pages: 7,
    thumbnail: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "portfolio",
    name: "Minimal Portfolio",
    createdAt: "2025-06-18T08:10:00Z",
    status: "Pro",
    starred: false,
    views: 4021,
    pages: 12,
    thumbnail: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "storefront",
    name: "Nova Storefront",
    createdAt: "2025-05-04T15:02:00Z",
    status: "Paused",
    views: 0,
    pages: 3,
    thumbnail: "/placeholder.svg?height=200&width=300",
  },
]

export const SORTS = ["Date created", "Name", "Most viewed"] as const
export type SortKey = (typeof SORTS)[number]
