import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Send, Settings2 } from "lucide-react";
import { useState } from "react";
import { CalendarTab } from "@/components/cm/CalendarTab";
import { ConfigTab } from "@/components/cm/ConfigTab";
import { PostsTab } from "@/components/cm/PostsTab";
import { PageHeader } from "@/components/geodata/ui-bits";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SocialPost } from "@/lib/cm/types";

export const Route = createFileRoute("/community-manager")({
  head: () => ({
    meta: [
      { title: "Community Manager IA — GEODATA" },
      {
        name: "description",
        content:
          "Community Manager IA GEODATA : création IA ou manuelle de posts sociaux, calendrier des publications et configuration des agents par plateforme.",
      },
      { property: "og:title", content: "Community Manager IA — GEODATA" },
      { property: "og:description", content: "Posts sociaux, calendrier éditorial et paramètres IA par plateforme." },
    ],
  }),
  component: CommunityManagerPage,
});

function CommunityManagerPage() {
  const [tab, setTab] = useState("posts");
  const [detail, setDetail] = useState<SocialPost | null>(null);

  return (
    <div>
      <PageHeader
        titre="Community Manager IA"
        sousTitre="Agent Rédaction — création IA ou manuelle, validation, planification et publication"
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="posts">
            <Send className="size-4" /> Posts sociaux
          </TabsTrigger>
          <TabsTrigger value="calendrier">
            <CalendarDays className="size-4" /> Calendrier
          </TabsTrigger>
          <TabsTrigger value="config">
            <Settings2 className="size-4" /> Configuration IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" forceMount className="mt-4 data-[state=inactive]:hidden">
          <PostsTab detail={detail} setDetail={setDetail} />
        </TabsContent>
        <TabsContent value="calendrier" forceMount className="mt-4 data-[state=inactive]:hidden">
          <CalendarTab
            onPostClick={(p) => {
              setTab("posts");
              setDetail(p);
            }}
          />
        </TabsContent>
        <TabsContent value="config" forceMount className="mt-4 data-[state=inactive]:hidden">
          <ConfigTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
