'use client'

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc-client";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import StudioEditorRaw from "@grapesjs/studio-sdk/react";
import "@grapesjs/studio-sdk/style";
import { flexComponent, canvasFullSize, canvasGridMode, rteProseMirror, tableComponent, swiperComponent, canvasEmptyState, iconifyComponent, accordionComponent, listPagesComponent, fsLightboxComponent, layoutSidebarButtons, youtubeAssetProvider, lightGalleryComponent } from '@grapesjs/studio-sdk-plugins';
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
  const createPage = trpc.createPage.useMutation({
    onSuccess: () => pagesQuery.refetch(),
  });
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

  const scheduleSaveData = React.useMemo(() => {
    let t: any;
    return (data: any) => {
      if (!activePageIdRef.current) return;
      setSaving("saving");
      clearTimeout(t);
      t = setTimeout(() => {
        updateCanvas.mutate({ pageId: activePageIdRef.current!, canvasJson: data ?? {} });
      }, 800);
    };
  }, [updateCanvas]);

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
            {pagesQuery.isLoading ? (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <LoaderIcon className="h-3.5 w-3.5 animate-spin" /> Loading pages…
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
                  <PlusIcon className="mr-1 h-3.5 w-3.5" /> New page
                </Button>
              </div>
            )}
            <span className="ml-3 text-xs text-muted-foreground">
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
        <StudioEditor
          className="h-full w-full"
          options={{
        licenseKey: process.env.GRAPEJS_LICENSE_KEY,
      theme: 'light',
      project: {
        type: 'web'
      },
      assets: {
        storageType: 'self',
        // Provide a custom upload handler for assets
        onUpload: async ({ files }: { files: File[] }) => {
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
        onDelete: async ({ assets }: { assets: any[] }) => {
          const body = JSON.stringify(assets);
          await fetch('ASSETS_DELETE_URL', { method: 'DELETE', body });
        }
      },
      storage: {
        type: 'self',
        // Provide a custom handler for saving the project data.
        onSave: async ({ project }: { project: any }) => {
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
