# Premium Media Management System

A comprehensive, user-friendly media management system built with Node.js, Express, MongoDB, and modern web technologies.

## 🚀 Features

### Core Functionality
- **File Upload & Management**: Support for images, videos, audio, documents, and other file types
- **Folder Organization**: Hierarchical folder structure with custom colors and icons
- **Advanced Search & Filtering**: Search by name, type, tags, and date ranges
- **Bulk Operations**: Select multiple files for bulk upload, delete, and move operations
- **Drag & Drop Interface**: Modern drag-and-drop file upload experience

### Enhanced User Experience
- **Multiple View Modes**: Grid and list view options
- **Real-time Preview**: Instant preview for images, videos, audio, and documents
- **Progress Tracking**: Upload progress indicators with detailed feedback
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Keyboard Shortcuts**: Efficient navigation with keyboard shortcuts

### Advanced Features
- **File Metadata**: Automatic extraction of file size, type, dimensions, and duration
- **Usage Analytics**: Track downloads, access patterns, and file statistics
- **Public/Private Files**: Control file visibility and access permissions
- **Tag Management**: Organize files with custom tags and categories
- **Breadcrumb Navigation**: Easy navigation through folder hierarchies

## 📁 File Structure

```
├── controllers/
│   ├── mediaController.js          # Enhanced media CRUD operations
│   └── mediaFolderController.js    # Advanced folder management
├── models/
│   ├── Media.js                    # Enhanced media model with metadata
│   └── MediaFolder.js              # Folder model with statistics
├── middleware/
│   └── upload.js                   # Advanced file upload handling
├── views/pages/media/
│   ├── index.ejs                   # Premium media library interface
│   ├── create.ejs                  # Multi-mode upload interface
│   ├── edit.ejs                    # Comprehensive edit form
│   └── show.ejs                    # Detailed media viewer
├── public/
│   ├── js/media-library.js         # Advanced JavaScript functionality
│   └── css/media-library.css       # Premium styling
└── routes/
    ├── webRoutes.js                # Enhanced web routes
    └── apiRoutes.js                # Comprehensive API endpoints
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Environment Variables
Create a `.env` file with the following variables:

```env
MONGO_URI=mongodb://localhost:27017/your-database
SESSION_SECRET=your-super-secret-session-key
NODE_ENV=development
PORT=3000
```

### Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

3. **Run the Application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

4. **Access the Application**
   - Open your browser and navigate to `http://localhost:3000`
   - Go to `/media` to access the media library

## 📚 API Documentation

### Media Endpoints

#### GET /api/media
Get all media files with advanced filtering options.

**Query Parameters:**
- `folder` - Filter by folder ID
- `type` - Filter by file type (image, video, audio, document, other)
- `search` - Search in title, description, and tags
- `sortBy` - Sort field (uploadedAt, title, fileSize)
- `sortOrder` - Sort direction (asc, desc)
- `page` - Page number for pagination
- `limit` - Items per page
- `tags` - Filter by tags (comma-separated)

**Response:**
```json
{
  "media": [...],
  "pagination": {
    "current": 1,
    "total": 5,
    "totalItems": 42
  }
}
```

#### POST /api/media
Upload a single media file.

**Form Data:**
- `file` - The media file (required)
- `type` - File type override
- `title` - Custom title
- `description` - File description
- `tags` - Comma-separated tags
- `folder` - Destination folder ID
- `isPublic` - Public access flag

#### POST /api/media/bulk
Upload multiple media files.

**Form Data:**
- `files` - Array of media files (max 10)
- `folder` - Destination folder ID
- `tags` - Common tags for all files
- `isPublic` - Public access flag for all files

#### PUT /api/media/:id
Update media file information.

#### DELETE /api/media/:id
Delete a media file.

#### POST /api/media/bulk-delete
Delete multiple media files.

**Body:**
```json
{
  "mediaIds": ["id1", "id2", "id3"]
}
```

#### POST /api/media/bulk-move
Move multiple media files to a different folder.

**Body:**
```json
{
  "mediaIds": ["id1", "id2", "id3"],
  "targetFolder": "folderId"
}
```

### Folder Endpoints

#### GET /api/media/folders
Get all folders with optional parent filtering.

#### GET /api/media/folder-tree
Get complete folder hierarchy as a tree structure.

