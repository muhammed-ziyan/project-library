'use client'

import { useAdminAuth } from '@/lib/admin-auth'
import { AdminUploader } from '@/components/admin-uploader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText } from 'lucide-react'

export default function AdminUploadPage() {
  const { token } = useAdminAuth()

  if (!token) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Upload Projects</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Upload and manage project JSON files
          </p>
        </div>
      </div>

      {/* Upload Component */}
      <div className="max-w-4xl">
        <AdminUploader token={token} />
      </div>

      {/* Help Section */}
      <div className="max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              JSON Format Guide
            </CardTitle>
            <CardDescription>
              Learn how to structure your project JSON files
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Required Fields:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• <code>slug</code> - Unique project identifier</li>
                <li>• <code>title</code> - Project name</li>
                <li>• <code>shortDesc</code> - Brief description</li>
                <li>• <code>longDesc</code> - Detailed description</li>
                <li>• <code>classRange</code> - Min/max class levels</li>
                <li>• <code>level</code> - BEGINNER, INTERMEDIATE, or ADVANCED</li>
                <li>• <code>guidance</code> - FULLY_GUIDED, SEMI_GUIDED, or UNGUIDED</li>
                <li>• <code>steps</code> - Array of project steps</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Optional Fields:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• <code>subjects</code> - Array of subject areas</li>
                <li>• <code>tags</code> - Array of project tags</li>
                <li>• <code>tools</code> - Array of required tools</li>
                <li>• <code>prerequisites</code> - Array of prerequisites</li>
                <li>• <code>durationHrs</code> - Estimated hours</li>
                <li>• <code>submission</code> - Submission requirements</li>
              </ul>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Example JSON Structure:</h4>
              <pre className="text-xs text-muted-foreground overflow-x-auto">
{`{
  "slug": "digit-recognizer-cnn",
  "title": "Handwritten Digit Recognizer",
  "shortDesc": "Build a CNN to classify MNIST digits",
  "longDesc": "Students train a CNN on MNIST...",
  "classRange": { "min": 9, "max": 12 },
  "level": "INTERMEDIATE",
  "guidance": "FULLY_GUIDED",
  "subjects": ["Computer Science", "Mathematics"],
  "tags": ["CNN", "Vision", "Classification"],
  "tools": ["Python", "TensorFlow", "Colab"],
  "prerequisites": ["Basic Python", "Matrices"],
  "durationHrs": 8,
  "steps": [
    {
      "order": 1,
      "title": "Setup & Dataset",
      "description": "Open the starter notebook...",
      "checklist": [
        { "order": 1, "text": "Open Colab and copy notebook" }
      ],
      "resources": [
        { "title": "Starter Notebook", "url": "https://...", "type": "notebook" }
      ]
    }
  ],
  "submission": {
    "type": "LINK",
    "instruction": "Submit the public link to your demo",
    "allowedTypes": []
  }
}`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
