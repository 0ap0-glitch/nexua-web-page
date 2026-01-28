import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, Calendar, Pin, Plus, Settings, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation, useRoute } from "wouter";
import { formatDistanceToNow } from "date-fns";

export default function Community() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/community/:id");
  const communityId = params?.id ? parseInt(params.id) : null;

  const [isThreadDialogOpen, setIsThreadDialogOpen] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadContent, setNewThreadContent] = useState("");

  const { data: community } = trpc.communities.get.useQuery(
    { communityId: communityId! },
    { enabled: !!communityId }
  );

  const { data: threads, refetch: refetchThreads } = trpc.threads.list.useQuery(
    { communityId: communityId! },
    { enabled: !!communityId }
  );

  const { data: communityWidgets } = trpc.communityWidgets.list.useQuery(
    { communityId: communityId! },
    { enabled: !!communityId }
  );

  const createThread = trpc.threads.create.useMutation({
    onSuccess: () => {
      refetchThreads();
      setIsThreadDialogOpen(false);
      setNewThreadTitle("");
      setNewThreadContent("");
    },
  });

  const handleCreateThread = () => {
    if (!newThreadTitle.trim() || !newThreadContent.trim() || !communityId) return;

    createThread.mutate({
      communityId,
      title: newThreadTitle,
      content: newThreadContent,
    });
  };

  if (!communityId || !community) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Community not found</h2>
          <Button onClick={() => setLocation("/communities")}>Browse Communities</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container py-6">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/communities")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Communities
          </Button>
          
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              {community.avatarUrl && (
                <img
                  src={community.avatarUrl}
                  alt={community.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold mb-2">{community.name}</h1>
                <p className="text-muted-foreground mb-3">{community.description}</p>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {community.type}
                  </Badge>
                  <Badge variant="outline">
                    <Users className="w-3 h-3 mr-1" />
                    {community.memberCount} members
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Customize Space
              </Button>
              <Button size="sm">Join Community</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="col-span-12 lg:col-span-8">
            <Tabs defaultValue="discussions">
              <TabsList className="mb-4">
                <TabsTrigger value="discussions">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Discussions
                </TabsTrigger>
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="events">
                  <Calendar className="w-4 h-4 mr-2" />
                  Events
                </TabsTrigger>
                <TabsTrigger value="members">
                  <Users className="w-4 h-4 mr-2" />
                  Members
                </TabsTrigger>
              </TabsList>

              <TabsContent value="discussions">
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Discussion Threads</h2>
                  <Dialog open={isThreadDialogOpen} onOpenChange={setIsThreadDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        New Thread
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Start a Discussion</DialogTitle>
                        <DialogDescription>
                          Create a new discussion thread in {community.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="thread-title">Thread Title</Label>
                          <Input
                            id="thread-title"
                            value={newThreadTitle}
                            onChange={(e) => setNewThreadTitle(e.target.value)}
                            placeholder="What's this discussion about?"
                          />
                        </div>
                        <div>
                          <Label htmlFor="thread-content">Content</Label>
                          <Textarea
                            id="thread-content"
                            value={newThreadContent}
                            onChange={(e) => setNewThreadContent(e.target.value)}
                            placeholder="Share your thoughts..."
                            rows={8}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsThreadDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreateThread}
                          disabled={!newThreadTitle.trim() || !newThreadContent.trim()}
                        >
                          Create Thread
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-3">
                  {threads?.map((thread: any) => (
                    <Card
                      key={thread.id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setLocation(`/thread/${thread.id}`)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {thread.isPinned === 1 && (
                                <Pin className="w-4 h-4 text-primary" />
                              )}
                              <CardTitle className="text-lg">{thread.title}</CardTitle>
                            </div>
                            <CardDescription className="line-clamp-2">
                              {thread.content}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{thread.authorName}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(thread.createdAt))} ago</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {thread.replyCount} replies
                          </span>
                          <span>•</span>
                          <span>{thread.viewCount} views</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {(!threads || threads.length === 0) && (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground mb-4">
                          No discussions yet. Start the conversation!
                        </p>
                        <Button onClick={() => setIsThreadDialogOpen(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create First Thread
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="posts">
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">Posts feed coming soon</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="events">
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">Events calendar coming soon</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="members">
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">Member list coming soon</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Community Widgets */}
          <div className="col-span-12 lg:col-span-4">
            <div className="space-y-4 sticky top-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {community.description || "No description available"}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span>{formatDistanceToNow(new Date(community.createdAt))} ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Visibility</span>
                      <span className="capitalize">{community.visibility}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Custom Community Widgets */}
              {communityWidgets?.map((widget: any) => (
                <Card key={widget.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{widget.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      {widget.content ? (
                        <div dangerouslySetInnerHTML={{ __html: widget.content }} />
                      ) : (
                        <p className="text-muted-foreground">No content</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Widget
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Space
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
