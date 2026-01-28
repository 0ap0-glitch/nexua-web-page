import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Search } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function Communities() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newCommunityName, setNewCommunityName] = useState("");
  const [newCommunityDescription, setNewCommunityDescription] = useState("");
  const [newCommunityType, setNewCommunityType] = useState<"interest" | "emotional" | "lifestyle" | "goal" | "dating" | "mental-health" | "creator" | "general">("interest");
  const [newCommunityVisibility, setNewCommunityVisibility] = useState<"public" | "private" | "invite-only">("public");

  const { data: allCommunities, refetch: refetchAll } = trpc.communities.list.useQuery({ limit: 100 });
  const { data: myCommunities, refetch: refetchMy } = trpc.communities.myCommunities.useQuery(undefined, {
    enabled: !!user,
  });

  const createCommunity = trpc.communities.create.useMutation({
    onSuccess: () => {
      refetchAll();
      refetchMy();
      setIsCreateDialogOpen(false);
      setNewCommunityName("");
      setNewCommunityDescription("");
    },
  });

  const joinCommunity = trpc.communities.join.useMutation({
    onSuccess: () => {
      refetchAll();
      refetchMy();
    },
  });

  const handleCreateCommunity = () => {
    if (!newCommunityName.trim()) return;

    createCommunity.mutate({
      name: newCommunityName,
      description: newCommunityDescription,
      type: newCommunityType,
      visibility: newCommunityVisibility,
    });
  };

  const handleJoinCommunity = (communityId: number) => {
    joinCommunity.mutate({ communityId });
  };

  const filteredCommunities = allCommunities?.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Communities</h1>
              <p className="text-muted-foreground">
                Discover and join communities that match your interests
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Community
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Community</DialogTitle>
                  <DialogDescription>
                    Build a space for people to connect around shared interests
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="community-name">Community Name</Label>
                    <Input
                      id="community-name"
                      value={newCommunityName}
                      onChange={(e) => setNewCommunityName(e.target.value)}
                      placeholder="e.g., AI Enthusiasts"
                    />
                  </div>
                  <div>
                    <Label htmlFor="community-description">Description</Label>
                    <Textarea
                      id="community-description"
                      value={newCommunityDescription}
                      onChange={(e) => setNewCommunityDescription(e.target.value)}
                      placeholder="What's this community about?"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="community-type">Community Type</Label>
                    <Select value={newCommunityType} onValueChange={(v: any) => setNewCommunityType(v)}>
                      <SelectTrigger id="community-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="interest">Interest-Based</SelectItem>
                        <SelectItem value="emotional">Emotional Support</SelectItem>
                        <SelectItem value="lifestyle">Lifestyle</SelectItem>
                        <SelectItem value="goal">Goal-Oriented</SelectItem>
                        <SelectItem value="dating">Dating</SelectItem>
                        <SelectItem value="mental-health">Mental Health</SelectItem>
                        <SelectItem value="creator">Creator Hub</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="community-visibility">Visibility</Label>
                    <Select value={newCommunityVisibility} onValueChange={(v: any) => setNewCommunityVisibility(v)}>
                      <SelectTrigger id="community-visibility">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="invite-only">Invite Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCommunity} disabled={!newCommunityName.trim()}>
                    Create Community
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </header>

      <div className="container py-8">
        <Tabs defaultValue="discover">
          <TabsList className="mb-6">
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="my-communities">My Communities</TabsTrigger>
          </TabsList>

          <TabsContent value="discover">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCommunities?.map((community: any) => (
                <Card
                  key={community.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setLocation(`/community/${community.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-lg">{community.name}</CardTitle>
                      {community.avatarUrl && (
                        <img
                          src={community.avatarUrl}
                          alt={community.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                    </div>
                    <CardDescription className="line-clamp-2">
                      {community.description || "No description"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="capitalize">
                          {community.type}
                        </Badge>
                        <Badge variant="outline">
                          <Users className="w-3 h-3 mr-1" />
                          {community.memberCount}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinCommunity(community.id);
                        }}
                      >
                        Join
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {(!filteredCommunities || filteredCommunities.length === 0) && (
                <div className="col-span-full">
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground mb-4">No communities found</p>
                      <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Community
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="my-communities">
            {user ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myCommunities?.map((community: any) => (
                  <Card
                    key={community.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setLocation(`/community/${community.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-lg">{community.name}</CardTitle>
                        <Badge variant="default" className="capitalize">
                          {community.role}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {community.description || "No description"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize">
                          {community.type}
                        </Badge>
                        <Badge variant="outline">
                          <Users className="w-3 h-3 mr-1" />
                          {community.memberCount}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {(!myCommunities || myCommunities.length === 0) && (
                  <div className="col-span-full">
                    <Card>
                      <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground mb-4">
                          You haven't joined any communities yet
                        </p>
                        <Button onClick={() => setLocation("/communities")}>
                          Discover Communities
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Sign in to view your communities</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
