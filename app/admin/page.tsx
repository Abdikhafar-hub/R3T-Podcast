"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Upload, Trash2, Plus, Lock, Eye, EyeOff, Edit, Settings, Save, Image as ImageIcon, Users, MessageSquare, Link, Globe, Menu, Home } from "lucide-react"
import { toast } from "sonner"
import ConfirmationModal from "@/components/confirmation-modal"
import EditVideoModal from "@/components/edit-video-modal"

interface Video {
  id: string
  title: string
  description?: string
  src: string
  uploadDate: string
  featured: boolean
}

interface CMSData {
  hero: {
    slides: Array<{
      id: string
      image: string
      title: string
      subtitle: string
      cta: string
      ctaLink: string
    }>
  }
  about: {
    title: string
    content: string[]
    image: string
    imageAlt: string
  }
  hosts: {
    title: string
    hosts: Array<{
      id: string
      name: string
      image: string
      bio: string
    }>
  }
  producer: {
    title: string
    name: string
    image: string
    bio: string
  }
  testimonials: {
    title: string
    subtitle: string
    testimonials: Array<{
      id: string
      quote: string
      name: string
      role: string
      avatar: string
    }>
  }
  partners: {
    title: string
    subtitle: string
    platforms: Array<{
      name: string
      icon: string
      color: string
      url: string
    }>
  }
  contact: {
    title: string
    subtitle: string
    email: string
    socialLinks: Array<{
      name: string
      icon: string
      href: string
      color: string
    }>
  }
  footer: {
    logo: string
    description: string
    email: string
    location: string
    quickLinks: Array<{
      name: string
      href: string
    }>
    socialLinks: Array<{
      name: string
      icon: string
      href: string
    }>
  }
  navbar: {
    logo: string
    navLinks: Array<{
      href: string
      label: string
    }>
    ctaText: string
    ctaLink: string
  }
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isPublished, setIsPublished] = useState(true)
  const [videoTitle, setVideoTitle] = useState("")
  const [videoDescription, setVideoDescription] = useState("")
  
  // CMS states
  const [activeTab, setActiveTab] = useState<'videos' | 'cms'>('videos')
  const [cmsData, setCmsData] = useState<CMSData | null>(null)
  const [cmsLoading, setCmsLoading] = useState(false)
  const [activeCmsSection, setActiveCmsSection] = useState<string>('hero')
  
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
  const [editModal, setEditModal] = useState<{ isOpen: boolean; video: Video | null }>({
    isOpen: false,
    video: null
  })
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Get admin password from environment variable
  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "r3tadmin2024"

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      fetchVideos()
      fetchCmsData()
    } else {
      toast.error("Incorrect password")
    }
  }

  const fetchCmsData = async () => {
    setCmsLoading(true)
    try {
      const response = await fetch('/api/cms')
      const data = await response.json()
      setCmsData(data)
    } catch (error) {
      toast.error("Failed to fetch CMS data")
    } finally {
      setCmsLoading(false)
    }
  }

  const updateCmsSection = async (section: string, data: any) => {
    setCmsLoading(true)
    try {
      const response = await fetch('/api/cms', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ section, data }),
      })

      if (response.ok) {
        toast.success(`${section} section updated successfully!`)
        fetchCmsData()
      } else {
        toast.error("Failed to update section")
      }
    } catch (error) {
      toast.error("Update failed")
    } finally {
      setCmsLoading(false)
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

    // Check file size before upload (200MB limit)
    const maxSize = 200 * 1024 * 1024 // 200MB
    if (file.size > maxSize) {
      toast.error(`File too large! Maximum size is 200MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB. Please compress your video or use a smaller file.`)
      return
    }

    // Check file type
    if (!file.type.startsWith('video/')) {
      toast.error("Please select a video file")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      toast.info(`Uploading ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)...`)

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
            title: videoTitle || file.name.replace(/\.[^/.]+$/, ""), // Use custom title or filename
            description: videoDescription || "", // Use custom description
            src: uploadData.url,
            public_id: uploadData.public_id, // Store Cloudinary public_id
            featured: isPublished
          }),
        })

        if (videoResponse.ok) {
          toast.success("Video uploaded successfully!")
          fetchVideos()
          // Clear form
          setVideoTitle("")
          setVideoDescription("")
          setIsPublished(true)
        } else {
          toast.error("Failed to add video to database")
        }
      } else {
        toast.error(uploadData.error || "Failed to upload file")
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error("Upload failed. Please try again.")
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

  const handleEditVideo = (video: Video) => {
    setEditModal({
      isOpen: true,
      video
    })
  }

  const handleDeleteVideo = (video: Video) => {
    setDeleteModal({
      isOpen: true,
      video
    })
  }

  const handleSaveVideo = async (updatedVideo: Video) => {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/videos', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: updatedVideo.id,
          title: updatedVideo.title,
          description: updatedVideo.description,
          featured: updatedVideo.featured
        }),
      })

      if (response.ok) {
        toast.success("Video updated successfully!")
        fetchVideos()
        setEditModal({ isOpen: false, video: null })
      } else {
        toast.error("Failed to update video")
      }
    } catch (error) {
      toast.error("Update failed")
    } finally {
      setIsProcessing(false)
    }
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
              Access Admin Panel.
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
              <h1 className="text-3xl font-bold">Admin Panel</h1>
              <p className="text-muted-foreground">Manage videos and website content</p>
            </div>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-8 bg-muted/30 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('videos')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'videos'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Upload className="w-4 h-4" />
              Video Management
            </button>
            <button
              onClick={() => setActiveTab('cms')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'cms'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Settings className="w-4 h-4" />
              Content Management
            </button>
          </div>

          {/* Video Management Tab */}
          {activeTab === 'videos' && (
            <>
              {/* Upload Section */}
              <div className="mb-8 p-6 border-2 border-dashed border-border rounded-lg">
            <div className="text-center">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Upload New Video</h3>
              <p className="text-muted-foreground mb-4">
                Select a video file to add to the featured videos section
              </p>
              <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>File Requirements:</strong>
                </p>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                  <li>• Maximum file size: <strong>100MB</strong></li>
                  <li>• Supported formats: MP4, MOV, AVI, MKV, etc.</li>
                  <li>• Videos will be automatically optimized for web</li>
                  <li>• For larger files, please compress your video first</li>
                </ul>
              </div>
              
              {/* Video Details */}
              <div className="mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Video Title
                  </label>
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="Enter a descriptive title for your video"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                    disabled={uploading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Video Description (Optional)
                  </label>
                  <textarea
                    value={videoDescription}
                    onChange={(e) => setVideoDescription(e.target.value)}
                    placeholder="Add a description of what this video is about..."
                    rows={3}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background resize-none"
                    disabled={uploading}
                  />
                </div>
              </div>

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
                      {video.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {video.description}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mt-2">
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
                        onClick={() => handleEditVideo(video)}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                        title="Edit video details"
                      >
                        <Edit size={16} />
                      </button>
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
            </>
          )}

          {/* CMS Tab */}
          {activeTab === 'cms' && (
            <div className="space-y-8">
              {cmsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading CMS data...</p>
                </div>
              ) : cmsData ? (
                <>
                  {/* CMS Section Navigation */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {[
                      { id: 'hero', label: 'Hero', icon: Home },
                      { id: 'about', label: 'About', icon: ImageIcon },
                      { id: 'hosts', label: 'Hosts', icon: Users },
                      { id: 'producer', label: 'Producer', icon: Users },
                      { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
                      { id: 'partners', label: 'Partners', icon: Link },
                      { id: 'contact', label: 'Contact', icon: Globe },
                      { id: 'footer', label: 'Footer', icon: Menu },
                      { id: 'navbar', label: 'Navigation', icon: Menu }
                    ].map((section) => {
                      const Icon = section.icon
                      return (
                        <button
                          key={section.id}
                          onClick={() => setActiveCmsSection(section.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                            activeCmsSection === section.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {section.label}
                        </button>
                      )
                    })}
                  </div>

                  {/* CMS Section Content */}
                  <div className="bg-muted/30 rounded-lg p-6">
                    {activeCmsSection === 'hero' && (
                      <HeroSectionEditor 
                        data={cmsData.hero} 
                        onUpdate={(data) => updateCmsSection('hero', data)} 
                      />
                    )}
                    {activeCmsSection === 'about' && (
                      <AboutSectionEditor 
                        data={cmsData.about} 
                        onUpdate={(data) => updateCmsSection('about', data)} 
                      />
                    )}
                    {activeCmsSection === 'hosts' && (
                      <HostsSectionEditor 
                        data={cmsData.hosts} 
                        onUpdate={(data) => updateCmsSection('hosts', data)} 
                      />
                    )}
                    {activeCmsSection === 'producer' && (
                      <ProducerSectionEditor 
                        data={cmsData.producer} 
                        onUpdate={(data) => updateCmsSection('producer', data)} 
                      />
                    )}
                    {activeCmsSection === 'testimonials' && (
                      <TestimonialsSectionEditor 
                        data={cmsData.testimonials} 
                        onUpdate={(data) => updateCmsSection('testimonials', data)} 
                      />
                    )}
                    {activeCmsSection === 'partners' && (
                      <PartnersSectionEditor 
                        data={cmsData.partners} 
                        onUpdate={(data) => updateCmsSection('partners', data)} 
                      />
                    )}
                    {activeCmsSection === 'contact' && (
                      <ContactSectionEditor 
                        data={cmsData.contact} 
                        onUpdate={(data) => updateCmsSection('contact', data)} 
                      />
                    )}
                    {activeCmsSection === 'footer' && (
                      <FooterSectionEditor 
                        data={cmsData.footer} 
                        onUpdate={(data) => updateCmsSection('footer', data)} 
                      />
                    )}
                    {activeCmsSection === 'navbar' && (
                      <NavbarSectionEditor 
                        data={cmsData.navbar} 
                        onUpdate={(data) => updateCmsSection('navbar', data)} 
                      />
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Failed to load CMS data
                </div>
              )}
            </div>
          )}
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

      {/* Edit Video Modal */}
      {editModal.isOpen && editModal.video && (
        <EditVideoModal
          video={editModal.video}
          onClose={() => setEditModal({ isOpen: false, video: null })}
          onSave={handleSaveVideo}
        />
      )}
    </div>
  )
}

// Image Upload Button Component
function ImageUploadButton({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (10MB limit for images)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      toast.error(`File too large! Maximum size is 10MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB. Please compress your image or use a smaller file.`)
      return
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      toast.info(`Uploading ${file.name}...`)

      const uploadResponse = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      })

      const uploadData = await uploadResponse.json()
      
      if (uploadData.success) {
        toast.success("Image uploaded successfully!")
        onUpload(uploadData.url)
      } else {
        toast.error(uploadData.error || "Failed to upload image")
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error("Upload failed. Please try again.")
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        disabled={uploading}
        className="hidden"
        id={`image-upload-${Math.random()}`}
        ref={fileInputRef}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className={`px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 ${
          uploading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title="Upload image from device"
      >
        {uploading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span className="hidden sm:inline">Uploading...</span>
          </>
        ) : (
          <>
            <ImageIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Upload</span>
          </>
        )}
      </button>
    </>
  )
}

// Section Editor Components
function HeroSectionEditor({ data, onUpdate }: { data: any, onUpdate: (data: any) => void }) {
  const [slides, setSlides] = useState(data.slides || [])

  // Sync slides with data prop when it changes
  useEffect(() => {
    setSlides(data.slides || [])
  }, [data])

  const addSlide = () => {
    const newSlide = {
      id: `slide-${Date.now()}`,
      image: '',
      title: '',
      subtitle: '',
      cta: '',
      ctaLink: ''
    }
    setSlides([...slides, newSlide])
  }

  const updateSlide = (index: number, field: string, value: string) => {
    const updatedSlides = [...slides]
    updatedSlides[index] = { ...updatedSlides[index], [field]: value }
    setSlides(updatedSlides)
  }

  const removeSlide = (index: number) => {
    setSlides(slides.filter((_: any, i: number) => i !== index))
  }

  const saveChanges = () => {
    onUpdate({ slides })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Hero Section - Slides</h3>
        <div className="flex gap-2">
          <button
            onClick={addSlide}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Add Slide
          </button>
          <button
            onClick={saveChanges}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {slides.map((slide: any, index: number) => (
          <div key={slide.id} className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Slide {index + 1}</h4>
              <button
                onClick={() => removeSlide(index)}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={slide.image}
                    onChange={(e) => updateSlide(index, 'image', e.target.value)}
                    className="flex-1 px-3 py-2 border border-border rounded-lg"
                    placeholder="/path/to/image.jpg"
                  />
                  <ImageUploadButton
                    onUpload={(url) => updateSlide(index, 'image', url)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={slide.title}
                  onChange={(e) => updateSlide(index, 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg"
                  placeholder="Slide title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Subtitle</label>
                <input
                  type="text"
                  value={slide.subtitle}
                  onChange={(e) => updateSlide(index, 'subtitle', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg"
                  placeholder="Slide subtitle"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">CTA Text</label>
                <input
                  type="text"
                  value={slide.cta}
                  onChange={(e) => updateSlide(index, 'cta', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg"
                  placeholder="Button text"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">CTA Link</label>
                <input
                  type="text"
                  value={slide.ctaLink}
                  onChange={(e) => updateSlide(index, 'ctaLink', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg"
                  placeholder="#videos or /link"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AboutSectionEditor({ data, onUpdate }: { data: any, onUpdate: (data: any) => void }) {
  const [formData, setFormData] = useState(data)

  // Sync formData with data prop when it changes
  useEffect(() => {
    setFormData(data)
  }, [data])

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  const updateContent = (index: number, value: string) => {
    const newContent = [...formData.content]
    newContent[index] = value
    setFormData({ ...formData, content: newContent })
  }

  const addContent = () => {
    setFormData({ ...formData, content: [...formData.content, ''] })
  }

  const removeContent = (index: number) => {
    const newContent = formData.content.filter((_: any, i: number) => i !== index)
    setFormData({ ...formData, content: newContent })
  }

  const saveChanges = () => {
    onUpdate(formData)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">About Section</h3>
        <button
          onClick={saveChanges}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Save Changes
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Content Paragraphs</label>
          {formData.content.map((paragraph: string, index: number) => (
            <div key={index} className="flex gap-2 mb-2">
              <textarea
                value={paragraph}
                onChange={(e) => updateContent(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-border rounded-lg"
                rows={3}
              />
              <button
                onClick={() => removeContent(index)}
                className="px-3 py-2 text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={addContent}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Add Paragraph
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Image URL</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.image}
              onChange={(e) => updateField('image', e.target.value)}
              className="flex-1 px-3 py-2 border border-border rounded-lg"
              placeholder="/path/to/image.jpg"
            />
            <ImageUploadButton
              onUpload={(url) => updateField('image', url)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Image Alt Text</label>
          <input
            type="text"
            value={formData.imageAlt}
            onChange={(e) => updateField('imageAlt', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg"
            placeholder="Description of the image"
          />
        </div>
      </div>
    </div>
  )
}

function HostsSectionEditor({ data, onUpdate }: { data: any, onUpdate: (data: any) => void }) {
  const [formData, setFormData] = useState(data)

  // Sync formData with data prop when it changes
  useEffect(() => {
    setFormData(data)
  }, [data])

  const updateHost = (index: number, field: string, value: string) => {
    const newHosts = [...formData.hosts]
    newHosts[index] = { ...newHosts[index], [field]: value }
    setFormData({ ...formData, hosts: newHosts })
  }

  const addHost = () => {
    const newHost = {
      id: `host-${Date.now()}`,
      name: '',
      image: '',
      bio: ''
    }
    setFormData({ ...formData, hosts: [...formData.hosts, newHost] })
  }

  const removeHost = (index: number) => {
    const newHosts = formData.hosts.filter((_: any, i: number) => i !== index)
    setFormData({ ...formData, hosts: newHosts })
  }

  const saveChanges = () => {
    onUpdate(formData)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Hosts Section</h3>
        <div className="flex gap-2">
          <button
            onClick={addHost}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Add Host
          </button>
          <button
            onClick={saveChanges}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Section Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-lg"
        />
      </div>

      <div className="space-y-4">
        {formData.hosts.map((host: any, index: number) => (
          <div key={host.id} className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Host {index + 1}</h4>
              <button
                onClick={() => removeHost(index)}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={host.name}
                  onChange={(e) => updateHost(index, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={host.image}
                    onChange={(e) => updateHost(index, 'image', e.target.value)}
                    className="flex-1 px-3 py-2 border border-border rounded-lg"
                  />
                  <ImageUploadButton
                    onUpload={(url) => updateHost(index, 'image', url)}
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  value={host.bio}
                  onChange={(e) => updateHost(index, 'bio', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg"
                  rows={4}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProducerSectionEditor({ data, onUpdate }: { data: any, onUpdate: (data: any) => void }) {
  const [formData, setFormData] = useState(data)

  // Sync formData with data prop when it changes
  useEffect(() => {
    setFormData(data)
  }, [data])

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const saveChanges = () => {
    onUpdate(formData)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Producer Section</h3>
        <button
          onClick={saveChanges}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Save Changes
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Section Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Image URL</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.image}
              onChange={(e) => updateField('image', e.target.value)}
              className="flex-1 px-3 py-2 border border-border rounded-lg"
            />
            <ImageUploadButton
              onUpload={(url) => updateField('image', url)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => updateField('bio', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg"
            rows={6}
          />
        </div>
      </div>
    </div>
  )
}

function TestimonialsSectionEditor({ data, onUpdate }: { data: any, onUpdate: (data: any) => void }) {
  const [formData, setFormData] = useState(data)

  // Sync formData with data prop when it changes
  useEffect(() => {
    setFormData(data)
  }, [data])

  const updateTestimonial = (index: number, field: string, value: string) => {
    const newTestimonials = [...formData.testimonials]
    newTestimonials[index] = { ...newTestimonials[index], [field]: value }
    setFormData({ ...formData, testimonials: newTestimonials })
  }

  const addTestimonial = () => {
    const newTestimonial = {
      id: `testimonial-${Date.now()}`,
      quote: '',
      name: '',
      role: '',
      avatar: ''
    }
    setFormData({ ...formData, testimonials: [...formData.testimonials, newTestimonial] })
  }

  const removeTestimonial = (index: number) => {
    const newTestimonials = formData.testimonials.filter((_: any, i: number) => i !== index)
    setFormData({ ...formData, testimonials: newTestimonials })
  }

  const saveChanges = () => {
    onUpdate(formData)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Testimonials Section</h3>
        <div className="flex gap-2">
          <button
            onClick={addTestimonial}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Add Testimonial
          </button>
          <button
            onClick={saveChanges}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Section Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Section Subtitle</label>
          <input
            type="text"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg"
          />
        </div>

        <div className="space-y-4">
          {formData.testimonials.map((testimonial: any, index: number) => (
            <div key={testimonial.id} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Testimonial {index + 1}</h4>
                <button
                  onClick={() => removeTestimonial(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Quote</label>
                  <textarea
                    value={testimonial.quote}
                    onChange={(e) => updateTestimonial(index, 'quote', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={testimonial.name}
                    onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <input
                    type="text"
                    value={testimonial.role}
                    onChange={(e) => updateTestimonial(index, 'role', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Avatar URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={testimonial.avatar}
                      onChange={(e) => updateTestimonial(index, 'avatar', e.target.value)}
                      className="flex-1 px-3 py-2 border border-border rounded-lg"
                    />
                    <ImageUploadButton
                      onUpload={(url) => updateTestimonial(index, 'avatar', url)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PartnersSectionEditor({ data, onUpdate }: { data: any, onUpdate: (data: any) => void }) {
  const [formData, setFormData] = useState({
    ...data,
    platforms: data.platforms || []
  })

  // Sync formData with data prop when it changes
  useEffect(() => {
    setFormData({
      ...data,
      platforms: data.platforms || []
    })
  }, [data])

  const updatePlatform = (index: number, field: string, value: string) => {
    const newPlatforms = [...(formData.platforms || [])]
    newPlatforms[index] = { ...newPlatforms[index], [field]: value }
    setFormData({ ...formData, platforms: newPlatforms })
  }

  const addPlatform = () => {
    const newPlatform = {
      name: '',
      logo: '',
      icon: '',
      color: '#000000',
      url: ''
    }
    const currentPlatforms = formData.platforms || []
    setFormData({ ...formData, platforms: [...currentPlatforms, newPlatform] })
  }

  const removePlatform = (index: number) => {
    const currentPlatforms = formData.platforms || []
    const newPlatforms = currentPlatforms.filter((_: any, i: number) => i !== index)
    setFormData({ ...formData, platforms: newPlatforms })
  }

  const saveChanges = () => {
    onUpdate(formData)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Partners Section</h3>
        <div className="flex gap-2">
          <button
            onClick={addPlatform}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Add Platform
          </button>
          <button
            onClick={saveChanges}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Section Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Section Subtitle</label>
          <input
            type="text"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg"
          />
        </div>

        <div className="space-y-4">
          {(formData.platforms || []).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No platforms added yet. Click "Add Platform" to add a new partner.
            </p>
          )}
          {(formData.platforms || []).map((platform: any, index: number) => (
            <div key={index} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Platform {index + 1}</h4>
                <button
                  onClick={() => removePlatform(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Partner Name</label>
                  <input
                    type="text"
                    value={platform.name}
                    onChange={(e) => updatePlatform(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg"
                    placeholder="Partner name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Link URL</label>
                  <input
                    type="text"
                    value={platform.url}
                    onChange={(e) => updatePlatform(index, 'url', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg"
                    placeholder="https://..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Logo (Image URL or Upload)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={platform.logo || ''}
                      onChange={(e) => updatePlatform(index, 'logo', e.target.value)}
                      className="flex-1 px-3 py-2 border border-border rounded-lg"
                      placeholder="https://... or upload logo"
                    />
                    <ImageUploadButton
                      onUpload={(url) => updatePlatform(index, 'logo', url)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    If you upload a logo, it will be used instead of icon. Leave empty to use icon below.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Icon (Lucide icon name) - Optional</label>
                  <input
                    type="text"
                    value={platform.icon || ''}
                    onChange={(e) => updatePlatform(index, 'icon', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg"
                    placeholder="Music, Podcast, etc. (only if no logo)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Color (for icon background)</label>
                  <input
                    type="color"
                    value={platform.color || '#000000'}
                    onChange={(e) => updatePlatform(index, 'color', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg h-10"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ContactSectionEditor({ data, onUpdate }: { data: any, onUpdate: (data: any) => void }) {
  const [formData, setFormData] = useState({
    ...data,
    socialLinks: data.socialLinks || []
  })

  // Sync formData with data prop when it changes
  useEffect(() => {
    setFormData({
      ...data,
      socialLinks: data.socialLinks || []
    })
  }, [data])

  const updateSocialLink = (index: number, field: string, value: string) => {
    const currentSocialLinks = formData.socialLinks || []
    const newSocialLinks = [...currentSocialLinks]
    newSocialLinks[index] = { ...newSocialLinks[index], [field]: value }
    setFormData({ ...formData, socialLinks: newSocialLinks })
  }

  const addSocialLink = () => {
    const newSocialLink = {
      name: '',
      icon: '',
      logo: '',
      href: '',
      color: '#000000'
    }
    const currentSocialLinks = formData.socialLinks || []
    setFormData({ ...formData, socialLinks: [...currentSocialLinks, newSocialLink] })
  }

  const removeSocialLink = (index: number) => {
    const currentSocialLinks = formData.socialLinks || []
    const newSocialLinks = currentSocialLinks.filter((_: any, i: number) => i !== index)
    setFormData({ ...formData, socialLinks: newSocialLinks })
  }

  const saveChanges = () => {
    onUpdate(formData)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Contact Section</h3>
        <button
          onClick={saveChanges}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Save Changes
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Section Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Section Subtitle</label>
          <input
            type="text"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Social Links</label>
              <p className="text-xs text-muted-foreground">Add your social media accounts</p>
            </div>
            <button
              onClick={addSocialLink}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Social Account
            </button>
          </div>
          
          <div className="space-y-4">
            {(formData.socialLinks || []).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No social links added yet. Click "Add Link" to add a new social account.
              </p>
            )}
            {(formData.socialLinks || []).map((link: any, index: number) => (
              <div key={index} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Social Link {index + 1}</h4>
                  <button
                    onClick={() => removeSocialLink(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <input
                      type="text"
                      value={link.name}
                      onChange={(e) => updateSocialLink(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg"
                      placeholder="Instagram, Twitter, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">URL</label>
                    <input
                      type="text"
                      value={link.href}
                      onChange={(e) => updateSocialLink(index, 'href', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Logo (Image URL or Upload)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={link.logo || ''}
                        onChange={(e) => updateSocialLink(index, 'logo', e.target.value)}
                        className="flex-1 px-3 py-2 border border-border rounded-lg"
                        placeholder="https://... or upload logo"
                      />
                      <ImageUploadButton
                        onUpload={(url) => updateSocialLink(index, 'logo', url)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      If you upload a logo, it will be used instead of icon. Leave empty to use icon below.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Icon (Lucide icon name) - Optional</label>
                    <input
                      type="text"
                      value={link.icon || ''}
                      onChange={(e) => updateSocialLink(index, 'icon', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg"
                      placeholder="Instagram, Twitter, etc. (only if no logo)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Color (for icon background)</label>
                    <input
                      type="color"
                      value={link.color || '#000000'}
                      onChange={(e) => updateSocialLink(index, 'color', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg h-10"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function FooterSectionEditor({ data, onUpdate }: { data: any, onUpdate: (data: any) => void }) {
  const [formData, setFormData] = useState(data)

  // Sync formData with data prop when it changes
  useEffect(() => {
    setFormData(data)
  }, [data])

  const updateQuickLink = (index: number, field: string, value: string) => {
    const newQuickLinks = [...formData.quickLinks]
    newQuickLinks[index] = { ...newQuickLinks[index], [field]: value }
    setFormData({ ...formData, quickLinks: newQuickLinks })
  }

  const updateSocialLink = (index: number, field: string, value: string) => {
    const newSocialLinks = [...formData.socialLinks]
    newSocialLinks[index] = { ...newSocialLinks[index], [field]: value }
    setFormData({ ...formData, socialLinks: newSocialLinks })
  }

  const addQuickLink = () => {
    const newQuickLink = { name: '', href: '' }
    setFormData({ ...formData, quickLinks: [...formData.quickLinks, newQuickLink] })
  }

  const removeQuickLink = (index: number) => {
    const newQuickLinks = formData.quickLinks.filter((_: any, i: number) => i !== index)
    setFormData({ ...formData, quickLinks: newQuickLinks })
  }

  const addSocialLink = () => {
    const newSocialLink = { name: '', icon: '', href: '' }
    setFormData({ ...formData, socialLinks: [...formData.socialLinks, newSocialLink] })
  }

  const removeSocialLink = (index: number) => {
    const newSocialLinks = formData.socialLinks.filter((_: any, i: number) => i !== index)
    setFormData({ ...formData, socialLinks: newSocialLinks })
  }

  const saveChanges = () => {
    onUpdate(formData)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Footer Section</h3>
        <button
          onClick={saveChanges}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Save Changes
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Logo URL</label>
            <input
              type="text"
              value={formData.logo}
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Quick Links</label>
            <button
              onClick={addQuickLink}
              className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
            >
              Add Link
            </button>
          </div>
          
          <div className="space-y-2">
            {formData.quickLinks.map((link: any, index: number) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={link.name}
                  onChange={(e) => updateQuickLink(index, 'name', e.target.value)}
                  className="flex-1 px-3 py-2 border border-border rounded-lg"
                  placeholder="Link name"
                />
                <input
                  type="text"
                  value={link.href}
                  onChange={(e) => updateQuickLink(index, 'href', e.target.value)}
                  className="flex-1 px-3 py-2 border border-border rounded-lg"
                  placeholder="Link URL"
                />
                <button
                  onClick={() => removeQuickLink(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Social Links</label>
            <button
              onClick={addSocialLink}
              className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
            >
              Add Link
            </button>
          </div>
          
          <div className="space-y-2">
            {formData.socialLinks.map((link: any, index: number) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={link.name}
                  onChange={(e) => updateSocialLink(index, 'name', e.target.value)}
                  className="flex-1 px-3 py-2 border border-border rounded-lg"
                  placeholder="Social platform name"
                />
                <input
                  type="text"
                  value={link.icon}
                  onChange={(e) => updateSocialLink(index, 'icon', e.target.value)}
                  className="flex-1 px-3 py-2 border border-border rounded-lg"
                  placeholder="Icon name"
                />
                <input
                  type="text"
                  value={link.href}
                  onChange={(e) => updateSocialLink(index, 'href', e.target.value)}
                  className="flex-1 px-3 py-2 border border-border rounded-lg"
                  placeholder="Social URL"
                />
                <button
                  onClick={() => removeSocialLink(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function NavbarSectionEditor({ data, onUpdate }: { data: any, onUpdate: (data: any) => void }) {
  const [formData, setFormData] = useState(data)

  // Sync formData with data prop when it changes
  useEffect(() => {
    setFormData(data)
  }, [data])

  const updateNavLink = (index: number, field: string, value: string) => {
    const newNavLinks = [...formData.navLinks]
    newNavLinks[index] = { ...newNavLinks[index], [field]: value }
    setFormData({ ...formData, navLinks: newNavLinks })
  }

  const addNavLink = () => {
    const newNavLink = { href: '', label: '' }
    setFormData({ ...formData, navLinks: [...formData.navLinks, newNavLink] })
  }

  const removeNavLink = (index: number) => {
    const newNavLinks = formData.navLinks.filter((_: any, i: number) => i !== index)
    setFormData({ ...formData, navLinks: newNavLinks })
  }

  const saveChanges = () => {
    onUpdate(formData)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Navigation Section</h3>
        <button
          onClick={saveChanges}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Save Changes
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Logo URL</label>
          <input
            type="text"
            value={formData.logo}
            onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">CTA Text</label>
          <input
            type="text"
            value={formData.ctaText}
            onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">CTA Link</label>
          <input
            type="text"
            value={formData.ctaLink}
            onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Navigation Links</label>
            <button
              onClick={addNavLink}
              className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
            >
              Add Link
            </button>
          </div>
          
          <div className="space-y-2">
            {formData.navLinks.map((link: any, index: number) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={link.href}
                  onChange={(e) => updateNavLink(index, 'href', e.target.value)}
                  className="flex-1 px-3 py-2 border border-border rounded-lg"
                  placeholder="Link URL (#about, /page, etc.)"
                />
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => updateNavLink(index, 'label', e.target.value)}
                  className="flex-1 px-3 py-2 border border-border rounded-lg"
                  placeholder="Link label"
                />
                <button
                  onClick={() => removeNavLink(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
