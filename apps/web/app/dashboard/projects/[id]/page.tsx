'use client'

import * as React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc-client";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import StudioEditorRaw from "@grapesjs/studio-sdk/react";
import "@grapesjs/studio-sdk/style";
import { flexComponent, canvasFullSize, canvasGridMode, canvasEmptyState,rteProseMirror, tableComponent, swiperComponent, iconifyComponent, accordionComponent, listPagesComponent, fsLightboxComponent, layoutSidebarButtons, youtubeAssetProvider, lightGalleryComponent } from '@grapesjs/studio-sdk-plugins';
import type { SVGProps } from "react";
import type { FC } from "react";
import { defaultIcons } from "@grapesjs/studio-sdk/dist/components/public/StudioIcon/index.js";
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
  
  const utils = trpc.useUtils();
  const createPage = trpc.createPage.useMutation({
    onSuccess: (newPage) => {
      utils.getPages.invalidate({ projectId: projectId! }); // refresh page list
      setActivePageId(newPage.id); // set the new page as active
    },
  });
  const pages = (pagesQuery.data as any[]) || [];

const updateCanvas = trpc.updateCanvasJson.useMutation({
  onSuccess: () => {
    setSaving("saved");
    setTimeout(() => setSaving("idle"), 900);
  },
  onMutate: () => setSaving("saving"),
});

const searchParams = useSearchParams();
const pageIdFromUrl = searchParams.get("pageId");
React.useEffect(() => {
  if (pageIdFromUrl) {
    setActivePageId(pageIdFromUrl);
  } else if (pages.length > 0) {
    setActivePageId(pages[0].id); // fallback
  }
}, [pageIdFromUrl, pages]);

  React.useEffect(() => {
    activePageIdRef.current = activePageId;
  }, [activePageId]);

  // Load the correct canvas every time the active page changes
  React.useEffect(() => {
    const ed = editorRef.current;
    if (!ed || !activePageId) return;

    // Clear current canvas before loading the new one to avoid residual blocks
    try {
      ed.loadProjectData?.({ project: {} });
    } catch (err) {
      console.warn("Unable to reset editor project before loading", err);
    }

    const current = pages.find((p) => p.id === activePageId);
    if (!current) return;

    try {
      ed.loadProjectData?.(current.canvasJson || {});
    } catch (err) {
      console.error("Error loading page canvas", err);
    }
  }, [activePageId, pages]);
  




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

      {/* Render editor only when pages are loaded to prevent fallback blank project */}
      {pagesQuery.isLoading ? (
        <div className="flex w-full h-full items-center justify-center text-sm text-muted-foreground">
          <LoaderIcon className="h-4 w-4 animate-spin mr-2" /> Loading editor…
        </div>
      ) : (
      <StudioEditor className='h-full w-full'

      ref={editorRef}
      options={{
        licenseKey: process.env.GRAPEJS_LICENSE_KEY,
      theme: 'light',
      project: {
        type: 'web',
        pages: pages.map((p, idx) => ({
          id: p.id,
          name: p.name,
          component: 'page',
        })),
        default: pages[0]?.canvasJson 

      },
      assets: {
        storageType: 'self',
        // Provide a custom upload handler for assets
        onUpload: async ({ files }:{files:File[]}) => {
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
        onDelete: async ({ assets }:{assets:any}) => {
          const body = JSON.stringify(assets);
          await fetch('ASSETS_DELETE_URL', { method: 'DELETE', body });
        }
      },
      storage: {
        type: 'self',
        // Provide a custom handler for saving the project data.
        onSave: async ({ project }:{project:any}) => {

          if (!activePageIdRef.current) return;
          await updateCanvas.mutateAsync({
            pageId: activePageIdRef.current,
            canvasJson: project,
          });
          
        },
        // Provide a custom handler for loading project data.
        onLoad: async () => {
          if (!activePageIdRef.current) return { project: {} };
          const allPages = await utils.getPages.fetch({ projectId: projectId! });
          const p = allPages.find((x: any) => x.id === activePageIdRef.current);
          return { project: p?.canvasJson || {} };
        },
        autosaveChanges: 100,
        autosaveIntervalMs: 15000
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
        listPagesComponent.init({
          fetch: async () =>{
            const allPages = await utils.getPages.fetch({ projectId: projectId! });
            return allPages.map((p: any) => ({
              id: p.id,
              name: p.name 
            }));
          },
          onRename : async (pageId:string,name:string)=>{
            await (trpc.updatePage as any).mutateAsync({ pageId, name });
            await utils.getPages.invalidate({ projectId: projectId! });
          },
          onDelete: async (pageId:string)=>{
            await (trpc.deletePage as any).mutateAsync({ pageId });
            await utils.getPages.invalidate({ projectId: projectId! });
            setActivePageId(null);
          },
          onAdd: async (name: string) => {
            const newPage = await createPage.mutateAsync({ projectId: projectId!, name });
            await utils.getPages.invalidate({ projectId: projectId! }); // refetch pages
            setActivePageId(newPage.id); // make new page active
            return { id: newPage.id, name: newPage.name };
          },
          onSelect: (pageId: string) => {
          setActivePageId(pageId);
          router.push(`/designer/${projectId}?pageId=${pageId}`);
         },
        
        }),
        fsLightboxComponent.init({ /* Plugin options: https://app.grapesjs.com/docs-sdk/plugins/components/fslightbox */ }),
        layoutSidebarButtons.init({ /* Plugin options: https://app.grapesjs.com/docs-sdk/plugins/layout/sidebar-buttons */ }),
        youtubeAssetProvider.init({ /* Plugin options: https://app.grapesjs.com/docs-sdk/plugins/asset-providers/youtube-asset-provider */ }),
        lightGalleryComponent.init({ /* Plugin options: https://app.grapesjs.com/docs-sdk/plugins/components/lightGallery */ })
      ]
      }}
    />
      )}
        </div>
      </div>
    </div>
  );
}
