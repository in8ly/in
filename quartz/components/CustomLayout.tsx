import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { JSX } from "preact"

interface CustomLayoutOptions {
  children: QuartzComponent[]
}

export default ((opts: CustomLayoutOptions) => {
  const CustomLayout: QuartzComponent = ({ children, ...componentData }: QuartzComponentProps) => {
    return (
      <div class="custom-layout">
        <div class="main-container">
          <aside class="sidebar-left">
            {/* Render navigation and explorer components */}
            {opts.children.slice(0, 2).map((Child, index) => (
              <Child key={index} {...componentData} />
            ))}
          </aside>
          
          <main class="content-main">
            {/* Render main content components */}
            {opts.children.slice(2, 4).map((Child, index) => (
              <Child key={index + 2} {...componentData} />
            ))}
          </main>
          
          <aside class="sidebar-right">
            {/* Render supplementary components */}
            {opts.children.slice(4).map((Child, index) => (
              <Child key={index + 4} {...componentData} />
            ))}
          </aside>
        </div>
      </div>
    )
  }

  CustomLayout.css = `
    .custom-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    .main-container {
      display: grid;
      grid-template-columns: 250px 1fr 300px;
      grid-gap: 2rem;
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 1rem;
      flex: 1;
    }
    
    .sidebar-left {
      position: sticky;
      top: 2rem;
      height: fit-content;
      padding: 1rem;
      background: var(--lightgray);
      border-radius: 8px;
    }
    
    .content-main {
      padding: 2rem 1rem;
    }
    
    .sidebar-right {
      position: sticky;
      top: 2rem;
      height: fit-content;
      padding: 1rem;
      background: var(--lightgray);
      border-radius: 8px;
    }
    
    @media (max-width: 1024px) {
      .main-container {
        grid-template-columns: 1fr;
        grid-template-areas: 
          "content"
          "left"
          "right";
      }
      
      .sidebar-left {
        grid-area: left;
        position: static;
      }
      
      .content-main {
        grid-area: content;
      }
      
      .sidebar-right {
        grid-area: right;
        position: static;
      }
    }
  `

  return CustomLayout
}) satisfies QuartzComponentConstructor