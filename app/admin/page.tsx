"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Upload, Trash2, Plus, Lock, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import ConfirmationModal from "@/components/confirmation-modal"

interface Video {
  id: string
  title: string
  src: string
  uploadDate: string
  featured: boolean
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isPublished, setIsPublished] = useState(true)
  
  // Modal states
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; video: Video | null }>({
    isOpen: false,
    video: null
  })
  const [statusModal, setStatusModal] = useState<{ isOpen: boolean; video: Video | null; newStatus: boolean }>({
    isOpen: false,
    video: null,
    newStatus: false
  })
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Get admin password from environment variable
  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "r3tadmin2024"

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      fetchVideos()
    } else {
      toast.error("Incorrect password")
    }
  }

  const fetchVideos = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/videos')
      const data = await response.json()
      setVideos(data)
    } catch (error) {
      toast.error("Failed to fetch videos")
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const uploadData = await uploadResponse.json()
      
      if (uploadData.success) {
        // Add video to database
        const videoResponse = await fetch('/api/videos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
            src: uploadData.url,
            featured: isPublished
          }),
        })

        if (videoResponse.ok) {
          toast.success("Video uploaded successfully!")
          fetchVideos()
        } else {
          toast.error("Failed to add video to database")
        }
      } else {
        toast.error("Failed to upload file")
      }
    } catch (error) {
      toast.error("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleToggleStatus = (video: Video, newStatus: boolean) => {
    setStatusModal({
      isOpen: true,
      video,
      newStatus
    })
  }

  const confirmToggleStatus = async () => {
    if (!statusModal.video) return
    
    setIsProcessing(true)
    try {
      const response = await fetch('/api/videos', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: statusModal.video.id,
          featured: statusModal.newStatus
        }),
      })

      if (response.ok) {
        toast.success(statusModal.newStatus ? "Video published!" : "Video moved to draft")
        fetchVideos()
        setStatusModal({ isOpen: false, video: null, newStatus: false })
      } else {
        toast.error("Failed to update video status")
      }
    } catch (error) {
      toast.error("Update failed")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteVideo = (video: Video) => {
    setDeleteModal({
      isOpen: true,
      video
    })
  }

  const confirmDeleteVideo = async () => {
    if (!deleteModal.video) return
    
    setIsProcessing(true)
    try {
      const response = await fetch(`/api/videos?id=${deleteModal.video.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success("Video deleted successfully!")
        fetchVideos()
        setDeleteModal({ isOpen: false, video: null })
      } else {
        toast.error("Failed to delete video")
      }
    } catch (error) {
      toast.error("Delete failed")
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-card p-8 rounded-lg border shadow-lg"
        >
          <div className="text-center mb-8">
            <Lock className="w-12 h-12 mx-auto text-primary mb-4" />
            <h1 className="text-2xl font-bold">Admin Access</h1>
            <p className="text-muted-foreground">Enter password to manage videos</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 pr-12 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Access Admin Panel
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-lg border shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Video Management</h1>
              <p className="text-muted-foreground">Upload and manage featured videos</p>
            </div>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Upload Section */}
          <div className="mb-8 p-6 border-2 border-dashed border-border rounded-lg">
            <div className="text-center">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Upload New Video</h3>
              <p className="text-muted-foreground mb-4">
                Select a video file to add to the featured videos section
              </p>
              
              {/* Draft/Published Toggle */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-3">
                  Video Status
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsPublished(false)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      !isPublished
                        ? 'bg-muted border-border text-foreground'
                        : 'bg-transparent border-border text-muted-foreground hover:bg-muted/50'
                    }`}
                    disabled={uploading}
                  >
                    Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPublished(true)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      isPublished
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'bg-transparent border-border text-muted-foreground hover:bg-muted/50'
                    }`}
                    disabled={uploading}
                  >
                    Published
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {isPublished 
                    ? "Video will appear on the main website immediately" 
                    : "Video will be saved as draft and won't appear on the main website"
                  }
                </p>
              </div>

              <input
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className={`inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90 transition-colors ${
                  uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Choose Video File
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Videos List */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Current Videos ({videos.length})</h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading videos...</p>
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No videos uploaded yet
              </div>
            ) : (
              <div className="grid gap-4">
                {videos.map((video) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold">{video.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Uploaded: {new Date(video.uploadDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-md">
                        {video.src}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        video.featured 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                      }`}>
                        {video.featured ? 'Published' : 'Draft'}
                      </span>
                      <button
                        onClick={() => handleToggleStatus(video, !video.featured)}
                        className={`p-2 rounded-lg transition-colors ${
                          video.featured 
                            ? 'text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900' 
                            : 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900'
                        }`}
                        title={video.featured ? 'Move to Draft' : 'Publish Video'}
                      >
                        {video.featured ? '📝' : '✅'}
                      </button>
                      <button
                        onClick={() => handleDeleteVideo(video)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        title="Delete video"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, video: null })}
        onConfirm={confirmDeleteVideo}
        title="Delete Video"
        message={`Are you sure you want to delete "${deleteModal.video?.title}"? This action cannot be undone.`}
        confirmText="Delete Video"
        cancelText="Cancel"
        type="danger"
        isLoading={isProcessing}
      />

      {/* Status Change Confirmation Modal */}
      <ConfirmationModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, video: null, newStatus: false })}
        onConfirm={confirmToggleStatus}
        title={statusModal.newStatus ? "Publish Video" : "Move to Draft"}
        message={`Are you sure you want to ${statusModal.newStatus ? 'publish' : 'move to draft'} "${statusModal.video?.title}"?`}
        confirmText={statusModal.newStatus ? "Publish" : "Move to Draft"}
        cancelText="Cancel"
        type={statusModal.newStatus ? "success" : "warning"}
        isLoading={isProcessing}
      />
    </div>
  )
}
