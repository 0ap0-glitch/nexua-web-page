import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutGrid, Users, MessageSquare, Bot, ArrowRight } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

/**
 * All content in this page are only for example, replace with your own feature implementation
 * When building pages, remember your instructions in Frontend Workflow, Frontend Best Practices, Design Guide and Common Pitfalls
 */
export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      {/* Hero Section */}
      <header className="container py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Welcome to NEXUS
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            A living, evolving platform that unifies social connection, creativity, and AI
            into one continuously upgrading ecosystem
          </p>
          <div className="flex gap-4 justify-center">
            {user ? (
              <>
                <Button size="lg" onClick={() => setLocation("/dashboard")}>
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => setLocation("/communities")}>
                  Browse Communities
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" onClick={() => window.location.href = getLoginUrl()}>
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => setLocation("/communities")}>
                  Explore Communities
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <LayoutGrid className="w-10 h-10 mb-4 text-primary" />
              <CardTitle>Widget-Based Pages</CardTitle>
              <CardDescription>
                Create multiple personalized pages with customizable widgets for every aspect of your life
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="w-10 h-10 mb-4 text-primary" />
              <CardTitle>Community Spaces</CardTitle>
              <CardDescription>
                Join or create communities with custom widgets, discussion threads, and collaborative spaces
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <MessageSquare className="w-10 h-10 mb-4 text-primary" />
              <CardTitle>Rich Discussions</CardTitle>
              <CardDescription>
                Engage in threaded conversations without clout metrics - connection over performance
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Bot className="w-10 h-10 mb-4 text-primary" />
              <CardTitle>AI Companion</CardTitle>
              <CardDescription>
                Your personal AI assistant NEX guides you through features and helps you discover connections
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-16">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Build Your Space?</h2>
            <p className="text-lg mb-6 opacity-90">
              Create personalized pages, join communities, and connect with like-minded people
            </p>
            {user ? (
              <Button size="lg" variant="secondary" onClick={() => setLocation("/dashboard")}>
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button size="lg" variant="secondary" onClick={() => window.location.href = getLoginUrl()}>
                Sign In to Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
