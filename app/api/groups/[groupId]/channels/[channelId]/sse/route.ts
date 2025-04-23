import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Store active connections
const activeConnections = new Map<string, ReadableStreamController<Uint8Array>>();

// Debug helper to log active connections
function logConnectionCount(channelId: string) {
  let count = 0;
  Array.from(activeConnections.keys()).forEach(connectionId => {
    if (connectionId.includes(`channel-${channelId}`)) {
      count++;
    }
  });
  console.log(`Active connections for channel ${channelId}: ${count}`);
  return count;
}

// Helper to send message to all active connections for a specific channel
export function sendMessageToChannel(channelId: string, data: any) {
  console.log(`Attempting to broadcast to channel ${channelId}:`, data.type);
  
  const connections = Array.from(activeConnections.entries());
  console.log(`Total active connections: ${connections.length}`);
  
  let sentCount = 0;
  
  // Use Array.from to convert the entries to an array first to avoid iterator issues
  connections.forEach(([connectionId, controller]) => {
    if (connectionId.includes(`channel-${channelId}`)) {
      try {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(
          new TextEncoder().encode(message)
        );
        sentCount++;
        console.log(`Message sent to ${connectionId}`);
      } catch (error) {
        console.error(`Error sending message to client ${connectionId}:`, error);
        // Remove broken connections
        activeConnections.delete(connectionId);
      }
    }
  });
  
  console.log(`Message broadcasted to ${sentCount} clients for channel ${channelId}`);
}

export async function GET(
  req: NextRequest,
  { params }: { params: { groupId: string; channelId: string } }
) {
  console.log(`SSE connection request for channel ${params.channelId}`);
  
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    console.log('SSE connection rejected: Unauthorized');
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  const { groupId, channelId } = params;
  
  // Check if user is member of the group
  const member = await prisma.groupMember.findFirst({
    where: {
      groupId,
      userId: session.user.id,
    },
  });
  
  if (!member) {
    console.log(`SSE connection rejected: User ${session.user.id} is not a member of group ${groupId}`);
    return new NextResponse('Forbidden', { status: 403 });
  }
  
  // Create a unique connection ID for this user and channel
  const connectionId = `channel-${channelId}-user-${session.user.id}-${Date.now()}`;
  console.log(`Creating new SSE connection: ${connectionId}`);
  
  // Create a streaming response
  const stream = new ReadableStream({
    start(controller) {
      console.log(`SSE connection established: ${connectionId}`);
      activeConnections.set(connectionId, controller);
      
      // Send initial heartbeat
      controller.enqueue(
        new TextEncoder().encode(`: heartbeat\n\n`)
      );
      
      // Send a test message to confirm connection is working
      setTimeout(() => {
        try {
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({ type: 'connection_test', message: 'Connection established' })}\n\n`)
          );
          console.log(`Test message sent to ${connectionId}`);
        } catch (error) {
          console.error(`Error sending test message to ${connectionId}:`, error);
        }
      }, 1000);
      
      // Log active connections
      logConnectionCount(channelId);
    },
    cancel() {
      // Clean up when client disconnects
      console.log(`SSE connection closed: ${connectionId}`);
      activeConnections.delete(connectionId);
      logConnectionCount(channelId);
    },
  });
  
  // Return the stream response
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
} 