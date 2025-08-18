'use client'

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc-client";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import StudioEditorRaw from "@grapesjs/studio-sdk/react";
import "@grapesjs/studio-sdk/style";
import { flexComponent, canvasFullSize, canvasGridMode, canvasEmptyState,rteProseMirror, tableComponent, swiperComponent, iconifyComponent, accordionComponent, listPagesComponent, fsLightboxComponent, layoutSidebarButtons, youtubeAssetProvider, lightGalleryComponent } from '@grapesjs/studio-sdk-plugins';
import type { SVGProps } from "react";
import type { FC } from "react";
const LoaderIcon = Loader2 as unknown as React.FC<SVGProps<SVGSVGElement>>;
const PlusIcon = Plus as unknown as React.FC<SVGProps<SVGSVGElement>>;
const StudioEditor = StudioEditorRaw as unknown as FC<any>;

export default function DesignerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const projectId = React.useMemo(() => params?.id, [params]);

  const [activePageId, setActivePageId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState<"idle" | "saving" | "saved">("idle");
  const editorRef = React.useRef<any>(null);
  const activePageIdRef = React.useRef<string | null>(null);
  // tRPC hooks
  const pagesQuery = trpc.getPages.useQuery(
    { projectId: projectId! },
    { enabled: Boolean(projectId) }
  );
  // Page creation handled inside GrapesJS via listPages plugin; no external button
  const updateCanvas = trpc.updateCanvasJson.useMutation({
    onSuccess: () => {
      setSaving("saved");
      setTimeout(() => setSaving("idle"), 900);
    },
    onMutate: () => setSaving("saving"),
  });

  // Initialize active page once list fetched
  React.useEffect(() => {
    const pages = pagesQuery.data;
    if (!pages || pages.length === 0 || !projectId) return;
    const first: any = pages[0];
    if (!first) return;
    setActivePageId((prev) => prev ?? first.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagesQuery.data, projectId]);

  React.useEffect(() => {
    activePageIdRef.current = activePageId;
  }, [activePageId]);

  // // Load project data into editor when page changes
  // React.useEffect(() => {
  //   const ed = editorRef.current;
  //   if (!ed || !activePageId) return;
  //   const p = pagesQuery.data?.find((x: any) => x.id === activePageId);
  //   const raw = p?.canvasJson ?? null;
  //   if (raw && typeof raw === 'object' && Array.isArray((raw as any).pages) && (raw as any).pages.length === 0) {
  //     // empty => reset editor with blank project structure
  //     ed.loadProjectData?.(BLANK_PROJECT);
  //     return;
  //   }
  //   let data: any = raw as any;
  //   if (raw && typeof raw === 'object' && Array.isArray((raw as any).pages)) {
  //     const r: any = raw as any;
  //     data = {
  //       ...r,
  //       pages: r.pages.map((pg: any) => {
  //         if (Array.isArray(pg.frames)) return pg;
  //         if (typeof pg.component === 'string') return { ...pg, frames: [{ component: pg.component }] };
  //         return pg;
  //       }),
  //     };
  //   }
  //   try {
  //     ed.loadProjectData?.(data);
  //   } catch {}
  // }, [activePageId, pagesQuery.data]);

  const pages = (pagesQuery.data as any[]) || [];

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3 px-4 py-2">
          <Button variant="ghost" onClick={() => router.push("/dashboard")}>← Dashboard</Button>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">Project</div>
            <span className="text-sm font-medium">{projectId}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {pagesQuery.isLoading && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <LoaderIcon className="h-3.5 w-3.5 animate-spin" /> Loading…
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {saving === "saving" && (
                <span className="inline-flex items-center gap-1"><LoaderIcon className="h-3 w-3 animate-spin" /> Saving…</span>
              )}
              {saving === "saved" && <span>Saved</span>}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex min-h-0">
        <div className="rounded-md border bg-white flex-1 h-full min-h-0">
        <StudioEditor className='h-full w-full'
      options={{
        licenseKey: process.env.GRAPEJS_LICENSE_KEY,
      theme: 'light',
      project: {
        type: 'web'
      },
      assets: {
        storageType: 'self',
        // Provide a custom upload handler for assets
        onUpload: async ({ files }) => {
          const body = new FormData();
          for (const file of files) {
            body.append('files', file);
          }
          const response = await fetch('ASSETS_UPLOAD_URL', { method: 'POST', body });
          const result = await response.json();
          // The expected result should be an array of assets, eg.
          // [{ src: 'ASSET_URL' }]
          return result;
        },
        // Provide a custom handler for deleting assets
        onDelete: async ({ assets }) => {
          const body = JSON.stringify(assets);
          await fetch('ASSETS_DELETE_URL', { method: 'DELETE', body });
        }
      },
      storage: {
        type: 'self',
        // Provide a custom handler for saving the project data.
        onSave: async ({ project }) => {
          throw new Error('Implement your "onSave"!');
          const body = new FormData();
          body.append('project', JSON.stringify(project));
          await fetch('PROJECT_SAVE_URL', { method: 'POST', body });
        },
        // Provide a custom handler for loading project data.
        onLoad: async () => {
          throw new Error('Implement your "onLoad"!');
          const response = await fetch('PROJECT_LOAD_URL');
          const project = await response.json();
          // The project JSON is expected to be returned inside an object.
          return { project };
        },
        autosaveChanges: 100,
        autosaveIntervalMs: 10000
      },
      plugins: [
        flexComponent.init({ /* Plugin options: https://app.grapesjs.com/docs-sdk/plugins/components/flex */ }),
        canvasFullSize.init({ /* Plugin options: https://app.grapesjs.com/docs-sdk/plugins/canvas/full-size */ }),
        canvasGridMode.init({ /* Plugin options: https://app.grapesjs.com/docs-sdk/plugins/canvas/grid-mode */ }),
        rteProseMirror.init({ /* Plugin options: https://app.grapesjs.com/docs-sdk/plugins/rte/prosemirror */ }),
        tableComponent.init({ /* Plugin options: https://app.grapesjs.com/docs-sdk/plugins/components/table */ }),
        swiperComponent.init({ /* Plugin options: https://app.grapesjs.com/docs-sdk/plugins/components/swiper */ }),
        canvasEmptyState.init({ /* Plugin options: https://app.grapesjs.com/docs-sdk/plugins/canvas/emptyState */ }),
        iconifyComponent.init({ /* Plugin options: https://app.grapesjs.com/docs-sdk/plugins/components/iconify */ }),
        accordionComponent.init({ /* Plugin options: https://app.grapesjs.com/docs-sdk/plugins/components/accordion */ }),
        listPagesComponent.init({ /* Plugin options: https://app.grapesjs.com/docs-sdk/plugins/components/listPages */ }),
        fsLightboxComponent.init({ /* Plugin options: https://app.grapesjs.com/docs-sdk/plugins/components/fslightbox */ }),
        layoutSidebarButtons.init({ /* Plugin options: https://app.grapesjs.com/docs-sdk/plugins/layout/sidebar-buttons */ }),
        youtubeAssetProvider.init({ /* Plugin options: https://app.grapesjs.com/docs-sdk/plugins/asset-providers/youtube-asset-provider */ }),
        lightGalleryComponent.init({ /* Plugin options: https://app.grapesjs.com/docs-sdk/plugins/components/lightGallery */ })
      ]
      }}
    />
        </div>
      </div>
    </div>
  );
}
