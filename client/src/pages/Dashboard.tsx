import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Settings, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { WidgetGrid } from "@/components/WidgetGrid";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedPageId, setSelectedPageId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [newPageType, setNewPageType] = useState<"social" | "professional" | "creative" | "private" | "custom">("social");
  const [newPageVisibility, setNewPageVisibility] = useState<"public" | "semi-public" | "private" | "ai-only">("public");

  const { data: pages, isLoading: pagesLoading, refetch } = trpc.pages.list.useQuery(undefined, {
    enabled: !!user,
  });

  const createPage = trpc.pages.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsCreateDialogOpen(false);
      setNewPageName("");
    },
  });

  const deletePage = trpc.pages.delete.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedPageId(null);
    },
  });

  const handleCreatePage = () => {
    if (!newPageName.trim()) return;
    
    createPage.mutate({
      name: newPageName,
      type: newPageType,
      visibility: newPageVisibility,
    });
  };

  const handleDeletePage = (pageId: number) => {
    if (confirm("Are you sure you want to delete this page? All widgets will be removed.")) {
      deletePage.mutate({ pageId });
    }
  };

  if (loading || pagesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Welcome to NEXUS</h1>
        <p className="text-muted-foreground">Please sign in to continue</p>
        <Button onClick={() => setLocation("/")}>Go to Home</Button>
      </div>
    );
  }

  const currentPage = pages?.find((p) => p.id === selectedPageId);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">NEXUS Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {user.name}</span>
            <Button variant="outline" size="sm" onClick={() => setLocation("/profile")}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar - Pages List */}
          <div className="col-span-12 md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Pages</CardTitle>
                <CardDescription>Manage your personalized pages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {pages?.map((page) => (
                  <div
                    key={page.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedPageId === page.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:bg-accent"
                    }`}
                    onClick={() => setSelectedPageId(page.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{page.name}</div>
                        <div className="text-xs opacity-70 capitalize">{page.type}</div>
                      </div>
                      {selectedPageId === page.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePage(page.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      New Page
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Page</DialogTitle>
                      <DialogDescription>
                        Create a personalized page for different aspects of your life
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="page-name">Page Name</Label>
                        <Input
                          id="page-name"
                          value={newPageName}
                          onChange={(e) => setNewPageName(e.target.value)}
                          placeholder="e.g., My Social Hub"
                        />
                      </div>
                      <div>
                        <Label htmlFor="page-type">Page Type</Label>
                        <Select value={newPageType} onValueChange={(v: any) => setNewPageType(v)}>
                          <SelectTrigger id="page-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="social">Social</SelectItem>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="creative">Creative</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="page-visibility">Visibility</Label>
                        <Select value={newPageVisibility} onValueChange={(v: any) => setNewPageVisibility(v)}>
                          <SelectTrigger id="page-visibility">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="semi-public">Semi-Public</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                            <SelectItem value="ai-only">AI Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreatePage} disabled={!newPageName.trim()}>
                        Create Page
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Widget Grid */}
          <div className="col-span-12 md:col-span-9">
            {currentPage ? (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold">{currentPage.name}</h2>
                  <p className="text-muted-foreground capitalize">
                    {currentPage.type} • {currentPage.visibility}
                  </p>
                </div>
                <WidgetGrid pageId={currentPage.id} editable />
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground mb-4">
                    {pages && pages.length > 0
                      ? "Select a page from the sidebar to view widgets"
                      : "Create your first page to get started"}
                  </p>
                  {(!pages || pages.length === 0) && (
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Page
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
