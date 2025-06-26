// garden.js - Resonance Garden Visualization

class ResonanceGarden {
  constructor() {
    this.container = document.querySelector('.garden-container');
    if (!this.container) return;
    
    this.notes = [];
    this.connections = [];
    this.previewEl = null;
    this.isInitialized = false;
    
    // Bind methods
    this.handleLeafClick = this.handleLeafClick.bind(this);
    this.handleLeafHover = this.handleLeafHover.bind(this);
    this.handleLeafLeave = this.handleLeafLeave.bind(this);
    this.handleResize = this.handleResize.bind(this);
    
    // Add resize listener
    window.addEventListener('resize', this.handleResize);
    
    // Create note preview element
    this.createPreviewElement();
    
    // Load data and initialize garden
    this.loadGardenData().then(() => {
      this.renderGarden();
      this.isInitialized = true;
    });
  }
  
  // Load garden data from the Quartz site index
  async loadGardenData() {
    try {
      const response = await fetch('/static/contentIndex.json');
      const data = await response.json();
      
      // Process the content index to create garden elements
      this.notes = Object.entries(data).map(([path, note], index) => {
        // Extract folder to determine "branch" in the garden
        const pathParts = path.split('/');
        const folder = pathParts.length > 1 ? pathParts[0] : 'root';
        const tags = note.tags || [];
        
        return {
          id: index,
          path,
          title: note.title || path.split('/').pop().replace('.md', ''),
          folder,
          tags,
          description: note.description || '',
          // We'll calculate positions based on folder/tags later
          x: 0,
          y: 0
        };
      });
      
      // Generate connections between related notes (by tags or folder)
      this.generateConnections();
      
    } catch (error) {
      console.error('Failed to load garden data:', error);
      this.notes = [];
    }
  }
  
  // Generate connections between notes
  generateConnections() {
    this.connections = [];
    
    // Connect notes within the same folder
    const folderGroups = this.groupBy(this.notes, 'folder');
    
    Object.values(folderGroups).forEach(group => {
      if (group.length <= 1) return;
      
      // Connect notes within same folder
      for (let i = 0; i < group.length - 1; i++) {
        this.connections.push({
          source: group[i].id,
          target: group[i + 1].id,
          strength: 0.7
        });
      }
    });
    
    // Connect notes with shared tags
    const tagMap = {};
    this.notes.forEach(note => {
      if (!note.tags || note.tags.length === 0) return;
      
      note.tags.forEach(tag => {
        if (!tagMap[tag]) tagMap[tag] = [];
        tagMap[tag].push(note.id);
      });
    });
    
    // Create connections for notes sharing tags
    Object.values(tagMap).forEach(noteIds => {
      if (noteIds.length <= 1) return;
      
      for (let i = 0; i < noteIds.length - 1; i++) {
        for (let j = i + 1; j < noteIds.length; j++) {
          // Avoid duplicate connections
          if (!this.connections.some(c => 
            (c.source === noteIds[i] && c.target === noteIds[j]) || 
            (c.source === noteIds[j] && c.target === noteIds[i])
          )) {
            this.connections.push({
              source: noteIds[i],
              target: noteIds[j],
              strength: 0.3
            });
          }
        }
      }
    });
  }
  
  // Helper function to group items by a property
  groupBy(items, key) {
    return items.reduce((result, item) => {
      (result[item[key]] = result[item[key]] || []).push(item);
      return result;
    }, {});
  }
  
  // Calculate positions for each note
  calculatePositions() {
    const containerWidth = this.container.clientWidth;
    const containerHeight = this.container.clientHeight;
    
    // Group notes by folder
    const folderGroups = this.groupBy(this.notes, 'folder');
    const folderCount = Object.keys(folderGroups).length;
    
    // Assign base positions by folder
    let folderIndex = 0;
    Object.entries(folderGroups).forEach(([folder, notes]) => {
      const angle = (folderIndex / folderCount) * Math.PI * 2;
      const radius = Math.min(containerWidth, containerHeight) * 0.4;
      
      const centerX = containerWidth / 2 + Math.cos(angle) * radius * 0.5;
      const centerY = containerHeight / 2 + Math.sin(angle) * radius * 0.5;
      
      // Place notes in this folder in a cluster
      notes.forEach((note, i) => {
        const noteAngle = angle + (i / notes.length - 0.5) * Math.PI * 0.5;
        const noteRadius = radius * 0.3 + Math.random() * radius * 0.1;
        
        note.x = centerX + Math.cos(noteAngle) * noteRadius;
        note.y = centerY + Math.sin(noteAngle) * noteRadius;
        
        // Ensure notes stay within container
        note.x = Math.max(30, Math.min(containerWidth - 30, note.x));
        note.y = Math.max(30, Math.min(containerHeight - 30, note.y));
      });
      
      folderIndex++;
    });
  }
  
