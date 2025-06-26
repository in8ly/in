# Resonance Garden: Technical Elaboration

This document provides technical details for implementing the Resonance Garden visualization as outlined in the four-phase implementation plan. It includes code snippets, technical considerations, and implementation guides for developers working on the project.

## Core Visualization Components

### 1. Garden Elements (Notes as Natural Objects)

The visualization represents notes as natural elements through CSS and image styling:

```javascript
// Determine which image to use based on note properties
function getLeafImageIndex(note) {
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
```

### 2. Organic Connections

Connections between notes use SVG paths with curved lines to create a more natural, thread-like appearance:

```javascript
// Create curved SVG connections between notes
function createConnection(source, target, strength) {
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
  
  // Style based on connection type
  const strokeWidth = 1 + strength * 2;
  let strokeColor = `rgba(108, 86, 63, ${strength})`;
  
  path.setAttribute('stroke', strokeColor);
  path.setAttribute('stroke-width', strokeWidth);
  path.setAttribute('stroke-dasharray', strength > 0.5 ? '0' : '3,3');
  
  svg.appendChild(path);
  return svg;
}
```

## Phase 1 Implementation Details

### Image Preparation Workflow

1. **Capturing Raw Material:**
   - Photograph fabric scraps, leaves, paper fragments against white background
   - Ensure good lighting to capture texture details

2. **Image Processing:**
   ```
   // Using Photoshop or similar tool:
   1. Remove background (Select > Subject, then refine edge)
   2. Save as transparent PNG
   3. Resize to approximately 300px width (allows scaling down in browser)
   4. Optimize file size (aim for under 50KB per image)
   ```

3. **File Organization:**
   - Name files consistently: `leaf-1.png`, `leaf-2.png`, etc.
   - Place in `/public/static/garden-elements/` directory
   - Create a manifest file documenting image categories

### Raspberry Pi Configuration

Basic setup for each Strange Bird kiosk:

```bash
# Install Raspberry Pi OS Lite (headless)
# Enable SSH and Wi-Fi during initial setup

# Install minimal browser for kiosk mode
sudo apt update
sudo apt install -y --no-install-recommends xserver-xorg x11-xserver-utils xinit openbox chromium-browser

# Create autostart script
mkdir -p ~/.config/openbox
cat > ~/.config/openbox/autostart << EOF
# Disable screen saver and energy management
xset s off
xset s noblank
xset -dpms

# Start Chromium in kiosk mode
chromium-browser --kiosk --app=https://enter-here.vercel.app/birds/3 --noerrdialogs --disable-translate --no-first-run --fast --fast-start --disable-infobars --disable-features=TranslateUI --disk-cache-dir=/dev/null
EOF

# Create startup script
cat > ~/.xinitrc << EOF
exec openbox-session
EOF

# Set to start on boot
cat > /etc/systemd/system/kiosk.service << EOF
[Unit]
Description=Chromium Kiosk
After=network-online.target

[Service]
User=pi
Environment=DISPLAY=:0
ExecStart=/usr/bin/startx
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable kiosk.service
```

## Phase 2 Implementation Details

### Visit Tracking System

Implementation for tracking note visits and visual changes:

```javascript
// In garden.js - Add visit tracking

// Load visit data on initialization
constructor() {
  // ...existing code
  
  // Load visit data
  this.visitData = JSON.parse(localStorage.getItem('gardenVisitData') || '{}');
  
  // Start decay timer to gradually fade unvisited notes
  this.startVisitDecay();
}

// Start a timer to periodically update visit "energy"
startVisitDecay() {
  setInterval(() => {
    let hasChanges = false;
    
    // Reduce energy for all notes slightly
    Object.keys(this.visitData).forEach(path => {
      if (this.visitData[path].energy > 0) {
        this.visitData[path].energy -= 0.01; // Decay rate
        if (this.visitData[path].energy < 0) this.visitData[path].energy = 0;
        hasChanges = true;
      }
    });
    
    // Save changes if needed
    if (hasChanges) {
      localStorage.setItem('gardenVisitData', JSON.stringify(this.visitData));
      this.renderGarden(); // Update visualization
    }
  }, 3600000); // Check every hour
}

// Update leaf appearance based on visit data
updateLeafAppearance(leaf, note) {
  const visitInfo = this.visitData[note.path] || { energy: 0, lastVisit: 0, count: 0 };
  
  // Apply visual effects based on visit data
  if (visitInfo.energy > 0) {
    // Brightness increases with energy (0-1)
    leaf.style.filter = `brightness(${1 + visitInfo.energy * 0.5})`;
    
    // Size increases slightly with visit count
    const growFactor = Math.min(1.2, 1 + (visitInfo.count * 0.02));
    leaf.style.transform = `scale(${leaf._baseScale * growFactor}) rotate(${leaf._rotation}deg)`;
  }
}

// Add method to record visits on page load
static recordVisit(path) {
  // Load current data
  const visitData = JSON.parse(localStorage.getItem('gardenVisitData') || '{}');
  
  // Update visit information
  if (!visitData[path]) {
    visitData[path] = {
      energy: 0,
      lastVisit: 0,
      count: 0
    };
  }
  
  visitData[path].lastVisit = Date.now();
  visitData[path].count += 1;
  visitData[path].energy = 1; // Full energy on visit
  
  // Save updated data
  localStorage.setItem('gardenVisitData', JSON.stringify(visitData));
}
```

Add to Quartz layouts to record visits on page load:

```typescript
// Add to quartz.layout.ts in the content component section
Component.Content({
  afterRender: () => {
    // Record visit to current page
    const currentPath = window.location.pathname.replace(/\/$/, '') + '.md';
    if (window.ResonanceGarden && window.ResonanceGarden.recordVisit) {
      window.ResonanceGarden.recordVisit(currentPath);
    }
  }
}),
```

## Phase 3 Implementation Details

### Visitor Contribution System

Simplified implementation for allowing visitor contributions:

```javascript
// Function to add a new seedling contribution
function addSeedling(content, author, relatedNoteId) {
  // Create seedling data
  const seedling = {
    id: `seedling-${Date.now()}`,
    content,
    author,
    createdAt: Date.now(),
    relatedNoteId,
    interactions: 0,
    stage: 'seed' // Stages: seed -> sprout -> leaf
  };
  
  // Save to seedling collection
  const seedlings = JSON.parse(localStorage.getItem('gardenSeedlings') || '[]');
  seedlings.push(seedling);
  localStorage.setItem('gardenSeedlings', JSON.stringify(seedlings));
  
  // Notify server about new seedling
  fetch('/api/seedlings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(seedling)
  }).catch(err => console.error('Failed to save seedling to server:', err));
  
  return seedling;
}

// Add seedlings to garden visualization
function renderSeedlings() {
  const seedlings = JSON.parse(localStorage.getItem('gardenSeedlings') || '[]');
  
  seedlings.forEach(seedling => {
    // Find related note position
    const relatedNote = this.notes.find(n => n.id === seedling.relatedNoteId);
    if (!relatedNote) return;
    
    // Create seedling element based on stage
    const element = document.createElement('div');
    
    switch(seedling.stage) {
      case 'seed':
        element.className = 'seedling seed';
        element.style.width = '15px';
        element.style.height = '15px';
        break;
      case 'sprout':
        element.className = 'seedling sprout';
        element.style.width = '25px';
        element.style.height = '25px';
        break;
      case 'leaf':
        element.className = 'seedling leaf';
        element.style.width = '40px';
        element.style.height = '40px';
        break;
    }
    
    // Position near related note
    const offsetX = (Math.random() - 0.5) * 60;
    const offsetY = (Math.random() - 0.5) * 60;
    
    element.style.left = `${relatedNote.x + offsetX}px`;
    element.style.top = `${relatedNote.y + offsetY}px`;
    
    // Add tooltip with content
    element.title = `${seedling.content}\n- ${seedling.author}`;
    
    // Add interaction handling
    element.addEventListener('click', () => this.handleSeedlingClick(seedling));
    
    this.container.appendChild(element);
  });
}
```

## Phase 4 Implementation Details

### NFT Integration

Basic structure for NFT functionality:

