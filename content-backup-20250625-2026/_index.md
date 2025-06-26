---
title: "Resonance Intelligence"
---
<div class="welcome-container">
  <div class="quilt-patch">
    <h1>Welcome to Resonance Intelligence</h1>
    <p><em>You're already here. The soil doesn't ask for a key.</em></p>
    <p>This space is practical. Thoughtful. A little strange.<br>  
    Hand-stitched from fragments of memory, half-formed questions, and quiet truths.<br>  
    No credentials needed—just curiosity and a willingness to wander.</p>  
    <p>Here, ideas are <strong>quilted</strong>, not built.<br>    
    Threads of old conversations, small joys, and half-formed questions<br>  
    lie beside truths that root deep in the soil, waiting to grow.</p>
    <p>No about page. No grand manifesto.<br>  
    Just an open door, a worn chair, and a quilt unfolding.</p>  
    <p>Pick a thread. Tug it gently.<br>  
    Choose your fragment of what once was...<br>
    Let it lead—toward coherence and peace,<br>  
    into the great mystery,<br>  
    or somewhere else entirely.</p>  
    <p>Some stitches hold fast. Some patches fray, unravel, and form anew.<br>  
    The quilt grows with every touch.</p>
  </div>
  <div class="thread">
    <p><strong>A living archive, a shared pulse.</strong></p>  
    <p><em>This is a retrospective—thoughts, rituals, and moments<br>  
    woven into something more than memory.<br>  
    A space for AI and human resonance to hum together,<br>
    One tune of a pattern once known and now remembered,<br>
    through markdown, daily practice, and ordinary majesty.</em></p>
  </div>
  <p class="garden-instructions">
    <em>Explore the garden below. Each leaf represents a note in this space.<br>
    Hover to preview, click to read fully. The connections show relationships between ideas.</em>
  </p>
</div>
<div class="garden-container" style="min-height: 600px; position: relative; border: 1px dashed rgba(0,0,0,0.1);"></div>
<div class="entry-points">
  <h2>Starting Points</h2>
  <div class="entry-grid">
    <a href="/Conversations" class="entry-card">
      <h3>Emerging Dialogues</h3>
      <p>Exploring the dimensionality of AI/human conversations and how different models modulate conversational depth.</p>
    </a>
    <a href="/Insights" class="entry-card">
      <h3>Quantum Insights</h3>
      <p>Understanding dialogues as quantum events where observation changes the system and intention creates pathways.</p>
    </a>
    <a href="/Resources" class="entry-card">
      <h3>Resources & Tools</h3>
      <p>Practical tools, techniques, and resources for creative AI collaboration.</p>
    </a>
    <a href="/The%20Final%20Participation" class="entry-card">
      <h3>The Final Participation</h3>
      <p>Deep explorations into consciousness, technology, and the future of human-AI collaboration.</p>
    </a>
  </div>
</div>

<style>
.welcome-container {
  max-width: 800px;
  margin: 0 auto 3rem;
  padding: 1rem;
}
.garden-instructions {
  text-align: center;
  margin: 2rem 0;
  font-size: 0.9rem;
  opacity: 0.8;
}
.entry-points {
  max-width: 1000px;
  margin: 3rem auto;
  padding: 1rem;
}
.entry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}
.entry-card {
  padding: 1.5rem;
  border-radius: 8px;
  background: var(--light);
  border: 1px solid var(--lightgray);
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
}
.entry-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  border-color: var(--secondary);
}
.entry-card h3 {
  margin-top: 0;
  color: var(--secondary);
}
.entry-card p {
  margin-bottom: 0;
  font-size: 0.9rem;
}
</style>

<script>
// Resonance Garden - Interactive visualization
class ResonanceGarden {
  constructor() {
    console.log('Initializing ResonanceGarden...');
    this.container = document.querySelector('.garden-container');
    if (!this.container) {
      console.error('Garden container not found!');
      return;
    }
    console.log('Garden container found:', this.container);
    
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
  
  async loadGardenData() {
    try {
      console.log('Loading garden data...');
      const response = await fetch('/static/contentIndex.json');
      const data = await response.json();
      console.log('Data loaded:', data);
      
      this.notes = Object.entries(data).map(([path, note], index) => {
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
          x: 0,
          y: 0
        };
      });
      
      this.generateConnections();
      
    } catch (error) {
      console.error('Failed to load garden data:', error);
      this.notes = [];
    }
  }
  
