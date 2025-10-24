"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

interface Video {
  id: string
  title: string
  description?: string
  src: string
  uploadDate: string
  featured: boolean
}

interface EditVideoModalProps {
  video: Video
  onClose: () => void
  onSave: (video: Video) => void
}

export default function EditVideoModal({ video, onClose, onSave }: EditVideoModalProps) {
  const [title, setTitle] = useState(video.title)
  const [description, setDescription] = useState(video.description || "")
  const [featured, setFeatured] = useState(video.featured)

  const handleSave = () => {
    if (!title.trim()) {
      alert("Please enter a title")
      return
    }

    onSave({
      ...video,
      title: title.trim(),
      description: description.trim(),
      featured
    })
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-card border border-border rounded-lg shadow-xl max-w-md w-full"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Edit Video</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-lg transition-colors"
            >
              <X size={20} className="text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Video Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                placeholder="Enter video title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background resize-none"
                placeholder="Enter video description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Status
              </label>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => setFeatured(false)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    !featured
                      ? 'bg-muted border-border text-foreground'
                      : 'bg-transparent border-border text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  Draft
                </button>
                <button
                  type="button"
                  onClick={() => setFeatured(true)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    featured
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-transparent border-border text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  Published
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
