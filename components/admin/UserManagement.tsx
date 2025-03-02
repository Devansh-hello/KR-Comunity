"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface User {
  id: string
  name: string
  email: string
  image?: string
  role: string
  permissions: string[]
}

const AVAILABLE_PERMISSIONS = [
  { id: "CREATE_EVENT", label: "Create Events" },
  { id: "DELETE_POST", label: "Delete Posts" },
  { id: "MODERATE_COMMENTS", label: "Moderate Comments" },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const response = await fetch("/api/admin/users")
    const data = await response.json()
    setUsers(data)
    setLoading(false)
  }

  const updatePermissions = async (userId: string, permissions: string[]) => {
    try {
      const response = await fetch("/api/admin/users/permissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, permissions }),
      })
      
      if (!response.ok) throw new Error()
      setUsers(users.map(user => 
        user.id === userId ? { ...user, permissions } : user
      ))
      toast.success("Permissions updated")
    } catch (error) {
      toast.error("Failed to update permissions")
    }
  }

  if (loading) {
    return <LoadingSpinner className="min-h-[400px]" />
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 px-4 md:px-0"
    >
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/50">
          <CardTitle className="text-lg md:text-xl bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            User Permissions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <motion.div className="divide-y">
            {users.map((user) => (
              <motion.div
                key={user.id}
                variants={cardVariants}
                className="p-4 md:p-6 hover:bg-muted/50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <Avatar>
                      <AvatarImage src={user.image} />
                      <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                      <p className="font-medium truncate">{user.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {AVAILABLE_PERMISSIONS.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${user.id}-${permission.id}`}
                          checked={user.permissions.includes(permission.id)}
                          onCheckedChange={(checked) => {
                            const newPermissions = checked
                              ? [...user.permissions, permission.id]
                              : user.permissions.filter(p => p !== permission.id)
                            updatePermissions(user.id, newPermissions)
                          }}
                        />
                        <label
                          htmlFor={`${user.id}-${permission.id}`}
                          className="text-sm whitespace-nowrap"
                        >
                          {permission.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
} 