  // Render the garden visualization
  renderGarden() {
    if (!this.container) return;
    
    // Clear container
    this.container.innerHTML = '';
    
    // Calculate positions
    this.calculatePositions();
    
    // Create main branch from center
    const containerWidth = this.container.clientWidth;
    const containerHeight = this.container.clientHeight;
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    
    // Group notes by folder
    const folderGroups = this.groupBy(this.notes, 'folder');
    
    // Create root node
    const rootNode = document.createElement('div');
    rootNode.className = 'node';
    rootNode.style.left = `${centerX}px`;
    rootNode.style.top = `${centerY}px`;
    this.container.appendChild(rootNode);
    
    // Create branches for each folder
    Object.entries(folderGroups).forEach(([folder, notes]) => {
      if (!notes.length) return;
      
      // Find approximate center of this folder's notes
      const folderCenterX = notes.reduce((sum, note) => sum + note.x, 0) / notes.length;
      const folderCenterY = notes.reduce((sum, note) => sum + note.y, 0) / notes.length;
      
      // Create branch from root to folder center
      const branch = document.createElement('div');
      branch.className = 'branch';
      
      // Calculate branch position and rotation
      const dx = folderCenterX - centerX;
      const dy = folderCenterY - centerY;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      
      branch.style.width = `${length}px`;
      branch.style.left = `${centerX}px`;
      branch.style.top = `${centerY}px`;
      branch.style.transform = `rotate(${angle}deg)`;
      
      this.container.appendChild(branch);
      
      // Create folder node
      const folderNode = document.createElement('div');
      folderNode.className = 'node';
      folderNode.title = folder;
      folderNode.style.left = `${folderCenterX}px`;
      folderNode.style.top = `${folderCenterY}px`;
      this.container.appendChild(folderNode);
      
      // Create branches to each note in this folder
      notes.forEach(note => {
        const noteBranch = document.createElement('div');
        noteBranch.className = 'branch';
        
        const noteDx = note.x - folderCenterX;
        const noteDy = note.y - folderCenterY;
        const noteLength = Math.sqrt(noteDx * noteDx + noteDy * noteDy);
        const noteAngle = Math.atan2(noteDy, noteDx) * 180 / Math.PI;
        
        noteBranch.style.width = `${noteLength}px`;
        noteBranch.style.left = `${folderCenterX}px`;
        noteBranch.style.top = `${folderCenterY}px`;
        noteBranch.style.transform = `rotate(${noteAngle}deg)`;
        
        this.container.appendChild(noteBranch);
      });
    });
    
    // Create connections between related notes
    this.connections.forEach(connection => {
      const source = this.notes[connection.source];
      const target = this.notes[connection.target];
      
      if (!source || !target) return;
      
      // Use SVG for organic, thread-like connections
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.classList.add('connection-svg');
      svg.style.position = 'absolute';
      svg.style.width = '100%';
      svg.style.height = '100%';
      svg.style.top = '0';
      svg.style.left = '0';
      svg.style.pointerEvents = 'none';
      
      // Create curved path
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      
      // Calculate control points for curve
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const midX = (source.x + target.x) / 2;
      const midY = (source.y + target.y) / 2;
      
      // Add some organic variation to the curve
      const curveVariation = 30 + Math.random() * 30;
      const ctrlX = midX + (Math.random() - 0.5) * curveVariation;
      const ctrlY = midY + (Math.random() - 0.5) * curveVariation;
      
      // Draw path
      path.setAttribute('d', `M ${source.x} ${source.y} Q ${ctrlX} ${ctrlY} ${target.x} ${target.y}`);
      path.setAttribute('fill', 'none');
      
      // Determine style based on connection type/strength
      const strokeWidth = 1 + connection.strength * 2;
      let strokeColor;
      
      // Different colors for different types of connections
      if (connection.strength > 0.6) {
        // Strong connection - thread-like
        strokeColor = 'rgba(108, 86, 63, ' + connection.strength + ')';
      } else {
        // Weaker connection - more transparent
        strokeColor = 'rgba(140, 120, 100, ' + connection.strength + ')';
      }
      
      path.setAttribute('stroke', strokeColor);
      path.setAttribute('stroke-width', strokeWidth);
      path.setAttribute('stroke-dasharray', connection.strength > 0.5 ? '0' : '3,3');
      
      svg.appendChild(path);
      this.container.appendChild(svg);
    });
    
    // Create leaves for each note
    this.notes.forEach(note => {
      const leaf = document.createElement('div');
      leaf.className = 'leaf';
      leaf.dataset.noteId = note.id;
      leaf.dataset.path = note.path;
      leaf.title = note.title;
      
      leaf.style.left = `${note.x}px`;
      leaf.style.top = `${note.y}px`;
      
      // Add random animation delay for subtle movement
      leaf.style.setProperty('--delay', `${Math.random() * 2}s`);
      leaf.classList.add('animated');
      
      // Determine image based on folder/tags
      const imageIndex = this.getLeafImageIndex(note);
      leaf.style.backgroundImage = `url('/static/garden-elements/leaf-${imageIndex}.png')`;
      leaf.style.backgroundSize = 'contain';
      leaf.style.backgroundRepeat = 'no-repeat';
      leaf.style.backgroundPosition = 'center';
      
      // Randomize size slightly for organic feel
      const sizeVar = 0.8 + Math.random() * 0.4; // 80-120% of base size
      leaf.style.transform = `scale(${sizeVar}) rotate(${Math.random() * 360}deg)`;
      
      // Add event listeners
      leaf.addEventListener('click', this.handleLeafClick);
      leaf.addEventListener('mouseenter', this.handleLeafHover);
      leaf.addEventListener('mouseleave', this.handleLeafLeave);
      
      this.container.appendChild(leaf);
    });
  }
  
