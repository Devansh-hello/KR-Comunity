import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ImageIcon, Video, Paperclip } from "lucide-react"

export default function CreatePost() {
  return (
    <div className="container max-w-4xl py-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Create Post</h1>
          <p className="text-muted-foreground">Share your thoughts, images, or videos with the community</p>
        </div>

        <Tabs defaultValue="post" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="post">New Post</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="hot">Hot Topics</TabsTrigger>
          </TabsList>

          <TabsContent value="post">
            <Card className="p-6">
              <form className="space-y-4">
                <Input placeholder="Title" />
                <Textarea placeholder="What's on your mind?" className="min-h-[150px]" />
                <div className="flex gap-2">
                  <Button variant="outline" type="button">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Add Image
                  </Button>
                  <Button variant="outline" type="button">
                    <Video className="h-4 w-4 mr-2" />
                    Add Video
                  </Button>
                  <Button variant="outline" type="button">
                    <Paperclip className="h-4 w-4 mr-2" />
                    Attach
                  </Button>
                </div>
                <div className="flex justify-end">
                  <Button>Publish Post</Button>
                </div>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="trending">
            <div className="grid gap-4">
              {/* Trending posts... */}
              <Card className="p-4">
                <h3 className="font-semibold">#TechConference2025</h3>
                <p className="text-sm text-muted-foreground">1.2k posts</p>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="hot">
            <div className="grid gap-4">
              {/* Hot topics... */}
              <Card className="p-4">
                <h3 className="font-semibold">Community Hackathon Results</h3>
                <p className="text-sm text-muted-foreground">Trending with 500+ engagements</p>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

