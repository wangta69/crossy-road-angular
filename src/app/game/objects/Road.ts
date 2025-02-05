import * as THREE from 'three';

export class Road {
  private parent: any;
  public mesh: THREE.Group;
  constructor(parent: any) { 
    this.parent = parent;

    this.mesh = new THREE.Group();

    const createSection = (color: any) => new THREE.Mesh(
      new THREE.PlaneGeometry( this.parent.boardWidth*this.parent.zoom, this.parent.positionWidth*this.parent.zoom ), 
      new THREE.MeshPhongMaterial( { color } )
    );

    const middle = createSection(0x454A59);
    middle.receiveShadow = true;
    this.mesh.add(middle);

    const left = createSection(0x393D49);
    left.position.x = - this.parent.boardWidth*this.parent.zoom;
    this.mesh.add(left);

    const right = createSection(0x393D49);
    right.position.x = this.parent.boardWidth*this.parent.zoom;
    this.mesh.add(right);
  }
}