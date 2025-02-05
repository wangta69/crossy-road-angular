import * as THREE from 'three';

export class Texture {
  public texture:any;
  constructor(width: number, height: number, rects: any) { 
    const canvas = document.createElement( "canvas" );
    canvas.width = width;
    canvas.height = height;
    const context: any = canvas.getContext( "2d" );
    context.fillStyle = "#ffffff";
    context.fillRect( 0, 0, width, height );
    context.fillStyle = "rgba(0,0,0,0.6)";  
    rects.forEach((rect:any) => {
      context.fillRect(rect.x, rect.y, rect.w, rect.h);
    });
    this.texture = new THREE.CanvasTexture(canvas);
  }
}