// Live2DViewer.tsx
import { useLayoutEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import { Live2DModel } from "pixi-live2d-display/cubism4";

// Declare PIXI on window for live2d-display compatibility
declare global {
  interface Window {
    PIXI: typeof PIXI;
  }
}
window.PIXI = PIXI;

const Live2DViewer = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const modelRef = useRef<Live2DModel | null>(null);

  useLayoutEffect(() => {
    // Cleanup previous instances
    if (appRef.current) {
      appRef.current.destroy(true);
      appRef.current = null;
    }
    
    if (!containerRef.current) return;

    // Get container dimensions for responsive canvas
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    
    // Create Pixi application
    const app = new PIXI.Application({
      width: containerWidth,
      height: containerHeight,
      backgroundColor: 0x000000,
      antialias: true,
      resizeTo: containerRef.current, // Make canvas resize with container
    });
    
    appRef.current = app;
    containerRef.current.appendChild(app.view as HTMLCanvasElement);
    
    // Load model
    (async () => {
      try {
        const model = await Live2DModel.from(
          "/live2d/Hiyori/Hiyori.model3.json" // Verify this path!
        );
        
        modelRef.current = model;
        app.stage.addChild(model);
        
        // Better positioning and sizing
        model.anchor.set(0.5, 0.5);
        model.position.set(app.screen.width / 2, app.screen.height / 2);
        
        // Scale model based on container size for better fit
        const scale = Math.min(
          app.screen.width / model.width,
          app.screen.height / model.height
        ) * 0.8; // 80% of available space
        
        model.scale.set(scale);
        
        // Make model interactive
        model.interactive = true;
        model.buttonMode = true;
        
        model.on("pointertap", () => {
          model.motion("TapBody");
        });

        // Add idle motion
        const startIdleMotion = () => {
          const motions = ["Idle", "Breath", "Flick"];
          const randomMotion = motions[Math.floor(Math.random() * motions.length)];
          model.motion(randomMotion);
          
          // Schedule next motion
          setTimeout(startIdleMotion, 5000 + Math.random() * 5000);
        };
        
        startIdleMotion();
        
        // Handle window resize
        window.addEventListener("resize", () => {
          if (!containerRef.current || !model) return;
          
          // Update position
          model.position.set(app.screen.width / 2, app.screen.height / 2);
          
          // Update scale
          const newScale = Math.min(
            app.screen.width / model.width,
            app.screen.height / model.height
          ) * 0.8;
          
          model.scale.set(newScale);
        });
        
      } catch (error) {
        console.error("Model loading failed:", error);
      }
    })();

    // Cleanup
    return () => {
      if (modelRef.current) {
        modelRef.current.destroy();
        modelRef.current = null;
      }
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} className="live2d-container" />;
};

export default Live2DViewer;