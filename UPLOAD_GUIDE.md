# Enhanced JSON Upload System

This guide covers the improved JSON file upload system for the Project Library, featuring better error handling, validation, and user experience.

## Features

### 🚀 **Enhanced Error Handling**
- Detailed validation error messages with field-specific feedback
- Graceful fallback between upload methods
- Comprehensive error reporting for batch uploads
- Retry mechanism for failed uploads

### 📊 **Progress Tracking**
- Real-time upload status for individual files
- Batch upload progress with detailed results
- Visual indicators for success/failure states
- Upload summary with statistics

### 🔄 **Multiple Upload Modes**
- **Individual Files**: Upload multiple JSON files separately
- **Batch Upload**: Upload a single JSON file containing an array of projects
- **Mixed Mode**: Automatic detection and handling

### 🛡️ **Robust Validation**
- Pre-upload validation with detailed error messages
- File size limits (10MB individual, 50MB batch)
- JSON syntax validation
- Schema validation using Zod
- Required field checking

## Backend Improvements

### New Endpoints

#### 1. Enhanced Individual Upload (`/projects/import`)
```typescript
// Improved error handling with detailed validation
POST /projects/import
Content-Type: multipart/form-data
Headers: x-admin-key: your-key

// Response includes detailed error information
{
  "success": true,
  "project": {
    "id": "uuid",
    "slug": "project-slug",
    "title": "Project Title"
  }
}
```

#### 2. Enhanced JSON Upload (`/projects/import-json`)
```typescript
// Direct JSON upload with better validation
POST /projects/import-json
Content-Type: application/json
Headers: x-admin-key: your-key

// Body: Project JSON object
```

#### 3. New Batch Upload (`/projects/import-batch`)
```typescript
// Batch upload for multiple projects
POST /projects/import-batch
Content-Type: multipart/form-data
Headers: x-admin-key: your-key

// Response includes detailed results
{
  "success": true,
  "results": {
    "successful": [...],
    "failed": [...],
    "total": 10
  },
  "summary": {
    "total": 10,
    "successful": 8,
    "failed": 2
  }
}
```

### Error Response Format
```typescript
{
  "type": "https://docs/errors/validation",
  "title": "Validation Failed",
  "status": 400,
  "detail": "The project data does not meet the required format",
  "errors": [
    {
      "path": "title",
      "message": "String must contain at least 3 character(s)",
      "code": "too_small"
    }
  ]
}
```

## Frontend Improvements

### Enhanced Admin Uploader Component

#### Features
- **Upload Mode Selection**: Choose between individual files or batch upload
- **Real-time Validation**: Immediate feedback on file validation
- **Progress Tracking**: Visual indicators for upload status
- **Error Reporting**: Detailed error messages with field-specific feedback
- **Retry Mechanism**: Retry failed uploads individually
- **Download Reports**: Export error reports for batch uploads

#### Usage
```tsx
<AdminUploader token={adminToken} />
```

#### Upload Modes

**Individual Mode:**
- Upload multiple JSON files
- Each file contains a single project
- Individual progress tracking
- Per-file error handling

**Batch Mode:**
- Upload single JSON file
- File contains array of project objects
- Batch processing results
- Comprehensive error reporting

### File Validation

The component now performs comprehensive validation:

```typescript
// Required fields validation
- slug: minimum 3 characters
- title: minimum 3 characters  
- shortDesc: minimum 10 characters
- longDesc: minimum 10 characters
- classRange: must have min and max
- subjects: non-empty array
- steps: non-empty array
```

## Manual Upload Script

### Enhanced PowerShell Script

The `upload-manual.ps1` script now supports multiple upload modes:

#### Single Project Upload
```powershell
.\upload-manual.ps1 -FilePath "project.json"
```

#### Batch Upload
```powershell
.\upload-manual.ps1 -FilePath "projects.json" -BatchMode
```

#### Multiple Files Upload
```powershell
.\upload-manual.ps1 -FilePath "file1.json,file2.json,file3.json" -MultipleFiles
```

#### Verbose Output
```powershell
.\upload-manual.ps1 -FilePath "project.json" -Verbose
```

