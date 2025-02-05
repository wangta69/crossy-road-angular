import * as THREE from 'three';
import {Texture} from './Texture';
import {Wheel} from './Wheel';
import {laneTypes, laneSpeeds, vechicleColors, threeHeights} from './Constants';

export class Chicken {
  private parent: any;
  public mesh;
  constructor(parent: any) { 
    this.parent = parent;

    this.mesh = new THREE.Group();

    const body = new THREE.Mesh(
      new THREE.BoxGeometry( this.parent.chickenSize*this.parent.zoom, this.parent.chickenSize*this.parent.zoom, 20*this.parent.zoom ), 
      new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } )
    );
    body.position.z = 10*this.parent.zoom;
    body.castShadow = true;
    body.receiveShadow = true;
    this.mesh.add(body);

    const rowel = new THREE.Mesh(
      new THREE.BoxGeometry( 2*this.parent.zoom, 4*this.parent.zoom, 2*this.parent.zoom ), 
      new THREE.MeshLambertMaterial( { color: 0xF0619A, flatShading: true } )
    );
    rowel.position.z = 21*this.parent.zoom;
    rowel.castShadow = true;
    rowel.receiveShadow = false;
    this.mesh.add(rowel);

    // return chicken; 
  }
}