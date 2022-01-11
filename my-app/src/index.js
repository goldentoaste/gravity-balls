import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import './index.css';


class Vector2{


    constructor(x, y){
        this.x = x;
        this.y = y;
    }

    static zero(){
        return new Vector2(0,0);
    }

    static r2d(rad){
        //converts radian into degrees
        return 360 * rad / (2*Math.PI);
    }

    static d2r(deg){
        return (deg/360) * 2 * Math.PI;
    }

    rotated(angle){
        //rotates this vector by angle in radians, then return the rotated vector.

        let cos = Math.cos(angle);
        let sin = Math.sin(angle)

        let x = this.x;
        let y = this.y;

        this.x = x * cos - y * sin;
        this.y = x * sin + y * cos;

        return this;
    }

    mag() {
        return Math.sqrt(this.x**2 + this.y**2);
    }

    angle(){
        //returns angle relative to x-axis in radians
        return Math.atan2(this.y, this.x);
    }

    dot(v2){
        //returns the dot product of the 2 vectors, does not change either.
        return (this.x * v2.x) + (this.y * v2.y);
    }

    add(vec){
        //adds another vector onto this one, and return result
        this.x += vec.x;
        this.y += vec.y;
        return this;
    }

    mul(float){
        //mutipleis this vector with a float, and returns result
        this.x *= float
        this.y *= float
        return this;
    }

    distTo(vec){
        return vec.add(this.mul(-1)).mag();
    }

    normalized(){
        let mag = this.mag()
        return new Vector2(this.x / mag, this.y / mag);
    }

    toString(){
        return `Vector2 (${this.x} , ${this.y})`
    }
}


const G = 6.674e-12; //universal gravitational constant
const deltaTime = 0.05;
class GravityBall {
    constructor(position = Vector2.zero(), velocity = Vector2.zero(), mass = 0.0, radius = 0.0, color = "#304050", name = "wow!", nameColor = "#efe0e2"){
        /*
        postion : Vector2, initial postition of this ball
        velocity : Vector2, initial velocity of this ball, in m/s
        mass: float, mass of this ball, in kg
        radius: float, radius of this ball, in m
        */

        this.position = position;
        this.velocity = velocity;
        this.mass = mass;
        this.radius = radius;
        this.color = color;
        this.name = name;
        this.nameColor = nameColor;
    }

    get x(){
        return this.position.x;
    }

    get y(){
        return this.position.y;
    }

    get deltaX(){
        return this.velocity.x;
    }

    get deltaY(){
        return this.velocity.y;
    }

    applyImpulse(force = Vector2.zero(), dt = 0.0){
        /*
        impulse/change in momentum = F * dt = M * A * dt
        => change in velocity = F * dt / mass
        force: Vector2, in kg*m/s^2
        dt: float, change in time
        */

        this.velocity = this.velocity.add(force.mul(dt/this.mass));
    }

    applyAttraction(b2){
        /*
            applying newton's gravitation formula:

            F = G * (m1 * m2) * dir / r^2 
            where dir is the normalized vector/direction from b1 to b2, thus F is a force vector
            b1 attracts b2 by F, b2 attacts b1 by -F

            note this function applies force to both objects to save a tiny bit of computation, so only 1 call is needed.
        */
        let dir = b2.position.add(this.position.mul(-1)).normalized(); //unit vector for direction
        let distance = this.position.distTo(b2.position)
        let F = dir.mul(G * this.mass * b2.mass / (distance ** 2))

        b2.applyImpulse(F, deltaTime);
        this.applyImpulse(F.mul(-1), deltaTime);
    }
    
}



/*
https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258
yoink!
*/

const Canvas = (props) => {
    const canvasRef = useRef(null); //null as initial val

    

    const update = (ctx , frame) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height) //reset

        ctx.fillStyle = '#000'
        ctx.beginPath()
        ctx.arc(50, 100, 20 * Math.abs(Math.sin(frame * 0.05)), 0, 2 * Math.PI)
        ctx.fill()
    }



    useEffect(()=>{
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')


        let frame = 0
        let animationFrameid
        const render = () => {
            frame ++
            update(context, frame)
            animationFrameid = window.requestAnimationFrame(render)
        }

        render()
        return () => {
            window.cancelAnimationFrame(animationFrameid)
        }
    }, [update]) //initialize canvas on initial render

    return (
        <canvas ref = {canvasRef} {...props}/>
    );
}



const Parent = () => {

     return (
        <div className="container">
            <div className="menuGroup">
            
            </div>
            <div className="canvas">
                <Canvas/>
            </div>
        </div>
    );
};





// ========================================

ReactDOM.render(
    <Parent />,
    document.getElementById('root')
);