#### POST /api/media/folders
Create a new folder.

**Body:**
```json
{
  "name": "Folder Name",
  "parent": "parentFolderId",
  "description": "Optional description",
  "color": "#6366f1",
  "icon": "folder"
}
```

## 🎨 User Interface Features

### Media Library Interface
- **Grid/List Toggle**: Switch between grid and list view modes
- **Advanced Search**: Real-time search with multiple filter options
- **Bulk Selection**: Select multiple items with checkboxes
- **Drag & Drop**: Upload files by dragging them into the interface
- **Responsive Design**: Optimized for all screen sizes

### Upload Interface
- **Three Upload Modes**:
  1. Single Upload - Traditional form-based upload
  2. Bulk Upload - Multiple file selection
  3. Drag & Drop - Modern drag-and-drop interface
- **Progress Tracking**: Real-time upload progress with detailed feedback
- **File Validation**: Client-side and server-side file type validation
- **Preview Generation**: Automatic thumbnail generation for supported formats

### Media Viewer
- **Full-Screen Preview**: Click to view images in full-screen modal
- **Video/Audio Player**: Built-in media players for video and audio files
- **PDF Viewer**: Embedded PDF viewer for document files
- **Metadata Display**: Comprehensive file information and statistics
- **Quick Actions**: Download, copy URL, edit, and delete options

## ⌨️ Keyboard Shortcuts

- `Ctrl + A` - Select all media items
- `Ctrl + U` - Open upload interface
- `Delete` - Delete selected items
- `Escape` - Clear selection or close modals

## 🔧 Configuration Options

### File Upload Limits
Configure in `middleware/upload.js`:
```javascript
const limits = {
  fileSize: 100 * 1024 * 1024, // 100MB max file size
  files: 10, // Max 10 files at once for bulk upload
};
```

### Supported File Types
The system supports a wide range of file types:
- **Images**: JPEG, PNG, GIF, WebP, SVG
- **Videos**: MP4, MPEG, MOV, AVI, WebM
- **Audio**: MP3, WAV, OGG, M4A
- **Documents**: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX
- **Text**: TXT, CSV
- **Archives**: ZIP, RAR

### Folder Customization
Folders support:
- Custom colors (hex color codes)
- Custom icons (FontAwesome icon names)
- Descriptions and metadata
- Hierarchical organization

## 📊 Analytics & Statistics

The system tracks various metrics:
- **File Statistics**: Total files, folders, and storage usage
- **Usage Analytics**: Download counts and access patterns
- **Folder Statistics**: File counts and total size per folder
- **Upload History**: Track when and who uploaded files

## 🔒 Security Features

- **File Type Validation**: Server-side validation of file types and extensions
- **Size Limits**: Configurable file size limits to prevent abuse
- **Access Control**: Public/private file access controls
- **Session Management**: Secure session handling with MongoDB store
- **Input Sanitization**: Protection against XSS and injection attacks

## 🚀 Performance Optimizations

- **Lazy Loading**: Images and media are loaded on demand
- **Pagination**: Large media libraries are paginated for better performance
- **Caching**: Static assets are cached with appropriate headers
- **Compression**: Response compression for faster loading
- **Database Indexing**: Optimized database queries with proper indexing

## 🐛 Troubleshooting

### Common Issues

1. **Upload Fails**
   - Check file size limits
   - Verify file type is supported
   - Ensure sufficient disk space

2. **Images Not Loading**
   - Verify static file serving is configured
   - Check file permissions
   - Ensure uploads directory exists

3. **Search Not Working**
   - Verify MongoDB text indexes are created
   - Check search query syntax
   - Ensure database connection is stable

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` in your `.env` file.

## 🔄 Future Enhancements

Planned features for future releases:
- **Cloud Storage Integration**: Support for AWS S3, Google Cloud Storage
- **Image Processing**: Automatic thumbnail generation and image optimization
- **Video Transcoding**: Automatic video format conversion
- **Advanced Permissions**: Role-based access control
- **API Rate Limiting**: Prevent abuse with rate limiting
- **Backup & Sync**: Automatic backup and synchronization features
- **Mobile App**: Native mobile application for media management

## 📝 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines before submitting pull requests.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the troubleshooting section

---

**Built with ❤️ using modern web technologies for the best user experience.**