### Script Features
- **Automatic Detection**: Detects single vs batch JSON files
- **Fallback Handling**: Tries JSON upload first, falls back to file upload
- **Detailed Reporting**: Shows success/failure for each upload
- **Error Reporting**: Displays detailed error messages
- **Progress Tracking**: Shows upload progress and results

## JSON File Formats

### Single Project Format
```json
{
  "slug": "my-project",
  "title": "My Project",
  "shortDesc": "A short description",
  "longDesc": "A longer description",
  "classRange": {
    "min": 1,
    "max": 12
  },
  "level": "BEGINNER",
  "guidance": "FULLY_GUIDED",
  "subjects": ["Math", "Science"],
  "tags": ["education", "hands-on"],
  "tools": ["Python", "Jupyter"],
  "prerequisites": ["Basic programming"],
  "durationHrs": 2,
  "steps": [
    {
      "order": 1,
      "title": "Step 1",
      "description": "Description of step 1",
      "checklist": [
        {
          "order": 1,
          "text": "Complete task 1"
        }
      ],
      "resources": [
        {
          "title": "Resource 1",
          "url": "https://example.com",
          "type": "documentation"
        }
      ]
    }
  ],
  "submission": {
    "type": "LINK",
    "instruction": "Submit your project link",
    "allowedTypes": ["url"]
  }
}
```

### Batch Upload Format
```json
[
  {
    "slug": "project-1",
    "title": "Project 1",
    // ... project data
  },
  {
    "slug": "project-2", 
    "title": "Project 2",
    // ... project data
  }
]
```

## Error Handling

### Validation Errors
- **Field-specific errors**: Each validation error includes the field path
- **Detailed messages**: Clear descriptions of what's wrong
- **Error codes**: Standardized error codes for programmatic handling

### Upload Errors
- **Network errors**: Connection and timeout handling
- **Server errors**: 500-level error handling with logging
- **Validation errors**: 400-level errors with detailed feedback
- **File errors**: File size, format, and permission errors

### Retry Logic
- **Automatic retry**: Failed uploads can be retried individually
- **Fallback methods**: JSON upload falls back to file upload
- **Error reporting**: Detailed error reports for debugging

## Best Practices

### File Preparation
1. **Validate JSON**: Ensure files are valid JSON before upload
2. **Check Schema**: Verify all required fields are present
3. **Test Locally**: Use the manual script to test uploads
4. **Batch Processing**: Use batch upload for multiple projects

### Error Handling
1. **Review Errors**: Check validation errors before retrying
2. **Fix Issues**: Address validation errors in source files
3. **Use Reports**: Download error reports for batch uploads
4. **Monitor Progress**: Watch upload progress and status

### Performance
1. **File Sizes**: Keep individual files under 10MB
2. **Batch Sizes**: Keep batch files under 50MB
3. **Network**: Ensure stable internet connection
4. **Resources**: Monitor server resources during large uploads

## Troubleshooting

### Common Issues

**"Invalid JSON Format"**
- Check JSON syntax with a validator
- Ensure proper encoding (UTF-8)
- Verify file isn't corrupted

**"Validation Failed"**
- Check all required fields are present
- Verify field types match schema
- Review minimum length requirements

**"File Too Large"**
- Reduce file size or split into smaller files
- Use batch upload for multiple projects
- Compress JSON if possible

**"Upload Failed"**
- Check network connection
- Verify admin key is correct
- Check server logs for detailed errors

### Debug Mode

Enable verbose output for detailed debugging:

```powershell
.\upload-manual.ps1 -FilePath "project.json" -Verbose
```

This will show:
- Request details
- Response information
- Error details
- Processing steps

## Migration Guide

### From Old System
1. **Update API calls**: Use new endpoints with enhanced error handling
2. **Update validation**: Implement new validation logic
3. **Update UI**: Use new upload component with progress tracking
4. **Test thoroughly**: Verify all upload scenarios work correctly

### Backward Compatibility
- Old upload methods still work
- New features are additive
- Gradual migration supported
- Fallback mechanisms in place

## Support

For issues or questions:
1. Check error messages and logs
2. Use verbose mode for debugging
3. Review validation requirements
4. Test with sample files
5. Contact development team for complex issues