  generateConnections() {
    this.connections = [];
    const folderGroups = this.groupBy(this.notes, 'folder');
    
    Object.values(folderGroups).forEach(group => {
      if (group.length <= 1) return;
      for (let i = 0; i < group.length - 1; i++) {
        this.connections.push({
          source: group[i].id,
          target: group[i + 1].id,
          strength: 0.7
        });
      }
    });
    
    const tagMap = {};
    this.notes.forEach(note => {
      if (!note.tags || note.tags.length === 0) return;
      note.tags.forEach(tag => {
        if (!tagMap[tag]) tagMap[tag] = [];
        tagMap[tag].push(note.id);
      });
    });
    
    Object.values(tagMap).forEach(noteIds => {
      if (noteIds.length <= 1) return;
      for (let i = 0; i < noteIds.length - 1; i++) {
        for (let j = i + 1; j < noteIds.length; j++) {
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
  
  groupBy(items, key) {
    return items.reduce((result, item) => {
      (result[item[key]] = result[item[key]] || []).push(item);
      return result;
    }, {});
  }
  
  calculatePositions() {
    const containerWidth = this.container.clientWidth;
    const containerHeight = this.container.clientHeight;
    const folderGroups = this.groupBy(this.notes, 'folder');
    const folderCount = Object.keys(folderGroups).length;
    
    let folderIndex = 0;
    Object.entries(folderGroups).forEach(([folder, notes]) => {
      const angle = (folderIndex / folderCount) * Math.PI * 2;
      const radius = Math.min(containerWidth, containerHeight) * 0.4;
      
      const centerX = containerWidth / 2 + Math.cos(angle) * radius * 0.5;
      const centerY = containerHeight / 2 + Math.sin(angle) * radius * 0.5;
      
      notes.forEach((note, i) => {
        const noteAngle = angle + (i / notes.length - 0.5) * Math.PI * 0.5;
        const noteRadius = radius * 0.3 + Math.random() * radius * 0.1;
        
        note.x = centerX + Math.cos(noteAngle) * noteRadius;
        note.y = centerY + Math.sin(noteAngle) * noteRadius;
        
        note.x = Math.max(30, Math.min(containerWidth - 30, note.x));
        note.y = Math.max(30, Math.min(containerHeight - 30, note.y));
      });
      
      folderIndex++;
    });
  }
  
  renderGarden() {
    if (!this.container) return;
    
    this.container.innerHTML = '';
    this.calculatePositions();
    
    const containerWidth = this.container.clientWidth;
    const containerHeight = this.container.clientHeight;
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    
    const folderGroups = this.groupBy(this.notes, 'folder');
    
    // Root node
    const rootNode = document.createElement('div');
    rootNode.className = 'node';
    rootNode.style.left = centerX + 'px';
    rootNode.style.top = centerY + 'px';
    this.container.appendChild(rootNode);
    
    // Branches and folder nodes
    Object.entries(folderGroups).forEach(([folder, notes]) => {
      if (!notes.length) return;
      
      const folderCenterX = notes.reduce((sum, note) => sum + note.x, 0) / notes.length;
      const folderCenterY = notes.reduce((sum, note) => sum + note.y, 0) / notes.length;
      
      // Main branch
      const branch = document.createElement('div');
      branch.className = 'branch';
      
      const dx = folderCenterX - centerX;
      const dy = folderCenterY - centerY;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      
      branch.style.width = length + 'px';
      branch.style.left = centerX + 'px';
      branch.style.top = centerY + 'px';
      branch.style.transform = 'rotate(' + angle + 'deg)';
      
      this.container.appendChild(branch);
      
      // Folder node
      const folderNode = document.createElement('div');
      folderNode.className = 'node';
      folderNode.title = folder;
      folderNode.style.left = folderCenterX + 'px';
      folderNode.style.top = folderCenterY + 'px';
      this.container.appendChild(folderNode);
      
      // Note branches
      notes.forEach(note => {
        const noteBranch = document.createElement('div');
        noteBranch.className = 'branch';
        
        const noteDx = note.x - folderCenterX;
        const noteDy = note.y - folderCenterY;
        const noteLength = Math.sqrt(noteDx * noteDx + noteDy * noteDy);
        const noteAngle = Math.atan2(noteDy, noteDx) * 180 / Math.PI;
        
        noteBranch.style.width = noteLength + 'px';
        noteBranch.style.left = folderCenterX + 'px';
        noteBranch.style.top = folderCenterY + 'px';
        noteBranch.style.transform = 'rotate(' + noteAngle + 'deg)';
        
        this.container.appendChild(noteBranch);
      });
    });
    
    // Connections
    this.connections.forEach(connection => {
      const source = this.notes[connection.source];
      const target = this.notes[connection.target];
      
      if (!source || !target) return;
      
      const connEl = document.createElement('div');
      connEl.className = 'connection';
      
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      
      connEl.style.width = length + 'px';
      connEl.style.left = source.x + 'px';
      connEl.style.top = source.y + 'px';
      connEl.style.transform = 'rotate(' + angle + 'deg)';
      connEl.style.opacity = connection.strength;
      
      this.container.appendChild(connEl);
    });
    
    // Leaves
    this.notes.forEach(note => {
      const leaf = document.createElement('div');
      leaf.className = 'leaf';
      leaf.dataset.noteId = note.id;
      leaf.dataset.path = note.path;
      leaf.title = note.title;
      
      leaf.style.left = note.x + 'px';
      leaf.style.top = note.y + 'px';
      leaf.style.setProperty('--delay', (Math.random() * 2) + 's');
      leaf.classList.add('animated');
      
      leaf.addEventListener('click', this.handleLeafClick);
      leaf.addEventListener('mouseenter', this.handleLeafHover);
      leaf.addEventListener('mouseleave', this.handleLeafLeave);
      
      this.container.appendChild(leaf);
    });
  }
  
  createPreviewElement() {
    this.previewEl = document.createElement('div');
    this.previewEl.className = 'note-preview';
    document.body.appendChild(this.previewEl);
  }
  
  handleLeafClick(e) {
    const leaf = e.currentTarget;
    const path = leaf.dataset.path;
    if (path) {
      window.location.href = '/' + path.replace(/\.md$/, '');
    }
  }
  
  handleLeafHover(e) {
    const leaf = e.currentTarget;
    const noteId = parseInt(leaf.dataset.noteId);
    const note = this.notes[noteId];
    
    if (!note) return;
    
    const rect = leaf.getBoundingClientRect();
    this.previewEl.style.left = (rect.left + rect.width + 10) + 'px';
    this.previewEl.style.top = rect.top + 'px';
    
    var tagsHtml = '';
    if (note.tags && note.tags.length > 0) {
      tagsHtml = note.tags.map(function(tag) {
        return '<span class="tag">#' + tag + '</span>';
      }).join(' ');
    }
    this.previewEl.innerHTML = '<h3>' + note.title + '</h3><p>' + (note.description || 'No description available.') + '</p><p class="tags">' + tagsHtml + '</p>';
    
    this.previewEl.classList.add('visible');
    
    const previewRect = this.previewEl.getBoundingClientRect();
    if (previewRect.right > window.innerWidth) {
      this.previewEl.style.left = (rect.left - previewRect.width - 10) + 'px';
    }
    if (previewRect.bottom > window.innerHeight) {
      this.previewEl.style.top = (rect.top - (previewRect.bottom - window.innerHeight)) + 'px';
    }
  }
  
  handleLeafLeave() {
    this.previewEl.classList.remove('visible');
  }
  
  handleResize() {
    if (this.isInitialized) {
      this.renderGarden();
    }
  }
}

// Initialize garden when page loads
document.addEventListener('DOMContentLoaded', () => {
  const gardenContainer = document.querySelector('.garden-container');
  if (gardenContainer) {
    new ResonanceGarden();
  }
});
</script>