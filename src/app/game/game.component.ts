import { Component,OnInit,AfterViewInit,ViewChild,ElementRef } from '@angular/core';
import * as THREE from 'three';
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
    
    
    

 
    
   
    
    
    
    const chicken = new Chicken(this);
    this.scene.add( chicken.mesh );
    
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    this.scene.add(hemiLight)
    
    this.initialDirLightPosition = {x: -100, y: -100};
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(this.initialDirLightPosition.x, this.initialDirLightPosition.y, 200);
    dirLight.castShadow = true;
    dirLight.target = chicken.mesh;
    this.scene.add(dirLight);
    
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    var d = 500;
    dirLight.shadow.camera.left = - d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = - d;
    
    // var helper = new THREE.CameraHelper( dirLight.shadow.camera );
    // var helper = new THREE.CameraHelper( camera );
    // scene.add(helper)
    
    const backLight = new THREE.DirectionalLight(0x000000, .4);
    backLight.position.set(200, 200, 50);
    backLight.castShadow = true;
    this.scene.add(backLight)
    
    
    
    
    
    this.initaliseValues();
    
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );





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
      if (event.keyCode == '38') {
        // up arrow
        this.move('forward');
      }
      else if (event.keyCode == '40') {
        // down arrow
        this.move('backward');
      }
      else if (event.keyCode == '37') {
        // left arrow
        this.move('left');
      }
      else if (event.keyCode == '39') {
        // right arrow
        this.move('right');
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
    const finalPositions = this.moves.reduce((position:any, move:string) => {
      if(move === 'forward') return {lane: position.lane+1, column: position.column};
      if(move === 'backward') return {lane: position.lane-1, column: position.column};
      if(move === 'left') return {lane: position.lane, column: position.column-1};
      if(move === 'right') return {lane: position.lane, column: position.column+1};
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
    this.moves.push(direction);
  }

  private animate(timestamp:number) {
    requestAnimationFrame( this.animate );

    if(!this.previousTimestamp) this.previousTimestamp = timestamp;
    const delta = timestamp - this.previousTimestamp;
    this.previousTimestamp = timestamp;

    // Animate cars and trucks moving on the lane
    this.lanes.forEach(lane => {
      if(lane.type === 'car' || lane.type === 'truck') {
        const aBitBeforeTheBeginingOfLane = -this.boardWidth*this.zoom/2 - this.positionWidth*2*this.zoom;
        const aBitAfterTheEndOFLane = this.boardWidth*this.zoom/2 + this.positionWidth*2*this.zoom;
        lane.vechicles.forEach((vechicle:any) => {
          if(lane.direction) {
            vechicle.position.x = vechicle.position.x < aBitBeforeTheBeginingOfLane ? aBitAfterTheEndOFLane : vechicle.position.x -= lane.speed/16*delta;
          }else{
            vechicle.position.x = vechicle.position.x > aBitAfterTheEndOFLane ? aBitBeforeTheBeginingOfLane : vechicle.position.x += lane.speed/16*delta;
          }
        });
      }
    });

    if(this.startMoving) {
      this.stepStartTimestamp = this.timestamp;
      this.startMoving = false;
    }

    if(this.stepStartTimestamp) {
      const moveDeltaTime = this.timestamp - this.stepStartTimestamp;
      const moveDeltaDistance = Math.min(moveDeltaTime/this.stepTime,1)*this.positionWidth*this.zoom;
      const jumpDeltaDistance = Math.sin(Math.min(moveDeltaTime/this.stepTime,1)*Math.PI)*8*this.zoom;
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
          this.chicken.position.y = positionY;

          this.chicken.position.z = jumpDeltaDistance;
          break;
        }
        case 'left': {
          const positionX = (this.currentColumn*this.positionWidth+this.positionWidth/2)*this.zoom -this.boardWidth*this.zoom/2 - moveDeltaDistance;
          this.camera.position.x = this.initialCameraPosition.x + positionX;     
          this.dirLight.position.x = this.initialDirLightPosition.x + positionX; 
          this.chicken.position.x = positionX; // initial chicken position is 0
          this.chicken.position.z = jumpDeltaDistance;
          break;
        }
        case 'right': {
          const positionX = (this.currentColumn*this.positionWidth+this.positionWidth/2)*this.zoom -this.boardWidth*this.zoom/2 + moveDeltaDistance;
          this.camera.position.x = this.initialCameraPosition.x + positionX;       
          this.dirLight.position.x = this.initialDirLightPosition.x + positionX;
          this.chicken.position.x = positionX; 

          this.chicken.position.z = jumpDeltaDistance;
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
      }
    }

    // Hit test
    if(this.lanes[this.currentLane].type === 'car' || this.lanes[this.currentLane].type === 'truck') {
      const chickenMinX = this.chicken.position.x - this.chickenSize*this.zoom/2;
      const chickenMaxX = this.chicken.position.x + this.chickenSize*this.zoom/2;
      const vechicleLength = ({ car: 60, truck: 105} as any)[this.lanes[this.currentLane].type]; 
      this.lanes[this.currentLane].vechicles.forEach((vechicle: any) => {
        const carMinX = vechicle.position.x - vechicleLength*this.zoom/2;
        const carMaxX = vechicle.position.x + vechicleLength*this.zoom/2;
        if(chickenMaxX > carMinX && chickenMinX < carMaxX) {
          this.endDOM.style.visibility = 'visible';
        }
      });

    }
    this.renderer.render( this.scene, this.camera );	

    requestAnimationFrame( this.animate );
  }



}

