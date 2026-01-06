/**
 * Premium Media Library JavaScript
 * Handles advanced media management features
 */

class MediaLibrary {
    constructor() {
        this.selectedItems = new Set();
        this.currentView = 'grid';
        this.filters = {
            search: '',
            type: 'all',
            sortBy: 'uploadedAt',
            sortOrder: 'desc'
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.initializeFilters();
        this.setupKeyboardShortcuts();
    }

    bindEvents() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.handleSearch(e.target.value);
                }, 300);
            });
        }

        // Filter controls
        const typeFilter = document.getElementById('typeFilter');
        const sortFilter = document.getElementById('sortFilter');
        
        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                this.handleFilterChange('type', e.target.value);
            });
        }

        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                this.handleSortChange(sortBy, sortOrder);
            });
        }

        // View toggle
        const gridViewBtn = document.getElementById('gridViewBtn');
        const listViewBtn = document.getElementById('listViewBtn');
        
        if (gridViewBtn) {
            gridViewBtn.addEventListener('click', () => this.switchView('grid'));
        }
        if (listViewBtn) {
            listViewBtn.addEventListener('click', () => this.switchView('list'));
        }

        // Bulk operations
        this.bindBulkOperations();
        
        // Folder operations
        this.bindFolderOperations();
        
        // Media operations
        this.bindMediaOperations();

        // Selection handling
        this.bindSelectionEvents();
    }

    bindBulkOperations() {
        const bulkUploadBtn = document.getElementById('bulkUploadBtn');
        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
        const bulkMoveBtn = document.getElementById('bulkMoveBtn');
        const clearSelectionBtn = document.getElementById('clearSelectionBtn');

        if (bulkUploadBtn) {
            bulkUploadBtn.addEventListener('click', () => {
                window.location.href = '/media/new?bulk=true';
            });
        }

        if (bulkDeleteBtn) {
            bulkDeleteBtn.addEventListener('click', () => this.handleBulkDelete());
        }

        if (bulkMoveBtn) {
            bulkMoveBtn.addEventListener('click', () => this.handleBulkMove());
        }

        if (clearSelectionBtn) {
            clearSelectionBtn.addEventListener('click', () => this.clearSelection());
        }
    }

    bindFolderOperations() {
        const createFolderBtn = document.getElementById('createFolderBtn');
        const createFolderBtnEmpty = document.getElementById('createFolderBtnEmpty');
        
        if (createFolderBtn) {
            createFolderBtn.addEventListener('click', () => this.showCreateFolderModal());
        }
        if (createFolderBtnEmpty) {
            createFolderBtnEmpty.addEventListener('click', () => this.showCreateFolderModal());
        }

        // Folder edit buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.folder-edit-btn')) {
                const folderId = e.target.closest('.folder-edit-btn').dataset.folderId;
                this.showEditFolderModal(folderId);
            }
            
            if (e.target.closest('.folder-delete-btn')) {
                const folderId = e.target.closest('.folder-delete-btn').dataset.folderId;
                this.handleFolderDelete(folderId);
            }
        });
    }

    bindMediaOperations() {
        // Media delete buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.media-delete-btn')) {
                const mediaId = e.target.closest('.media-delete-btn').dataset.mediaId;
                this.handleMediaDelete(mediaId);
            }
        });
    }

    bindSelectionEvents() {
        // Media checkboxes
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('media-checkbox')) {
                const mediaId = e.target.dataset.mediaId;
                if (e.target.checked) {
                    this.selectedItems.add(mediaId);
                } else {
                    this.selectedItems.delete(mediaId);
                }
                this.updateBulkActionsBar();
            }
        });

        // Select all functionality (Ctrl+A)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'a' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                this.selectAll();
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // ESC to clear selection
            if (e.key === 'Escape') {
                this.clearSelection();
            }
            
            // Delete key to delete selected items
            if (e.key === 'Delete' && this.selectedItems.size > 0) {
                this.handleBulkDelete();
            }
            
            // Ctrl+U for upload
            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault();
                window.location.href = '/media/new';
            }
        });
    }

    initializeFilters() {
        // Get current filters from URL
        const urlParams = new URLSearchParams(window.location.search);
        this.filters.search = urlParams.get('search') || '';
        this.filters.type = urlParams.get('type') || 'all';
        this.filters.sortBy = urlParams.get('sortBy') || 'uploadedAt';
        this.filters.sortOrder = urlParams.get('sortOrder') || 'desc';
        this.currentView = urlParams.get('view') || 'grid';
    }

    handleSearch(query) {
        this.filters.search = query;
        this.applyFilters();
    }

    handleFilterChange(filterType, value) {
        this.filters[filterType] = value;
        this.applyFilters();
    }

    handleSortChange(sortBy, sortOrder) {
        this.filters.sortBy = sortBy;
        this.filters.sortOrder = sortOrder;
        this.applyFilters();
    }

    switchView(view) {
        this.currentView = view;
        const mediaContainer = document.getElementById('mediaContainer');
        const gridViewBtn = document.getElementById('gridViewBtn');
        const listViewBtn = document.getElementById('listViewBtn');
        
        if (view === 'list') {
            mediaContainer.className = 'space-y-4';
            gridViewBtn.classList.remove('bg-white', 'shadow-sm', 'text-indigo-600');
            gridViewBtn.classList.add('text-gray-600');
            listViewBtn.classList.add('bg-white', 'shadow-sm', 'text-indigo-600');
            listViewBtn.classList.remove('text-gray-600');
            
            // Update media items to list view
            document.querySelectorAll('.media-item').forEach(item => {
                item.classList.add('list-view');
                item.classList.remove('grid-view');
            });
        } else {
            mediaContainer.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6';
            listViewBtn.classList.remove('bg-white', 'shadow-sm', 'text-indigo-600');
            listViewBtn.classList.add('text-gray-600');
            gridViewBtn.classList.add('bg-white', 'shadow-sm', 'text-indigo-600');
            gridViewBtn.classList.remove('text-gray-600');
            
            // Update media items to grid view
            document.querySelectorAll('.media-item').forEach(item => {
                item.classList.add('grid-view');
                item.classList.remove('list-view');
            });
        }
        
        this.applyFilters();
    }

    applyFilters() {
        const params = new URLSearchParams();
        
        Object.keys(this.filters).forEach(key => {
            if (this.filters[key] && this.filters[key] !== 'all') {
                params.set(key, this.filters[key]);
            }
        });
        
        if (this.currentView !== 'grid') {
            params.set('view', this.currentView);
        }
        
        const currentFolder = window.location.pathname.includes('/folder/') 
            ? window.location.pathname.split('/folder/')[1] 
            : null;
        
        const baseUrl = currentFolder ? `/media/folder/${currentFolder}` : '/media';
        const newUrl = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
        
        window.location.href = newUrl;
    }

    selectAll() {
        const checkboxes = document.querySelectorAll('.media-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
            this.selectedItems.add(checkbox.dataset.mediaId);
        });
        this.updateBulkActionsBar();
    }

    clearSelection() {
        this.selectedItems.clear();
        document.querySelectorAll('.media-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        this.updateBulkActionsBar();
    }

    updateBulkActionsBar() {
        const bulkActionsBar = document.getElementById('bulkActionsBar');
        const selectedCount = document.getElementById('selectedCount');
        
        if (this.selectedItems.size > 0) {
            bulkActionsBar.classList.remove('hidden');
            selectedCount.textContent = `${this.selectedItems.size} item${this.selectedItems.size > 1 ? 's' : ''} selected`;
        } else {
            bulkActionsBar.classList.add('hidden');
        }
    }

    async handleBulkDelete() {
        if (this.selectedItems.size === 0) return;
        
        const confirmed = await this.showConfirmDialog(
            'Delete Selected Items',
            `Are you sure you want to delete ${this.selectedItems.size} selected item${this.selectedItems.size > 1 ? 's' : ''}? This action cannot be undone.`
        );
        
        if (!confirmed) return;
        
        try {
            const response = await fetch('/api/media/bulk-delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mediaIds: Array.from(this.selectedItems)
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification('Items deleted successfully', 'success');
                setTimeout(() => window.location.reload(), 1000);
            } else {
                this.showNotification('Failed to delete items', 'error');
            }
        } catch (error) {
            console.error('Bulk delete error:', error);
            this.showNotification('An error occurred while deleting items', 'error');
        }
    }

    async handleBulkMove() {
        if (this.selectedItems.size === 0) return;
        
        const targetFolder = await this.showFolderSelectDialog();
        if (targetFolder === null) return;
        
        try {
            const response = await fetch('/api/media/bulk-move', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mediaIds: Array.from(this.selectedItems),
                    targetFolder: targetFolder
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification('Items moved successfully', 'success');
                setTimeout(() => window.location.reload(), 1000);
            } else {
                this.showNotification('Failed to move items', 'error');
            }
        } catch (error) {
            console.error('Bulk move error:', error);
            this.showNotification('An error occurred while moving items', 'error');
        }
    }

    async handleMediaDelete(mediaId) {
        const confirmed = await this.showConfirmDialog(
            'Delete Media',
            'Are you sure you want to delete this media file? This action cannot be undone.'
        );
        
        if (!confirmed) return;
        
        try {
            const response = await fetch(`/api/media/${mediaId}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification('Media deleted successfully', 'success');
                setTimeout(() => window.location.reload(), 1000);
            } else {
                this.showNotification('Failed to delete media', 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            this.showNotification('An error occurred while deleting media', 'error');
        }
    }

    async handleFolderDelete(folderId) {
        const confirmed = await this.showConfirmDialog(
            'Delete Folder',
            'Are you sure you want to delete this folder? You can choose to delete all contents or move them to the parent folder.',
            [
                { text: 'Cancel', value: null, class: 'btn-secondary' },
                { text: 'Move Contents', value: 'move', class: 'btn-primary' },
                { text: 'Delete All', value: 'delete', class: 'btn-danger' }
            ]
        );
        
        if (!confirmed) return;
        
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/media/folder/${folderId}/delete`;
        
        const deleteContentsInput = document.createElement('input');
        deleteContentsInput.type = 'hidden';
        deleteContentsInput.name = 'deleteContents';
        deleteContentsInput.value = confirmed === 'delete' ? 'true' : 'false';
        
        form.appendChild(deleteContentsInput);
        document.body.appendChild(form);
        form.submit();
    }

    showCreateFolderModal() {
        this.showModal('Create New Folder', `
            <form id="createFolderForm" class="space-y-4">
                <div>
                    <label for="folderName" class="block text-sm font-medium text-gray-700 mb-2">Folder Name *</label>
                    <input type="text" id="folderName" name="name" required 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                           placeholder="Enter folder name">
                </div>
                <div>
                    <label for="folderDescription" class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea id="folderDescription" name="description" rows="3"
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Optional description"></textarea>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="folderColor" class="block text-sm font-medium text-gray-700 mb-2">Color</label>
                        <input type="color" id="folderColor" name="color" value="#6366f1"
                               class="w-full h-10 border border-gray-300 rounded-lg">
                    </div>
                    <div>
                        <label for="folderIcon" class="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                        <select id="folderIcon" name="icon" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                            <option value="folder">📁 Folder</option>
                            <option value="folder-open">📂 Open Folder</option>
                            <option value="images">🖼️ Images</option>
                            <option value="video">🎥 Videos</option>
                            <option value="music">🎵 Music</option>
                            <option value="file-alt">📄 Documents</option>
                            <option value="archive">📦 Archive</option>
                        </select>
                    </div>
                </div>
            </form>
        `, [
            { text: 'Cancel', value: false, class: 'btn-secondary' },
            { text: 'Create Folder', value: true, class: 'btn-primary' }
        ]).then(result => {
            if (result) {
                this.createFolder();
            }
        });
    }

    async createFolder() {
        const form = document.getElementById('createFolderForm');
        const formData = new FormData(form);
        
        // Get current folder from URL
        const currentFolder = window.location.pathname.includes('/folder/') 
            ? window.location.pathname.split('/folder/')[1] 
            : null;
        
        if (currentFolder) {
            formData.append('parent', currentFolder);
        }
        
        try {
            const response = await fetch('/media/folder', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                this.showNotification('Folder created successfully', 'success');
                setTimeout(() => window.location.reload(), 1000);
            } else {
                this.showNotification('Failed to create folder', 'error');
            }
        } catch (error) {
            console.error('Create folder error:', error);
            this.showNotification('An error occurred while creating folder', 'error');
        }
    }

    // Utility methods for modals and notifications
    showModal(title, content, buttons = []) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 z-50 overflow-y-auto';
            modal.innerHTML = `
                <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                    <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">${title}</h3>
                            <div class="mt-2">${content}</div>
                        </div>
                        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            ${buttons.map(btn => `
                                <button type="button" class="modal-btn ${btn.class} ml-3" data-value="${btn.value}">
                                    ${btn.text}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            modal.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal-btn')) {
                    const value = e.target.dataset.value;
                    document.body.removeChild(modal);
                    resolve(value === 'true' ? true : value === 'false' ? false : value);
                } else if (e.target === modal || e.target.classList.contains('bg-gray-500')) {
                    document.body.removeChild(modal);
                    resolve(false);
                }
            });
        });
    }

    showConfirmDialog(title, message, buttons = null) {
        const defaultButtons = [
            { text: 'Cancel', value: false, class: 'btn-secondary' },
            { text: 'Confirm', value: true, class: 'btn-danger' }
        ];
        
        return this.showModal(title, `<p class="text-gray-600">${message}</p>`, buttons || defaultButtons);
    }

    async showFolderSelectDialog() {
        try {
            const response = await fetch('/api/media/folders');
            const folders = await response.json();
            
            const folderOptions = folders.map(folder => 
                `<option value="${folder._id}">${folder.name}</option>`
            ).join('');
            
            const result = await this.showModal('Move to Folder', `
                <div class="space-y-4">
                    <p class="text-gray-600">Select the destination folder:</p>
                    <select id="targetFolder" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="">Root Directory</option>
                        ${folderOptions}
                    </select>
                </div>
            `, [
                { text: 'Cancel', value: false, class: 'btn-secondary' },
                { text: 'Move', value: true, class: 'btn-primary' }
            ]);
            
            if (result) {
                return document.getElementById('targetFolder').value || null;
            }
            return null;
        } catch (error) {
            console.error('Error loading folders:', error);
            this.showNotification('Failed to load folders', 'error');
            return null;
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
        
        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            info: 'bg-blue-500 text-white',
            warning: 'bg-yellow-500 text-white'
        };
        
        notification.classList.add(...colors[type].split(' '));
        notification.innerHTML = `
            <div class="flex items-center">
                <span>${message}</span>
                <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.parentElement.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

// Initialize the media library when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MediaLibrary();
});

// Additional utility functions
window.formatFileSize = function(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};