import { Component,OnInit,AfterViewInit,ViewChild,ElementRef } from '@angular/core';
import * as THREE from 'three';
import {Chicken} from './objects/Chicken';
import {Lane} from './objects/Lane';

import {laneTypes, laneSpeeds, vechicleColors, threeHeights} from './objects/Constants';

@Component({
  selector: 'app-root',
  templateUrl: './game.html',
  styleUrls: ['./game.scss']
})
export class GameComponent implements OnInit, AfterViewInit{

  private counterDOM: any;  
  private endDOM: any;  

  private moves:any[] = [];
  private lanes:any[] = [];
  private currentLane = 0;
  private currentColumn = 0;
  private positionWidth = 0;
  private chickenSize = 0;
  private zoom = 0;
  private columns = 17;
  private boardWidth = 0;
    
  private stepTime = 200; //
  private timestamp = 0;
  private previousTimestamp = 0;
  private stepStartTimestamp = 0;
  private startMoving = false;
  
  private scene!: THREE.Scene;
  private camera!: THREE.OrthographicCamera;
  private renderer!: THREE.WebGLRenderer;
  private dirLight: any;

  private initialCameraPosition = {x:0, y:0}
  private initialDirLightPosition = {x:0, y:0}
  
  private chicken: any;
  // private chicken!: THREE.Group;
  constructor(
  ) { 
  }

  ngOnInit() {

  }
  ngAfterViewInit() {
    this.init();
    requestAnimationFrame( this.animate );
  }

  private init() {
    this.counterDOM = document.getElementById('counter');  
    this.endDOM = document.getElementById('end');  
    
    this.scene = new THREE.Scene();
    
    const distance = 500;
    this.camera = new THREE.OrthographicCamera( window.innerWidth/-2, window.innerWidth/2, window.innerHeight / 2, window.innerHeight / -2, 0.1, 10000 );
    
    this.camera.rotation.x = 50*Math.PI/180;
    this.camera.rotation.y = 20*Math.PI/180;
    this.camera.rotation.z = 10*Math.PI/180;
    
    this.initialCameraPosition.y = -Math.tan(this.camera.rotation.x)*distance;
    this.initialCameraPosition.x = Math.tan(this.camera.rotation.y)*Math.sqrt(distance**2 + this.initialCameraPosition.y**2);
    this.camera.position.y = this.initialCameraPosition.y;
    this.camera.position.x = this.initialCameraPosition.x;
    this.camera.position.z = distance;
    
    this.zoom = 2;
    
    this.chickenSize = 15;
    
    this.positionWidth = 42;
    this.columns = 17;
    this.boardWidth = this.positionWidth*this.columns;
    
    this.stepTime = 200; // Miliseconds it takes for the chicken to take a step forward, backward, left or right
    
    
    

 
    
    // this.clock = new THREE.Clock();
 
    
    
    this.chicken = new Chicken(this);
    this.scene.add( this.chicken.mesh );
    
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    this.scene.add(hemiLight)
    
    this.initialDirLightPosition = {x: -100, y: -100};
    this.dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    this.dirLight.position.set(this.initialDirLightPosition.x, this.initialDirLightPosition.y, 200);
    this.dirLight.castShadow = true;
    this.dirLight.target = this.chicken.mesh;
    this.scene.add(this.dirLight);
    
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    var d = 500;
    this.dirLight.shadow.camera.left = - d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = - d;
    
    // var helper = new THREE.CameraHelper( dirLight.shadow.camera );
    // var helper = new THREE.CameraHelper( camera );
    // scene.add(helper)
    
    const backLight = new THREE.DirectionalLight(0x000000, .4);
    backLight.position.set(200, 200, 50);
    backLight.castShadow = true;
    this.scene.add(backLight)
    
    this.initaliseValues();
    
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    const dom: any = document.getElementById('world');
    dom.appendChild( this.renderer.domElement );


    (document as any).querySelector("#retry").addEventListener("click", () => {
      this.lanes.forEach(lane => this.scene.remove( lane.mesh ));
      this.initaliseValues();
      this.endDOM.style.visibility = 'hidden';
    });
    
    (document as any).getElementById('forward').addEventListener("click", () => this.move('forward'));
    
    (document as any).getElementById('backward').addEventListener("click", () => this.move('backward'));
    
    (document as any).getElementById('left').addEventListener("click", () => this.move('left'));
    
    (document as any).getElementById('right').addEventListener("click", () => this.move('right'));
    
    window.addEventListener("keydown", (event:any) => {
      console.log(event.keyCode);
      switch(event.keyCode){
        case 38: this.move('forward');break;// up arrow
        case 40:this.move('backward');break;// down arrow
        case 37:this.move('left');break;// left arrow
        case 39:this.move('right');break;// right arrow
      }
    });
  }