class Texture {
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

class Wheel {
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

class Car {
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

class Truck {

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

class Three {

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

class Chicken {
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

class Road {
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

class Grass {
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

class Lane {
  private parent;
  public index;
  private type;
  public mesh: any;
  // private occupiedPositions;
  // private threes;

  constructor(parent: any, index: number) { 
    this.parent = parent;
    this.index = index;
    this.type = index <= 0 ? 'field' : laneTypes[Math.floor(Math.random()*laneTypes.length)];
    let occupiedPositions: any;
    let direction: boolean;
    switch(this.type) {
      case 'field':
        this.type = 'field';
        this.mesh = new Grass(parent);
        break;
      case 'forest':
        this.mesh = new Grass(parent);
    
        occupiedPositions = new Set(parent);
        [1,2,3,4].map(() => {
          const three = new Three(this.parent);
          let position;
          do {
            position = Math.floor(Math.random()*this.parent.columns);
          }while(this.parent.occupiedPositions.has(position))
            this.parent.occupiedPositions.add(position);
          three.mesh.position.x = (position*this.parent.positionWidth+this.parent.positionWidth/2)*this.parent.zoom-this.parent.boardWidth*this.parent.zoom/2;
          this.mesh.add( three );
          return three;
        })
        break;
      case 'car' :
        this.mesh = new Road(this.parent);
        direction = Math.random() >= 0.5;
    
        occupiedPositions = new Set();
        [1,2,3].map(() => {
          const vechicle = new Car(this.parent);
          let position;
          do {
            position = Math.floor(Math.random()*this.parent.columns/2);
          }while(occupiedPositions.has(position))
            occupiedPositions.add(position);
          vechicle.mesh.position.x = (position*this.parent.positionWidth*2+this.parent.positionWidth/2)*this.parent.zoom-this.parent.boardWidth*this.parent.zoom/2;
          if(!direction) vechicle.mesh.rotation.z = Math.PI;
          this.mesh.add( vechicle );
          return vechicle;
        })
    
        this.parent.speed = laneSpeeds[Math.floor(Math.random()*laneSpeeds.length)];
        break;
      case 'truck' :
        this.mesh = new Road(this.parent);
        direction = Math.random() >= 0.5;
    
        occupiedPositions = new Set();
        [1,2].map(() => {
          const vechicle = new Truck(this.parent);
          let position;
          do {
            position = Math.floor(Math.random()*this.parent.columns/3);
          }while(occupiedPositions.has(position))
            occupiedPositions.add(position);
          vechicle.mesh.position.x = (position*this.parent.positionWidth*3+this.parent.positionWidth/2)*this.parent.zoom-this.parent.boardWidth*this.parent.zoom/2;
          if(!direction) vechicle.mesh.rotation.z = Math.PI;
          this.mesh.add( vechicle );
          return vechicle;
        })
    
        this.parent.speed = laneSpeeds[Math.floor(Math.random()*laneSpeeds.length)];
        break;
    }

  }

}
