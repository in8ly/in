import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { JSX } from "preact"

const Navbar: QuartzComponent = ({ cfg, fileData }: QuartzComponentProps) => {
  return (
    <nav class="navbar">
      <div class="nav-content">
        <a href="/" class="nav-brand">
          {cfg.pageTitle}
        </a>
        
        <div class="nav-links">
          <a href="/tags" class="nav-link">Tags</a>
          <a href="/search" class="nav-link">Search</a>
          <a href="/about" class="nav-link">About</a>
        </div>
      </div>
    </nav>
  )
}

Navbar.css = `
  .navbar {
    background: var(--light);
    border-bottom: 1px solid var(--lightgray);
    padding: 0.75rem 0;
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(10px);
    background: rgba(var(--light-rgb), 0.95);
  }
  
  .nav-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .nav-brand {
    font-family: var(--headerFont);
    font-size: 1.25rem;
    font-weight: 600;
    text-decoration: none;
    color: var(--dark);
    transition: color 0.2s ease;
  }
  
  .nav-brand:hover {
    color: var(--secondary);
  }
  
  .nav-links {
    display: flex;
    gap: 1.5rem;
  }
  
  .nav-link {
    text-decoration: none;
    color: var(--darkgray);
    font-weight: 500;
    transition: color 0.2s ease;
    position: relative;
  }
  
  .nav-link:hover {
    color: var(--secondary);
  }
  
  .nav-link::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--secondary);
    transition: width 0.2s ease;
  }
  
  .nav-link:hover::after {
    width: 100%;
  }
  
  @media (max-width: 768px) {
    .nav-content {
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .nav-links {
      gap: 1rem;
    }
  }
`

export default (() => Navbar) satisfies QuartzComponentConstructor