  private initaliseValues() {
    this.lanes = this.generateLanes()

    this.currentLane = 0;
    this.currentColumn = Math.floor(this.columns/2);

    this.previousTimestamp = 0;

    this.startMoving = false;
    this.stepStartTimestamp = 0;

    this.chicken.mesh.position.x = 0;
    this.chicken.mesh.position.y = 0;

    this.camera.position.y = this.initialCameraPosition.y;
    this.camera.position.x = this.initialCameraPosition.x;

    this.dirLight.position.x = this.initialDirLightPosition.x;
    this.dirLight.position.y = this.initialDirLightPosition.y;
  }


  private generateLanes() {
    return [-9,-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8,9].map((index) => {
      const lane = new Lane(this, index);
      lane.mesh.position.y = index*this.positionWidth*this.zoom;
      this.scene.add( lane.mesh );
      return lane;
    }).filter((lane) => lane.index >= 0);
  }

  private addLane() {
    const index = this.lanes.length;
    const lane = new Lane(this, index);
    lane.mesh.position.y = index*this.positionWidth*this.zoom;
    this.scene.add(lane.mesh);
    this.lanes.push(lane);
  }

  private move(direction: string) {

    const finalPositions = this.moves.reduce((position:any, move:any) => {
      switch(move) {
        case 'forward': return {lane: position.lane+1, column: position.column};
        case 'backward': return {lane: position.lane-1, column: position.column};
        case 'left': return {lane: position.lane, column: position.column-1};
        case 'right': return {lane: position.lane, column: position.column+1};
        default: return {lane: this.currentLane, column: this.currentColumn}
    }
    }, {lane: this.currentLane, column: this.currentColumn})

    switch(direction){
      case 'forward':
        if(this.lanes[finalPositions.lane+1].type === 'forest' && this.lanes[finalPositions.lane+1].occupiedPositions.has(finalPositions.column)) return;
        if(!this.stepStartTimestamp) this.startMoving = true;
        this.addLane();
        break;
      case 'backward':
        if(finalPositions.lane === 0) return;
        if(this.lanes[finalPositions.lane-1].type === 'forest' && this.lanes[finalPositions.lane-1].occupiedPositions.has(finalPositions.column)) return;
        if(!this.stepStartTimestamp) this.startMoving = true;
        break;
      case 'left':
        if(finalPositions.column === 0) return;
        if(this.lanes[finalPositions.lane].type === 'forest' && this.lanes[finalPositions.lane].occupiedPositions.has(finalPositions.column-1)) return;
        if(!this.stepStartTimestamp) this.startMoving = true;
        break;
      case 'right':
        if(finalPositions.column === this.columns - 1 ) return;
        if(this.lanes[finalPositions.lane].type === 'forest' && this.lanes[finalPositions.lane].occupiedPositions.has(finalPositions.column+1)) return;
        if(!this.stepStartTimestamp) this.startMoving = true;
        break;
    }
    console.log('startMoving:', this.startMoving);
    this.moves.push(direction);
  }

