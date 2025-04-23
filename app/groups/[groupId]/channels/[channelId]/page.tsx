"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, Send, ArrowLeft, Settings, Hash, Volume2, Megaphone, Paperclip, Smile, ImageIcon, X, Film, PlusCircle } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import dynamic from "next/dynamic"
import Image from "next/image"
import { ImageUpload } from "@/components/ImageUpload"

// Temporarily removed emoji picker implementation
// Will be restored when dependencies are fixed

interface Channel {
  id: string
  name: string
  description: string | null
  type: "TEXT" | "VOICE" | "ANNOUNCEMENT"
  groupId: string
  createdAt: string
}

interface MessageAttachment {
  id: string
  url: string
  type: "IMAGE" | "FILE" | "GIF"
  filename: string
}

interface Reaction {
  id: string
  emoji: string
  userId: string
  user: {
    id: string
    name: string
  }
}

interface Message {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    name: string
    image: string | null
  }
  attachments: MessageAttachment[]
  reactions: Reaction[]
}

interface Group {
  id: string
  name: string
  ownerId: string
  members: {
    userId: string
    role: string
  }[]
}

// GIF search API key (Tenor or GIPHY)
const GIF_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY || "YOUR_API_KEY_HERE"

// Add a simple emoji handler function
const handleEmojiSelect = (messageId: string, emoji: string) => {
  // Simple implementation for now
  console.log(`Selected emoji ${emoji} for message ${messageId}`);
}

