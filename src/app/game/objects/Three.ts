import * as THREE from 'three';
import {threeHeights} from './Constants';

export class Three {
  private parent: any;
  public mesh: THREE.Group;
  constructor(parent: any) { 
    this.parent = parent;

    this.mesh = new THREE.Group();

    const trunk = new THREE.Mesh(
      new THREE.BoxGeometry( 15*this.parent.zoom, 15*this.parent.zoom, 20*this.parent.zoom ), 
      new THREE.MeshPhongMaterial( { color: 0x4d2926, flatShading: true } )
    );
    trunk.position.z = 10*this.parent.zoom;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    this.mesh.add(trunk);

    const height = threeHeights[Math.floor(Math.random()*threeHeights.length)];

    const crown = new THREE.Mesh(
      new THREE.BoxGeometry( 30*this.parent.zoom, 30*this.parent.zoom, height*this.parent.zoom ), 
      new THREE.MeshLambertMaterial( { color: 0x7aa21d, flatShading: true } )
    );
    crown.position.z = (height/2+20)*this.parent.zoom;
    crown.castShadow = true;
    crown.receiveShadow = false;
    this.mesh.add(crown);
  }
}