  private animate = (timestamp: number) => {   

    if(!this.previousTimestamp) this.previousTimestamp = timestamp;
    const delta = timestamp - this.previousTimestamp;
    this.previousTimestamp = timestamp;
    this.timestamp = timestamp;

    // Animate cars and trucks moving on the lane
    this.lanes.forEach(lane => {

      if(lane.type === 'car' || lane.type === 'truck') {
        const aBitBeforeTheBeginingOfLane = -this.boardWidth*this.zoom/2 - this.positionWidth*2*this.zoom;
        const aBitAfterTheEndOFLane = this.boardWidth*this.zoom/2 + this.positionWidth*2*this.zoom;
        lane.vechicles.forEach((vechicle:any) => {

          if(lane.direction) {
            vechicle.mesh.position.x = vechicle.mesh.position.x < aBitBeforeTheBeginingOfLane ? aBitAfterTheEndOFLane : vechicle.mesh.position.x -= lane.speed/16*delta;
          }else{
            vechicle.mesh.position.x = vechicle.mesh.position.x > aBitAfterTheEndOFLane ? aBitBeforeTheBeginingOfLane : vechicle.mesh.position.x += lane.speed/16*delta;
          }
     
        });
      }
    });

    if(this.startMoving) {
      this.stepStartTimestamp = this.timestamp;
      console.log('this.stepStartTimestamp >>', this.stepStartTimestamp);
      this.startMoving = false;
    }

    if(this.stepStartTimestamp) {
      const moveDeltaTime = this.timestamp - this.stepStartTimestamp;
      const moveDeltaDistance = Math.min(moveDeltaTime/this.stepTime,1)*this.positionWidth*this.zoom;
      const jumpDeltaDistance = Math.sin(Math.min(moveDeltaTime/this.stepTime,1)*Math.PI)*8*this.zoom;

      // console.log(delta);
      switch(this.moves[0]) {
        case 'forward': {
          const positionY = this.currentLane*this.positionWidth*this.zoom + moveDeltaDistance;
          this.camera.position.y = this.initialCameraPosition.y + positionY; 
          this.dirLight.position.y = this.initialDirLightPosition.y + positionY; 
          this.chicken.mesh.position.y = positionY; // initial chicken position is 0

          this.chicken.mesh.position.z = jumpDeltaDistance;
          break;
        }
        case 'backward': {
          const positionY = this.currentLane*this.positionWidth*this.zoom - moveDeltaDistance
          this.camera.position.y = this.initialCameraPosition.y + positionY;
          this. dirLight.position.y = this.initialDirLightPosition.y + positionY; 
          this.chicken.mesh.position.y = positionY;

          this.chicken.mesh.position.z = jumpDeltaDistance;
          break;
        }
        case 'left': {
          const positionX = (this.currentColumn*this.positionWidth+this.positionWidth/2)*this.zoom -this.boardWidth*this.zoom/2 - moveDeltaDistance;
          this.camera.position.x = this.initialCameraPosition.x + positionX;     
          this.dirLight.position.x = this.initialDirLightPosition.x + positionX; 
          this.chicken.mesh.position.x = positionX; // initial chicken position is 0
          this.chicken.mesh.position.z = jumpDeltaDistance;
          break;
        }
        case 'right': {
          const positionX = (this.currentColumn*this.positionWidth+this.positionWidth/2)*this.zoom -this.boardWidth*this.zoom/2 + moveDeltaDistance;
          this.camera.position.x = this.initialCameraPosition.x + positionX;       
          this.dirLight.position.x = this.initialDirLightPosition.x + positionX;
          this.chicken.mesh.position.x = positionX; 

          this.chicken.mesh.position.z = jumpDeltaDistance;
          break;
        }
      }
      // Once a step has ended
      if(moveDeltaTime > this.stepTime) {
        switch(this.moves[0]) {
          case 'forward': {
            this.currentLane++;
            this.counterDOM.innerHTML = this.currentLane;    
            break;
          }
          case 'backward': {
            this.currentLane--;
            this.counterDOM.innerHTML = this.currentLane;    
            break;
          }
          case 'left': {
            this.currentColumn--;
            break;
          }
          case 'right': {
            this.currentColumn++;
            break;
          }
        }
        this.moves.shift();
        // If more steps are to be taken then restart counter otherwise stop stepping
        this.stepStartTimestamp = this.moves.length === 0 ? 0 : this.timestamp;
        console.log('this.stepStartTimestamp 11111:', this.stepStartTimestamp );
      }
    }

    // Hit test
    if(this.lanes[this.currentLane].type === 'car' || this.lanes[this.currentLane].type === 'truck') {
      const chickenMinX = this.chicken.mesh.position.x - this.chickenSize*this.zoom/2;
      const chickenMaxX = this.chicken.mesh.position.x + this.chickenSize*this.zoom/2;
      const vechicleLength = ({ car: 60, truck: 105} as any)[this.lanes[this.currentLane].type]; 
      this.lanes[this.currentLane].vechicles.forEach((vechicle: any) => {
        const carMinX = vechicle.mesh.position.x - vechicleLength*this.zoom/2;
        const carMaxX = vechicle.mesh.position.x + vechicleLength*this.zoom/2;
        if(chickenMaxX > carMinX && chickenMinX < carMaxX) {
          this.endDOM.style.visibility = 'visible';
        }
      });

    }
    this.renderer.render( this.scene, this.camera );	

    requestAnimationFrame( this.animate );
 
  }



}
