import * as THREE from 'three';

export class Wheel {
  private parent: any;
  public mesh: THREE.Mesh;
  constructor(parent: any) { 
    this.parent = parent;

    this.mesh = new THREE.Mesh( 
      new THREE.BoxGeometry( 12*this.parent.zoom, 33*this.parent.zoom, 12*this.parent.zoom ), 
      new THREE.MeshLambertMaterial( { color: 0x333333, flatShading: true } ) 
    );
    this.mesh.position.z = 6*this.parent.zoom;
  }
}