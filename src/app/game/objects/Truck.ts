import * as THREE from 'three';
import {Texture} from './Texture';
import {Wheel} from './Wheel';
import {vechicleColors} from './Constants';

export class Truck {
  private parent: any;
  public mesh:THREE.Group;
  constructor(parent: any) { 
    this.parent = parent;

    this.mesh = new THREE.Group();
    const color = vechicleColors[Math.floor(Math.random() * vechicleColors.length)];


    const base = new THREE.Mesh(
      new THREE.BoxGeometry( 100*this.parent.zoom, 25*this.parent.zoom, 5*this.parent.zoom ), 
      new THREE.MeshLambertMaterial( { color: 0xb4c6fc, flatShading: true } )
    );
    base.position.z = 10*this.parent.zoom;
    this.mesh.add(base)

    const cargo = new THREE.Mesh(
      new THREE.BoxGeometry( 75*this.parent.zoom, 35*this.parent.zoom, 40*this.parent.zoom ), 
      new THREE.MeshPhongMaterial( { color: 0xb4c6fc, flatShading: true } )
    );
    cargo.position.x = 15*this.parent.zoom;
    cargo.position.z = 30*this.parent.zoom;
    cargo.castShadow = true;
    cargo.receiveShadow = true;
    this.mesh.add(cargo)

    const truckFrontTexture = new Texture(30,30,[{x: 15, y: 0, w: 10, h: 30 }]).texture;
    const truckRightSideTexture = new Texture(25,30,[{x: 0, y: 15, w: 10, h: 10 }]).texture;
    const truckLeftSideTexture = new Texture(25,30,[{x: 0, y: 5, w: 10, h: 10 }]).texture;

    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry( 25*this.parent.zoom, 30*this.parent.zoom, 30*this.parent.zoom ), 
      [
        new THREE.MeshPhongMaterial( { color, flatShading: true } ), // back
        new THREE.MeshPhongMaterial( { color, flatShading: true, map: truckFrontTexture } ),
        new THREE.MeshPhongMaterial( { color, flatShading: true, map: truckRightSideTexture } ),
        new THREE.MeshPhongMaterial( { color, flatShading: true, map: truckLeftSideTexture } ),
        new THREE.MeshPhongMaterial( { color, flatShading: true } ), // top
        new THREE.MeshPhongMaterial( { color, flatShading: true } ) // bottom
      ]
    );
    cabin.position.x = -40*this.parent.zoom;
    cabin.position.z = 20*this.parent.zoom;
    cabin.castShadow = true;
    cabin.receiveShadow = true;
    this.mesh.add( cabin );

    const frontWheel = new Wheel(this.parent);
    frontWheel.mesh.position.x = -38*this.parent.zoom;
    this.mesh.add( frontWheel.mesh );

    const middleWheel = new Wheel(this.parent);
    middleWheel.mesh.position.x = -10*this.parent.zoom;
    this.mesh.add( middleWheel.mesh );

    const backWheel = new Wheel(this.parent);
    backWheel.mesh.position.x = 30*this.parent.zoom;
    this.mesh.add( backWheel.mesh );
  }
}