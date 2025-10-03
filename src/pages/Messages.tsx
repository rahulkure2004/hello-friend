import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Send } from "lucide-react";

interface User {
  id: string;
  email?: string;
}

export default function Messages() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header currentUser={currentUser} onLogout={handleLogout} />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid md:grid-cols-3 gap-4 h-[calc(100vh-12rem)]">
          {/* Conversations List */}
          <Card className="md:col-span-1 p-4">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-4">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search messages..." className="pl-10" />
              </div>
            </div>
            
            <ScrollArea className="h-[calc(100%-8rem)]">
              <div className="space-y-2">
                {!currentUser ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Please sign in to view messages</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No messages yet</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>

          {/* Chat Area */}
          <Card className="md:col-span-2 p-4 flex flex-col">
            <div className="text-center py-12 text-muted-foreground flex-1 flex items-center justify-center">
              <p>Select a conversation to start messaging</p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
