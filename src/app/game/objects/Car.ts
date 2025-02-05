import * as THREE from 'three';
import {Texture} from './Texture';
import {Wheel} from './Wheel';
import {vechicleColors} from './Constants';

export class Car {
  private parent: any;
  public mesh: THREE.Group;
  constructor(parent: any) { 
    this.parent = parent;

    this.mesh = new THREE.Group();
    const color = vechicleColors[Math.floor(Math.random() * vechicleColors.length)];
    
    const main = new THREE.Mesh(
      new THREE.BoxGeometry( 60*this.parent.zoom, 30*this.parent.zoom, 15*this.parent.zoom ), 
      new THREE.MeshPhongMaterial( { color, flatShading: true } )
    );
    main.position.z = 12*this.parent.zoom;
    main.castShadow = true;
    main.receiveShadow = true;
    this.mesh.add(main)
  
    const carFrontTexture = new Texture(40,80,[{x: 0, y: 10, w: 30, h: 60 }]).texture;
    const carBackTexture = new Texture(40,80,[{x: 10, y: 10, w: 30, h: 60 }]).texture;
    const carRightSideTexture = new Texture(110,40,[{x: 10, y: 0, w: 50, h: 30 }, {x: 70, y: 0, w: 30, h: 30 }]).texture;
    const carLeftSideTexture = new Texture(110,40,[{x: 10, y: 10, w: 50, h: 30 }, {x: 70, y: 10, w: 30, h: 30 }]).texture;
    
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry( 33*this.parent.zoom, 24*this.parent.zoom, 12*this.parent.zoom ), 
      [
        new THREE.MeshPhongMaterial( { color: 0xcccccc, flatShading: true, map: carBackTexture } ),
        new THREE.MeshPhongMaterial( { color: 0xcccccc, flatShading: true, map: carFrontTexture } ),
        new THREE.MeshPhongMaterial( { color: 0xcccccc, flatShading: true, map: carRightSideTexture } ),
        new THREE.MeshPhongMaterial( { color: 0xcccccc, flatShading: true, map: carLeftSideTexture } ),
        new THREE.MeshPhongMaterial( { color: 0xcccccc, flatShading: true } ), // top
        new THREE.MeshPhongMaterial( { color: 0xcccccc, flatShading: true } ) // bottom
      ]
    );
    cabin.position.x = 6*this.parent.zoom;
    cabin.position.z = 25.5*this.parent.zoom;
    cabin.castShadow = true;
    cabin.receiveShadow = true;
    this.mesh.add( cabin );
    
    const frontWheel = new Wheel(this.parent);
    frontWheel.mesh.position.x = -18*this.parent.zoom;
    this.mesh.add( frontWheel.mesh );

    const backWheel = new Wheel(this.parent);
    backWheel.mesh.position.x = 18*this.parent.zoom;
    this.mesh.add( backWheel.mesh );

    this.mesh.castShadow = true;
    this.mesh.receiveShadow = false;
  }
}