```javascript
// Connect to user's wallet
async function connectWallet() {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      return accounts[0];
    } catch (error) {
      console.error("User denied account access");
      return null;
    }
  } else {
    console.log("No Ethereum browser extension detected");
    return null;
  }
}

// Check if user owns any Strange Bird NFTs
async function checkBirdOwnership(address) {
  if (!address) return [];
  
  // Contract address for Strange Birds collection
  const contractAddress = '0x...'; // To be determined
  
  // Connect to contract
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const contract = new ethers.Contract(
    contractAddress,
    ['function balanceOf(address owner) view returns (uint256)'],
    provider
  );
  
  // Check balance
  const balance = await contract.balanceOf(address);
  
  // If they own any tokens, get the specific tokens
  if (balance.toNumber() > 0) {
    // Implement token ID lookup logic
    return ['bird-3', 'bird-7']; // Example return
  }
  
  return [];
}

// Unlock special features based on NFT ownership
function unlockSpecialFeatures(ownedBirds) {
  if (ownedBirds.length > 0) {
    // Add special styling for owners
    document.body.classList.add('nft-owner');
    
    // Enable special features
    enableContributionHighlighting();
    enableExclusiveAreas();
    
    // Add owner badge
    const badge = document.createElement('div');
    badge.className = 'owner-badge';
    badge.textContent = `${ownedBirds.length} Bird${ownedBirds.length > 1 ? 's' : ''} Owned`;
    document.body.appendChild(badge);
  }
}
```

## Image Asset Requirements

### Required Images for Phase 1:

1. **Fabric Scraps (leaf-1.png through leaf-3.png)**
   - Textural, irregular shapes
   - Varied colors and patterns
   - Transparent backgrounds

2. **Natural Leaves (leaf-4.png through leaf-6.png)**
   - Different leaf shapes and species
   - Various seasonal colors
   - Detailed vein structures if possible

3. **Paper Fragments (leaf-7.png through leaf-9.png)**
   - Torn paper edges
   - Some with subtle text or patterns
   - Aged/weathered appearance

4. **Final Participation Elements (leaf-10.png through leaf-12.png)**
   - More elaborate mixed-media elements
   - Feather or bird-like shapes
   - Sacred geometry patterns

5. **Tag-Specific Elements (leaf-13.png through leaf-21.png)**
   - Distinctive elements for each major tag
   - More visually prominent than general elements
   - Thematically aligned with tag meaning

## Deployment Workflow

1. **Local Testing**
   ```bash
   # Test build locally first
   cd C:\Users\in8ly\in8ly-garden
   npm run build
   npm run serve
   ```

2. **GitHub Integration**
   ```bash
   # Add changes to GitHub
   git add .
   git commit -m "Implement garden visualization"
   git push origin main
   ```

3. **Vercel Deployment**
   - Connect GitHub repository to Vercel
   - Configure build settings:
     - Build Command: `npm run build`
     - Output Directory: `public`
   - Set environment variables if needed
   - Deploy

## Performance Optimization

For optimal performance, especially on mobile devices:

1. **Image Optimization**
   - Keep individual PNGs under 50KB
   - Consider using WebP format with PNG fallback
   - Implement lazy loading for images

2. **Rendering Optimizations**
   ```javascript
   // Only render leaves that are in or near viewport
   function isInViewport(x, y) {
     const margin = 100; // px outside viewport to still render
     return (
       x >= -margin &&
       y >= -margin &&
       x <= window.innerWidth + margin &&
       y <= window.innerHeight + margin
     );
   }
   
   // Apply to leaf rendering
   this.notes.forEach(note => {
     if (isInViewport(note.x, note.y)) {
       // Create and append leaf
     }
   });
   ```

3. **Animation Efficiency**
   - Use CSS animations instead of JavaScript where possible
   - Reduce animation complexity on mobile devices
   - Use `will-change` property for smoother animations

## Technical Challenges and Solutions

1. **Challenge**: Handling large numbers of notes in the visualization
   **Solution**: Implement clustering for densely packed areas and level-of-detail rendering

2. **Challenge**: Maintaining consistent experience across devices
   **Solution**: Progressive enhancement approach with device capability detection

3. **Challenge**: Syncing visitor contributions across sessions
   **Solution**: Server-side storage with local caching and periodic sync

4. **Challenge**: Raspberry Pi reliability in garden settings
   **Solution**: Weatherproof enclosures, watchdog scripts for automatic recovery