export default function ChannelPage() {
  const params = useParams()
  const groupId = params.groupId as string
  const channelId = params.channelId as string
  const { data: session } = useSession()
  
  const [channel, setChannel] = useState<Channel | null>(null)
  const [group, setGroup] = useState<Group | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isReacting, setIsReacting] = useState(false)
  const [attachments, setAttachments] = useState<string[]>([])
  const [attachmentType, setAttachmentType] = useState<"IMAGE" | "FILE" | "GIF">("IMAGE")
  const [gifSearchQuery, setGifSearchQuery] = useState("")
  const [gifResults, setGifResults] = useState<any[]>([])
  const [isSearchingGifs, setIsSearchingGifs] = useState(false)
  const [imgUrl, setImgUrl] = useState("")
  const [showImageUpload, setShowImageUpload] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const sseConnectionRef = useRef<EventSource | null>(null)
  
  // Define scrollToBottom function first since it's used by other functions
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);
  
  // Function to fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      const messagesResponse = await fetch(`/api/groups/${groupId}/channels/${channelId}/messages`);
      
      if (!messagesResponse.ok) {
        throw new Error("Failed to fetch messages");
      }
      
      const messagesData = await messagesResponse.json();
      setMessages(messagesData);
      
      // Scroll to bottom after messages load
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  }, [groupId, channelId, scrollToBottom]);
  
  // Function to handle new message received from SSE
  const handleNewMessage = useCallback((newMessage: any) => {
    console.log('Processing new message:', newMessage);
    
    setMessages(prev => {
      // Check if message already exists to prevent duplicates
      if (prev.some(m => m.id === newMessage.id)) {
        return prev;
      }
      return [...prev, newMessage];
    });
    
    // Scroll to bottom when new message arrives
    setTimeout(scrollToBottom, 100);
  }, [scrollToBottom]);
  
  // Function to connect to SSE
  const connectToSSE = useCallback(() => {
    if (!channelId || !session?.user?.id) return;
    
    // Close any existing connection
    if (sseConnectionRef.current) {
      console.log('Closing existing SSE connection');
      sseConnectionRef.current.close();
    }
    
    console.log(`Connecting to SSE endpoint for channel ${channelId}`);
    
    // Connect to the SSE endpoint with a timestamp to prevent caching
    const eventSource = new EventSource(`/api/groups/${groupId}/channels/${channelId}/sse?t=${Date.now()}`);
    
    // Handle connection open
    eventSource.onopen = () => {
      console.log('SSE connection established successfully');
    };
    
    // Handle messages
    eventSource.onmessage = (event) => {
      console.log('SSE message received:', event.data);
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'new_message') {
          handleNewMessage(data.message);
        } else if (data.type === 'reaction_added') {
          console.log('Processing new reaction:', data.reaction);
          
          setMessages(prev => prev.map(msg => {
            if (msg.id === data.messageId) {
              return {
                ...msg,
                reactions: [...msg.reactions, data.reaction]
              };
            }
            return msg;
          }));
        } else if (data.type === 'reaction_removed') {
          console.log('Processing reaction removal');
          
          setMessages(prev => prev.map(msg => {
            if (msg.id === data.messageId) {
              return {
                ...msg,
                reactions: msg.reactions.filter(r => 
                  !(r.userId === data.userId && r.emoji === data.emoji)
                )
              };
            }
            return msg;
          }));
        } else {
          console.log('Unknown event type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing/handling SSE message:', error, event.data);
      }
    };
    
    // Handle errors
    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      
      // Reconnect after a delay if connection fails
      eventSource.close();
      sseConnectionRef.current = null;
      
      console.log('Attempting to reconnect in 5 seconds...');
      setTimeout(connectToSSE, 5000);
    };
    
    // Store the connection
    sseConnectionRef.current = eventSource;
  }, [channelId, groupId, session?.user?.id, handleNewMessage]);
  
  // Effect to fetch channel data when component loads
  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        // Fetch channel details
        const channelResponse = await fetch(`/api/groups/${groupId}/channels/${channelId}`);
        
        if (!channelResponse.ok) {
          if (channelResponse.status === 404) {
            setError("Channel not found");
          } else {
            setError("Failed to load channel");
          }
          setLoading(false);
          return;
        }
        
        const channelData = await channelResponse.json();
        setChannel(channelData);
        
        // Fetch group details to check permissions
        const groupResponse = await fetch(`/api/groups/${groupId}`);
        
        if (!groupResponse.ok) {
          setError("Failed to load group information");
          setLoading(false);
          return;
        }
        
        const groupData = await groupResponse.json();
        setGroup(groupData);
        
        // Fetch channel messages
        await fetchMessages();
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching channel data:", err);
        setError("An error occurred while loading the channel");
        setLoading(false);
      }
    };
    
    if (groupId && channelId) {
      fetchChannelData();
    }
  }, [groupId, channelId, fetchMessages]);
  
  // Effect to connect to SSE when channel is loaded
  useEffect(() => {
    if (channel && session?.user) {
      connectToSSE();
    }
    
    // Clean up on unmount
    return () => {
      if (sseConnectionRef.current) {
        sseConnectionRef.current.close();
        sseConnectionRef.current = null;
      }
    };
  }, [channel, connectToSSE, session?.user]);
  
  // Search for GIFs
  const searchGifs = async (query: string) => {
    if (!query) return
    
    setIsSearchingGifs(true)
    try {
      const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIF_API_KEY}&q=${encodeURIComponent(query)}&limit=20`)
      const data = await response.json()
      setGifResults(data.data || [])
    } catch (error) {
      console.error("Error searching GIFs:", error)
    } finally {
      setIsSearchingGifs(false)
    }
  }
  
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    const reader = new FileReader()
    reader.onload = async (e) => {
      if (e.target?.result) {
        try {
          const formData = new FormData()
          formData.append('file', files[0])
          
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })
          
          if (!response.ok) {
            throw new Error('Failed to upload file')
          }
          
          const data = await response.json()
          setAttachments([...attachments, data.url])
        } catch (error) {
          console.error("Error uploading file:", error)
        }
      }
    }
    
    reader.readAsDataURL(files[0])
  }
  
  // Modify the addReaction function
  const addReaction = async (messageId: string, emoji: string) => {
    if (!session?.user) return;
    
    setIsReacting(true);
    try {
      const response = await fetch(`/api/groups/${groupId}/channels/${channelId}/messages/${messageId}/reactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emoji }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to add reaction");
      }
      
      // Update the messages state
      const updatedMessages = messages.map(msg => {
        if (msg.id === messageId) {
          // Check if user already reacted with this emoji
          const existingReaction = msg.reactions.find(
            r => r.userId === session.user.id && r.emoji === emoji
          );
          
          if (existingReaction) {
            // Remove the reaction (toggle behavior)
            return {
              ...msg,
              reactions: msg.reactions.filter(r => !(r.userId === session.user.id && r.emoji === emoji))
            };
          } else {
            // Add the reaction
            return {
              ...msg,
              reactions: [
                ...msg.reactions,
                {
                  id: `temp-${Date.now()}`,
                  emoji,
                  userId: session.user.id,
                  user: {
                    id: session.user.id,
                    name: session.user.name || "User"
                  }
                }
              ]
            };
          }
        }
        return msg;
      });
      
      setMessages(updatedMessages);
    } catch (error) {
      console.error("Error adding reaction:", error);
    } finally {
      setIsReacting(false);
    }
  };
  
  // Send a new message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if ((!message.trim() && attachments.length === 0) || !session?.user) return
    
    setIsSending(true)
    
    try {
      const response = await fetch(`/api/groups/${groupId}/channels/${channelId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          content: message,
          attachments: attachments.map(url => ({
            url,
            type: attachmentType,
            filename: url.split('/').pop() || 'attachment'
          }))
        }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to send message")
      }
      
      // Add the new message to the state
      const newMessage = await response.json()
      setMessages([...messages, newMessage])
      setMessage("")
      setAttachments([])
      
      // Scroll to bottom after sending
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSending(false)
    }
  }
  
  // Get channel icon based on type
  const getChannelIcon = (type: string) => {
    switch (type) {
      case "TEXT":
        return <Hash className="h-5 w-5 mr-2" />
      case "VOICE":
        return <Volume2 className="h-5 w-5 mr-2" />
      case "ANNOUNCEMENT":
        return <Megaphone className="h-5 w-5 mr-2" />
      default:
        return <Hash className="h-5 w-5 mr-2" />
    }
  }

  // Select a GIF to send
  const selectGif = async (gif: any) => {
    setAttachmentType("GIF")
    setAttachments([...attachments, gif.images.original.url])
  }
  
  // Simple placeholder for emoji picker
  const SimpleEmojiPicker = ({ onEmojiSelect }: { onEmojiSelect: (emoji: string) => void }) => {
    const commonEmojis = ["😀", "👍", "❤️", "🎉", "😂", "🔥", "👏", "🙏"];
    
    return (
      <div className="grid grid-cols-4 gap-2 p-2">
        {commonEmojis.map(emoji => (
          <button
            key={emoji}
            className="text-xl hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded"
            onClick={() => onEmojiSelect(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  if (error || !channel || !group) {
    return (
      <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">{error || "Channel not found"}</h1>
        <Link href={`/groups/${groupId}`}>
          <Button>Back to Group</Button>
        </Link>
      </div>
    )
  }
  
  // Check if user is member of the group
  const isGroupMember = group.members?.some(m => m.userId === session?.user?.id)
  
  // Check if user is admin
  const isAdmin = group.members?.some(m => 
    m.userId === session?.user?.id && (m.role === "ADMIN" || m.role === "OWNER")
  )
  
  // If not a member, show access denied
  if (!isGroupMember) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You are not a member of this group.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/groups">
              <Button>Browse Groups</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // For voice channels, show a different interface
  if (channel.type === "VOICE") {
    return (
      <div className="container max-w-4xl py-8">
        <div className="mb-6">
          <Link 
            href={`/groups/${groupId}`}
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to group
          </Link>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {getChannelIcon(channel.type)}
                <CardTitle>{channel.name}</CardTitle>
              </div>
              {isAdmin && (
                <Link href={`/groups/${groupId}/channels/${channelId}/settings`}>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
            <CardDescription>
              {channel.description || "No description provided."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Volume2 className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2">Voice Channel</h2>
            <p className="text-muted-foreground mb-6 text-center">
              Voice channels are not yet implemented in this version.
              <br />
              Check back soon for updates!
            </p>
            <Button variant="outline" className="mb-4">
              Join Voice (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <Link 
          href={`/groups/${groupId}`}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to group
        </Link>
      </div>
      
      <Card className="mb-4">
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {getChannelIcon(channel.type)}
              <CardTitle>{channel.name}</CardTitle>
            </div>
            {isAdmin && (
              <Link href={`/groups/${groupId}/channels/${channelId}/settings`}>
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
          {channel.description && (
            <CardDescription>
              {channel.description}
            </CardDescription>
          )}
        </CardHeader>
      </Card>
      
      <Card>
        <div className="h-[500px] flex flex-col">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                <Hash className="h-8 w-8 mb-2" />
                <p>No messages yet</p>
                <p className="text-sm">Be the first to send a message!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="flex flex-col gap-2">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={msg.author.image || undefined} />
                      <AvatarFallback>{msg.author.name?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium">{msg.author.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      {msg.content && <p className="text-sm">{msg.content}</p>}
                      
                      {/* Attachments */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {msg.attachments.map((attachment) => (
                            <div key={attachment.id} className="relative">
                              {attachment.type === "IMAGE" || attachment.type === "GIF" ? (
                                <Image 
                                  src={attachment.url} 
                                  alt={attachment.filename}
                                  width={200}
                                  height={150}
                                  className="rounded-md object-cover max-h-[200px] max-w-[200px]"
                                />
                              ) : (
                                <div className="flex items-center gap-2 p-2 border rounded-md">
                                  <Paperclip className="h-4 w-4" />
                                  <a 
                                    href={attachment.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-500 hover:underline"
                                  >
                                    {attachment.filename}
                                  </a>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Reactions */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {/* Group reactions by emoji */}
                          {Object.entries(
                            msg.reactions.reduce((acc, reaction) => {
                              if (!acc[reaction.emoji]) {
                                acc[reaction.emoji] = []
                              }
                              acc[reaction.emoji].push(reaction)
                              return acc
                            }, {} as Record<string, typeof msg.reactions>)
                          ).map(([emoji, reactions]) => (
                            <Button
                              key={emoji}
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs gap-1 cursor-pointer"
                              onClick={() => addReaction(msg.id, emoji)}
                            >
                              {emoji} <span className="ml-1">{reactions.length}</span>
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Reaction button */}
                  <div className="flex ml-11 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 px-2">
                          <Smile className="h-3.5 w-3.5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0" align="start">
                        <SimpleEmojiPicker onEmojiSelect={(emoji) => addReaction(msg.id, emoji)} />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <Separator />
          
          {/* Attachment preview */}
          {attachments.length > 0 && (
            <div className="p-2 flex flex-wrap gap-2 border-b">
              {attachments.map((url, index) => (
                <div key={index} className="relative">
                  {attachmentType === "IMAGE" || attachmentType === "GIF" ? (
                    <div className="relative group">
                      <Image 
                        src={url} 
                        alt="attachment"
                        width={100}
                        height={80}
                        className="rounded-md object-cover h-[80px] w-[100px]"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-5 w-5 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                      >
                        ×
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2 p-2 border rounded-md">
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4" />
                        <span className="text-sm truncate max-w-[80px]">
                          {url.split('/').pop()}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                      >
                        ×
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Message input */}
          <form onSubmit={sendMessage} className="p-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder={`Message ${channel.name}`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isSending || channel.type === "ANNOUNCEMENT" && !isAdmin}
                  className="flex-1"
                />
                <div className="flex gap-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" size="icon" className="h-10 w-10">
                        <Smile className="h-5 w-5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" side="top">
                      <SimpleEmojiPicker onEmojiSelect={(emoji) => {
                        setMessage(prev => prev + emoji);
                      }} />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" size="icon" className="h-10 w-10">
                        <ImageIcon className="h-5 w-5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" side="top">
                      <Tabs defaultValue="gifs">
                        <TabsList className="w-full">
                          <TabsTrigger value="gifs" className="flex-1">GIFs</TabsTrigger>
                          <TabsTrigger value="upload" className="flex-1">Upload</TabsTrigger>
                        </TabsList>
                        <TabsContent value="gifs" className="p-4">
                          <div className="space-y-4">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Search GIFs..."
                                value={gifSearchQuery}
                                onChange={(e) => setGifSearchQuery(e.target.value)}
                              />
                              <Button 
                                type="button" 
                                onClick={() => searchGifs(gifSearchQuery)}
                                disabled={isSearchingGifs}
                              >
                                {isSearchingGifs ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                              </Button>
                            </div>
                            <ScrollArea className="h-[300px]">
                              {gifResults.length > 0 ? (
                                <div className="grid grid-cols-2 gap-2">
                                  {gifResults.map((gif) => (
                                    <Image
                                      key={gif.id}
                                      src={gif.images.fixed_height_small.url}
                                      alt="GIF"
                                      width={100}
                                      height={100}
                                      className="rounded-md cursor-pointer object-cover h-[100px] w-full"
                                      onClick={() => {
                                        selectGif(gif);
                                      }}
                                    />
                                  ))}
                                </div>
                              ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                  {isSearchingGifs ? (
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                  ) : (
                                    "Search for GIFs to display here"
                                  )}
                                </div>
                              )}
                            </ScrollArea>
                          </div>
                        </TabsContent>
                        <TabsContent value="upload" className="p-4">
                          <div className="space-y-4">
                            <div className="flex flex-col items-center gap-2 p-8 border-2 border-dashed rounded-md">
                              <Paperclip className="h-8 w-8 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                Drag files here or click to browse
                              </p>
                              <ImageUpload
                                value=""
                                onChange={(url) => {
                                  setAttachmentType("IMAGE");
                                  setAttachments([...attachments, url]);
                                }}
                              />
                              <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setAttachmentType("FILE");
                                  fileInputRef.current?.click();
                                }}
                              >
                                Upload File
                              </Button>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </PopoverContent>
                  </Popover>
                  
                  <Button 
                    type="submit" 
                    size="icon" 
                    disabled={isSending || (message.trim() === "" && attachments.length === 0) || (channel.type === "ANNOUNCEMENT" && !isAdmin)}
                  >
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              {channel.type === "ANNOUNCEMENT" && !isAdmin && (
                <p className="text-xs text-muted-foreground">
                  Only admins can post in announcement channels.
                </p>
              )}
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
} 