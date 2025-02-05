import * as THREE from 'three';

export class Grass {
  private parent: any;
  public mesh: THREE.Group;
  constructor(parent: any) { 
    this.parent = parent;

    this.mesh = new THREE.Group();

    const createSection = (color: any) => new THREE.Mesh(
      new THREE.BoxGeometry( this.parent.boardWidth*this.parent.zoom, this.parent.positionWidth*this.parent.zoom, 3*this.parent.zoom ), 
      new THREE.MeshPhongMaterial( { color } )
    );
  
    const middle = createSection(0xbaf455);
    middle.receiveShadow = true;
    this.mesh.add(middle);
  
    const left = createSection(0x99C846);
    left.position.x = - this.parent.boardWidth*this.parent.zoom;
    this.mesh.add(left);
  
    const right = createSection(0x99C846);
    right.position.x = this.parent.boardWidth*this.parent.zoom;
    this.mesh.add(right);
  
    this.mesh.position.z = 1.5*this.parent.zoom;
  }
}