  // Create preview element for hover
  createPreviewElement() {
    this.previewEl = document.createElement('div');
    this.previewEl.className = 'note-preview';
    document.body.appendChild(this.previewEl);
  }
  
  // Handle leaf click - navigate to note
  handleLeafClick(e) {
    const leaf = e.currentTarget;
    const path = leaf.dataset.path;
    if (path) {
      window.location.href = `/${path.replace(/\.md$/, '')}`;
    }
  }
  
  // Handle leaf hover - show preview
  handleLeafHover(e) {
    const leaf = e.currentTarget;
    const noteId = parseInt(leaf.dataset.noteId);
    const note = this.notes[noteId];
    
    if (!note) return;
    
    // Position preview
    const rect = leaf.getBoundingClientRect();
    this.previewEl.style.left = `${rect.left + rect.width + 10}px`;
    this.previewEl.style.top = `${rect.top}px`;
    
    // Update preview content
    this.previewEl.innerHTML = `
      <h3>${note.title}</h3>
      <p>${note.description || 'No description available.'}</p>
      <p class="tags">${note.tags?.map(tag => `<span class="tag">#${tag}</span>`).join(' ') || ''}</p>
    `;
    
    // Show preview
    this.previewEl.classList.add('visible');
    
    // Adjust position if off-screen
    const previewRect = this.previewEl.getBoundingClientRect();
    if (previewRect.right > window.innerWidth) {
      this.previewEl.style.left = `${rect.left - previewRect.width - 10}px`;
    }
    if (previewRect.bottom > window.innerHeight) {
      this.previewEl.style.top = `${rect.top - (previewRect.bottom - window.innerHeight)}px`;
    }
  }
  
  // Handle leaf mouseleave - hide preview
  handleLeafLeave() {
    this.previewEl.classList.remove('visible');
  }
  
  // Handle window resize
  handleResize() {
    if (this.isInitialized) {
      this.renderGarden();
    }
  }
  
  // Determine which leaf image to use based on note properties
  getLeafImageIndex(note) {
    // Map folders to specific image sets
    const folderImageMap = {
      'Conversations': [1, 2, 3], // Fabric scraps
      'Insights': [4, 5, 6],      // Leaves
      'Resources': [7, 8, 9],      // Paper fragments
      'The Final Participation Project': [10, 11, 12] // Specialized elements
    };
    
    // Map tags to specific images
    const tagImageMap = {
      'thestrangebirds': [13, 14],
      'captainsimple': [15],
      'ai-collaboration': [16, 17],
      'knowing-field': [18, 19],
      'backstory': [20, 21]
    };
    
    // Check if note has a special tag that determines image
    if (note.tags && note.tags.length > 0) {
      for (const tag of note.tags) {
        if (tagImageMap[tag]) {
          const images = tagImageMap[tag];
          return images[Math.floor(Math.random() * images.length)];
        }
      }
    }
    
    // Otherwise use folder-based image
    if (folderImageMap[note.folder]) {
      const images = folderImageMap[note.folder];
      return images[Math.floor(Math.random() * images.length)];
    }
    
    // Default to generic images (1-3) if no matches
    return Math.floor(Math.random() * 3) + 1;
  }
}

// Initialize garden when the page is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize on pages with a garden container
  const gardenContainer = document.querySelector('.garden-container');
  if (gardenContainer) {
    new ResonanceGarden();
  }
});

// Export for use in Quartz
export default function() {
  // This will be called by Quartz, initialization is handled by the DOMContentLoaded event
}
