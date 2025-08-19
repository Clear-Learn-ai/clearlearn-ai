'use client'

import { useState } from 'react'
import { useSubmitFeedback, useCurrentContent } from '@/lib/store'
import { cn } from '@/lib/utils'

const UNDERSTANDING_OPTIONS = [
  { value: false, label: "I'm still confused", icon: "😕", color: "text-red-600 bg-red-50 border-red-200" },
  { value: 'partially', label: "I understand some parts", icon: "🤔", color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
  { value: true, label: "I understand completely", icon: "😊", color: "text-green-600 bg-green-50 border-green-200" }
] as const

const RATING_LABELS = [
  "Poor", "Fair", "Good", "Very Good", "Excellent"
]

export function FeedbackMechanism() {
  const [selectedUnderstanding, setSelectedUnderstanding] = useState<boolean | 'partially' | null>(null)
  const [rating, setRating] = useState<number>(0)
  const [comments, setComments] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const currentContent = useCurrentContent()
  const submitFeedback = useSubmitFeedback()
  
  if (!currentContent) return null
  
  const handleSubmit = async () => {
    if (selectedUnderstanding === null || rating === 0) return
    
    setIsSubmitting(true)
    
    try {
      submitFeedback({
        contentId: currentContent.id,
        understood: selectedUnderstanding === true,
        rating,
        comments: comments.trim() || undefined
      })
      
      setIsSubmitted(true)
      
      // Reset form after a delay
      setTimeout(() => {
        setSelectedUnderstanding(null)
        setRating(0)
        setComments('')
        setIsSubmitted(false)
      }, 3000)
      
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const canSubmit = selectedUnderstanding !== null && rating > 0 && !isSubmitting && !isSubmitted
  
  if (isSubmitted) {
    return (
      <div className="learning-card p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Thank you for your feedback!</h3>
          <p className="text-sm text-gray-600">Your input helps us improve the learning experience.</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="learning-card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          How well did you understand this explanation?
        </h3>
        <p className="text-sm text-gray-600">
          Your feedback helps us create better learning experiences
        </p>
      </div>
      
      <div className="space-y-6">
        {/* Understanding Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Understanding Level
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {UNDERSTANDING_OPTIONS.map((option) => (
              <button
                key={option.label}
                onClick={() => setSelectedUnderstanding(option.value)}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all duration-200",
                  "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500",
                  selectedUnderstanding === option.value 
                    ? option.color
                    : "bg-white border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="text-2xl mb-2">{option.icon}</div>
                <div className="text-sm font-medium">{option.label}</div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Rate this explanation (1-5 stars)
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={cn(
                  "p-1 rounded transition-colors duration-200",
                  "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500",
                  star <= rating ? "text-yellow-400" : "text-gray-300"
                )}
                title={RATING_LABELS[star - 1]}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm text-gray-600">
                {RATING_LABELS[rating - 1]}
              </span>
            )}
          </div>
        </div>
        
        {/* Comments */}
        <div>
          <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
            Additional Comments (Optional)
          </label>
          <textarea
            id="comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="What worked well? What could be improved? Any suggestions?"
            rows={3}
            className={cn(
              "w-full px-3 py-2 border border-gray-300 rounded-lg",
              "focus:ring-2 focus:ring-primary-500 focus:border-transparent",
              "resize-none transition-all duration-200"
            )}
            maxLength={500}
          />
          <div className="text-xs text-gray-500 mt-1">
            {comments.length}/500 characters
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={cn(
              "px-6 py-2 rounded-lg font-medium transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary-500",
              canSubmit
                ? "bg-primary-600 text-white hover:bg-primary-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting...</span>
              </div>
            ) : (
              'Submit Feedback'
            )}
          </button>
        </div>
      </div>
      
      {/* Feedback Summary */}
      {(selectedUnderstanding !== null || rating > 0) && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <div className="text-sm text-gray-600">
            <strong>Your feedback:</strong>
            {selectedUnderstanding !== null && (
              <span className="ml-2">
                Understanding: {
                  selectedUnderstanding === true ? 'Complete' :
                  selectedUnderstanding === 'partially' ? 'Partial' : 'Confused'
                }
              </span>
            )}
            {rating > 0 && (
              <span className="ml-2">
                • Rating: {rating}/5 stars
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}