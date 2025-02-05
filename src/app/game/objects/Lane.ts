import {Grass} from './Grass';
import {Three} from './Three';
import {Truck} from './Truck';
import {Road} from './Road';
import {Car} from './Car';

import {laneTypes, laneSpeeds} from './Constants';

export class Lane {
  private parent;
  public index;
  private type;
  public mesh: any;
  public occupiedPositions: any;
  public trees: any;
  public vechicles: any;
  public speed!: number;
  public direction!: boolean;
  // private threes;

  constructor(parent: any, index: number) { 
    this.parent = parent;
    this.index = index;
    this.type = index <= 0 ? 'field' : laneTypes[Math.floor(Math.random()*laneTypes.length)];
    switch(this.type) {
      case 'field':
        this.type = 'field';
        this.mesh = new Grass(parent).mesh;
        break;
      case 'forest':
        this.mesh = new Grass(parent).mesh;
    
        this.occupiedPositions = new Set();
        this.trees = [1,2,3,4].map(() => {
          const three = new Three(this.parent);
          let position;
          do {
            position = Math.floor(Math.random()*this.parent.columns);
          }while(this.occupiedPositions.has(position))
            this.occupiedPositions.add(position);
          three.mesh.position.x = (position*this.parent.positionWidth+this.parent.positionWidth/2)*this.parent.zoom-this.parent.boardWidth*this.parent.zoom/2;
          this.mesh.add( three.mesh );
          return three;
        })
        break;
      case 'car' :
        this.mesh = new Road(this.parent).mesh;
        this.direction = Math.random() >= 0.5;
    
        this.occupiedPositions = new Set();
        this.vechicles = [1,2,3].map(() => {
          const vechicle = new Car(this.parent);
          let position;
          do {
            position = Math.floor(Math.random()*this.parent.columns/2);
          }while(this.occupiedPositions.has(position))
            this.occupiedPositions.add(position);
          vechicle.mesh.position.x = (position*this.parent.positionWidth*2+this.parent.positionWidth/2)*this.parent.zoom-this.parent.boardWidth*this.parent.zoom/2;
          if(!this.direction) vechicle.mesh.rotation.z = Math.PI;
          this.mesh.add( vechicle.mesh );
          return vechicle;
        })
    
        this.speed = laneSpeeds[Math.floor(Math.random()*laneSpeeds.length)];
        break;
      case 'truck' :
        this.mesh = new Road(this.parent).mesh;
        this.direction = Math.random() >= 0.5;
    
        this.occupiedPositions = new Set();
        this.vechicles = [1,2].map(() => {
          const vechicle = new Truck(this.parent);
          let position;
          do {
            position = Math.floor(Math.random()*this.parent.columns/3);
          }while(this.occupiedPositions.has(position))
            this.occupiedPositions.add(position);
          vechicle.mesh.position.x = (position*this.parent.positionWidth*3+this.parent.positionWidth/2)*this.parent.zoom-this.parent.boardWidth*this.parent.zoom/2;
          if(!this.direction) vechicle.mesh.rotation.z = Math.PI;
          this.mesh.add( vechicle.mesh );
          return vechicle;
        })
    
        this.speed = laneSpeeds[Math.floor(Math.random()*laneSpeeds.length)];
        break;
    }

  }
}